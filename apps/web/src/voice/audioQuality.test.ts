import { expect, it } from 'vitest'
import { prepareSpeechAudio } from './audioQuality'
it('rejects silence and invalid samples before speech inference', () => {
 expect(() => prepareSpeechAudio(new Float32Array(16000))).toThrow('No audible speech')
 expect(() => prepareSpeechAudio(new Float32Array([NaN]))).toThrow('Unsupported audio')
})
it('keeps speech with padding and reports clipping without guessing text', () => {
 const pcm = new Float32Array(48000)
 for (let i = 16000; i < 32000; i++) pcm[i] = i % 2 ? .1 : -.1
 const result = prepareSpeechAudio(pcm)
 expect(result.audio.length).toBeGreaterThanOrEqual(20800)
 expect(result.audio.length).toBeLessThan(48000)
 expect(result.quality.flags).toEqual([])
 const clipped = prepareSpeechAudio(new Float32Array(Array.from({ length: 16000 }, (_, i) => i % 2 ? 1 : -1)))
 expect(clipped.quality.flags[0]).toContain('distorted')
})
