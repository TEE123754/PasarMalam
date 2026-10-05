# PasarMalam

Mobile-first community market PWA. Phases 1–11 are locally built, including discovery, vendor batches, freshness, voice, moderation, simulated commerce/partners and presentation. Morpheus extraction and a public PWA shell are implemented; images are white described placeholders. Connected Supabase, human and device acceptance remain pending. See [local readiness](docs/local-readiness-acceptance.md), [PRD](PRD.md) and [implementation plan](IMPLEMENTATION_PLAN.md). Deployment is on hold.

## Local setup

Requirements: Node.js 24, npm 11, Python 3.12 and uv. Exact npm/Python package versions are recorded in the lockfiles.

The selected Node runtime is pinned in `.nvmrc`; direct web dependencies are exact versions. Use `npm ci` and `uv sync --frozen` to preserve the resolved toolchain.

```powershell
npm ci --cache .npm-cache
uv sync --project apps/api --frozen
npm run dev
```

In another terminal:

```powershell
uv run --project apps/api uvicorn app.main:app --reload --app-dir apps/api --host 127.0.0.1 --port 8000
```

Open `http://localhost:5173`. Root routes open the real-app workspace. Click **Try demo**, then **Open prefilled demo**, or visit `/demo/discover` for the separate fictional playground. Copy `.env.example` to `apps/web/.env.local` only when changing web settings; copy server values to `apps/api/.env` when configuring the API later. Never put private keys in `VITE_` variables.

`/health` and `/api/v1/config` are the Phase 1 API contract. Connected discovery/authentication are implemented; configure a disposable Supabase environment using [Phase 2 setup](docs/phase2-setup.md). The fixture app contains fictional markets, stalls and offers. Its role switch and time scenario are for presentation only; administrator permissions are restricted.

## Phase gates

Run checks only after finishing an entire phase. Phase 1 commands and results are recorded in [phase status](docs/phase-status.md). Do not use watch-mode tests or rerun the whole suite after each small change.

```powershell
npm run phase6:check
# After configuring a disposable Supabase environment and prior live gates:
npm run phase5:live
```

The demo administrator screen includes forward-only fixture clock controls; Profile includes four reusable business response scenarios: success, pending, rejected and timeout. They produce labelled `DEMO-` references locally. Business providers are never contacted.

The [feature coverage matrix](docs/feature-coverage.md) maps the full PRD to screens, scenario boundaries and later phases. [Image prompts](IMAGE_GENERATION_PROMPTS.md) remain optional references. All image slots use described placeholders until the user supplies final images.

Phase 3 adds BM/English search, combined dietary/category/promotion filters, day/night schedules, manual-area/device distance, paginated map/list discovery, batch/menu/review profiles and saved stalls/visits. [Phase 3 acceptance](docs/phase3-acceptance.md) records the local/browser checks and remaining real Supabase/Realtime gate. Set `RUN_LIVE_PHASE3=1` only with the configured disposable environment; this gate does not replace Phase 2 live permission/session acceptance.

Phase 4 adds stall/menu editing, map pin placement, validated photos, independent numbered batches, stock actions, audit history, conservative merges and earlier-only preparation corrections. [Phase 4 acceptance](docs/phase4-acceptance.md) explains results, media setup and remaining live checks. Root routes reject this repository’s disposable-demo API; use `/sandbox/discover` on a dedicated technical test deployment for connected acceptance. Real production activation needs a separate reviewed project/schema. The demo makes no real API/auth writes.

Phase 5 adds advisory rules, reminders, confirmed clearance offers and simulated dispatch. See [Phase 5 acceptance](docs/phase5-acceptance.md). Phase 6 adds [voice and quick entry](/demo/hawker/voice), editable JSON confirmation, automatic paired-task timing and an honestly unmeasured evaluation screen. Actual local Whisper/Qwen inference has been exercised with synthetic inputs; human/device/live acceptance remains pending. See [Phase 6 acceptance](docs/phase6-acceptance.md) and [required user actions](docs/phase6-user-actions.md) for setup. Run `npm run phase6:check` only at the phase boundary.

Phase 7 adds `/demo/community` for moderated reviews, confidential verified reports, scoped organiser summaries, hawker replies/appeals and explicit independent-report public-flag decisions. Photos remain described placeholders. See [Phase 7 acceptance](docs/phase7-acceptance.md) and the consolidated [later setup actions](docs/USER_ACTIONS.md), including Supabase, keys, media tools, devices and deployment. Run `npm run phase7:check` at the phase boundary; `phase7:live` requires the guarded disposable environment and migration 011.

Phase 8 adds `/demo/commerce`: reset the evening scenario, prepare its fictional clearance offer, then select shopper, hawker, advertiser, moderator, courier or council personas. It includes pay-at-stall reservations/collection, hypothetical commission, fake online payments/refunds, DEMO receipts, advertising/sponsorship, subscriptions and delivery. `/sandbox/commerce` uses protected caller-scoped database commands. All commercial providers remain simulated and images remain described placeholders. See [Phase 8 acceptance](docs/phase8-acceptance.md). Run `npm run phase8:check` at the phase boundary; `phase8:live` requires the guarded project, migration `20261002051951_commerce_simulation.sql` and `RUN_LIVE_PHASE8=1`.

Phase 9 adds `/demo/partners` for fictional media/supplier collaborations, editorial trails, consented redacted authority cases, officer resolution, council permits/dietary evidence and donation/compost/BSF pickups. Collection and shopper reservations share stock holds; receipts and weights are synthetic. `/sandbox/partners` requires assigned caller memberships. No company or agency endpoint is contacted. See [Phase 9 acceptance and demo steps](docs/phase9-acceptance.md). Run `npm run phase9:check` at the completed phase boundary; `phase9:live` requires the guarded project, migration `20261002060812_partner_simulation.sql` and `RUN_LIVE_PHASE9=1`.
