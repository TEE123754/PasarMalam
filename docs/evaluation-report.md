# Voice evaluation — Not measured

Updated: 1 October 2026. No human recordings or participant measurements supplied. Actual local LLM on three fictional texts and browser Whisper on one synthetic English WAV were exercised. These smoke checks do not establish human accuracy or listing speed.

| Required evidence | Current status |
| --- | --- |
| BM corpus | 10 annotated fictional scripts; zero consented recordings |
| Manglish corpus | 10 annotated fictional scripts; zero consented recordings |
| English controls | 4 annotated fictional scripts; zero consented recordings |
| Speakers | Zero supplied; at least five consenting speakers required |
| Accuracy, JSON validity, WER, ingredients, corrections | Not measured |
| Paired voice/typing median and p90 | Not measured; automatic task instrumentation and valid-pair aggregation implemented |
| Desktop model download | Loaded successfully; cold/warm duration not measured |
| Desktop/Android microphone | Pending; no permission granted; synthetic file is separate |
| Actual local LLM smoke | Executed English/BM/Manglish; errors retained in `phase6-llm-smoke.json`; conflicting times cleared |
| Browser synthetic audio | Actual Whisper inference; dish/price required correction; excluded from human metrics |

The current script set is a narrow satay baseline, not representative Malaysian menu coverage. Add more dishes, units, prices, ambiguous wording and background-noise cases before drawing broad conclusions. Keep audio/consent files private and separate from ordinary voice notes. Run actual inference using the pinned manifest, preserve failed attempts and denominators, alternate task order and include fixes/confirmation. Use the corpus reference clock and matching test menu; do not mark canned transcripts as inference.

The Evaluation screen accepts actual result records with device/network/model context, rejects scripted source labels and duplicate IDs, and computes per-language metrics. Operator-provided labels are not independent proof of inference; keep raw run evidence and consent receipts for review. Target at least 80% critical accuracy in BM and Manglish separately; if it fails, fix affected cases and rerun affected clips plus a small unchanged sample. Never fill this report with invented percentages or fake speedups.

See [Phase 6 acceptance](phase6-acceptance.md) and `contracts/voice-evaluation.json` for the current schema, setup and remaining gates.
