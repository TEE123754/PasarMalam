# CP7 recording and measurement pack

Updated 9 October 2026. **Fresh v2 collection ready; human results not measured.** The original CP7 scripts were used for extraction development and cannot serve as an independent holdout. Use [holdout v2](../contracts/cp7-holdout-v2.json) for new recordings. The original satay recordings and CP7 scripts remain development material. See [accuracy improvements and measured comparisons](VOICE_ACCURACY_IMPROVEMENTS.md). This supplements the [original recording guide](VOICE_RECORDING_GUIDE.md). Nothing here deploys the app or sends recordings to a provider.

## 1. Files and tools

| File | Purpose |
| --- | --- |
| [Recording pack](../contracts/cp7-holdout-v2.json) | 24 distinct cases: 10 BM, 10 Manglish, four English; six dishes/drink types, bundle prices, batch references, ambiguity and five planned noise cases |
| `.local-evaluation/cp7-v2/manifest.json` | Private editable collection copy, created locally; actual anonymous speaker, consent receipt, audio path/hash, accent and verified annotation |
| `.local-evaluation/cp7-v2/measurements.json` | Empty actual inference, paired timing and request/billing records |
| [Scorer](../scripts/cp7_measure.py) | Python standard library; collection initialisation, freeze integrity and aggregate scoring; no API calls or uploads |
| [Interview template](cp7-interviews.csv), [trial template](cp7-trial.csv), [device matrix](cp7-devices.csv) | Empty CSV headers for human findings and actual device observations |

The private folder is ignored by Git. Keep original audio and consent receipts there; never add them to the public demo or commit them. The scorer writes a private aggregate JSON report; review it and publish only anonymous totals/findings when actual evidence is ready. No new API key, paid recorder or model subscription is requested. Speech uses the chosen browser Whisper model or optional local desktop helper; extraction uses the configured backend Morpheus route only after the participant agrees to transcript processing. Do not assume its price or free allowance.

## 2. Recruit and record

Obtain voluntary recording consent from at least five adult speakers. Follow the original guide's consent wording, separate Morpheus consent and withdrawal/deletion instructions. Use `S01`–`S05`; the pack's planned assignments are suggestions, not participants. Do not collect names, contact details, ethnicity or inferred religion in results. Accent is optional self-description; `not specified by participant` is acceptable. Interview participation and live task consent are separate from recording consent.

Read the pack's `reference_transcript` naturally, one file per case, e.g. `audio/cp7b-01.wav`. Scripts use fictional facts and the fixed interpretation clock **9 October 2026, 20:00 Malaysia time**. Do not apply these old times to a real sale. Keep all evaluation updates in isolated fictional scenarios. Before batch-reference tasks create the named dish and two distinct test batches; observe that the other batch remains unchanged. If a case cannot be executed by the actual workflow, retain it as `unsupported`, rather than manually substituting a successful JSON draft.

For the five `market-noise` cases, use a controlled low-volume background source without recording bystanders; note how it was created and any consent. Do not claim natural market-noise robustness from quiet recordings or artificial noise. Record actual device, format, duration, condition and speaker-described accent in your private collection notes. Avoid cloud recorder synchronisation unless separately agreed.

Listen to each file, correct the reference transcript to what was actually said and verify the expected fields against that transcript **before inference**. Canonical dish names are explicit in `expected`; review translations, unit and ingredient annotations with a competent bilingual reviewer. Expected `null` means deliberately unknown, not an absent field. Bundle price and quantity must remain separate from a guessed unit price. Ambiguous time/batch cases should ask for clarification and avoid a database write. These are evaluation annotations, not additional food-safety rules.

Fill each private manifest sample with:

```json
{
  "speaker": "S01",
  "consented": true,
  "consent_receipt": "consent/S01.txt",
  "audio": "audio/cp7b-01.wav",
  "audio_sha256": "ACTUAL_SHA256_FROM_GET_FILE_HASH",
  "accent": "participant description or not specified by participant",
  "annotation_verified": true
}
```

