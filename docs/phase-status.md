# Phase status

Update this file at the end of each phase gate. Phase 1 is complete locally. Phase 2 implementation passed its local phase-end gate and awaits live Supabase acceptance; Phase 3 implementation and local/browser gates passed; Phases 4–12 have not started.

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

## Phase 3 — Customer discovery and stall profiles

- Status: 14/14 implementation tasks written; local automated/browser gates passed; live acceptance pending, 1 October 2026.
- Deliverables: bilingual discovery filters/search, lazy Leaflet map with matching list pages and tile fallback, Malaysian schedules/exceptions, dietary evidence/expiry/conflicts, menu/review/batch detail, saved stalls/check-ins, protected customer RPCs, PostGIS geographic RPC, public monotonic Realtime invalidation, 60-second visible-only polling, coarse/device-only location boundary and migration 005.
- Remaining: live geographic/customer/Realtime acceptance only (1/4 acceptance groups pending). The same unconfigured Supabase environment blocks Phase 2 and Phase 3 live acceptance. See `docs/phase3-acceptance.md`.

### Phase 3 gate results

| Check | Result |
| --- | --- |
| Web lint / TypeScript | PASS; final lint and `tsc -b` production build |
| Vitest discovery logic | **30/30 PASS**; schedules, combined search/filters, ties/pages, distance/bounds, certificate evidence/review/expiry/conflicts, expired offers, denied location and monotonic events |
| API/schema regression | **31 unique checks PASS** across the gate and focused fixes; **8 live groups skipped** (5 Phase 2 + 3 Phase 3) |
| SQL parser | PASS for all five migrations; syntax/duplicate columns only, not PL/pgSQL execution/RLS proof |
| Final production bundle | PASS; 1,882 modules; initial JS 170.45 kB gzip; lazy map JS 44.14 kB gzip; initial CSS 6.36 kB gzip, map CSS 6.46 kB gzip |
| Frontend private-key scan | PASS |
| Browser | PASS: three-market/eight-stall fixture, map pins/card agreement, disabled tile fallback, certified-plus-promotion no-match, debounced BM search, manual area + 1 km nearest, no-results, stable second page, separate two-batch preparation/upload times, save/Saved/remove, repeat visit notice, BM labels |
| Phone layout | PASS at 390 × 844; viewport content width 375 px equals document content width 375 px, no horizontal overflow |
| Real connected / two-client latency | **PENDING**; no Supabase test environment; no latency measured |

Gate began only after the implementation batch. It caught a shared empty-state helper removed during route replacement, outdated Phase 2 fixture count/shape assertions and pytest fixture-import lint. Browser review found a redundant debounced search reset overriding a quick page change and native-select grid overflow on a phone; both were fixed. Only failed or affected checks were rerun; no watch mode or test-on-edit loop was used. A final build/lint/key scan covers the UI fixes; the unchanged API/auth tests were not rerun repeatedly.

Non-failing warnings remain: upstream Zod comment annotations, the initial bundle above 500 kB minified, Starlette TestClient deprecation and a deliberately synthetic short tampering key. Leaflet is lazy-loaded; further connected/Auth splitting belongs to later performance work.

Evidence: [discovery](screenshots/phase3-discovery.png), [tile fallback with one matching pin](screenshots/phase3-map-filter.png), [phone BM](screenshots/phase3-mobile.png). Temporary browser preview used disabled tiles, made no public tile requests, and was closed; the user's existing preview remains available.

### What remains for Phase 3

- Apply migration `202610010005_discovery.sql` to the guarded disposable Supabase environment after Phase 2 live acceptance.
- Run `RUN_LIVE_PHASE3=1` + `npm run phase3:live`: real PostGIS radius/bounds, private idempotent favourites, customer-only daily check-ins, direct-write denial and public version projection. Resolve any runtime SQL/RLS failures.
- Perform the two-browser change/reconnect test described in `docs/phase3-acceptance.md`; record actual update latency against the five-second target and inspect payload privacy.
- Mark the phase complete only after those live checks pass. Phase 3 is currently **locally ready, live acceptance pending**, not fully complete. No hosting was deployed.


