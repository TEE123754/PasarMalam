# Phase status

Update this file at the end of each phase gate. Original Phases 1–11 have local implementation and representative connected acceptance. CP1 code and its focused gate passed on 8 October 2026; registration-policy and human privacy acceptance remain pending. CP2 local code and gate are complete; CP3 local code/gate are complete; CP4 passport/recording code and gate are complete; CP5 and CP6 are complete; CP8 local implementation is complete; CP7–CP11 external/human acceptance remains pending; deployment remains on hold. Earlier entries below preserve historical checkpoints.

## CP5 — clearance decisions and stock accounting

- Status: **complete locally**, 8 October 2026; four requirements closed. **114 checked / 37 open**; CP6 is next.
- Gate: 118 distinct selected frontend tests / 36 backend tests, including eight connected cases. Final lint/types/build/Ruff, credential/contract/private-permission checks passed.
- One additive migration, 31 total. Connected disposable fixture cleanup retained 33 stalls / 96 foods. No deployment, new provider or actual payments.
- Browser: fictional normal sale, final closing count, feasible/unknown/excessive ETA and downloaded CSV reconciliation passed. The example closes at 30 prepared, 5 normal, 6 clearance, 1 giveaway, 2 donation, 1 discard and 15 leftover portions. Confirmed clearance revenue/savings both RM15.00, all fictional.
- [Acceptance](CP5_ACCEPTANCE.md). CP4 reviewed food policy, CP6 weight metrics and later human/device/partner evidence remain separate.

## CP4 — batch passports and handling records

- Status: **local passport/recording code and focused gate complete**, 8 October 2026. `C07-01` qualified review and `C07-13` approved cumulative accounting/parity implementation remain pending.
- Gate: **68 frontend / 25 backend tests passed**, including one connected journey and its affected restore/merge-trigger retry. Lint/TypeScript/build/Ruff, exported contracts, final credential scan and private-table/function permissions passed.
- Three additive migrations (30 total); connected cleanup retains 33 public stalls / 96 menu items. No reseed or deployment.
- Browser: 158 °F observation, 157 °F correction retaining original, chilled transition, public passport with original 6:12 pm preparation / 6:42 pm deadline / 5 units, 3 handling records and 2 temperature records, blocked clearance and visible QR. Private notes/methods/actors absent from passport. A stale asset after a local rebuild required refresh/update; final route worked.
- **110 checked / 41 open**. [Evidence](CP4_ACCEPTANCE.md) · [Reviewer package](CP4_POLICY_REVIEW.md). CP5 is next; actual phone scan and reviewed policy remain separate acceptance inputs.

## CP3 — confirmed voice workflow

- Status: **local code and phase gate complete**, 8 October 2026. No remaining CP3 coding job; `C05-05` human expression acceptance stays open for CP7.
- Gate: **55 frontend / 39 backend cases passed**, including **5 connected CP3 cases**; lint/TypeScript/build/Ruff, API contract export, credential scan and database permissions passed.
- Two additive guarded migrations; 27 migrations total. Connected fixture cleanup leaves 33 public stalls / 96 menu items. Test-cleanup dependency and static issues were repaired with affected retries only.
- Browser: text draft → Malaysia date clarification → observed English readback start → new Batch 3 → remaining stock 10 to 5 → customer shows original 6:12 pm preparation and 6:42 pm advisory end, with 5 left.
- **107 checked / 44 open** consolidated requirements. [Detailed evidence and limits](CP3_ACCEPTANCE.md). CP4 is next; deployment held.

## CP2 — discovery completion

- Status: **complete locally**, 8 October 2026; **0 remaining CP2 tasks**.
- Seven consolidated gaps closed. Gate: 91 frontend / 26 backend tests (3 connected CP2 cases), lint/TypeScript/build/Ruff, credential scan and browser journeys passed.
- One new additive guarded migration; 33 public stalls / 96 menu items. Local services refreshed; deployment held.
- [Detailed evidence and limits](CP2_ACCEPTANCE.md). CP1 human onboarding/privacy acceptance remains open.

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

## 7 October 2026 — local connected completion and repairs

The supplied Session pooler resolved the replacement database blocker. Applied 22 checksum-tracked files, provisioned five foundation plus 99 Phase 11 identities, complete catalog/commercial/partner history and preserved-audit reset. Auth/markets/model discovery now HTTP 200; database connected. Real scoped dispatcher and media sweep succeeded; minute SQL tick configured without cloud-to-local callback.