This snippet is a template; never set consent true before obtaining it. Put the actual receipt in the stated private file. Compute hashes with `Get-FileHash -Algorithm SHA256 .local-evaluation/cp7-v2/audio/cp7b-01.wav`; store the lowercase hash. Keep the actual consent deletion date and withdrawal contact privately.

## 3. Freeze before testing

Create a fresh private v2 collection directory from the repository root:

The empty `.local-evaluation/cp7-v2` templates are already prepared on this computer. Use them directly and skip initialisation if they exist. For another collection, choose a new folder name; initialisation refuses to overwrite files.

```powershell
uv run --project apps/api python scripts/cp7_measure.py init --folder .local-evaluation/cp7-v2
```

Initialisation never overwrites existing files. After all 24 files, five actual speakers, verified annotations and receipts are present:

```powershell
uv run --project apps/api python scripts/cp7_measure.py freeze --folder .local-evaluation/cp7-v2
```

Freeze validates language counts, disjoint development IDs, anonymous speakers, separate audio hashes, bounded local files, consent receipts and annotation approval, then creates `freeze.json`. Do not tune prompts/model rules against these holdout results and still call them held out. If a frozen annotation needs correction, record the reason/version before any rerun; create a new collection folder and a newly frozen set. A file hash establishes integrity, not authenticity or independent human review.

## 4. Run actual inference once at the phase gate

Use the current local `/demo/hawker/voice` workflow with the relevant test menu and reference clock. Record exact Whisper/model manifest version, Morpheus response model ID, device/browser version, network, app build/date and cold download separately. Feed each recording through actual transcription/extraction; preserve the pre-correction draft and recognized transcript. Never score a manually corrected draft as the raw AI output. Retain all failures, unsupported cases, clarification questions and subsequent corrections. Do not repeatedly retry until a clip succeeds and then omit earlier attempts.

Each actual `measurements.json.results` entry follows:

```json
{
  "id": "cp7b-01",
  "source": "real-inference",
  "status": "ok",
  "run_evidence": "private run log reference",
  "recognized": "ACTUAL TRANSCRIPTION",
  "draft": {},
  "corrected": false,
  "clarified": false
}
```

Use `failed` or `unsupported` for those outcomes, `draft: null` if none and an empty recognized string if transcription failed. Keep the raw result in private evidence. Values above are placeholders, not actual observations. Populate the six top-level context fields: `device`, `browser`, `network`, `speech_model`, `extraction_model`, `run_date`.

The legacy `/demo/evaluation` importer still scores the old contract. Its new CP7 panel provides the expanded pack for download; **use the Python scorer for CP7**. Do not import CP7 IDs into the legacy scorer or call a contract download a benchmark.

## 5. Paired live tasks

Use the same speaker, clip facts, device and network for both modes. Alternate voice-first and typing-first across participants/tasks. Start at task presentation and stop only after the final successful confirmation, including every correction and clarification. A live-microphone run must actually capture the participant speaking; supplied-file inference is excluded from speed comparisons. Keep cold model downloads and warm runs separate. Retain cancellations, fallback entry, hidden-page events and failures outside the valid-pair comparison with reasons.

For the expanded scripts, use a stopwatch/observer until the legacy task picker supports those IDs; do not relabel legacy automatic timers as CP7 tasks. Append the two rows in their actual execution order to `timings`:

```json
{
  "pair": "P01",
  "clip": "cp7b-01",
  "speaker": "S01",
  "mode": "voice",
  "order": "voice-first",
  "device": "same anonymous device label",
  "network": "same network condition",
  "seconds": 0,
  "consented": true,
  "confirmed": true,
  "includes_fixes": true,
  "cold": false,
  "input_source": "live-microphone"
}
```

Replace zero with the actual positive duration. The matching row uses `mode: typing` and `input_source: manual`. Aim for 12 completed pairs with both orders, retaining the actual achieved denominator. The scorer excludes incomplete/mismatched pairs and reports each lane's median/p90; it does not invent a speedup or significance result.

## 6. Requests, latency, usage and cost

Record **each** request attempt, including failures/retries, from actual monotonic request timing. Keep billing receipts/usage responses privately; remove API keys, headers and tokens from any report. Request structure:

