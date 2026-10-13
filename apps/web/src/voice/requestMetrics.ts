import { z } from 'zod'
import type { AppMode } from '../data/types'

const token = z.number().int().min(0).max(1_000_000_000).nullable()
const usageSchema = z.object({
  provider_latency_ms: z.number().finite().nonnegative().max(120_000),
  input_tokens: token,
  output_tokens: token,
})
const uuid = z.string().uuid()
const recordSchema = z.object({
  id: uuid,
  update_group: uuid,
  at: z.string().datetime(),
  latency_ms: z.number().finite().nonnegative().max(120_000),
  provider_latency_ms: z.number().finite().nonnegative().max(120_000).nullable(),
  failed: z.boolean(),
  cancelled: z.boolean(),
  http_status: z.number().int().min(100).max(599).nullable(),
  model: z.string().max(120).nullable(),
  input_tokens: token,
  output_tokens: token,
  cost: z.null(),
  currency: z.null(),
  billing_evidence: z.null(),
  retry_of: uuid.nullable(),
  confirmed_update: uuid.nullable(),
  input_source: z.enum(['live-microphone', 'supplied-file', 'text']),
}).strict()
const storeSchema = z.object({ records: z.array(recordSchema).max(500), dropped: z.number().int().nonnegative() }).strict()
export type RequestRecord = z.infer<typeof recordSchema>
export interface RequestContext { group: string; inputSource: RequestRecord['input_source'] }
export const REQUEST_METRICS_CHANGED = 'pasarmalam:request-metrics-changed'
const key = (mode: AppMode) => `pasarmalam:${mode}:evaluation:requests-v1`
const unavailable = new Set<string>()

export function requestRecords(mode: AppMode) {
  try {
    if (unavailable.has(key(mode))) throw new Error('Storage unavailable')
    const raw = sessionStorage.getItem(key(mode))
    const state = raw ? storeSchema.parse(JSON.parse(raw)) : { records: [], dropped: 0 }
    return { ...state, available: true }
  } catch {
    return { records: [] as RequestRecord[], dropped: 0, available: false }
  }
}

function persist(mode: AppMode, records: RequestRecord[], dropped: number) {
  try {
    sessionStorage.setItem(key(mode), JSON.stringify({ records, dropped }))
    window.dispatchEvent(new Event(REQUEST_METRICS_CHANGED))
  } catch {
    unavailable.add(key(mode))
    window.dispatchEvent(new Event(REQUEST_METRICS_CHANGED))
  }
}

export function recordRequest(mode: AppMode, context: RequestContext, observation: {
  elapsed: number; failed: boolean; cancelled: boolean; status: number | null;
  measurement?: unknown; model?: unknown
}) {
  const state = requestRecords(mode)
  if (!state.available || !uuid.safeParse(context.group).success) return
  const usage = usageSchema.safeParse(observation.measurement)
  const previous = state.records.filter(r => r.update_group === context.group).at(-1)
  const row = recordSchema.safeParse({
    id: crypto.randomUUID(), update_group: context.group, at: new Date().toISOString(),
    latency_ms: observation.elapsed,
    provider_latency_ms: usage.success ? usage.data.provider_latency_ms : null,
    failed: observation.failed, cancelled: observation.cancelled, http_status: observation.status,
    model: typeof observation.model === 'string' && /^[\w./:@-]{1,120}$/.test(observation.model) ? observation.model : null,
    input_tokens: usage.success ? usage.data.input_tokens : null,
    output_tokens: usage.success ? usage.data.output_tokens : null,
    cost: null, currency: null, billing_evidence: null,
    retry_of: previous?.id ?? null, confirmed_update: null, input_source: context.inputSource,
  })
  if (!row.success) return
  const all = [...state.records, row.data]
  const removed = Math.max(0, all.length - 500)
  const retained = all.slice(-500)
  const ids = new Set(retained.map(r => r.id))
  persist(mode, retained.map(r => ({ ...r, retry_of: r.retry_of && ids.has(r.retry_of) ? r.retry_of : null })), state.dropped + removed)
}

export function confirmRequests(mode: AppMode, group: string, update: string) {
  if (!uuid.safeParse(update).success) return
  const state = requestRecords(mode)
  if (!state.available) return
  persist(mode, state.records.map(r => r.update_group === group ? { ...r, confirmed_update: update } : r), state.dropped)
}

const percentile = (values: number[], p: number) => values.length ? [...values].sort((a, b) => a - b)[Math.ceil(values.length * p) - 1] : null
export function requestReport(mode: AppMode) {
  const state = requestRecords(mode), rows = state.records
  const successes = new Set(rows.filter(r => !r.failed && r.confirmed_update).map(r => r.confirmed_update))
  const sum = (field: 'input_tokens' | 'output_tokens') => rows.length && rows.every(r => r[field] !== null) ? rows.reduce((total, r) => total + r[field]!, 0) : null
  return {
    kind: 'voice-request-observations-v1', scope: mode, available: state.available,
    complete_session: state.available && state.dropped === 0, dropped_attempts: state.dropped,
    summary: {
      attempts: rows.length, failed: rows.filter(r => r.failed).length,
      cancelled: rows.filter(r => r.cancelled).length, retried: rows.filter(r => r.retry_of).length,
      median_ms: percentile(rows.map(r => r.latency_ms), .5), p90_ms: percentile(rows.map(r => r.latency_ms), .9),
      input_tokens: sum('input_tokens'), output_tokens: sum('output_tokens'),
      confirmed_updates: successes.size, cost_per_success: null,
    },
    provenance: 'Browser request observations only. Not participant task timing, independent accuracy, or billing evidence. Unknown usage/cost stays null; failures may have consumed provider tokens. Add dated billing evidence privately before scoring cost.',
    requests: rows,
  }
}