Completed build gate: 186 frontend / 150 backend passes, initially 35 live skips. Actual connected execution exposed outdated fixtures and SQL name binding; grouped fixes reran failed/affected cases only. Final coverage is 44 distinct connected cases across gates. Three actual FFmpeg checks and two new frontend permission-timeout tests passed; 188 distinct frontend coverage across batches. Vendor five-case and voice four-case focused gates passed after additive SQL repairs. Exact configured Ruff and secret scans pass. No repeated full regression after individual edits.

Repairs: original unapplied draft-table migration compatibility, scheduled reset lock ordering, freshness/reservation SQL aliases, unchanged-row event loop, stall photo binding and retention-preserving tick. Applied migration history remains immutable, including harmless no-op entries. Two independent actual Realtime clients received public version-only updates in 885 ms; edited stall restored.

Browser evidence: production-preview sign-in/discovery/mode isolation/PWA update, representative fixture reservation/advertiser/permit workflows, actual Week 2 CSV matching nine rows/RM190.02/7.92kg; latest narrow viewport/document400px no overflow. Notification permission never resolved in the in-app browser, so no device receipt is claimed. Human recordings, cheap-phone/PWA acceptance and final images/provenance remain external inputs; deployment held. See [current readiness](local-readiness-acceptance.md), [remaining jobs](REMAINING_JOBS.md) and [user actions](USER_ACTIONS.md).

Final operational probe: connected weather switched from fixture to Open-Meteo; actual vendor refresh persisted a provider observation then reused its cache, both HTTP 200. Minute Cron active with 12 observed recent ticks. Local worker running: dispatcher HTTP 200 and hourly sweep completed with zero candidates. Browser notification timeout and sign-out visibly verified; no actual device enrolled.

## 7 October 2026 — final PWA repair and handoff

A controlled outage of the task-owned preview produced a blank page on in-app-browser reload. Restored the preview and repaired the public shell: bounded build manifest of JS/CSS includes lazy-route styles and exports, excludes large speech/WASM runtime, versions manifest/worker content, validates install assets and obtains a bounded cache acknowledgement. The app now displays preparing/ready/unconfirmed/unsupported status in BM/English instead of silently hiding setup failures.

Completed this repair batch before its gate: lint, typecheck, production build, 11 focused tests and configured frontend credential scan all passed. Six new tests bring frontend coverage to 194 distinct tests across batches. The browser activated the repaired update and visibly reports unconfirmed readiness, so actual offline reload remains open. Desktop browser-control approval timed out before actual notification enrolment/receipt; existing human notification consent remains valid.

Restored localhost API/web/worker after the interrupted turn. Subsequent worker observations included repeated dispatch HTTP 200 responses and one eligible-object sweep deletion while retaining unresolved ready tickets. Corrected stale Phase 6 and demo-guide database/export blockers, updated plan/remaining-job checklists, and retained actual phone/voice/image/pilot inputs as pending. Deployment remains on hold. Evidence: [readiness status screenshot](screenshots/local-offline-readiness-oct7.png) and [local readiness](local-readiness-acceptance.md).

## 8 October 2026 — customer/hawker UI refresh and supplied artwork

Completed the reference-led cream/orange UI batch: customer hero/search/category cards, expandable filters and segmented sorting; selected-stall hawker overview with scoped batch/review/offer counts, illustrated reminders/products, voice-first quick actions and a mobile floating menu. Shared navigation, focus states, responsive layout, detail/menu/offer presentation, demo dialog and asset library are updated. Existing domain engines, role boundaries, batch audits and private evidence remain in control.

All 12 original PNGs supplied in `IMAGE/` are preserved and integrated via 24 metadata-stripped responsive WebP files. Original aggregate size 29,297,792 bytes; output aggregate 1,872,656 bytes. Matching subjects carry demo labels and accessible alt text; unmatched subjects and batch/evidence slots retain described placeholders. The legacy 100 logical slot manifest remains a descriptor catalogue; actual outputs/hashes are recorded in [supplied provenance](supplied-image-provenance.json). Model/date/public-use rights are not invented.

