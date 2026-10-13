import { describe, expect, it } from 'vitest'
import { marketPulseAggregates, suggestedPrepReductionPct } from './market-pulse'

describe('demo market pulse aggregates', () => {
  it('exposes category-level aggregate fields with no stall identities', () => {
    const aggregates = marketPulseAggregates('skewers')
    expect(aggregates).toHaveLength(2)
    for (const aggregate of aggregates) {
      expect(aggregate).toMatchObject({ category: expect.any(String), trend_pct: expect.any(Number), comparison_window: 'This week vs last week', sample_stall_count: 8 })
      expect(Object.keys(aggregate).some(key => /stall_id|stall_name|owner/i.test(key))).toBe(false)
    }
    expect(aggregates[0]).toMatchObject({ category: 'Grilled / BBQ stalls', trend_pct: 20, metric: 'clearance_time_minutes', current_value: 52, previous_value: 65 })
    expect(aggregates[1]).toMatchObject({ metric: 'promotion_participation', current_value: 5, previous_value: 3, trend_pct: 67 })
  })

  it('derives a capped prep recommendation from the clearance-speed aggregate', () => {
    expect(suggestedPrepReductionPct(marketPulseAggregates('skewers')[0])).toBe(10)
    expect(suggestedPrepReductionPct(marketPulseAggregates('produce')[0])).toBe(5)
    expect(suggestedPrepReductionPct({ ...marketPulseAggregates('skewers')[0], trend_pct: 80 })).toBe(15)
  })

  it('provides a structured fallback category for stalls with no category mapping', () => {
    expect(marketPulseAggregates('unknown')[0].category).toBe('Similar food stalls')
  })
})
