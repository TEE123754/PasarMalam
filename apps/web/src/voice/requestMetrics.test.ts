import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { confirmRequests, recordRequest, requestRecords, requestReport } from './requestMetrics'

const group = '00000000-0000-4000-8000-000000000001'
const confirmed = '00000000-0000-4000-8000-000000000002'
const context = { group, inputSource: 'supplied-file' as const }
const observation = { elapsed: 1200, failed: false, cancelled: false, status: 200,
  model: 'qwen35-9b', measurement: { provider_latency_ms: 1000, input_tokens: 10, output_tokens: 20 } }
beforeEach(() => {
  const data = new Map<string, string>()
  vi.stubGlobal('sessionStorage', { getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value) })
  vi.stubGlobal('window', { dispatchEvent: vi.fn() })
})
afterEach(() => vi.unstubAllGlobals())

it('retains failed/retried attempts while counting an idempotent confirmed update once', () => {
  recordRequest('fixture', context, { ...observation, failed: true, status: 503, measurement: undefined })
  recordRequest('fixture', context, observation)
  confirmRequests('fixture', group, confirmed)
  confirmRequests('fixture', group, confirmed)
  const report = requestReport('fixture')
  expect(report.summary).toMatchObject({ attempts: 2, failed: 1, retried: 1, confirmed_updates: 1,
    input_tokens: null, output_tokens: null, cost_per_success: null })
  expect(report.requests[1].retry_of).toBe(report.requests[0].id)
  expect(report.requests.every(r => r.confirmed_update === confirmed)).toBe(true)
})
it('keeps request timing separate from task time and preserves explicit zero tokens', () => {
  recordRequest('fixture', context, { ...observation, measurement: { ...observation.measurement, input_tokens: 0 } })
  expect(requestReport('fixture').summary).toMatchObject({ median_ms: 1200, p90_ms: 1200, input_tokens: 0, output_tokens: 20 })
  expect(requestReport('fixture').requests[0].input_source).toBe('supplied-file')
})
it('does not store unknown provider fields or infer costs from token counts', () => {
  recordRequest('fixture', context, { ...observation, measurement: { ...observation.measurement,
    secret: 'private', cost: 55, transcript: 'private text' } })
  const out = JSON.stringify(requestReport('fixture'))
  expect(out).not.toContain('private text')
  expect(out).not.toContain('secret')
  expect(requestReport('fixture').requests[0].cost).toBeNull()
})
it('does not join distinct updates or expose one mode in another', () => {
  recordRequest('fixture', context, observation)
  recordRequest('fixture', { ...context, group: confirmed }, observation)
  confirmRequests('fixture', group, confirmed)
  expect(requestRecords('fixture').records[1]).toMatchObject({ retry_of: null, confirmed_update: null })
  expect(requestReport('connected').summary.attempts).toBe(0)
})
it('records cancellation as failure and never counts it as a successful model update', () => {
  recordRequest('fixture', context, { ...observation, failed: true, cancelled: true, status: null, measurement: undefined })
  confirmRequests('fixture', group, confirmed)
  expect(requestReport('fixture').summary).toMatchObject({ cancelled: 1, confirmed_updates: 0, input_tokens: null })
})
it('bounds retained history and marks truncation instead of claiming a complete report', () => {
  for (let i = 0; i < 501; i++) recordRequest('fixture', context, observation)
  const report = requestReport('fixture')
  expect(report.requests).toHaveLength(500)
  expect(report.dropped_attempts).toBe(1)
  expect(report.complete_session).toBe(false)
  const ids = new Set(report.requests.map(r => r.id))
  expect(report.requests.every(r => r.retry_of === null || ids.has(r.retry_of))).toBe(true)
})
it('keeps invalid or absent provider usage unknown', () => {
  recordRequest('fixture', context, { ...observation, measurement: { ...observation.measurement, input_tokens: true } })
  expect(requestReport('fixture').summary.input_tokens).toBeNull()
})
it('reports unreadable private storage rather than overwriting it with invented measurements', () => {
  vi.stubGlobal('sessionStorage', { getItem: () => 'invalid JSON', setItem: vi.fn() })
  recordRequest('fixture', context, observation)
  expect(requestReport('fixture').available).toBe(false)
})
it('reports unavailable storage when a write is denied or its quota is exhausted', () => {
  vi.stubGlobal('sessionStorage', { getItem: () => null, setItem: () => { throw new Error('Quota exceeded') } })
  recordRequest('connected', context, observation)
  expect(requestReport('connected').available).toBe(false)
  expect(requestReport('connected').summary.attempts).toBe(0)
})
