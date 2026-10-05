# Local readiness checkpoint — 5 October 2026

Frontend and FastAPI remain on localhost. Vercel/Railway deployment is deferred. The requested private GitHub backup is a source-code backup, not app deployment.

## Completed in this batch

- Backend-only Morpheus adapter with explicit transcript-sharing consent, redaction, exact endpoint/model checks, server JSON/evidence validation, two concurrent requests, request/response limits and manual fallback. Local llama.cpp extraction remains available.
- Selected `qwen35-9b`. Real fictional English, BM and Manglish text samples returned Chicken satay, 20 sticks, 600 sen and the stated 5 pm time without flags. See [smoke evidence](morpheus-smoke.json). This is three text examples, not speech accuracy or a representative quality benchmark.
- Qwen initially exhausted its token budget on reasoning and returned null content. A live compatibility check showed `reasoning: {enabled: false}` resolves this. That option is not currently listed in the gateway reference; if support changes, validation fails closed to quick entry. Cloud calls use at most 800 completion tokens and have no automatic retry or paid-provider fallback.
- [Published Morpheus rates](https://apidocs.mor.org/documentation/models/pricing) list this model at USD 0.05 input / 0.15 output per million tokens. Free allowance is **not established**. The supplied account was used for a bounded set of fictional diagnostic requests; no credits, plan or subscription was purchased. Local extraction and typing avoid inference charges.
- Voice menus now belong to the selected stall, preventing ambiguous duplicate food names across the expanded catalog. Changing stall clears the draft, confirmation and external consent.
- White image boxes with centred image descriptions. No artwork was generated or downloaded.
- PWA manifest, code-native identity icon, public-shell caching, build-derived cache version, update control and offline explanation. Private API/Auth/media responses, external maps/weather and large speech assets are excluded. Fixture shell navigation can fall back offline; connected routes show an offline explanation.
- Guarded `scripts/phase11_seed.py` core provisioning scaffold: 99 fictional account identities, roles/memberships, markets/schedules, stalls/menu/reviews, cautious batch records and partner organisations. It has **not run against Supabase** and does not yet implement full commerce/partner history or reset-to-today. New proposed active batches stay `needs-information`; it never invents eligibility.
- Refreshed OpenAPI/types, service readiness evidence and configured-secret scans for both build output and Git upload candidates.

## Verification

The completed local batch passed lint, type checking, production build and Ruff; **186 frontend tests and 149 API tests passed; 33 database-dependent tests skipped**. After the model/PWA repairs, the affected 28 voice/provider API tests and three service-worker tests passed. Only affected checks were repeated.

Browser checks on the production preview verified cloud consent/extraction, editable evidence scores, explicit cooking-time correction and successful fictional batch confirmation. Changing to another stall displayed only that stall's three dishes and cleared consent. Real-app exit, separate demo dialog/re-entry and the PWA Update app reload passed. Final discovery viewport/document widths were both 375 px with no horizontal overflow. White placeholder descriptions were inspected and cramped discovery thumbnails expanded into full-width boxes; the observed 348 px × 120 px box contained an 18 px-high description. Screenshots are under `docs/screenshots/local-*`. This is a desktop browser at phone width, not a physical phone acceptance result.

## Concrete blockers and remaining work

- The supplied direct Supabase DB hostname has IPv6-only resolution on this machine and is unreachable. HTTPS Auth is reachable (200), but the markets REST route returns 404. No SQL migration, seed, reset or live permission/job test was executed. The API secret cannot substitute for a PostgreSQL migration connection.
- Full connected Phase 11 history/reset implementation and SQL scenario parity remain work, not simply a missing key. The core seed scaffold is not a completed connected dataset.
- Real push display, two-client Realtime, Storage isolation, transactional races, scoped role sessions, scheduled cleanup/dispatch and all 33 skipped checks remain unaccepted.
- Actual low-memory phone, microphone, install/update/offline and filtered downloaded CSV acceptance remain pending. Automated cache tests do not replace a physical device check.
- Human recordings, measured extraction/WER and paired voice-versus-typing timing are pending. Final user images are intentionally pending.

The application is **locally built with working fictional workflows; full connected product acceptance is not complete**. See [remaining jobs](REMAINING_JOBS.md) and [user actions](USER_ACTIONS.md).

## Local launch and recovery

This session uses API `http://127.0.0.1:8010` and frontend `http://127.0.0.1:5174` because ports 8000/5173 were already occupied. Unrelated processes were not stopped. `VITE_API_BASE_URL` must match the API port; allowed origins must match the web port. Rebuild when changing Vite environment variables.

```powershell
uv run --project apps/api uvicorn app.main:app --app-dir apps/api --host 127.0.0.1 --port 8010 --env-file apps/api/.env
```

In another terminal, run `npm run dev -- --host 127.0.0.1 --port 5174`, or build once and run `npm run preview -w @pasarmalam/web -- --host 127.0.0.1 --port 5174`. Use `/demo/discover` or `/demo/presentation`. Root routes stay separate; `/sandbox/*` requires configured connected acceptance. Stop only terminals started for this app. Keep secrets in ignored local environment files.
