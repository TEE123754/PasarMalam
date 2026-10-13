import { describe, expect, it } from 'vitest'
import { advance, exposurePreview, freshState, journeys, proofs, proofHTML, proofPacket, publicBadge, redactedCasePacket, stateSchema, WATERMARK } from './model'

describe('fictional proof and future integration boundaries', () => {
  it('a redacted authority handoff requires the moderator and explicit scoped consent', () => {
    const j = journeys[0]
    expect(() => advance(j, 2, 'Customer', true)).toThrow('role')
    expect(() => advance(j, 2, 'Moderator', false)).toThrow('fields')
    expect(advance(j, 2, 'Moderator', true)).toBe(3)
  })
  it('the authority payload excludes reporters, contact details and original evidence', () => {
    const p = redactedCasePacket()
    expect(Object.keys(p).sort()).toEqual(['destination', 'fictional', 'market', 'reference', 'source', 'stall', 'summary', 'timeline', 'transmitted', 'watermark'].sort())
    expect(p.transmitted).toBe(false)
  })
  it.each(['expired', 'revoked', 'missing'] as const)('%s proof cannot display a current sample badge', status => {
    for (const p of proofs) expect(publicBadge(p, status)).toBe(false)
  })
  it('a case closure or pickup receipt cannot become a certification badge', () => {
    for (const p of proofs.filter(p => ['case', 'collection'].includes(p.kind))) expect(publicBadge(p, 'current')).toBe(false)
    expect(publicBadge(proofs[1], 'current')).toBe(true)
  })
  it.each(proofs)('watermarks the $kind document and every evidence reference', p => {
    const packet = proofPacket(p, 'revoked')
    expect(packet).toMatchObject({ fictional: true, operational: false, watermark: WATERMARK, status: 'revoked', real_logo: false, real_signature: false })
    expect(packet.evidence.every(e => e.watermark === WATERMARK && !e.authentic_document)).toBe(true)
    const html = proofHTML(p, 'revoked')
    expect(html).toContain('REVOKED')
    expect(html.split(WATERMARK).length).toBeGreaterThan(2)
    expect(html).toContain("default-src 'none'")
    expect(html).not.toContain('<script')
  })
  it('escapes content in downloadable documents instead of executing it', () => {
    const html = proofHTML({ ...proofs[0], title: '<img src=x onerror=alert(1)>', issuer: '<script>bad()</script>' }, 'current')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
  it('every displayed supporting reference has inspectable fictional fields and consistent lifecycle dates', () => {
    for (const p of proofs) {
      const current = proofPacket(p, 'current'), expired = proofPacket(p, 'expired')
      expect(current.evidence.every(e => Object.keys(e.fields).length > 1 && !e.authentic_document)).toBe(true)
      expect(current.issued <= current.scenario_date && current.scenario_date < current.expires).toBe(true)
      expect(expired.expires < expired.scenario_date).toBe(true)
    }
  })
  it('an unknown handling interval blocks arithmetic and never restarts prior exposure', () => {
    expect(exposurePreview(false)).toMatchObject({ known_minutes: 40, remaining: 20 })
    expect(exposurePreview(true)).toMatchObject({ known_minutes: 40, remaining: null, state: 'Needs information' })
  })
  it('rejects tampered persistent references and out-of-range workflow states', () => {
    expect(stateSchema.safeParse(freshState()).success).toBe(true)
    expect(stateSchema.safeParse({ version: 1, stages: { authority: 8 }, statuses: {} }).success).toBe(false)
    expect(stateSchema.safeParse({ version: 1, stages: {}, statuses: { 'real-issuer': 'current' } }).success).toBe(false)
  })
})
