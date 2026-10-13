// Private local inference. Audio never goes to a remote transcription service.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { env, pipeline } from '@huggingface/transformers'
import { prepareSpeechAudio } from '../apps/web/src/voice/audioQuality.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const folder = path.resolve(process.argv[2] ?? path.join(root, '.local-evaluation/supplied-satay'))
const ffmpeg = process.argv[3]
if (!ffmpeg) throw new Error('Supply the installed ffmpeg path')
const manifest = JSON.parse(await readFile(path.join(folder, 'manifest.json'), 'utf8'))
const model = JSON.parse(await readFile(path.join(root, 'contracts/speech-model.json'), 'utf8'))
const profileIndex = process.argv.indexOf('--profile')
const profileId = profileIndex >= 0 ? process.argv[profileIndex + 1] : process.argv.includes('--small') ? 'small' : 'tiny'
const profile = model.profiles.find(row => row.id === profileId)
if (!profile) throw new Error('Unknown speech model profile')
if (profileId === 'desktop') throw new Error('Use transcribe_recordings_local.py or the desktop speech helper for this profile')
const languageHints = process.argv.includes('--language-hints')
const enhanced = process.argv.includes('--enhanced')
const target = path.join(folder, enhanced ? `transcriptions-${profileId}-enhanced.json` : profileId === 'small' ? 'transcriptions-small.json' : languageHints ? 'transcriptions-language.json' : 'transcriptions.json')
try { await readFile(target); throw new Error('Results already exist; use a separate run folder') }
catch (error) { if (error.code !== 'ENOENT') throw error }
env.cacheDir = path.join(root, '.local-voice/speech-cache')
env.allowLocalModels = false
await mkdir(env.cacheDir, { recursive: true })
const started = performance.now()
const asr = await pipeline('automatic-speech-recognition', profile.model, {
  revision: profile.revision, device: 'cpu', dtype: model.dtype, local_files_only: process.argv.includes('--offline'),
})
const output = {
  device: 'Windows desktop; Node CPU runtime, not browser WASM or phone',
  network: 'Local audio; remote pinned model download only',
  model: `${model.library}; ${profile.model}@${profile.revision}; ${model.dtype}; CPU`,
  language_policy: languageHints ? 'Operator-selected ms for BM/Manglish; en for English' : 'Previous application default; no language hint',
  conditioning: enhanced ? 'DC removal, outer silence trim with padding, bounded gain; 256 token cap' : 'Original decoded PCM',
  model_load_ms: Math.round(performance.now() - started),
  run_date: new Date().toISOString(), results: [], timings: [],
}
for (const sample of manifest.samples) {
  const audioPath = path.resolve(folder, sample.audio)
  if (!audioPath.startsWith(folder + path.sep)) throw new Error('Audio outside collection')
  const encoded = await readFile(audioPath)
  const { createHash } = await import('node:crypto')
  if (createHash('sha256').update(encoded).digest('hex') !== sample.sha256) throw new Error('Source hash changed')
  const begun = performance.now()
  let pcm
  let prepared
  try {
    const bytes = execFileSync(ffmpeg, ['-v', 'error', '-i', audioPath, '-f', 'f32le', '-ac', '1', '-ar', '16000', 'pipe:1'], { maxBuffer: 2_000_000 })
    pcm = Float32Array.from({ length: bytes.length / 4 }, (_, i) => bytes.readFloatLE(i * 4))
    bytes.fill(0)
    const language = sample.language === 'English' ? 'en' : 'ms'
    const clean = enhanced ? prepareSpeechAudio(pcm) : null
    prepared = clean?.audio ?? pcm
    const result = await asr(prepared, { task: 'transcribe', return_timestamps: false, chunk_length_s: 30,
      ...(enhanced ? { max_new_tokens: 256, do_sample: false } : {}),
      ...(languageHints ? { language } : {}) })
    const recognized = Array.isArray(result) ? result.map(row => row.text).join(' ') : result.text
    output.results.push({ id: sample.id, recognized, draft: null, corrected: false,
      source: 'real-inference', status: 'transcribed', quality: clean?.quality, speech_ms: Math.round(performance.now() - begun) })
    console.log(`${sample.id}: transcribed (${output.results.at(-1).speech_ms} ms)`)
  } catch (error) {
    output.results.push({ id: sample.id, recognized: '', draft: null, corrected: false,
      source: 'real-inference', status: 'failed', error: String(error) })
    console.log(`${sample.id}: failed`)
  } finally { pcm?.fill(0); prepared?.fill(0); encoded.fill(0) }
  await writeFile(target, JSON.stringify(output, null, 2) + '\n')
}
await asr.dispose()