```json
{
  "id": "R01",
  "latency_ms": 0,
  "failed": false,
  "retry_of": null,
  "input_tokens": null,
  "output_tokens": null,
  "cost": null,
  "currency": "USD",
  "billing_evidence": null,
  "confirmed_update": null
}
```

Populate latency from observation. Set a shared anonymous `confirmed_update` ID only after a successful human-confirmed app update; multiple requests for it count as one update. Preserve retry links. Missing usage/pricing remains null. A measured zero cost needs an actual dated free-allowance/billing record; an account balance alone is insufficient. Use one currency per report. Cost per success includes **all logged attempt costs**, including failed requests, divided by unique successful confirmed updates; if any cost is unknown, the figure remains unknown. Separate speech download/device resource observations from extraction-provider latency.

## 7. Interviews, trial and devices

Copy the empty CSV templates into the private folder. Interview hawkers and customers using anonymous IDs and ask: current listing process, batch tracking, ambiguous voice handling, clearance decisions, halal transparency, confidential reporting, accessibility and willingness to reuse. Record role, consent, actual workflow findings, changes requested and limits. Do not send invitations on participants' behalf or invent testimonials.

Run a documented local trial: discovery → stall → offer; hawker voice/typing → correction → confirmed batch; warning → manually approved clearance → expiry; review/report → private triage. Record outcomes/errors and observable portions/RM only when source evidence supports them. Fictional sales prove workflow only; they are excluded from real waste diversion or income claims.

The device matrix includes real microphone allow/deny, download/memory, BM/English, large controls, slow-network/reconnect, installation/update, offline reload/unvisited lazy route and shopper/hawker workflows. For actual offline acceptance, wait for cache-ready acknowledgement, disconnect the supported browser's network, reload and visit an unvisited route, then restore connection; observe described image fallbacks and unavailable connected writes. For notifications, observe the actual OS/browser notification and its clicked destination, not merely an outbox row. Earlier consent covers this computer's notification test; new phone microphone/push permission belongs to its user.

Provide the target phone model/OS/browser when available. Trusted local HTTPS for that phone is prepared then; no public deployment is required. No device result is inferred from a desktop screenshot or responsive viewport.

## 8. Score and review

```powershell
uv run --project apps/api python scripts/cp7_measure.py report --folder .local-evaluation/cp7-v2
```

This writes `.local-evaluation/cp7-v2/report.json`. Review anonymous findings separately before incorporating them into [evaluation report](evaluation-report.md). WER uses lowercase Unicode words with punctuation removed; its denominator includes only clips with actual transcripts and is shown. JSON validity means an actual JSON object with finite numeric values, **not full provider-schema compliance**. Critical-field accuracy scores exact annotated fields, treats explicit unknowns correctly, and includes the full planned-set field denominator; absent/failed/unsupported runs cannot improve accuracy by disappearing. Per-field counts show executed denominators. Ingredient equality uses case-insensitive sets; timestamps compare aware instants. Human correction/clarification flags remain operator observations requiring evidence review.

Predeclared software evaluation targets: at least **80% full-set critical-field accuracy in BM and Manglish separately**, and **95% JSON-object validity**. These targets do not establish food safety. Report denominator, confidence limitations, failed tasks and unsupported features even if a target passes. Do not tune to the heldout set; fixes require a fresh independent holdout plus an unchanged regression sample. Interviews, actual devices, receipt/consent checks and operating costs remain separate acceptance conditions.

**Next handoff:** provide the private local folder path and actual phone details. CP7's seven feature requirements stay unchecked until that evidence exists. Deployment remains excluded.

## Automatic request evidence — 9 October 2026

[Request measurement guide](AI_REQUEST_MEASUREMENT_GUIDE.md): Evaluation now records browser request times, failures/cancellations/retries, available provider tokens and confirmed-save links in the same tab. Export privately after tasks. Costs remain unknown without dated billing/allowance evidence. These technical observations do not establish live participant timing or independent accuracy. See [actual one-request smoke](LOCAL_FEATURE_COMPLETION.md).