## Phase 4 checkpoint — implementation batch written, gate next

12/12 code tasks implemented: vendor stall/menu forms and map placement, optional quantities, independent immutable-photo batches, server timestamps, serialised SQL numbering/idempotency, append-only events, stock/status actions, earlier-only corrections, conservative source-closing merge, metadata-stripped JPEG uploads with signed scoped tickets, draft/retry recovery and offline write blocking. Demo is isolated at `/demo/*` behind a launcher dialog; real root routes reject disposable backend data. Connected acceptance uses explicitly labelled `/sandbox/*`. Local gate is next. Live Supabase/Storage acceptance and production activation remain pending; no service or hosting was configured.


## Phase 4 — local and browser acceptance recorded

Status: **locally ready; live acceptance pending**. Implementation checklist: **12/12 code tasks**. Saved work is described in `docs/phase4-acceptance.md`; demo and real routes/storage are separated and the requested demo launcher modal is implemented. The real app refuses this disposable-demo backend; `/sandbox/*` explicitly labels connected acceptance.

Phase-end checks: web lint/type/build and credential scan pass; **58 Vitest tests pass** (30 discovery, 19 vendor, 9 boundary); **44 Python checks pass** at the gate. Final affected schema/fixture checks: **7 pass**, four Phase 4 live groups skipped. Across the current suite, five Phase 2, three Phase 3 and four Phase 4 live groups remain environment-dependent. No live latency, SQL transaction execution or Storage policy behavior was measured.

Browser evidence: launcher dialog opens `/demo/discover` with three markets/eight stalls; hawker creates a dish and two photo batches; Batch 1 sells out while Batch 2's text, quantity, timestamps and original photo remain unchanged; retry does not duplicate a batch; a fake JPEG produces an error and no new batch; lot edit persists; exit opens the real workspace; phone document/client width both 375 px at 390 × 844. Tiles were disabled. Temporary review tab/server are closed after verification; the user's existing preview remains intact.

Grouped fixes: JSX/type/import gate failures; stale successful-save retry marker; mobile header overflow. Tests ran after the implementation batch and only failed/affected checks were rerun. Original batch identity is immutable, merge windows never extend, optional quantities stay unknown, and no new batch gets a guessed food window.

Remaining Phase 4 work: configure guarded disposable Supabase, apply migration 006, install matching server/private-DB media secret with `phase4:media-setup`, run `RUN_LIVE_PHASE4=1 npm run phase4:live`, and repeat the connected two-photo/failure/reconnect browser journey. Complete prior live gates too. Production setup remains outside this demo acceptance. Periodic orphan sweeping is scheduled for Phase 6; interrupted uploads use best-effort cleanup meanwhile. User-provided final images remain Phase 11 and vendor-copy BM completion is part of final accessibility/localisation work.


## Phase 5 — local completion; connected acceptance pending

Implemented synthetic ingredient/weather advisory policy, non-increasing deadlines, current reminder/draft generation, confirmed bounded clearance offers, inventory/outcomes, leased simulated outbox, coarse opt-in/revocation/quota checks, market weather cache and scoped guarded Cron/dispatcher setup. Final read-time filters conservatively cap stale weather even when maintenance is missed. All images are described placeholders for user-provided assets.

Local gate: lint/type/build/private-key scan pass, 86 frontend and 56 Python checks pass; 15 live groups skipped. Final affected checks: 28 freshness tests, 10 Python checks and TypeScript pass. Browser confirms reminder → fixed declaration → 70% clearance → one simulated delivery → customer visibility → forward-time removal, plus 390px phone layout. See [Phase 5 acceptance](phase5-acceptance.md).

Remaining: apply migrations 007–008 to guarded disposable Supabase after earlier live gates; execute real RPC/RLS/stock-race/outbox lease/revocation/quotas/weather persistence tests; verify minute Cron and deployed scoped dispatcher. No actual Supabase execution, hosting, real push or approved real-food policy claimed.

## Phase 6 — remaining local implementation complete; external acceptance pending

