# PasarMalam

Mobile-first community market PWA. The repository contains the Phase 1 shell and Phase 2 data/authentication implementation (live Supabase acceptance pending); [PRD](PRD.md) and [implementation plan](IMPLEMENTATION_PLAN.md) define later features.

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

Open `http://localhost:5173`. Fixture mode is the default. Copy `.env.example` to `apps/web/.env.local` only when changing web settings; copy server values to `apps/api/.env` when configuring the API later. Never put private keys in `VITE_` variables.

`/health` and `/api/v1/config` are the Phase 1 API contract. Connected discovery/authentication are implemented; configure a disposable Supabase environment using [Phase 2 setup](docs/phase2-setup.md). The fixture app contains fictional markets, stalls and offers. Its role switch and time scenario are for presentation only; administrator permissions are restricted.

## Phase gates

Run checks only after finishing an entire phase. Phase 1 commands and results are recorded in [phase status](docs/phase-status.md). Do not use watch-mode tests or rerun the whole suite after each small change.

```powershell
npm run phase2:check
# After configuring a disposable Supabase environment:
npm run phase2:live
```

The Profile screen includes fixture clock controls and four reusable business response scenarios: success, pending, rejected and timeout. They produce labelled `DEMO-` references locally. Business providers are never contacted.

The [feature coverage matrix](docs/feature-coverage.md) maps the full PRD to screens, scenario boundaries and later phases. [Image prompts](IMAGE_GENERATION_PROMPTS.md) provide one brief per generated asset.
