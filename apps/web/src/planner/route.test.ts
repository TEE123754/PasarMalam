import { describe, expect, it } from 'vitest'
import { distanceKm, planRoute } from './route'

const stall = (id: string, latitude: number, longitude: number, urgencyMinutes: number | null = null) => ({ id, latitude, longitude, urgencyMinutes })

describe('market run routing', () => {
  it('orders three selected stalls with the shortest advisory first, before a geographically nearer stall', () => {
    const plan = planRoute([
      stall('nearby', 3.139, 101.686, 45),
      stall('urgent', 3.145, 101.690, 8),
      stall('medium', 3.132, 101.680, 24),
    ])
    expect(plan.map(item => item.stop.id)).toEqual(['urgent', 'nearby', 'medium'])
  })

  it('uses nearest-neighbor routing when no active advisory countdowns exist', () => {
    const plan = planRoute([
      stall('anchor', 3.139, 101.686),
      stall('nearby', 3.140, 101.686),
      stall('far', 3.160, 101.710),
    ])
    expect(plan.map(item => item.stop.id)).toEqual(['anchor', 'nearby', 'far'])
  })

  it('handles missing coordinates without inventing distances', () => {
    expect(distanceKm(stall('a', 3.1, 101.6), stall('b', null as unknown as number, 101.6))).toBeNull()
    const plan = planRoute([stall('a', 3.1, 101.6), stall('b', 3.11, 101.6)])
    expect(plan[1].distanceFromPreviousKm).toBeGreaterThan(0)
  })
})
