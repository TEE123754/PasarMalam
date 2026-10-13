import type { FreshState } from '../freshness/engine'
import type { VendorWorkspace } from './model'

export interface RecordedSales {
  inventorySales: number | null
  completedOrders: number | null
  reportedClearanceUnits: number | null
}

const sumOrNull = (values: number[]): number | null =>
  values.length ? values.reduce((total, value) => total + value, 0) : null

export function recordedSales(workspace: VendorWorkspace, state: FreshState, batchId: string): RecordedSales {
  const inventorySales = workspace.events
    .filter(event => event.batch_id === batchId && event.kind === 'inventory')
    .map(event => event.details.consumed)
    .filter((value): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)

  const completedOrders = (workspace.commerce?.orders ?? [])
    .filter(order => order.batch === batchId && order.status === 'completed')
    .map(order => order.units)
    .filter(value => Number.isSafeInteger(value) && value >= 0)

  const reportedClearanceUnits = state.outcomes
    .filter(outcome => outcome.batch === batchId)
    .map(outcome => outcome.units)
    .filter(value => Number.isSafeInteger(value) && value >= 0)

  return {
    inventorySales: sumOrNull(inventorySales),
    completedOrders: sumOrNull(completedOrders),
    reportedClearanceUnits: sumOrNull(reportedClearanceUnits),
  }
}

export function elapsedPercent(preparedAt: string | null | undefined, deadline: string | null | undefined, now: string | null | undefined): number | null {
  if (!preparedAt || !deadline || !now) return null
  const start = Date.parse(preparedAt), end = Date.parse(deadline), current = Date.parse(now)
  if (![start, end, current].every(Number.isFinite) || end <= start) return null
  return Math.max(0, Math.min(100, Math.round((current - start) / (end - start) * 100)))
}

export function minutesUntil(deadline: string | null | undefined, now: string | null | undefined): number | null {
  if (!deadline || !now) return null
  const end = Date.parse(deadline), current = Date.parse(now)
  if (![end, current].every(Number.isFinite)) return null
  return Math.max(0, Math.floor((end - current) / 60_000))
}

export function windowLengthMinutes(preparedAt: string | null | undefined, deadline: string | null | undefined): number | null {
  if (!preparedAt || !deadline) return null
  const start = Date.parse(preparedAt), end = Date.parse(deadline)
  if (![start, end].every(Number.isFinite) || end <= start) return null
  return Math.round((end - start) / 60_000)
}

export function isClosedBatchStatus(status: string): boolean {
  return ['sold-out', 'withdrawn', 'discarded', 'merged', 'expired', 'recalled'].includes(status)
}
