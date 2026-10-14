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

  it('starts at the shopper-chosen stall instead of the most urgent one', () => {
    const stops = [
      { id: 'urgent', latitude: 3.1, longitude: 101.6, urgencyMinutes: 5 },
      { id: 'chosen', latitude: 3.2, longitude: 101.7, urgencyMinutes: null },
      { id: 'other', latitude: 3.15, longitude: 101.65, urgencyMinutes: null },
    ]
    expect(planRoute(stops)[0].stop.id).toBe('urgent')
    expect(planRoute(stops, 'chosen')[0].stop.id).toBe('chosen')
    expect(planRoute(stops, 'missing')[0].stop.id).toBe('urgent')
  })
})
