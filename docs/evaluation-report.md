# Voice evaluation - supplied baseline measured; acceptance pending

**9 October accuracy update:** The best full desktop development run now reaches BM 90%, Manglish 86%, English 95% critical-field accuracy with 24/24 valid drafts. Browser-compatible ONNX turbo reached BM 86% / Manglish 70% on desktop CPU; actual browser/phone accuracy is not inferred from that run. The original CP7 text pack was used for development and replaced for independent collection by [holdout v2](../contracts/cp7-holdout-v2.json). Human/live/device/cost acceptance remains pending. See [improvements and complete comparisons](VOICE_ACCURACY_IMPROVEMENTS.md). Current count stays 124 checked / 27 open; deployment held.

Updated 9 October 2026. The owner supplied 24 original satay recordings from five speaker folders and confirmed consent/script assignments. Actual local transcription and Morpheus interpretation were run. Detailed voices/transcripts/results stay private. [Anonymous measurements](supplied-voice-results.json) and [integration evidence](SUPPLIED_VOICE_ACCEPTANCE.md) record the results.

| Evidence | Current status |
| --- | --- |
| Recording inventory | 10 BM, 10 Manglish, four English; valid Ogg/Opus; source bytes/hashes preserved |
| Speaker/consent | Five anonymous folders; owner confirmation in chat; no invented signed receipts |
| Speech recognition | All 24 processed with pinned tiny, small, ONNX turbo and local turbo models; failures preserved |
| Morpheus interpretation | Actual qwen35-9b extraction of recognized text; original failures retained |
| First full small + Morpheus critical accuracy | BM 56%, Manglish 34%, English 40%; target not met |
| First full app-draft validity | 20/24 (83.3%); original baseline target not met |
| Best full desktop development result | BM 90%, Manglish 86%, English 95%; 24/24 valid drafts; independent acceptance pending |
| Unknown-unit repair | Three of four affected reruns returned valid drafts; one still failed |
| Browser flow | Original extensionless file, actual WASM transcription, actual Morpheus draft and verified private JSON download |
| Live microphone/typing median and p90 | Not measured; supplied files excluded |
| Phone/memory, actual market noise and interviews/trial | Not measured |
| Provider usage/billing cost | Not measured; no invented zero-cost claim |

The accuracy/WER figures compare with assigned scripts. Spoken deviations need independent bilingual annotation before definitive recognition claims. The original satay set is development material, not the expanded independent CP7 holdout. No broad Malaysian-menu robustness, safety, live speedup or phone claim is made.

Use the [expanded recording and measurement guide](CP7_MEASUREMENT_GUIDE.md) and [24-case pack](../contracts/cp7-holdout-v2.json) for final CP7 acceptance. Keep current failure evidence. Verify annotations before inference on a fresh holdout; do not count this repaired development set as independent. Live paired tasks, devices and operating-cost evidence remain separate requirements.

The working feature is audio -> editable transcript -> Morpheus draft -> clarification -> explicit human confirmation. Audio stays local; transcript sharing remains explicit. Manual entry remains required for ambiguous or failed results. CP7 and deployment remain open.
