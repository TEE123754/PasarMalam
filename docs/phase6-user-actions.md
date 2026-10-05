# Phase 6 — what needs your involvement

The remaining local implementation is built. Phase 6 stays acceptance-pending because real participants, a target phone and a disposable Supabase environment are not available in this workspace. These are evidence requirements, not additional paid-service requirements. All images remain described placeholders.

## 1. Human recordings and paired timings

Use `contracts/voice-evaluation.json`: 10 BM, 10 Manglish and four English fictional prompts. Collect recordings from at least five consenting speakers and annotate expected fields before evaluating. Keep consent receipts and recordings private, separate from ordinary app voice notes. Do not use real names or private stall/customer details. The current narrow satay corpus cannot establish broad menu coverage.

In `/demo/evaluation`, supply a clip ID, anonymous pair ID, device/network and task order, then record participant consent. Alternate voice-first and typing-first. The task panel starts timing before entry and stops only after successful confirmation, including inference and corrections. Both tasks must use matching context. Backgrounded, cancelled, failed, scripted or supplied-file voice tasks do not become valid paired results. Warm voice timing requires the speech model already loaded; record cold download separately. Export the session timing records and actual inference results into the evaluation report. Keep failed attempts and denominators. No accuracy or speedup should be entered before measurement.

## 2. Real microphone and phone checks

The free, checksum-pinned local model is already downloaded into ignored `.local-voice/` on this PC. Start these in separate PowerShell terminals from the repository:

```powershell
powershell -NoProfile -File scripts/start-voice-model.ps1
powershell -NoProfile -File scripts/start-voice-api.ps1
$env:VITE_API_BASE_URL='http://127.0.0.1:8000'
npm run dev
```

Open the demo hawker voice screen, download/load the multilingual speech model, then deliberately grant microphone access when you choose to record. Review/fix the transcript and fields before confirming a fictional batch. Record denial, cancellation and successful cleanup. Repeat on the target Android phone with usable audio; test Safari/iOS fallback if available. Phone microphone access needs a secure browser context and a reachable API; phone `127.0.0.1` refers to the phone, not this PC. Use an appropriately configured HTTPS development environment rather than exposing the private model server. No phone/emulator or microphone permission has been supplied here.

The local model is Qwen2.5-1.5B q5_k_m (~1.29 GB), served by official llama.cpp b11146 on authenticated loopback only. `npm run phase6:model-setup` verifies/downloads the pinned runtime if setting up another Windows x64 machine. It has no paid/cloud fallback. Railway deployment of this model is not assumed to fit a free account.

## 3. Disposable Supabase and job acceptance

Follow [Phase 2 setup](phase2-setup.md) and the Phase 4/5 acceptance documents. Configure only the ignored `apps/api/.env` with your disposable project's credentials and guard marker; do not paste secrets into chat. Apply migrations in order through 010 using the guarded migration operator, then complete earlier live gates.

```powershell
$env:RUN_LIVE_PHASE6='1'
npm run phase6:live
npm run phase6:media-sweep
```

The first command fails without a correctly guarded target; it does not substitute fixture passes. Verify atomic confirmation/retry, foreign-stall rollback, hourly quota, 30-day transcript deletion, and explicit upload abandonment. The media command is dry-run by default. After reviewing eligible objects, verify `--apply`, Storage failure retries and the separate hourly configuration in `scripts/media-sweep.railway.toml` on that disposable project. It must retain attached photos and ready unresolved tickets. Confirm the deployed schedule actually runs; configuration files alone are not operational evidence. Do not enable a paid deployment automatically.

## Current evidence

Local gate: 113 frontend tests and 79 Python tests passed; 19 live groups skipped for missing infrastructure. The subsequent affected clock-validation gate passed 20 voice tests, including four new regressions. Actual local LLM inference ran on three fictional texts; English produced a complete draft, while BM/Manglish required correction. Conflicting Malaysia preparation clocks are cleared, with a visible warning. Synthetic supplied audio is a smoke check only and never substitutes for human evaluation or microphone coverage. See [acceptance](phase6-acceptance.md) and [actual LLM output](phase6-llm-smoke.json).
