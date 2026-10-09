export type AudioQuality = { rms: number; peak: number; clippedFraction: number; flags: string[] }
// Remove DC offset and trim only outer silence, retaining 150 ms of padding.
// No denoising filter or stretching: those can distort spoken digits.
export function prepareSpeechAudio(input: Float32Array): { audio: Float32Array; quality: AudioQuality } {
 if (!input.length || input.length > 480000 || input.some(value => !Number.isFinite(value))) throw new Error('Unsupported audio; use quick entry.')
 let sum = 0
 for (const value of input) sum += value
 const dc = sum / input.length
 let peak = 0, energy = 0, clipped = 0
 for (let i = 0; i < input.length; i++) {
  if (Math.abs(input[i]) >= .995) clipped++
  input[i] -= dc; peak = Math.max(peak, Math.abs(input[i])); energy += input[i] ** 2
 }
 const rms = Math.sqrt(energy / input.length), flags: string[] = []
 if (rms < .00001) throw new Error('No audible speech. Record again or use text entry.')
 if (rms < .004) flags.push('Recording is quiet. Review prices and quantities carefully.')
 if (clipped / input.length > .01) flags.push('Recording is distorted. Record again for clearer numbers.')
 const frame = 320, threshold = Math.max(.0001, Math.min(.002, rms * .08))
 let first = 0, last = input.length
 function audible(start: number, end: number) {
  let energy = 0
  for (let i = start; i < end; i++) energy += input[i] ** 2
  return Math.sqrt(energy / (end - start)) >= threshold
 }
 while (first + frame < last && !audible(first, first + frame)) first += frame
 while (last - frame > first && !audible(last - frame, last)) last -= frame
 first = Math.max(0, first - 2400); last = Math.min(input.length, last + 2400)
 const audio = input.slice(first, last), gain = peak > 0 && peak < .5 ? Math.min(4, .5 / peak) : 1
 for (let i = 0; i < audio.length; i++) audio[i] *= gain
 return { audio, quality: { rms, peak, clippedFraction: clipped / input.length, flags } }
}
