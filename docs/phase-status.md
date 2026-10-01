# Phase status

Update this file at the end of each phase gate. Phase 1 is complete locally. Phase 2 implementation passed its local phase-end gate and awaits live Supabase acceptance; Phases 3–12 have not started.

## Phase 1 — Foundation and application shell

- Status: **complete**, 1 October 2026.
- Checklist: **15/15 build tasks complete; 0 remaining Phase 1 tasks**.
- Deliverables: Git/npm/uv scaffolds and lockfiles; responsive customer/hawker shell and restricted Admin state; BM/English catalogue; typed fixture/connected data boundary; local privacy choices and optional read-back; scenario clock; four shared business mock controls; health/config/OpenAPI API; coverage matrix and architecture decisions.
- Final additions: Profile success/pending/rejected/timeout controls, translated error/navigation/close labels, 48 px control sizing, Malaysian calendar date for closing scenarios, exact direct web dependency versions, and both local CORS origins.
- Files/modules: `apps/web/`, `apps/api/`, root toolchain/setup files, `docs/` and the implementation checklist. The original `PasarMalam.md` is preserved.

### Focused phase gate

The first gate was run after building the foundation. It found an unused import, an API line-length issue and a Windows Vite config-loader access issue; those were fixed. The remaining foundation additions invalidated the old web/API results, so one final complete batch was run after finishing those additions. No watch-mode or test-on-edit loop is configured.

Command: `npm run phase1:check` with local `UV_CACHE_DIR=.uv-cache`.

| Check | Final result |
| --- | --- |
| Web ESLint | PASS; no errors |
| TypeScript | PASS; no errors |
| Vite production build | PASS; 1,727 modules; JS 132.36 kB gzip, CSS 5.50 kB gzip |
| API Ruff | PASS; all checks passed |
| Local API contract | **5/5 PASS**: health + aware UTC timestamp, public config, OpenAPI paths, localhost CORS, unavailable privileged route |
| Browser routes | PASS: Discover, Offers, Saved, Profile, five hawker routes, restricted Admin |
| Demo interactions | PASS: role switching, BM/English, privacy dialog, Malaysian closing time, all four simulated response outcomes |
| Connected boundary | PASS: connected banner + unavailable state; roles disabled; fixture data appears only after explicit Open sample demo |
| Responsive layout | PASS: desktop 1,140 × 900 and phone 390 × 844; phone content width equals viewport content width, no horizontal overflow |

Evidence: [desktop](screenshots/phase1-desktop.jpg), [phone](screenshots/phase1-mobile.jpg).

The API test client emits a Starlette deprecation notice about its HTTPX transport; it does not affect the five passing contract checks. Review that test transport when expanding API tests in Phase 2.

### Remaining work and boundaries

- Remaining Phase 1 work: **none**. No external configuration is required for this local foundation.
- Later phases: connected discovery/authentication and durable data start in Phase 2; map/PWA offline behavior, listing writes, safety rules, voice extraction and partner workflows follow their planned phases.
- Hawker, Saved and Admin screens currently show intentional information states. They do not claim functional listing, saved-record or privileged workflows.
- Current visuals use CSS/emoji illustrations. The 100 generated assets and provenance manifest belong to Phase 11.
- Privacy controls store choices only; they do not request device permissions. Speech read-back depends on browser/OS voice availability; real STT is Phase 6.
- Neither Vercel/Railway/Supabase hosting nor a live food-safety system has been deployed.
- Next: **Phase 2 — data, authentication, permissions and initial seeds**.

## Template for the next phase

- Phase/status/date:
- Completed checklist count / remaining items:
- Deliverables and changed modules:
- Phase-end commands and pass/fail totals:
- Failure fixes and focused reruns, if any:
- Blockers and known limitations:
- Checkpoint and next step:

## Phase 2 — Data, authentication, permissions and initial seeds

- Status: implementation built; local validation passed; **live acceptance pending**, 1 October 2026.
- Checklist: 18/18 implementation tasks written; 1/4 acceptance groups passed; 3 remain in the implementation plan.
- Deliverables: four versioned SQL migrations, core/future table foundations, protected transactional RPCs, public-safe views, scoped Storage policies, cryptographic JWT verification, caller-token API repository, connected discovery, memory-only browser sessions and role gates, guarded seed/reset/migration tools, OpenAPI-generated types and shared fixtures, bilingual privacy notices and permission matrix.
- No configured Supabase project, Docker, Supabase CLI or database credentials are available. Actual migration execution, repeated seeds, RLS/Storage permissions and browser login/expiry are unverified. Unit tests and SQL parsing cannot substitute for these checks.
- Run tests at the phase boundary only: `npm run phase2:check`, then `npm run phase2:live` when the disposable environment is configured. Full future workflow behavior remains in its assigned phases.

### Local phase-end gate result

- Web ESLint and TypeScript: PASS.
- Production build: PASS; 1,870 modules, JS 159.51 kB gzip, CSS 5.55 kB gzip. Rollup removes two upstream Zod comment annotations and warns about the 508.65 kB JS chunk; consider splitting connected/Auth code during later performance work.
- Python Ruff: PASS after fixing four import-order findings and correcting the Windows path match for the documented long SQL literal exemption. Only failed/unfinished checks were rerun; the passing web gate was not repeated.
- pytest: **30 passed, 5 skipped** in 1.39 seconds. Coverage includes JWT claims/signature/rotation caching, metadata role denial, caller-token forwarding, strict inputs, shared fixture shape, four PostgreSQL migration syntax/duplicate-column checks and operator target/marker guards. The five skipped checks are explicitly live Supabase groups. SQL parsing does not execute PL/pgSQL or prove database policy correctness.
- Frontend credential scan: PASS. Detects privileged token formats and any configured private API environment values; no private environment file is configured here.
- Browser: PASS for existing fixture discovery, connected Profile missing-configuration guidance, disabled demo role controls, and unauthenticated Admin/hawker dashboard access denial. Actual sign-in/logout/expiry remains pending.
- Evidence: [connected access denial](screenshots/phase2-connected-denied.png).
- Non-failing test warnings: Starlette's TestClient HTTPX deprecation and a deliberately synthetic short HMAC tampering key. Deployment keys are not test keys.

### Remaining Phase 2 work

1. Configure one disposable Supabase project or install/start the official local stack with Docker. Follow `docs/phase2-setup.md`; keep keys/passwords in ignored environment files.
2. Apply all four migrations, record the guard UUID, and run `npm run phase2:live` with `RUN_LIVE_PHASE2=1`. The gate repeats seeds and checks real API/direct REST/Storage boundaries. Resolve any runtime migration or permission failures before claiming completion.
3. Exercise real connected browser account sign-in/logout, trusted vendor/admin roles and session expiry. Record these results and check the three remaining acceptance groups only after they pass.

Phase 2 is **not complete**: all 18 implementation tasks are written, but the live acceptance environment is unavailable. No deployment, real payment, partner message or authority referral occurred. Checkpoint contains the implementation and reproducible local/live gate commands.
