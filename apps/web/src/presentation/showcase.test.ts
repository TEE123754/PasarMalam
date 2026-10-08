import { describe, expect, it } from 'vitest'
import pack from '../../../../contracts/cp9-showcase-pack.json'
import catalog from '../../../../contracts/demo-catalog.json'
import { fixtureScenarios } from './model'
import { seededWorkspace } from './seed'
import { publish, tick } from '../freshness/engine'
import { showcaseJSON } from './showcase'

describe('CP9 preparation and expired showcase path', () => {
  it('preserves caption characters through portable downloaded JSON', () => {
    const exported = showcaseJSON()
    expect([...exported].every(c => c.charCodeAt(0) < 128)).toBe(true)
    expect(JSON.parse(exported)).toEqual(pack)
  })
  it('has contiguous provisional five-minute scenes with explicit evidence boundaries', () => {
    expect(pack.chapters[0].start).toBe(0)
    pack.chapters.forEach((chapter, i) => {
      expect(chapter.end).toBeGreaterThan(chapter.start)
      if (i) expect(chapter.start).toBe(pack.chapters[i - 1].end)
      expect(chapter.route.startsWith('/demo/')).toBe(true)
      if (chapter.scenario) expect(chapter.scenario in fixtureScenarios).toBe(true)
      expect(chapter.caption.length).toBeGreaterThan(10)
    })
    expect(pack.chapters.at(-1)?.end).toBe(pack.duration_seconds)
    expect(pack.duration_basis).toContain('unverified')
    expect(pack.pending_inputs).toContain('Actual student-narrated full video and presentation-device rehearsal')
  })
  it('ends all seeded active offers after the explicit expired scenario', () => {
    const now = new Date(catalog.anchor), w = seededWorkspace(now)
    const later = new Date(now.getTime() + fixtureScenarios.expired * 60000)
    const result = tick(w, w.freshness!, later)
    expect(result.state.promotions.every(p => p.state === 'ended')).toBe(true)
    expect(result.workspace.batches.filter(b => b.status === 'active')).toHaveLength(0)
    expect(w.batches.map(b => b.prepared_at)).toEqual(result.workspace.batches.map(b => b.prepared_at))
  })
  it('offers a genuinely eligible draft at clearance time and blocks the later cutoff', () => {
    const now = new Date(catalog.anchor), w = seededWorkspace(now)
    const later = new Date(now.getTime() + fixtureScenarios.clearance * 60000)
    w.freshness!.weather.observed = later.toISOString()
    const result = tick(w, w.freshness!, later)
    const draft = result.state.drafts.find(d => d.state === 'pending' && result.state.decisions[d.batch]?.eligible && result.state.decisions[d.batch].remaining > 15 && !result.state.promotions.some(p => p.batch === d.batch && p.state === 'active'))!
    expect(draft).toBeDefined()
    const approved = publish(result.workspace, result.state, later, { batch: draft.batch, kind: 'percentage', value: 25, units: 1, title: 'CP9 fictional reviewed offer' }, 'CP9-publish')
    expect(approved.promotions.some(p => p.title === 'CP9 fictional reviewed offer' && p.state === 'active')).toBe(true)
    const cutoff = new Date(now.getTime() + fixtureScenarios.reminder * 60000)
    const advanced = tick(result.workspace, approved, cutoff)
    expect(() => publish(advanced.workspace, advanced.state, cutoff, { batch: draft.batch, kind: 'percentage', value: 25, units: 1, title: 'Must reject' }, 'CP9-cutoff')).toThrow()
  })
})
