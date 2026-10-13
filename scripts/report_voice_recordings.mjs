// Calculate private reports with the same scorer used by the application's importer.
import { createServer } from 'vite'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const folder = path.join(root, '.local-evaluation/supplied-satay')
const server = await createServer({ root: path.join(root, 'apps/web'), configFile: false,
  envFile: false, logLevel: 'silent', server: { middlewareMode: true } })
try {
  const { evaluate } = await server.ssrLoadModule('/src/voice/evaluation.ts')
  const runs = []
  for (const file of await readdir(folder)) {
    if (!/^measured-results.*\.json$/.test(file)) continue
    const input = JSON.parse(await readFile(path.join(folder, file), 'utf8'))
    const report = evaluate(input)
    runs.push({ file, model: input.model, clips: input.results.length, missing: report.missingClips.length,
      groups: Object.fromEntries(Object.entries(report.groups).map(([language, row]) => [language, {
        clips: row.clips, validDrafts: row.valid, criticalCorrect: row.fieldCorrect,
        criticalFields: row.fields, criticalAccuracy: row.criticalAccuracy, wer: row.wer,
        allCorrect: row.allCorrect,
      }])) })
    await writeFile(path.join(folder, file.replace('measured-results', 'report')), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ file, clips: input.results.length, groups: Object.fromEntries(
      Object.entries(report.groups).map(([language, row]) => [language, {
        clips: row.clips, jsonValidity: row.jsonValidity, criticalAccuracy: row.criticalAccuracy,
        fullSetCriticalAccuracy: row.fullSetCriticalAccuracy, wer: row.wer,
      }])) }))
  }
  await writeFile(path.join(root, 'docs/supplied-voice-results.json'), JSON.stringify({
    date: '2026-10-09', kind: 'Script-relative development baseline; not independent CP7 holdout',
    suppliedClips: 24, speakers: 5, languages: { BM: 10, Manglish: 10, English: 4 },
    referenceVerification: 'Owner confirmed assigned scripts; spoken deviations not independently annotated',
    timings: 'Live voice/typing, phone performance and billing cost not measured', runs,
  }, null, 2) + '\n')
} finally { await server.close() }