Phase-end gate: after repairing one obsolete TypeScript comparison, typecheck/build and **92 tests in six files** passed. Lint, asset-script Ruff and frontend credential scan passed. Four new artwork tests cover subject/provenance boundaries and all responsive files; frontend coverage is 198 distinct tests across batches. Browser-driven refinements then passed only the affected lint/typecheck/build/credential checks; no repeated broad API/SQL or 92-test run.

Browser evidence: category/search/dietary exclusion/reset, stall selection with matching heading/products/status, floating New batch action closing its menu and scrolling the unsaved form into view. No broken rendered images or horizontal overflow: actual desktop viewport/document widths 1422/1405 pixels and narrow preview 434/417 pixels. Screenshots and exact scope are in [UI refresh report](UI_UX_REFRESH.md). Physical phone/localisation/accessibility acceptance remains separate.

After applying the final app update, the controlling worker now acknowledged **Fictional demo ready offline**. This supersedes the earlier unconfirmed-readiness observation; a network-disconnected reload remains unverified. Temporary browser viewport was restored and fixture role returned to customer. Services remain local. Deployment/publishing and business-provider activation remain on hold. Image local integration is complete; generation metadata/public-use rights, human voice/timing, displayed push, target-device and real pilot review remain open.

## 8 October 2026 — consolidated backlog and completion planning

Reviewed the user's broader consolidated checklist: **94 checked / 57 unchecked** requirements. The open inventory preserves source wording/status reasons and gives each requirement a section/item ID. Every one of the 57 items is mapped exactly once to CP1–CP11, with dependencies, tools, build tasks, phase-end gates and code-versus-acceptance completion criteria. CP12 maps to original Phase 12 deployment and remains last/on hold.

Deliverables: [all partial/pending requirements](PARTIAL_AND_PENDING_JOBS.md) and [completion implementation plan](COMPLETION_IMPLEMENTATION_PLAN.md). Original implementation-plan history is preserved and linked to this extended scope. Human/device checks attached to already implemented features and image metadata/rights are separately listed without inflating the 57-item count. The inventory generator validated unique IDs, complete coverage and all phase counts.

Documentation only: no new feature checkbox was ticked, no application test/build was run, no database/Auth policy/provider setting changed, and no deployment, partnership outreach or external submission occurred. Existing local services/data are unchanged. Official competition instructions, participant measurements, expert policy review, native hardware and real agreements remain inputs rather than fabricated implementation evidence.

## CP1 — Registration, listing details and transparent declarations (8 October 2026)

**Local code and focused gate complete; human registration/privacy acceptance pending.** Consolidated checklist: **97/151 checked, 54 open**. Three requirements closed: C03-07, C04-01, C04-09. C01-03 stays partial.

Delivered dedicated description, independent dietary/ownership declarations and explicit confirmed/unknown allergens with SQL recording/audit and ingredient-change invalidation. Voice cannot infer or reconfirm allergens. Invitation verification and customer onboarding ignore browser/user-metadata roles; new uninvited profiles are refused. Public signup remains disabled. Two additive migrations applied without editing prior applied files; no seed or batch-time reset and no deployment.

After the complete build batch, lint, TypeScript/build, 78 selected Vitest tests, 21 backend tests including 4 guarded connected tests, Ruff and frontend credential scan passed. First sandbox Vite startup failed before execution; only failed build/tests were retried with required filesystem access. Three Python formatting failures were repaired and only Ruff rerun; passed backend tests were not repeated. Browser verified descriptions/declarations, confirmed/unknown allergens, ingredient-edit invalidation, explicit reconfirmation and English/BM invite-only Profile. No human email/password setup or real device claim.

Evidence, commands, migrations and remaining actions: [CP1 acceptance](CP1_ACCEPTANCE.md). Review draft: [CP1 privacy](CP1_PRIVACY_REVIEW.md). Local API refreshed on port 8010; existing frontend on 5174. Next phase: CP2. Owner signup-policy, actual consenting email/password acceptance and privacy/provider/audit-retention review remain pending; CP1 has no further identified local code task.

## CP6 — community and impact, 8 October 2026

