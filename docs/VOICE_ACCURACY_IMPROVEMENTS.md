# Voice accuracy improvements — 9 October 2026

The supplied 24 recordings now support a working **audio → editable transcript → Morpheus draft → clarification → confirmation** flow. The best measured desktop configuration reached **90% BM, 86% Manglish and 95% English critical-field accuracy, with 24/24 valid drafts**. These are development results against assigned scripts, not independent CP7 acceptance.

## What changed

- Added pinned Whisper large-v3-turbo choices: a browser option and an optional local desktop helper. The desktop helper uses CPU int8 inference, five-beam decoding, voice activity detection and vocabulary hints containing menu/unit words only. It receives no script, expected quantity, price, time or sample ID. Manglish tries Malay and English decoding and selects the higher average decoder log probability; this is an uncalibrated selection score, not confidence.
- Browser transcription now removes DC offset, trims outer silence with padding, applies bounded gain, rejects silent/non-finite input and warns about quiet/clipped recordings. Microphone capture requests mono audio and supported echo/noise/gain processing. Explicit language selection avoids the installed library's English default. Larger models remain optional because download, memory and phone performance differ.
- Strengthened Morpheus instructions and literal transcript evidence. Conservative rules preserve explicitly spoken BM/English numbers, sen/ringgit, preparation clocks, stock actions and batch references. Conflicts or absent facts require clarification. Bundle quantity/price stay separate from per-unit price; cup/piece wording remains visible. Ingredients must be spoken, rather than inferred from a recipe.
- Missing provider ingredients become an empty list plus a review flag. Known unit aliases normalize; unknown units remain unknown. New batches require positive quantity; stock updates can explicitly reach zero. Exact menu aliases repair a missing dish only when the transcript identifies one unique menu name. Duplicate menu entries still require an exact ID.
- Original recognition/drafts, failures and separately labelled retries remain private and exportable. Supplied-file runs remain excluded from live voice-versus-typing timing. Nothing automatically creates a listing.

## Actual measurements

All lanes below contain the complete original set: 10 BM, 10 Manglish, four English. Critical-field denominators are 50, 50 and 20. Extraction used Morpheus qwen35-9b and the original fixed clock, 1 October 2026 at 20:00 Malaysia time. Failed drafts count against the full-set field totals.

| Full configuration | BM | Manglish | English | Valid drafts |
| --- | --- | --- | --- | --- |
| Original Whisper-small and original extractor | 56% | 34% | 40% | 20/24 |
| Same small transcripts and enhanced extractor | 48% | 36% | 60% | 19/24 |
| ONNX turbo q8 CPU and enhanced extractor | 86% | 70% | 90% | 22/24 |
| Local faster-whisper turbo, dual Manglish decoding and enhanced extractor | **90%** | **86%** | **95%** | **24/24** |

The small-text regression is retained: stronger extraction alone did not overcome recognition errors. The best local lane meets the nominal development thresholds of 80% BM/Manglish and 95% draft validity. The ONNX lane's Manglish score remains below target; its CPU run is not a browser-WASM or phone benchmark. Different inference engines and decoding settings prevent attributing the entire difference solely to model size.

Script-relative WER for small / ONNX turbo / local turbo was BM 41.4% / 30.0% / 20.0%, Manglish 59.3% / 36.7% / 25.3%, and English 55.4% / 48.2% / 41.1%. Assigned scripts have not been independently corrected against every spoken recording, so deviations from scripts can contribute to WER. [Anonymous aggregate evidence](supplied-voice-results.json) retains every full lane and earlier repair subsets; detailed results are ignored under `.local-evaluation/supplied-satay`.

The original 24-case CP7 text scripts were also used as development regressions, with no speech inference. The first enhanced extraction run yielded 15/24 valid drafts; provider `null` ingredients caused failures. A complete rerun after that repair yielded 24/24 valid drafts and BM 53/54 (98.15%), Manglish 51/52 (98.08%), English 20/20 (100%) critical fields. The remaining errors were an ambiguous `seringgit lima puluh satu` price and a missed explicit dish. The later exact-menu-alias guard passed focused tests; the recorded full-run percentages are unchanged. [Text-only aggregate evidence](voice-text-regression-results.json) keeps the first failed run and complete repair run separately. These text scores must not be presented as audio accuracy.