Completed the previously open local work: dynamic BM/error/advisory translations, automatic paired-task timing with consent/context/order and successful-confirmation clock, guarded expired/abandoned upload sweeping, migration 010 and explicit guarded live-test runner. Added official checksum-pinned local llama.cpp/Qwen setup/start scripts and installed the private runtime in ignored `.local-voice/`. Model manifest now uses Qwen2.5-1.5B q5_k_m (~1.29 GB), with no paid/cloud fallback.

Gate: web lint/type/build and **113 frontend tests passed**; Ruff and **79 Python tests passed**, **19 live groups skipped** for missing infrastructure. The actual model smoke exposed errors, so a deterministic explicit-clock mismatch validator was added; only affected voice checks reran, **20 passed including four new regressions**. Final model/message asset build and frontend credential scan passed. No test-on-edit loop or repeated full suite.

Actual inference: official local LLM ran three fictional English/BM/Manglish texts. English control complete; BM dish evidence unsupported and BM/Manglish times incorrect, now cleared with correction warning. Request durations about 6.3–6.8 seconds are LLM/validation only, not listing speed. Preserve failures in `phase6-llm-smoke.json`. Synthetic Windows SAPI English audio passed through real browser Whisper, producing dish/price recognition mistakes; playback was removed after transcription. Corrected transcript → actual LLM → visible conflicting-clock warning → explicit fictional time fix → confirmed independent demo batch verified. This is not a human recording or microphone test.

Browser evaluation remains “Not measured”, with empty timing records; missing participant consent/context prevents task start. BM evaluation and 390×844 layout have document/client widths both 375 px. No horizontal overflow. Screenshot evidence in `phase6-acceptance.md`. All stall/food photos remain described placeholders. Temporary review tab/services cleaned up; user's 5173 preview preserved.

Remaining required Phase 6 evidence:

- At least five consenting speakers, 10 BM/10 Manglish/four English clips and actual per-group accuracy/WER/correction evaluation; then actual counterbalanced paired timings through confirmation. No measured accuracy or speedup exists.
- User-controlled microphone permission and desktop Chromium/target Android audio, cleanup, cold/warm latency and memory checks; available Safari/iOS fallback.
- Guarded disposable Supabase configuration, migrations through 010 and prior live gates, actual atomic confirmation/quota/RLS/retention and scheduled Storage sweep acceptance. No real database/Storage/scheduler runtime claimed.

See [user actions](phase6-user-actions.md) for concrete commands and [acceptance](phase6-acceptance.md) for results/limitations. Local implementation can be reviewed now; full phase completion still depends on those external gates. No paid service, hosting, production-food policy or business integration activated.

## Phase 7 — local implementation verified; connected acceptance pending

Built moderated editable reviews, separate confidential report drafts, verified-account daily quotas/duplicate updates, private evidence/follow-ups, scoped organiser summaries, hawker replies/appeals, moderator-reviewed independence groups and 48-hour reply opportunities, explicit neutral public flag approval/removal/expiry, private referral drafts, review-report/audit queues, stall/dietary-declaration/schedule administration and fictional reset/adversarial personas. Images remain described placeholders. New migration 011 and caller-scoped API enforce permission and Storage boundaries; optional video validation requires FFmpeg/ffprobe and fails closed if absent.

Local gate: lint/type/build and credential scan pass; 123 frontend and 92 Python tests pass, 23 live groups skipped. Final affected checks: 12 community tests and eight API/parser checks pass; procedural parser accepts seven functions. No repeated full-suite testing after browser fixes. SQL parser output is not database/Storage/RLS acceptance.

Browser: verified confidential complaint → separately approved redacted summary → hawker reply → reporter triaged status; unverified denial; organiser/hawker lack raw body/identity/evidence; threshold and 48-hour flag block; explicit flag with approved reply after demo clock advancement, then removal; pending review published once. BM phone-sized layout has document/client widths both 375 px. Screenshot evidence and exact limitations are in phase7-acceptance.md. Temporary review resources cleaned up; existing preview preserved.

## Phase 8 — local implementation complete; connected acceptance pending

