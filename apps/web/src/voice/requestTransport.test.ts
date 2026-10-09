import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { extract } from './gateway'
import { requestReport } from './requestMetrics'
import { fallback } from './model'

const context = { group: '00000000-0000-4000-8000-000000000001', inputSource: 'text' as const }
beforeEach(() => {
  const data = new Map<string, string>()
  vi.stubGlobal('sessionStorage', { getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value) })
  vi.stubGlobal('window', { dispatchEvent: vi.fn(), location: { pathname: '/demo/hawker/voice' } })
})
afterEach(() => vi.unstubAllGlobals())
it('records a real HTTP failure even when the screen falls back to manual entry', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })))
  await expect(extract('fixture', 'Chicken satay', [], new AbortController().signal, true, [], context)).rejects.toThrow()
  expect(requestReport('fixture').requests[0]).toMatchObject({ failed: true, http_status: 503, input_tokens: null })
})
it('records cancellation and malformed output without inventing a valid extraction', async () => {
  const controller = new AbortController()
  controller.abort()
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')))
  await expect(extract('fixture', 'Chicken satay', [], controller.signal, true, [], context)).rejects.toThrow()
  expect(requestReport('fixture').requests[0]).toMatchObject({ failed: true, cancelled: true })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ draft: { deadline: '2099' } }), { status: 200 })))
  await expect(extract('fixture', 'Chicken satay', [], new AbortController().signal, true, [], context)).rejects.toThrow()
  expect(requestReport('fixture').summary).toMatchObject({ attempts: 2, failed: 2, retried: 1 })
})
it('exports only whitelisted observations after a validated provider response', async () => {
  const result = fallback('Chicken satay', [{ name: 'Chicken satay' }], new Date())
  const data = { ...result, source: 'morpheus', model: 'qwen35-9b',
    measurement: { provider_latency_ms: 40, input_tokens: 23, output_tokens: 45 }, secret: 'DO_NOT_FORWARD_TEST_SECRET' }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { status: 200 })))
  await extract('fixture', 'Chicken satay', [], new AbortController().signal, true, [], context)
  expect(requestReport('fixture').summary).toMatchObject({ attempts: 1, failed: 0, input_tokens: 23, output_tokens: 45 })
  expect(JSON.stringify(requestReport('fixture'))).not.toContain('DO_NOT_FORWARD_TEST_SECRET')
})
