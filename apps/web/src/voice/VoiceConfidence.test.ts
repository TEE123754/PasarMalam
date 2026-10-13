import { describe, expect, it } from 'vitest'
import { confidenceLevel } from './confidence'

describe('confidenceLevel', () => {
  it('maps extraction scores to High, Medium, and Low bands', () => {
    expect(confidenceLevel(0.8, false)).toBe('high')
    expect(confidenceLevel(0.55, false)).toBe('medium')
    expect(confidenceLevel(0.79, false)).toBe('medium')
    expect(confidenceLevel(0.54, false)).toBe('low')
  })

  it('forces Low when a field was unresolved, ambiguous, or required clarification', () => {
    expect(confidenceLevel(0.99, true)).toBe('low')
    expect(confidenceLevel(undefined, true)).toBe('low')
  })

  it('uses the high-confidence heuristic when a resolved field has no score', () => {
    expect(confidenceLevel(undefined, false)).toBe('high')
  })
})
