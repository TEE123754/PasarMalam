# Phase 6 — what needs your involvement

Updated 7 October 2026. Phase 6 implementation and connected SQL gates are completed on the guarded replacement Supabase project. Morpheus `qwen35-9b` is configured privately and three actual fictional text extractions passed. Human recordings, paired timings and target-phone microphone/memory results remain unavailable; they cannot be replaced with generated measurements. No new Supabase or AI key is required. All images remain described placeholders.

## 1. Human recordings and paired timings

Use the [complete recording and evaluation guide](VOICE_RECORDING_GUIDE.md), including all 24 scripts and a five-speaker allocation. It separates retained recording collection from live microphone timing and explains the fixed annotation date.

Use `contracts/voice-evaluation.json`: 10 BM, 10 Manglish and four English fictional prompts. Collect recordings from at least five consenting speakers and annotate expected fields before evaluating. Keep consent receipts and recordings private, separate from ordinary app voice notes. Do not use real names or private stall/customer details. The current narrow satay corpus cannot establish broad menu coverage.

In `/demo/evaluation`, supply a clip ID, anonymous pair ID, device/network and task order, then record participant consent. Alternate voice-first and typing-first. The task panel starts timing before entry and stops only after successful confirmation, including inference and corrections. Both tasks must use matching context. Backgrounded, cancelled, failed, scripted or supplied-file voice tasks do not become valid paired results. Warm voice timing requires the speech model already loaded; record cold download separately. Export the session timing records and actual inference results into the evaluation report. Keep failed attempts and denominators. No accuracy or speedup should be entered before measurement.

## 2. Real microphone and phone checks

The current app uses the consented backend Morpheus adapter. Start the local API and production preview in separate PowerShell terminals from the repository:

```powershell
powershell -NoProfile -File scripts/start-local.ps1 -Service api
powershell -NoProfile -File scripts/start-local.ps1 -Service web
```

Open the demo hawker voice screen, download/load the multilingual speech model, then deliberately grant microphone access when you choose to record. Review/fix the transcript and fields before confirming a fictional batch. Record denial, cancellation and successful cleanup. Repeat on the target Android phone with usable audio; test Safari/iOS fallback if available. Phone microphone access needs a secure browser context and a reachable API; phone `127.0.0.1` refers to the phone, not this PC. Use an appropriately configured HTTPS development environment rather than exposing the private model server. No phone/emulator or microphone permission has been supplied here.

An optional local model remains available: Qwen2.5-1.5B q5_k_m (~1.29 GB), served by official llama.cpp b11146 on authenticated loopback only. It is downloaded into ignored `.local-voice/` on this PC; `npm run phase6:model-setup` verifies/downloads the pinned runtime on another Windows x64 machine. Switching extraction providers requires deliberately configuring the backend; the old model scripts are not the current Morpheus launch path. Railway deployment of this local model is not assumed to fit a free account. See [local operations](local-operations.md).

## 3. Completed connected acceptance

The supplied Session pooler resolved the connection blocker. All 22 migration files are applied with unchanged checksums. Atomic confirmation/retry, foreign-stall rollback, quota and transcript-retention boundaries were exercised against the connected project. The local dispatcher and hourly guarded media sweep are operational; actual dispatch responses were HTTP 200, and eligible-object cleanup retained unresolved ready tickets. Do not reinitialise this accepted target or rerun tests just because you open this document. Use the recovery commands in [local operations](local-operations.md) when a relevant change or failure requires an affected gate. Railway deployment remains the last phase, on hold.

## Current evidence

The latest local build gate and focused repairs cover 194 distinct frontend tests, 150 baseline API passes, 44 distinct connected cases and three actual synthetic FFmpeg checks across batches. Human WER, extraction accuracy and voice-versus-typing timing remain unmeasured. The new offline status is visible, but actual in-app-browser offline reload remains unconfirmed. See [current readiness](local-readiness-acceptance.md) for scopes and limits.

## Historical Phase 6 evidence — superseded for infrastructure status

Local gate: 113 frontend tests and 79 Python tests passed; 19 live groups skipped for missing infrastructure. The subsequent affected clock-validation gate passed 20 voice tests, including four new regressions. Actual local LLM inference ran on three fictional texts; English produced a complete draft, while BM/Manglish required correction. Conflicting Malaysia preparation clocks are cleared, with a visible warning. Synthetic supplied audio is a smoke check only and never substitutes for human evaluation or microphone coverage. See [acceptance](phase6-acceptance.md) and [actual LLM output](phase6-llm-smoke.json).
