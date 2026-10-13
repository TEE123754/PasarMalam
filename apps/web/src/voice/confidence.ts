export type ConfidenceLevel = 'high' | 'medium' | 'low'

export function confidenceLevel(score: number | undefined, forcedLow: boolean): ConfidenceLevel {
  if (forcedLow) return 'low'
  if (typeof score !== 'number' || !Number.isFinite(score)) return 'high'
  if (score >= 0.8) return 'high'
  if (score >= 0.55) return 'medium'
  return 'low'
}