Complete locally: seven requirements closed; **121 checked / 30 open**. Review replies/moderation, dedicated report categories, minimised private summaries, opt-in deduplicated telemetry, comparable leftover metrics, measured-weight provenance and suppressed scoped exports are delivered. 47 distinct selected frontend and 25 backend tests passed, including five connected cases; three additive migrations (34 total), fixture baseline 33 stalls / 96 foods preserved. Browser private-draft/public-reply and organiser CSV evidence recorded. [Acceptance](CP6_ACCEPTANCE.md). CP7 human/device evidence is next; provider quality and real pilot effects are not claimed. Deployment held.

## CP7 preparation — 8 October 2026

Collection/scoring preparation complete; all seven human/device requirements remain pending. Expanded 24-case holdout template, consent/audio/hash freeze checks, offline metric/timing/request-cost scorer, interview/trial/device templates and browser pack download are ready. 15 distinct Python tests and six frontend timing tests passed; final static/build/credential and browser download evidence recorded. These are synthetic software checks, not measured human accuracy or pilot effects. Counts stay **121 checked / 30 open**. [Guide](CP7_MEASUREMENT_GUIDE.md) · [Preparation evidence](CP7_ACCEPTANCE.md). No deployment.

## CP8 — photo assistance and evaluated planning

8 October 2026: local gate complete; four real-history requirements pending. Three closed; **124 checked / 27 open** overall. 22 distinct backend cases (one connected), four frontend cases, static/build/contracts/credential checks passed. Affected provider retries followed fenced JSON and ingredient-prose findings; evidence is now constrained to apparent categories. Browser confirmed conflict, source choice and actual draft download. Gemma supplied-image smoke: satay, 480 total tokens; no price/accuracy claim. Synthetic coverage 6/8, below nominal 90%; real history unmeasured. No migration added (34 total); cumulative connected cases 71. API refreshed at 8010; web 5174. Deployment held. [Acceptance](CP8_ACCEPTANCE.md) · [Collection guide](CP8_FORECAST_GUIDE.md).

## CP9 — showcase preparation

8 October 2026: preparation complete; five human/competition requirements remain pending. Overall 124 checked / 27 open. English storyboard/evidence map/conditional declarations/private templates and studio download ready. Nine distinct frontend / one Python case passed; static/build/Ruff, credential scans and private Git-ignore check passed. Affected clearance selection retries preserved the 15-minute cutoff and reject active duplicate offers. Browser pack parity, confirmed scripted Batch 3/older Batch 1, Ubi bakar approval/customer offer, same-workspace advance/delisting, missing-handling block and Not measured label observed. Used an isolated localhost origin due existing shared demo-state interference; no actual offline/phone/student-video claim. No migrations/provider/database call, recording/submission or deployment. [Acceptance](CP9_ACCEPTANCE.md) · [Guide](CP9_SHOWCASE_GUIDE.md).

## CP10 — partner activation preparation, 8 October 2026

Local preparation/contract gate complete; all six real partner/data requirements pending. Six private templates and strict offline review/draft projection, source/expiry/revocation checks and owner handoff briefs delivered. 32 Python (22 new / 10 existing) and 14 existing frontend partner cases passed. Two import-only lint fixes; only failed Ruff rerun. Private-ignore and credential checks passed; actual template review reports missing evidence. No runtime/UI/schema change, network/provider call, external transmission or deployment. Overall 124 checked / 27 open. [Acceptance](CP10_ACCEPTANCE.md) · [Owner guide](CP10_PARTNER_GUIDE.md). Next: CP11 or supply real CP10 agreements/sources and approved samples.

## CP11 — fictional native wrapper preparation, 8 October 2026

Android/iOS source projects and isolated native bundle prepared; native binaries/device testing skipped by owner. 57 distinct frontend tests, lint/TypeScript/builds, platform generation/sync, config/credential checks passed. Dependency pin 8.4.3 avoids CLI audit finding. Focused repairs addressed notification-removal type, late-night seed initialization, Swift Windows paths, native exit link and pause UI cleanup; only affected checks repeated. Browser root/sandbox redirected to working fictional discovery; screenshot captured. No APK, iOS compiler or device receipt claim. C01-07 remains partial; 124 checked / 27 open. [Guide](CP11_NATIVE_GUIDE.md) · [Acceptance](CP11_ACCEPTANCE.md). Deployment held.

CP11 handoff continuation: final source/document review complete; no further code changes or repeated test gate. Owner-requested device/toolchain skip preserved. Native source preparation complete, C01-07 partial and deployment held.
