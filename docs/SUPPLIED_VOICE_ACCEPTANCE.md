# Supplied recording integration — 9 October 2026

**9 October accuracy update:** The best full desktop development run now reaches BM 90%, Manglish 86%, English 95% critical-field accuracy with 24/24 valid drafts. Browser-compatible ONNX turbo reached BM 86% / Manglish 70% on desktop CPU; actual browser/phone accuracy is not inferred from that run. The original CP7 text pack was used for development and replaced for independent collection by [holdout v2](../contracts/cp7-holdout-v2.json). Human/live/device/cost acceptance remains pending. See [improvements and complete comparisons](VOICE_ACCURACY_IMPROVEMENTS.md). Current count stays 124 checked / 27 open; deployment held.

The local feature flow is **audio → editable text → Morpheus listing draft → clarification → human confirmation**. All 24 supplied recordings were imported and transcribed privately. The owner confirmed speaker consent and the original script assignments, then explicitly requested Morpheus interpretation. Audio was not uploaded to Morpheus; only redacted recognized text and the fictional Chicken satay menu were sent.

## Delivered

- Verified 24 Ogg/Opus files: 10 BM, 10 Manglish, four English; five anonymous speaker folders. Added `.ogg` extensions to byte-identical private copies and recorded hashes, durations and source paths. Original `audio.zip` is unchanged. Source archive, extracted audio and detailed recognition/results are ignored by Git.
- Fixed extensionless uploads: inspect supported container signatures instead of trusting filename/MIME. Existing 5 MB/30-second decode limits and cancellation/deletion remain enforced. Non-audio content falsely labelled audio is rejected.
- Fixed an actual library issue: Transformers.js 4.3.0 defaults to English when no language is supplied. The app now passes the selected Malay or English language explicitly; BM/Manglish uses Malay. Added optional pinned Whisper-small beside the smaller Whisper-tiny download. Larger-device memory and phone performance remain unmeasured.
- Preserve and export the original recognized text and original extracted draft, including extraction text when the transcript was edited. Imported results and calculated reports can be downloaded privately. Timed live runs remain separate from supplied files.
- Unknown provider units now become null with a clarification flag; other schema/evidence checks remain enforced. A recognized `batal` is not silently turned into `stick`. Invalid fields still fall back to manual review; no automatic database writes occur.
- Evaluation exposes missing clips and full-set critical-field accuracy. Cold and out-of-order timing pairs are excluded.

## Original development baseline (preserved)

These are comparisons against the **assigned original satay scripts**, not independently verified transcripts of every spoken word. WER can include departures from the script. The fixed extraction clock was 1 October 2026, 20:00 Malaysia time. Desktop CPU results are not phone/browser latency results or live listing times.

| Full first run: Whisper-small + Morpheus qwen35-9b | Clips | Valid app drafts | Critical fields correct | Script-relative WER |
| --- | --- | --- | --- | --- |
| BM | 10 | 7/10 | 28/50 (56%) | 41.4% |
| Manglish | 10 | 9/10 | 17/50 (34%) | 59.3% |
| English | 4 | 4/4 | 8/20 (40%) | 55.4% |

In this original baseline, the 80% BM/Manglish critical-field target and 95% draft-validity target **did not pass**. Later complete configurations and their results are reported in the accuracy update above. All first-run failures remain recorded. A diagnostic retry of bm-02 exposed an invalid provider unit. Only the four failed Morpheus cases were rerun after the repair: bm-02/03/04 returned valid drafts; manglish-03 still failed and remains a manual-entry case. This repair subset does not replace or inflate the full first-run percentages.

Whisper-tiny with language selection plus the developer-local Qwen model was also measured: BM and Manglish each reached only 12% critical-field accuracy; English 0%. The earlier no-language transcription attempt is preserved privately. Different extraction providers prevent attributing the entire improvement solely to the speech model. No independent holdout, speedup, safety, cheap-phone or cost claim is made.

Anonymous aggregate evidence: [supplied-voice-results.json](supplied-voice-results.json). Private files: `.local-evaluation/supplied-satay/manifest.json`, `transcriptions*.json`, `measured-results*.json`, and `report*.json`. Do not publish those detailed files or voices.

## Verification

51 selected frontend cases passed, including signature rejection, score coverage, timing exclusions, recording cancellation and workflow guards. 24 distinct backend voice cases passed across the initial and focused repair batches. Lint, types, build, configured Ruff and browser-bundle credential scan passed; final verification is recorded in the phase status.

Browser: an original extensionless recording loaded, actual Whisper-small WASM transcription completed, audio controls were removed, and actual Morpheus extraction produced a reviewed draft with a private original-result download. The current daytime clock correctly rejected the recording's evening cook time as future; the offline benchmark separately used its documented historical clock. No live microphone timing or listing write was claimed.

CP7 remains open for the expanded independent/noise set, verified spoken annotations, live paired tasks, target devices, interviews/trial and usage/billing evidence. Feature checklist counts remain **124 checked / 27 open**. Deployment remains held.


Final affected repair: explicit `6pm` is now accepted alongside `6 pm`, while conflicting/future times remain blocked. Seven affected validation cases passed (three new), bringing distinct backend voice coverage to 24. Actual en-01/03/04 plus unchanged bm-01 interpretation reruns returned valid drafts; results remain a separately labelled four-case subset, with the original full baseline unchanged. The app importer calculated the 24-recording report and exposed its report download. [Browser evidence](screenshots/supplied-voice-evaluation-oct9.png).

Final local voice screen: [language, model and consented-file controls](screenshots/supplied-voice-screen-oct9.png).
