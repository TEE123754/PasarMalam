export type MarketPulseMetric = 'clearance_time_minutes' | 'promotion_participation'

/** Synthetic rollup shape mirrors a market-wide aggregate query; it contains no stall identifiers. */
export interface MarketPulseAggregate {
  category: string
  category_id: string
  metric: MarketPulseMetric
  trend_pct: number
  comparison_window: string
  sample_stall_count: number
  current_value: number
  previous_value: number
}

interface CategoryPulseSample {
  category: string
  clearance_minutes_this_week: number
  clearance_minutes_last_week: number
  promotions_this_week: number
  promotions_last_week: number
}

const DEMO_CATEGORY_SAMPLES: Record<string, CategoryPulseSample> = {
  skewers: { category: 'Grilled / BBQ stalls', clearance_minutes_this_week: 52, clearance_minutes_last_week: 65, promotions_this_week: 5, promotions_last_week: 3 },
  rice: { category: 'Rice & prepared-meal stalls', clearance_minutes_this_week: 60, clearance_minutes_last_week: 70, promotions_this_week: 4, promotions_last_week: 3 },
  kuih: { category: 'Kuih & dessert stalls', clearance_minutes_this_week: 41, clearance_minutes_last_week: 50, promotions_this_week: 4, promotions_last_week: 2 },
  drinks: { category: 'Drink stalls', clearance_minutes_this_week: 44, clearance_minutes_last_week: 50, promotions_this_week: 3, promotions_last_week: 2 },
  fried: { category: 'Fried-food stalls', clearance_minutes_this_week: 42, clearance_minutes_last_week: 50, promotions_this_week: 4, promotions_last_week: 3 },
  produce: { category: 'Fresh-produce stalls', clearance_minutes_this_week: 46, clearance_minutes_last_week: 50, promotions_this_week: 3, promotions_last_week: 2 },
}

export function marketPulseAggregates(categoryId: string | null | undefined): MarketPulseAggregate[] {
  const sample = DEMO_CATEGORY_SAMPLES[categoryId ?? ''] ?? { category: 'Similar food stalls', clearance_minutes_this_week: 44, clearance_minutes_last_week: 50, promotions_this_week: 4, promotions_last_week: 3 }
  const clearanceTrend = Math.round(((sample.clearance_minutes_last_week - sample.clearance_minutes_this_week) / sample.clearance_minutes_last_week) * 100)
  const promotionTrend = Math.round(((sample.promotions_this_week - sample.promotions_last_week) / sample.promotions_last_week) * 100)
  return [
    {
      category: sample.category,
      category_id: categoryId ?? 'other',
      metric: 'clearance_time_minutes',
      trend_pct: clearanceTrend,
      comparison_window: 'This week vs last week',
      sample_stall_count: 8,
      current_value: sample.clearance_minutes_this_week,
      previous_value: sample.clearance_minutes_last_week,
    },
    {
      category: sample.category,
      category_id: categoryId ?? 'other',
      metric: 'promotion_participation',
      trend_pct: promotionTrend,
      comparison_window: 'This week vs last week',
      sample_stall_count: 8,
      current_value: sample.promotions_this_week,
      previous_value: sample.promotions_last_week,
    },
  ]
}

/** Action is intentionally a capped half-strength heuristic derived from the fastest-clearance trend. */
export function suggestedPrepReductionPct(aggregate: MarketPulseAggregate): number {
  return Math.max(5, Math.min(15, Math.round(aggregate.trend_pct / 2)))
}

export function marketPulseLabel(marketId: string): string {
  return marketId.split(/[-_\s]+/).filter(Boolean).map(part => part[0].toUpperCase() + part.slice(1)).join(' ')
}
