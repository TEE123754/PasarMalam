# Phase 6 — local code complete; external acceptance pending

Updated 1 October 2026. Remaining translations, automatic paired-task timing, guarded upload abandonment/sweep, live-test runner and reproducible local model setup are implemented. Required external acceptance remains open; see [what needs your involvement](phase6-user-actions.md).

## Implemented behavior

Pinned multilingual Whisper tiny runs via Transformers.js 4.3.0 in a lazy worker with q8 WASM. Recording has a 30-second cap, playback, mono 16 kHz decoding, cancellation and fallback. Audio remains in browser memory; samples, blobs and URLs are released on completion/failure/cancel/unmount. Only reviewed redacted transcripts reach extraction. Model weights may be cached; audio is not cached or uploaded. JavaScript cannot guarantee forensic browser/OS memory erasure. Supplied synthetic/consented evaluation audio is labelled separately and cannot qualify as a timed microphone task.

The authenticated loopback llama.cpp adapter uses bounded schema-constrained Qwen extraction, evidence-based uncalibrated scores, editable fields, no tools and no paid/cloud fallback. Explicit numeric AM/PM/BM clock cross-checks clear conflicting preparation times. This limited check is not proof of arbitrary language semantics; hawkers must confirm/fix every field. Deterministic freshness rules remain authoritative. Optional explanation is disabled by default, checks numeric preservation and falls back to a template.

Migration 009 implements transactional confirmation/retry/quota and 30-day redacted transcript retention. Migration 010 adds explicit abandonment and prevents later attachment. The hourly media operator locks/rechecks attachment state, retains attached originals and ready unresolved tickets, defaults to dry-run and logs Storage retry failures. Railway configuration is written; no job deployed. Owner credentials are not given to the public dispatcher.

BM/English coverage includes existing screens, known errors, dynamic advisory/deadline/outcome messages and evaluation tasks. Technical identifiers and user-entered names remain original. Native-speaker editorial review is still useful. Images remain described placeholders.

Automatic timing includes consent/context, counterbalanced order, matching anonymous pair/clip IDs, warm model-ready start and entry through inference/corrections/successful confirmation. Hidden-tab, failed, cancelled, scripted and supplied-file voice tasks cannot produce valid paired measurements. Evaluation computes per-field/group accuracy, WER, ingredients, corrections and paired median/p90 with denominators, remaining **Not measured** until participant evidence exists.

## Free local inference

Ignored `.local-voice/` now contains checksum-verified official llama.cpp b11146 Windows x64 CPU runtime and Qwen2.5-1.5B-Instruct q5_k_m (~1.29 GB). Manifests pin commits, sizes, SHA-256 and licenses. A private ignored key protects loopback access. Explicit setup/start scripts are provided; no autostart, paid fallback or public model endpoint was enabled. Railway memory/free entitlement is not assumed.

Sources: [Whisper ONNX](https://huggingface.co/onnx-community/whisper-tiny), [Whisper upstream](https://github.com/openai/whisper), [Qwen](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF), [official llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b11146). Start commands are in the user-actions guide.

## Actual gate evidence

| Check | Result |
| --- | --- |
| Frontend phase gate | ESLint, TypeScript, build and 113 tests pass |
| Backend phase gate | Ruff and 79 tests pass; 19 live groups skipped for missing infrastructure |
| Affected clock repair | 20 voice checks pass including four new regression cases; affected tests only |
| Final assets | TypeScript/production rebuild and frontend credential scan pass after manifest/message update |
| Actual local LLM | English/BM/Manglish fictional requests executed; latest request durations about 6.3–6.8 seconds, including validation, not listing speed |
| Model defects | Initial 0.5B model failed/unusable. Upgraded 1.5B handles English control; BM dish evidence unsupported and BM/Manglish clock conversion wrong. Validation clears conflicting times and requires correction; failures retained |
| Actual browser speech | Synthetic SAPI English WAV transcribed: “Chicken Sotty 20 sticks 6 Ring It Ingredients Chicken, Peanuts, Cooked at 5 pm”. Playback removed afterward. Dish/price needed correction; no human accuracy claimed |
| Previous browser fallback | Labelled scripted/fallback draft, independent new batch, menu-only update without an extra batch |
| Human/phone/live | No consented human clips, microphone permission, target Android or configured Supabase; not passed |

[Actual model smoke JSON](phase6-llm-smoke.json) retains input/output/flags/duration. Synthetic audio is excluded from human metrics and timed voice tasks. Its browser transcript was corrected before requesting actual local extraction. No invented WER, accuracy or speedup entered.

Earlier evidence: [speech ready](screenshots/phase6-speech-ready.png), [Malay draft](screenshots/phase6-voice-ms.png), [phone layout](screenshots/phase6-mobile.png). A mobile viewport is layout evidence only. Temporary resources are cleaned up and the user's preview preserved.

Latest browser: [real extraction warning](screenshots/phase6-live-review.png), [corrected fictional batch confirmed](screenshots/phase6-live-confirmed.png), [evaluation phone layout](screenshots/phase6-timing-mobile.png). The supplied-audio flow ran real Whisper, then real LLM on the corrected transcript; the guard cleared an incorrect 5 pm clock. Explicit fictional time selection and confirmation saved a batch. Evaluation stayed unmeasured with empty timing records; missing consent/context prevented task start. At 390×844, document/client widths both 375 px. No real microphone or participant timing claimed.

## Required acceptance remaining

- Collect 10 BM, 10 Manglish and four English recordings from at least five consenting speakers. Preserve failures and evaluate separately; resolve 80% critical-field targets for BM and Manglish. Current satay scripts are a narrow baseline.
- Run participant paired timings through correction/confirmation; report cold download separately.
- Deliberately grant microphone permission for desktop Chromium and target Android checks: recording, denied/cancel, cleanup, cold/warm latency and memory. Check available Safari/iOS fallback, marking unavailable coverage.
- Configure guarded disposable Supabase, apply migrations through 010 after earlier live gates, run `phase6:live`, and verify actual retention/quota/atomicity/Storage/scheduler behavior. No connected SQL/RLS/Storage execution claimed.

Non-failing warnings: upstream Zod annotations, main bundle above 500 kB and test-only signing/deprecation warnings. Speech loads on demand but runtime/weights remain substantial; cheap-phone performance is unverified. No hosting or real-food policy approval performed.