2 October 2026: all 15 build tasks complete. Demo commerce covers batch carts, bounded atomic holds, pay-at-stall collection with both confirmations, commission snapshots/reversals, pretend payments/refunds, watermarked receipts, advertiser onboarding/campaigns/moderation/budgets, filtered sponsored search/map/ad previews, tier lifecycle, multi-stall exports, assigned delivery and suppressed market-scoped council metrics. Images remain description placeholders. No real commercial provider, account, payment or dispatch is introduced.

Connected implementation: FastAPI caller-scoped commerce routes, regenerated contracts, private transaction/ledger/request tables and migration `20261002051951_commerce_simulation.sql`, created with Supabase CLI. Browser persona selection exists only in the isolated fixture portal; protected memberships govern connected roles. Ambiguous network retries retain exact action/key, stock guards cover existing vendor actions, and fully refunded orders do not qualify aggregate groups.

Initial complete local gate: lint/type/build, 154 frontend tests, Ruff, 105 API tests, SQL/PLpgSQL parsing and credential scan passed; 26 live cases skipped. Final affected repair gate: lint/build/type, 78 frontend tests, Ruff, 12 commerce API tests and credential scan passed; five Phase 8 live cases skipped. Two new frontend regressions and two live cases were added after the initial full gate. No unnecessary repeat of the full suites.

Browser passed pickup/collection/refund, failed fake payment, tier renewal failure/cancellation, advertiser approval/budget exhaustion, courier assignment/failure, council market/small-group scopes, sponsored halal filtering, unauthenticated connected gate and phone overflow. No console errors observed. Details and screenshots: [Phase 8 acceptance](phase8-acceptance.md).

Remaining: actual migration execution, prior/Phase 8 live gates and authenticated connected browser journeys after disposable Supabase setup; target-phone/network/localisation acceptance in the final-demo gate. No deployment or live database permission claim. Setup is documented in [USER_ACTIONS.md](USER_ACTIONS.md). Next implementation phase: Phase 9.

## Phase 9 — local implementation verified; connected acceptance pending

2 October 2026: all 12 build tasks implemented. `/demo/partners` includes fictional media/supplier applications, editor publication and public badges, three trails/builder, reviewed consented referrals, officer inspection/corrective/follow-up resolution, council permits/renewal/dietary evidence, capacity/coarse suppressed aggregates, and donation/compost/BSF pickups with synthetic receipt/weight totals. Pickups share inventory holds with commerce, vendor stock actions and clearance outcomes. Images remain description placeholders; there are no external business or agency calls.

Connected implementation: strict FastAPI partner actions, updated OpenAPI/types, caller-scoped workspace/public/command RPCs and CLI-created migration `20261002060812_partner_simulation.sql`. Private source links never enter case projections. Roles/memberships/market assignments remain protected; anonymous publication exposes approved editorial fields only. Donation collection reevaluates the advisory before consuming stock. No migration was applied to a live project.

Initial phase-boundary run: 169 frontend tests passed; API run 115 passed, one parser failure, 31 live skips. Focused repairs passed all 10 partner API tests. Final focused shared-stock/commerce/partner suite: 92 passed, including an additional eligible donation/BSF case. Lint/type/build, Ruff and credential scan passed. Final presentation fixes compiled; last stock/parser safeguard rerun passed 14 partner tests and 10 partner API tests. No repeated full-suite run. Three Phase 9 live cases remain skipped.

Browser verified vendor/editor publication, foreign editor denial, independent-report review/reply time, consent rejection, case timeout/retry, foreign officer denial and full officer resolution; council permit approval/expiry/renewal; expired-food compost collection; fresh eligible donation and callback replay; expired donation rejection; two-stop trail publication; connected sign-in gate. Dropdown overflow repaired and phone document/client widths both 375 px. No console errors observed. Evidence and detailed remaining coverage: [Phase 9 acceptance](phase9-acceptance.md).

Remaining: guarded migration/live execution; additional complete connected referral/collection concurrency and privacy cases; connected browser/session/reconnect acceptance; target-phone/accessibility/BM copy polish. Setup is in [USER_ACTIONS.md](USER_ACTIONS.md). No keys needed for standalone demo. Next implementation phase: Phase 10.

