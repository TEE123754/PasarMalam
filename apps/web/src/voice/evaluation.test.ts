import { expect, it } from 'vitest'
import corpus from '../../../../contracts/voice-evaluation.json'
import { fallback } from './model'
import { evaluate } from './evaluation'
import { speechOptions } from './speechOptions'

const context = { device: 'test fixture', network: 'local', model: 'unit fixture', timings: [] }
it('reports full-set coverage instead of treating one perfect clip as a completed benchmark', () => {
 const sample = corpus.samples[0]
 const report = evaluate({ ...context, results: [{ id: sample.id, recognized: sample.transcript,
  draft: fallback(sample.transcript, [{ name: 'Chicken satay' }], new Date(corpus.reference_now)).draft,
  corrected: false, source: 'real-inference' }] })
 expect(report.groups.BM.plannedClips).toBe(10)
 expect(report.groups.BM.fullSetCriticalAccuracy).toBeLessThanOrEqual(.1)
 expect(report.missingClips).toHaveLength(23)
})
it('excludes a complete pair if either run is cold or performed out of order', () => {
 const pair = [{ pair: 'p', mode: 'voice', seconds: 10, order: 'voice-first', cold: true },
  { pair: 'p', mode: 'typing', seconds: 20, order: 'voice-first', cold: false }]
 expect(evaluate({ ...context, results: [], timings: pair }).timing.pairedCount).toBe(0)
 pair[0].cold = false
 expect(evaluate({ ...context, results: [], timings: [...pair].reverse() }).timing.pairedCount).toBe(0)
})
it('passes an explicit language to multilingual Whisper so BM does not default to English', () => {
 expect(speechOptions('ms').language).toBe('ms')
 expect(speechOptions('en').language).toBe('en')
 expect(speechOptions('ms').task).toBe('transcribe')
})
