import { describe, expect, it } from 'vitest'
import type { FreshState } from '../freshness/engine'
import type { VendorWorkspace } from './model'
import { elapsedPercent, isClosedBatchStatus, minutesUntil, recordedSales, windowLengthMinutes } from './lifecycle'

const emptyWorkspace = { events: [], commerce: { orders: [] } } as unknown as VendorWorkspace
const emptyState = { outcomes: [] } as unknown as FreshState

describe('batch lifecycle evidence', () => {
  it('leaves absent sales sources unrecorded rather than inventing zeroes', () => {
    expect(recordedSales(emptyWorkspace, emptyState, 'batch-a')).toEqual({
      inventorySales: null,
      completedOrders: null,
      reportedClearanceUnits: null,
    })
  })

  it('keeps explicit inventory, completed-order, and reported-clearance units separate', () => {
    const workspace = {
      events: [
        { batch_id: 'batch-a', kind: 'inventory', at: '2026-10-13T10:00:00Z', details: { consumed: 3 } },
        { batch_id: 'batch-b', kind: 'inventory', at: '2026-10-13T10:01:00Z', details: { consumed: 8 } },
      ],
      commerce: { orders: [
        { batch: 'batch-a', status: 'completed', units: 2 },
        { batch: 'batch-a', status: 'cancelled', units: 5 },
      ] },
    } as unknown as VendorWorkspace
    const state = { outcomes: [{ batch: 'batch-a', units: 4, grams: 0, at: '2026-10-13T10:02:00Z' }] } as unknown as FreshState
    expect(recordedSales(workspace, state, 'batch-a')).toEqual({
      inventorySales: 3,
      completedOrders: 2,
      reportedClearanceUnits: 4,
    })
  })

  it('derives elapsed time only from valid recorded timestamps and clamps it to the window', () => {
    expect(elapsedPercent('2026-10-13T10:00:00Z', '2026-10-13T12:00:00Z', '2026-10-13T11:00:00Z')).toBe(50)
    expect(elapsedPercent(null, '2026-10-13T12:00:00Z', '2026-10-13T11:00:00Z')).toBeNull()
    expect(elapsedPercent('2026-10-13T10:00:00Z', '2026-10-13T12:00:00Z', '2026-10-13T13:00:00Z')).toBe(100)
    expect(minutesUntil('2026-10-13T12:00:00Z', '2026-10-13T11:00:00Z')).toBe(60)
    expect(minutesUntil('invalid', '2026-10-13T11:00:00Z')).toBeNull()
    expect(windowLengthMinutes('2026-10-13T10:00:00Z', '2026-10-13T12:00:00Z')).toBe(120)
  })

  it('recognizes only recorded terminal batch statuses as closed', () => {
    expect(isClosedBatchStatus('discarded')).toBe(true)
    expect(isClosedBatchStatus('active')).toBe(false)
  })
})
