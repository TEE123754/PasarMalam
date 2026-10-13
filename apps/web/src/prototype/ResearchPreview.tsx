import { useState } from 'react'
import { NavLink } from 'react-router'
import { download } from '../commerce/exports'
import { WATERMARK } from './model'

export function ResearchPreview() {
  const [noisy, setNoisy] = useState(false)
  const rows = [
    { id: 'DEMO-TASK-001', typing_seconds: 85, voice_seconds: noisy ? 96 : 42, status: 'confirmed' },
    { id: 'DEMO-TASK-002', typing_seconds: 80, voice_seconds: noisy ? 89 : 51, status: 'confirmed' },
    { id: 'DEMO-TASK-003', typing_seconds: 55, voice_seconds: 65, status: 'confirmed' },
    { id: 'DEMO-TASK-004', typing_seconds: 70, voice_seconds: null, status: 'provider failed; manual fallback' },
  ]
  const pairs = rows.filter(r => r.voice_seconds !== null)
  const manual = pairs.reduce((n, r) => n + r.typing_seconds, 0) / pairs.length
  const voice = pairs.reduce((n, r) => n + r.voice_seconds!, 0) / pairs.length
  const change = (manual - voice) / manual * 100
  const packet = { watermark: WATERMARK, fictional: true, measured: false, participants: 0, source: 'Authored illustrative task times and example billing assumptions; no trial or invoice', scenario: noisy ? 'extra corrections' : 'ordinary illustration', interview_examples: [{ id: 'DEMO-HAWKER-A', quote: 'I want fewer taps when the stall is busy.', fictional: true }, { id: 'DEMO-CUSTOMER-B', quote: 'Show me the batch time and who supplied each claim.', fictional: true }], tasks: rows, requests: { attempts: 12, failed: 2, confirmed_updates: 10, assumed_cost_per_attempt_rm: .03, assumed_total_rm: .36, assumed_cost_per_success_rm: .036 }, valid_paired_tasks: pairs.length, mean_typing_seconds: manual, mean_voice_seconds: voice, speed_change_percent: change }
  return <section className="panel prototype-watermarked"><span className="eyebrow">04 · ILLUSTRATIVE VALIDATION REPORT</span><h2>Show how the future pilot would be measured.</h2><p className="prototype-data-label"><strong>{WATERMARK}</strong> · All quotes, timings, counts and costs in this section are authored examples. No participants, user study or billing evidence. Actual recorded AI results are kept separately.</p><div className="prototype-feature-grid"><article className="prototype-feature"><h3>Demo hawker A · fictional quote</h3><p>“I want fewer taps when the stall is busy.”</p><small>Illustrative interview example; not a testimonial.</small></article><article className="prototype-feature"><h3>Demo customer B · fictional quote</h3><p>“Show me the batch time and who supplied each claim.”</p><small>Illustrative interview example; not a testimonial.</small></article></div><label className="choice-row"><input type="checkbox" checked={noisy} onChange={e => setNoisy(e.target.checked)}/>Simulate extra voice corrections</label><div className="prototype-exposure"><div><strong>{manual.toFixed(1)}s</strong><span>mean sample typing task</span></div><div><strong>{voice.toFixed(1)}s</strong><span>mean sample voice task</span></div><div><strong>{Math.abs(change).toFixed(1)}%</strong><span>sample voice {change >= 0 ? 'faster' : 'slower'} · hypothetical</span></div></div><p>Three sample completed pairs enter this comparison. The fourth failed request/manual fallback remains in the export and is excluded from a completed voice pair. More corrections can make voice slower; the prototype shows that result too.</p><p><strong>Illustrative cost accounting:</strong> 12 attempts × assumed RM0.03 = RM0.36; 10 confirmed updates → RM0.036 per success. The two failed attempts are included in costs. These are fictional assumptions, not provider prices or an invoice.</p><div className="button-row"><button className="button secondary" onClick={() => download(JSON.stringify(packet, null, 2), 'FICTIONAL-prototype-research-example.json', 'application/json')}>Export fictional research example</button><NavLink className="button secondary" to="/evaluation">Open actual request measurements</NavLink></div></section>
}