Remaining: guarded disposable Supabase and media secret, migrations through 011, prior live gates, actual foreign-role/direct-write/Storage/signed-link-expiry/quota/race/flag tests and valid/invalid video with configured FFmpeg runtime. Human moderation/privacy/retention decisions and real-pilot policy approval remain launch gates. No external referral, hosting or paid service activated. Consolidated later actions: docs/USER_ACTIONS.md; no keys requested in chat.

## Phase 10 — local advanced implementation; live push acceptance pending

2 October 2026: all 13 local build tasks implemented. Seven advanced fixture tabs provide notifications/inboxes, synthetic telemetry/research, scripted AI, web device frames, filtered synthetic dashboards and bounded deterministic forecasts. Separate connected test-push API/SQL/worker code supports one opted-in device, private subscription keys, coarse radius/quiet preferences, leased agent checks, invalid cleanup, stable tags and scoped attempt history. No live migration/device permission/push was performed. Initial full gate: 178 frontend / 131 Python tests pass, 31 live tests skipped; final focused advanced/push checks pass, two additional live tests skip. Browser and limitations: [phase10-acceptance.md](phase10-acceptance.md). Plan has explicit unchecked live concurrency/device/export/phone gates. Setup: [USER_ACTIONS.md](USER_ACTIONS.md). Phase 10 is not fully accepted yet.

## Phase 11 — local presentation build; full acceptance pending

2 October 2026: expanded deterministic fictional catalog (10 markets, 30 stalls/owners, 50 customers, 90 menu items, 150 batches/reviews), expanded operational portal fixtures and labelled historical reference groups; `/demo/presentation` provides local scenarios/reset, synthetic pilot/business view, 100 user-image slots, two original eight-second diagram clips and three unposted community poster drafts. Image prompts remain optional; no artwork generated. Connected Phase 11 provisioning/reset is still implementation work, not merely missing credentials.

Phase-boundary lint/type/build, Ruff and credential scan passed. Initial broad run: 181/183 frontend passed, two obsolete fixture expectations; API 140 passed, 33 live skipped and one Windows tmp-directory fixture error. Grouped repairs: affected 56/58 frontend initially passed, remaining assertion repairs subsequently passed; final affected catalog/commerce/discovery suite 39 passed, Python catalog/media/idempotency three passed. No second broad suite run. Browser evidence and pending acceptance are in [phase11-acceptance.md](phase11-acceptance.md). Human recordings, supplied images, deployed QR origin, full guided/device/export checks and guarded connected runtime remain unchecked in the implementation plan.

## Local-first scheduling amendment — 5 October 2026
Remaining work is consolidated in REMAINING_JOBS.md. Local readiness now includes connected seed/permission/jobs/media/push acceptance, Morpheus adapter implementation (provider chosen; model later selected by agent), PWA/device/export polish and measured human evaluation. Vercel/Railway publishing, deployed-origin settings/smoke checks and QR distribution remain Phase 12, last. Backend remains FastAPI locally and Railway when deployed. No service credentials, migrations, AI calls or deployment were performed in this documentation update.

## Local connectivity and GitHub fallback — 5 October 2026

Morpheus qwen35-9b adapter, explicit cloud consent, stall-scoped voice menus, white described image boxes and public PWA shell are implemented. Three actual fictional EN/BM/Manglish text calls passed; browser draft review and batch confirmation passed. Full local batch: 186 frontend / 149 API pass, 33 connected skips; affected model/PWA repairs: 28 API / three frontend pass. No human accuracy claimed. Guarded Phase 11 core seed scaffold added but unexecuted; full history/reset remains work.

Supabase HTTPS Auth responds, markets REST returns 404 and direct PostgreSQL is unreachable. No remote migration/seed/reset was run. User authorised private GitHub backup as the fallback; source is prepared without ignored secrets. Vercel/Railway remain on hold. Current app ports: web 5174/API 8010. Full evidence and remaining work: [local readiness](local-readiness-acceptance.md), [remaining jobs](REMAINING_JOBS.md).
