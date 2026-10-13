import { describe, expect, it } from 'vitest'
import { complaintDestination, demoComplaintReceipt } from './demoRouting'
import { applyCommunity, emptyCommunity, people, publicCommunity } from './model'

describe('fictional customer complaint routing', () => {
  it.each(['spoiled-food', 'cross-contamination', 'unhygienic-handling', 'handling'])('routes %s to the invented health office', category => {
    expect(complaintDestination(category)).toMatchObject({ kind: 'health', name: 'Pejabat Kesihatan Demo Seri Rasa' })
  })
  it.each(['hygiene', 'pests'])('routes %s to the invented council', category => {
    expect(complaintDestination(category)).toMatchObject({ kind: 'council', name: 'Majlis Pasar Demo Seri Rasa' })
  })
  it.each(['misleading', 'other', 'unknown'])('keeps %s with community support', category => {
    expect(complaintDestination(category).kind).toBe('support')
  })
  it('projects a watermarked receipt without reporter, body, location or evidence', () => {
    const privateReport = { id: 'case-1', category: 'hygiene', created: '2026-10-09T12:00:00Z', reporter: 'private-person', body: 'Private allegation', evidence: ['private-upload'], stall: 'private-stall' }
    const receipt = demoComplaintReceipt(privateReport)
    expect(receipt).toMatchObject({ reference: 'DEMO-REFERRAL-case-1', simulated: true, external_transmission: false, watermark: 'DEMO · FICTIONAL', status: 'Sent to demo authority' })
    expect(JSON.stringify(receipt)).not.toMatch(/private-person|Private allegation|private-upload|private-stall/)
  })
  it('shows the simulated receipt for a saved private report without changing moderation or public flags', () => {
    const state = emptyCommunity(), now = new Date('2026-10-09T12:00:00Z')
    state.operations.stalls['bara-senja'] = true
    const saved = applyCommunity(state, people[0], { kind: 'report', stall: 'bara-senja', category: 'handling', incident: '2026-10-09T11:55:00Z', body: 'Fictional uncovered tray during service.', evidence: [] }, 'test-request', now, 'report-1', { 'bara-senja': 'market-1' })
    expect(saved.state.reports[0].status).toBe('submitted')
    expect(demoComplaintReceipt(saved.state.reports[0]).destination.kind).toBe('health')
    expect(publicCommunity(saved.state, now).flags).toEqual([])
    expect(state.reports).toHaveLength(0)
  })
})