No fine-tuning was performed. The 24 narrow recordings and unverified spoken references do not provide a reliable training/validation corpus. Collect and independently verify broader menu, speaker, noise and device examples before training or tuning further.

## Use the desktop option

On this computer the helper is running at loopback port 8020. Open `/demo/hawker/voice`, choose **Desktop accuracy · this computer**, choose the recording language, and load the model. Transcribe, review the text, then agree to Morpheus extraction and review every field.

To restart the prepared helper from the project root:

```powershell
& .\scripts\start-speech-helper.ps1
```

The helper uses the isolated `.local-voice/asr-venv` and previously downloaded pinned weights. On another computer, create that environment, install [the pinned optional requirements](../scripts/voice-asr-requirements.txt), and use [the local transcription runner](../scripts/transcribe_recordings_local.py) to download/cache the model before starting the offline helper. These dependencies are separate from the production API. A reproducible private development run is:

```powershell
.local-voice/asr-venv/Scripts/python.exe scripts/transcribe_recordings_local.py --language-policy dual --run-label your-unique-label
```

The runner refuses to overwrite an existing result file and preserves incremental failures. The first attempt failed because of a decoder-library compatibility issue; it remains recorded separately. The corrected runner decodes audio through local FFmpeg before inference. Detailed transcription and extraction files stay private.

Audio remains on this computer. The helper binds only to `127.0.0.1`, accepts the local app origins on ports 5173–5175, checks host/origin, bounds PCM size and rejects concurrent inference. It saves no audio/transcript/request logs. Cancellation discards the browser result; an already-running desktop inference may finish in memory before releasing its buffers. Only explicitly approved, redacted text and menu names go to Morpheus. Do not expose the helper publicly.

## Fresh independent evaluation

The original [CP7 pack](../contracts/cp7-recording-pack.json) is now development material because its scripts were used to improve extraction. A new [24-case holdout v2](../contracts/cp7-holdout-v2.json) uses fresh `cp7b-*` IDs and changed facts, with the clock **9 October 2026, 20:00 Malaysia time**. It has no actual recordings, consent receipts or verified annotations yet. No transcription/extraction has been run against this new pack. The scorer rejects known development IDs even if someone removes their declared development labels.

Follow the [collection and measurement guide](CP7_MEASUREMENT_GUIDE.md): record fresh speakers/cases, verify the actual spoken annotations, freeze before inference, and retain every failure. Live paired tasks, low-cost phones, actual noise, interviews/trial and usage/billing evidence still require real observations. No live speedup, phone acceptance, noise robustness or zero-cost claim is made. CP7 remains open; overall checklist stays **124 checked / 27 open** and deployment remains held.

## Verification

68 affected backend tests and 56 frontend voice tests passed. Frontend lint, TypeScript and production build passed; changed Python files passed Ruff. Repository-wide Ruff still reports ten pre-existing issues in unrelated checkpoint tests/scripts. Existing build chunk warnings remain.

The browser completed a real desktop transcription of supplied bm-01 and actual Morpheus extraction: quantity 5, price 500 sen, ingredients ayam/kacang and unit stick populated. The current daytime clock correctly rejected the spoken 18:00 preparation time as future; confirmation remained blocked. No listing was written. Private full-flow screenshot: `.local-evaluation/voice-enhancement/browser-desktop-bm01.png`. Helper status succeeded for the local app origin and rejected a foreign origin. [Clean voice-screen evidence](screenshots/voice-accuracy-desktop-oct9.png) contains no participant recording or transcript.

Implementation references: [official Whisper turbo model](https://huggingface.co/openai/whisper-large-v3-turbo), [faster-whisper decoding and CPU int8 documentation](https://github.com/SYSTRAN/faster-whisper), and [ONNX turbo model repository](https://huggingface.co/onnx-community/whisper-large-v3-turbo). Exact converted-model revisions are recorded in [the speech manifest](../contracts/speech-model.json).
