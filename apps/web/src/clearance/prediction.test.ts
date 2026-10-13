import { describe, expect, it } from 'vitest'
import { LIKELY_CLEARANCE_THRESHOLD, predictClearance, SAMPLE_FORECAST_BASELINE } from './prediction'

describe('predicted clearance heuristic', () => {
  const early = new Date('2026-10-13T09:00:00Z') // 5:00 pm in Malaysia
  const late = new Date('2026-10-13T14:00:00Z') // 10:00 pm in Malaysia

  it('uses the existing planning sample baseline and raises the score for above-baseline prep', () => {
    const baseline = predictClearance(SAMPLE_FORECAST_BASELINE, SAMPLE_FORECAST_BASELINE, early, '17:00', '23:00')!
    const excess = predictClearance(30, SAMPLE_FORECAST_BASELINE, early, '17:00', '23:00')!
    expect(excess.score).toBeGreaterThan(baseline.score)
    expect(excess.score).toBeGreaterThanOrEqual(LIKELY_CLEARANCE_THRESHOLD)
    expect(excess.baseline).toBe(SAMPLE_FORECAST_BASELINE)
    expect(excess.preparedToday).toBe(30)
  })

  it('raises the likelihood score as the market approaches closing time', () => {
    const earlyScore = predictClearance(30, SAMPLE_FORECAST_BASELINE, early, '17:00', '23:00')!.score
    const lateScore = predictClearance(30, SAMPLE_FORECAST_BASELINE, late, '17:00', '23:00')!.score
    expect(lateScore).toBeGreaterThan(earlyScore)
  })

  it('returns no score when no same-day preparation quantity is available', () => {
    expect(predictClearance(0, SAMPLE_FORECAST_BASELINE, early, '17:00', '23:00')).toBeNull()
    expect(predictClearance(20, 0, early, '17:00', '23:00')).toBeNull()
  })
})
