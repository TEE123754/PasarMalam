# PasarMalam — Phase-by-Phase Implementation Plan

Version: 4.3 · Date: 1 October 2026 · Status: Phase 1 complete; Phases 2–3 built locally, live acceptance pending

Product contract: [PRD.md](PRD.md). Original input: [PasarMalam.md](PasarMalam.md). Assets: [100 prompts, one prompt per image](IMAGE_GENERATION_PROMPTS.md).

Repository/model shortlist and source evidence: [TECH_REFERENCES.md](TECH_REFERENCES.md). The PRD's new technical, ethics and business requirements are mandatory and mapped to the phase gates below.

Phase 1 is implemented and verified locally. Phase 2 implementation passed local checks; live Supabase acceptance remains pending. Phase 3 implementation and local/browser checks pass; its live Supabase acceptance remains pending. Phases 4–12 remain planned, and hosting is not deployed. Start with a mobile-first PWA and deliver a demonstrable, zero-spend version using **Vercel + Railway + Supabase**. Paid commercial operation and guaranteed always-on availability are outside this demo commitment.

**All features, including the earlier future roadmap, remain in demo scope.** Business records and partner workflows are fictional. Connected mode additionally implements live weather, real STT → LLM JSON extraction, realtime map updates, persisted closing-agent actions and genuine Web Push to consenting test devices. Agencies, commercial partners, payment gateways, delivery, SMS and email remain simulated. Primary reservations use **pay-at-stall**; retain fake online payments only in the future-capability showcase. A “Coming soon” placeholder does not complete a phase.

## 1. Execution and testing rules

**Finish building one phase before running its tests. Do not run tests after each component, file edit, prompt, or small build change.**

For every phase:

1. Read that phase's tasks and the relevant PRD requirements.
2. Implement the complete phase scope, including its fixtures and meaningful tests. Tests may be written during development, but execute them only at the phase gate.
3. Run one focused end-of-phase verification batch: relevant static checks, build check, automated tests, and a short manual check where specified.
4. If the gate fails, group related fixes, then rerun only the failed checks and directly affected regression tests. Repeat only until those checks pass.
5. Record a concise result with command, pass/fail totals, blockers, and known limitations in `docs/phase-status.md`. Commit or checkpoint the completed phase when a Git repository is available.
6. Proceed after required criteria pass. Do not claim a phase complete while a critical defect remains; record a blocked state if external configuration is unavailable.

Additional constraints:

- Do not use Vitest/pytest watch mode, continuous browser test loops, or test-on-save hooks.
- A development server's hot reload is allowed; it does not require a new test run.
- Do not repeatedly build the whole app just to check individual edits. Use one production build at the applicable phase gate.
- Run the full regression suite once in the final release phase. Earlier phases run only their focused scope and directly affected shared contracts.
- Configure optional GitHub Actions as a manual `workflow_dispatch` phase gate, not a test suite on every push. Hosted CI is optional and must fit the account's free allowance.
- Keep outputs concise. Save detailed failure logs locally; do not repeatedly dump successful logs or reread unchanged files.
- The only routine retests are for actual failures, subsequent changes that invalidate a result, or the final release gate.

## 2. Stack and engineering choices

| Area | Technology | Why / hosting |
| --- | --- | --- |
| App | React, TypeScript, Vite | One fast mobile web app; static build on Vercel. |
| UI | Tailwind CSS, Radix primitives, Lucide | Accessible reusable components without a paid UI kit. |
| Routing/data/forms | React Router, TanStack Query, React Hook Form, Zod | Route separation, request caching, typed form validation. |
| Languages | i18next, react-i18next | BM/English translations and locale-aware dates/MYR. |
| Map | Leaflet, React Leaflet, OSM raster tiles | Enough for demo pins and nearby search; configurable provider and list fallback. |
| Backend | FastAPI, Pydantic, Uvicorn, HTTPX | Small Python REST API on Railway; OpenAPI contract. |
| Database | Supabase PostgreSQL + PostGIS | Relational model, spatial queries, RLS and transactional functions. |
| Auth/media | Supabase Auth + Storage | User JWTs, ownership rules, separate public/private media. |
| Scheduled work | Supabase Cron / pg_cron | SQL alert generation while Railway is idle; no separate worker. |
| Speech | Transformers.js, multilingual Whisper-tiny ONNX, Web Worker | Local transcription with no inference bill; text fallback. |
| Listing extraction | FastAPI LLM adapter, Gemini JSON-schema output; optional local Qwen/llama.cpp | Actual JSON extraction with validation/confidence; synthetic inputs on hosted free tier. No LLM in eligibility calculations. |
| Freshness/weather | Versioned SQL policy tables/functions, Open-Meteo temperature/humidity cache | Deterministic advisory caps; demo rules isolated from real-food use until expert review. |
| Agent/events/push | pg_cron, pg_net, SQL outbox, signed FastAPI dispatch, pywebpush/VAPID | Persisted drafts/nudges, confirmation, retry and real test-device push. |
| Live map | Supabase Realtime, TanStack Query | Public-safe event invalidation, version-aware reconnect and polling fallback. |
| Images/demo data | IMAGE_GENERATION_PROMPTS.md, generated image files, procedural fallback, Sharp, JSON + SQL seeds | 100 separate generated assets with provenance; all business records fictional. |
| External integrations | Typed mock-provider interfaces, TypeScript fixture engine, FastAPI adapters, SQL event log | Simulated company/agency/ad/payment/delivery/message/sensor operations; no third-party SDK calls. |
| Charts/exports | Recharts, browser CSV export, HTML print styles | Synthetic analytics, telemetry and demo receipts without paid reporting tools. |
| Package management | npm + lockfile; uv + Python lockfile | Reproducible installs and small deploy images. |
| Checks | TypeScript, ESLint, Ruff, Vitest/Testing Library, pytest, Playwright, axe-core | Static, domain, API, permission, browser, and accessibility coverage at phase gates. |
| Development | Git, editor, Supabase CLI; Docker-compatible local engine where available | Version control and local database services. No paid tooling required. |

Choose compatible stable versions once during Phase 1 and lock them. Weather, transcript LLM extraction and opted-in test Web Push are explicit live technical adapters; all business partner adapters stay simulated. Reuse the existing services, with no separate agent framework, Redis, paid payment gateway or native-store publishing. Evaluate real inference on the chosen free route rather than asserting that a scripted fixture satisfies the LLM requirement.

Supabase Cron can schedule SQL functions directly in PostgreSQL, which supports this small reminder workload without a continuously running API worker. [Documentation](https://supabase.com/docs/guides/cron)

### Repository layout

```text
PasarMalam/
  PasarMalam.md                 # Original concept, preserved
  PRD.md
  IMPLEMENTATION_PLAN.md
  IMAGE_GENERATION_PROMPTS.md   # One standalone prompt per asset
  apps/
    web/
      src/
        app/                     # Routes, providers, role layouts
        components/              # Shared UI
        features/                # Core app plus commerce, ads, partners, authority, lab
        data/                    # API adapter and fixture adapter
        integrations/            # Typed simulation adapters and scenario controls
        locales/                 # bm / en
        workers/                 # Speech worker
      public/demo/               # Generated illustrations and sample clips
      tests/
    api/
      app/
        api/                     # Versioned endpoints
        auth/                    # JWT verification and role resolution
        services/                # Validated use cases
        repositories/            # Supabase client with caller JWT
        integrations/            # Business mocks plus scoped weather/LLM/test-push adapters
      tests/
      Dockerfile
  contracts/                     # OpenAPI snapshot and generated TS types
  supabase/
    migrations/                  # Schema, RLS, functions, indexes, cron
    seed/                        # Idempotent seeds and fixture definitions
  scripts/                       # Generate assets, seed, reset demo, phase checks
  docs/
    decisions.md
    phase-status.md
    demo-guide.md
    deployment.md
    test-matrix.md
    feature-coverage.md           # Every PRD feature -> screen -> scenario -> phase gate
    asset-manifest.json          # 100 prompt IDs, files, alt text and provenance
    evaluation-report.md         # Actual extraction metrics and paired voice/typing timing
    pilot-plan.md                # One market, 10 stalls, four weeks; KPI definitions
    privacy-data-map.md          # Audio deletion, transcripts, coarse location, retention
  .env.example                   # Placeholders only
```

### Trust boundaries and application modes

- **Connected mode:** browser obtains a Supabase Auth session; requests carry its JWT to FastAPI. FastAPI verifies it and forwards the caller's token to the Supabase Data API so RLS remains effective. Database RPCs perform protected atomic changes.
- **Fixture mode:** the same application interface reads bundled JSON and saves simulated edits in browser-local storage. Role switching and time travel exist only here. No network write or privileged key is available.
- Public fixture demo and connected invite-only demo use separate Vercel deployment configurations. Their mode banners are always visible.
- Never implement backend failure as a silent fixture fallback. Tell the user the live request failed and offer an explicit switch to the sample demo.
- Admin credentials and Supabase service keys stay in trusted environment variables or an operator's seed process. They never appear in fixture files, browser code, screenshots, or committed `.env` files.
- Both modes force business `INTEGRATION_MODE=simulated`. Connected-only flags allow live Open-Meteo, real LLM extraction of permitted synthetic transcripts and Web Push to consenting test subscriptions. Keep keys server-side and endpoints allowlisted; arbitrary callback/LLM URLs are forbidden. SMS/email/company/authority/payment adapters cannot send externally.
- Connected partner roles are scoped by fictional organisation membership; fixture persona switching models the same permissions. Every fake receipt/case/reference has a `DEMO-` identifier and visible simulation label.

## 3. Phase overview

Estimates are rough solo-developer effort, excluding account provisioning, image-generation waiting time and feedback. Expanded total: approximately **48–71 working days**, with any real four-week pilot scheduled separately after readiness review. Re-estimate after foundation and speech validation; no fixed launch date is promised.

| Phase | Outcome | Depends on | Estimate |
| --- | --- | --- | --- |
| 1 | Project foundation, design shell, explicit demo modes | PRD | 2–3 days |
| 2 | Database, authentication, permissions, initial seeds | 1 | 3–5 days |
| 3 | Customer discovery, realtime map, coarse location and filters | 2 | 4–5 days |
| 4 | Hawker listings, uploads, independent batch records | 2–3 | 4–5 days |
| 5 | Deterministic weather/risk rules, closing-time agent, offers | 4 | 6–9 days |
| 6 | STT → LLM JSON, confidence/chips and measured evaluation | 4–5 | 5–8 days |
| 7 | Verified reports, organiser triage, hawker reply, public flags | 2–6 | 4–6 days |
| 8 | Orders, fake payments, ads, sponsorship, subscriptions, delivery | 1–7 | 4–6 days |
| 9 | Company/media, authority/council and waste partner simulations | 1–8 | 4–6 days |
| 10 | Test Web Push, demand forecast, analytics and advanced previews | 1–9 | 4–6 days |
| 11 | Complete seeds/images, evaluation screen, pilot dashboard | 1–10 | 4–5 days |
| 12 | Hosting, full acceptance gate, handoff | 1–11 | 4–7 days |

Phases are sequential by default. Do not start extra agents, speculative parallel work, or later-phase features unless separately requested.

## 4. Phase 1 — Foundation and application shell

**Status: COMPLETE — 1 October 2026.** All 15 build tasks and the focused phase gate are complete. Nothing remains within Phase 1. Details: [phase status](docs/phase-status.md).

**Goal:** Establish the selected stack, clear navigation, and one application contract for both fixture and connected modes.

**Tools:** npm, uv, Vite, React, FastAPI, Tailwind, Radix, i18next, Git.

### Build tasks

- [x] Create the repository layout and initialise Git if needed; preserve the original concept document.
- [x] Pin dependencies and runtimes; add `.gitignore`, lockfiles, and environment templates.
- [x] Build Customer navigation: Discover, Offers, Saved, Profile.
- [x] Build Hawker navigation: Dashboard, Stall, Menu/Batches, Promotions, Alerts.
- [x] Create restricted Admin layout; leave privileged routes unavailable until real authorisation exists.
- [x] Define colours, typography, cards, empty/loading/error states, accessible forms, and mobile bottom navigation.
- [x] Add BM/English translation infrastructure from the start; avoid hard-coded strings.
- [x] Define `DataGateway` methods and a small shared type contract; implement an initial fixture adapter.
- [x] Add explicit `fixture` versus `connected` configuration and persistent demo banners.
- [x] Add FastAPI `/health` and `/api/v1/config` with a minimal OpenAPI schema.
- [x] Add clock abstraction: system/server time in connected mode, explicit scenario time in fixture mode.
- [x] Create a phase-status template and end-of-phase check scripts; tests do not run automatically on edits.
- [x] Create `docs/feature-coverage.md` for all PRD requirements including Section 16. Define mock-provider interfaces and shared `success/pending/rejected/timeout` scenario controls.
- [x] Add the technical/ethics/business requirements in PRD Sections 17–19 to that matrix; distinguish live technical adapters from fake business integrations.
- [x] Design 48 px primary controls, icon-plus-text chips, optional read-back and the permanently free basic tier. Add privacy notice/consent surfaces without making microphone/location mandatory.

### Deliverables

Working responsive shell, typed data boundary, basic API, pinned toolchain, and a recorded architecture decision file.

### End-of-phase test gate — run after the complete foundation is built

- One web lint/type/build batch and API lint/import/health check.
- A small browser smoke check for navigation, locale switching, and visible demo mode.
- Check phone and desktop layouts once; no exhaustive visual regression suite.

**Done when:** the app starts locally, every main route has an intentional state, mode changes are explicit, and the API health response is valid.

### Completed implementation and evidence

- React/TypeScript/Vite/Tailwind shell; customer and hawker navigation, responsive cards/search/detail screens, and restricted Admin state.
- Exact direct web dependencies and npm/uv lockfiles, Node 24.14.0 selection, Python 3.12 runtime constraint, environment examples, Git repository and local setup guide.
- BM/English catalogue, privacy choices, read-back action, 48 px controls, fixture scenario clock using the Malaysian date, and a free-basic-tier message.
- Typed fixture/connected gateways; shared simulated-provider interface and four working Profile outcome chips with `DEMO-` references.
- FastAPI health/config/OpenAPI contracts and CORS for both local frontend origins; architecture record and full PRD coverage matrix.
- `npm run phase1:check`: **PASS** (web ESLint, TypeScript, Vite production build, API Ruff, API contract 5/5). Browser smoke: main routes, role switching, locale, privacy, clock, four provider outcomes, and explicit connected-to-sample switch passed. Phone and desktop reviewed once at the final gate; screenshots saved under `docs/screenshots/`.

### Work after Phase 1

No Phase 1 items are outstanding. Next is Phase 2: Supabase schema/RLS, authenticated sessions, protected roles, storage, initial persistent seeds and API response parity. The current hawker/admin information states are foundation states; their real workflows, generated assets and deployment are owned by later phases and have not been claimed complete.

## 5. Phase 2 — Data, authentication, permissions, initial seeds

**Status (1 October 2026):** 18/18 implementation tasks written. Local phase-end validation passed; Phase 2 is **not complete** until real Supabase acceptance passes. No disposable Supabase environment is configured in this workspace.

**Remaining acceptance checklist:**

- [x] Pass local lint, types, production build, JWT/contracts/SQL parsing/operator guard checks and frontend credential scan. Result: 30 passed, 5 live groups skipped; connected missing-config and unauthenticated role gates verified in browser.
- [ ] Apply all four migrations to a disposable Supabase database; seed twice and confirm stable counts/identities.
- [ ] Pass real API + direct REST role/isolation checks, Storage privacy, complaint rate limits and moderation permissions.
- [ ] Exercise actual browser sign-in/logout and session expiry with the provisioned accounts.

Implementation checkmarks below mean code is present; they do not certify live database or session behavior. Setup: `docs/phase2-setup.md`; permission matrix: `docs/test-matrix.md`. Future-module tables are foundations; their full simulated features remain in their scheduled phases.

**Goal:** Establish the persistent records and security rules before building user-facing writes.

**Tools:** Supabase CLI, SQL migrations, PostGIS, Supabase Auth/Storage, FastAPI, Pydantic, HTTPX, pytest.

### Build tasks

- [x] Create the tables and relationships listed in the PRD, initially with minimal columns for later modules.
- [x] Enable PostGIS and spatial indexes; store latitude/longitude as geographic points for metre-based distance queries.
- [x] Add uniqueness, foreign keys, integer money, stock constraints, and UTC timestamps.
- [x] Create RLS policies for visitor/customer/vendor/admin; store authoritative roles in a protected table, never user-editable metadata.
- [x] Verify JWT signature, expected issuer/audience, expiry, and role lookup at the API boundary. Cache signing keys appropriately and handle rotation.
- [x] Add public-safe views that omit private profiles, evidence, and internal moderation details. Ensure view/function privileges preserve intended RLS behaviour.
- [x] Create transactional RPC entry points for batch creation, inventory changes, promotions, reviews, complaints, and moderation. Revoke direct protected table writes.
- [x] Prefer invoker security; where a definer function is necessary, constrain `search_path`, grants, actor checks, and returned data.
- [x] Create public listing-media and private complaint-evidence/certification buckets with matching Storage policies.
- [x] Add login/logout and session-expiry UI; a UI role switch cannot change access rights.
- [x] Build idempotent minimal seeds with stable UUIDs: two markets, two vendors, two customers, one private admin, and a few menu items.
- [x] Create a guarded seed/reset command restricted to a configured demo project; never run a destructive reset against an arbitrary supplied URL.
- [x] Keep Auth user creation separate from display personas; use `.invalid` fictional addresses for seed identities and pre-provisioned credentials for private test sessions.
- [x] Add an initial API-to-fixture parity contract for response shapes. Generate TypeScript types from OpenAPI when the schema stabilises.
- [x] Include organisation memberships, fake ledgers, orders/reservations, authority referrals/consents, permit records, delivery/collection jobs, notifications, telemetry and integration-event tables from PRD Section 12; complete behaviour in Phases 8–10.
- [x] Include `is_demo`, source scenario and stable event identifiers; add organisation-isolation policies and forbid arbitrary outbound integration URLs.
- [x] Add organiser memberships, verified-account status, report replies/flag decisions, extraction metadata, weather/rule audit, agent drafts/runs, protected push subscriptions, commission ledger, forecast/pilot measurements and notification consent tables.
- [x] Document BM/English notices, audio/transcript lifecycle, coarse location expiry and rights requests in `docs/privacy-data-map.md`; identify PDPA and cross-border/provider-review work before any real pilot.

### Deliverables

Versioned schema/migrations, working sessions, scoped Storage, repeatable seed command, and a permission matrix in `docs/test-matrix.md`.

### End-of-phase test gate

- Apply migrations and seed a disposable/local demo database once; repeat seed once to prove idempotency.
- Run focused integration checks: visitor cannot write; vendor A cannot change vendor B; customer cannot become admin; private evidence is inaccessible publicly.
- Exercise direct Supabase access as well as FastAPI so restrictions cannot be bypassed around the API.
- Verify sign-in/session expiry and that frontend output contains no privileged key.

**Done when:** real sessions enforce the permission matrix, seed counts are stable, and all private information remains protected across API, database, and Storage paths.

## 6. Phase 3 — Customer discovery and stall profiles

**Status (1 October 2026):** 14/14 implementation tasks written; local automated and browser gates passed. Implementation checkmarks do not certify live Supabase behavior. Phase 2 live Supabase acceptance remains pending and also prevents live Phase 3 acceptance.

**Remaining acceptance:**

- [x] Complete Phase 3 implementation checklist below (14/14 code tasks).
- [x] Run phase-end schedule, dietary, distance, pagination and event-order checks plus build/lint/types. Result: 30 Vitest tests and 31 unique API/schema checks passed; 8 live groups skipped.
- [x] Verify browser browse/filter/detail/save and map-tile fallback flows. Manual area, certified/promotion mismatch, BM search, empty search, two pages, save/remove, duplicate visit and 390 px BM layout verified.
- [ ] Apply migration 005; verify real geographic RPCs, customer writes and two-client Realtime update/reconnect latency/private payload isolation against disposable Supabase.

**What is left for Phase 3:** one live acceptance group, including migration 005 execution, real PostGIS/customer RPC/RLS checks and two-client update/reconnect latency and payload privacy. No configured Supabase/Docker environment is available. The five-second latency target has not been measured. Follow `docs/phase3-acceptance.md`; Phase 2 live permission/session acceptance must also pass. Generated photos and full policy/voice/moderation workflows remain in their assigned later phases.

**Goal:** Customers can find a market, compare stalls, and discover relevant foods.

**Tools:** React, Leaflet, TanStack Query, PostGIS RPC queries, Playwright, Vitest.

**PRD coverage:** DISC-01/02/03, DIET-01.

### Build tasks

- [x] Implement day/night market cards, map pins, accessible list view, and market detail pages.
- [x] Evaluate weekday schedules, date exceptions, opening-soon states, and sessions spanning midnight in Malaysian time.
- [x] Distinguish scheduled market activity from vendor-reported stall opening status.
- [x] Add optional geolocation, manual area selection, map-bound queries, and distance filters.
- [x] Implement category/dietary/promotion filters and nearest/rating/popularity sorts with stable pagination.
- [x] Add BM/English aliases for search and debouncing; avoid a separate search service.
- [x] Add stall/menu/photo detail layouts, preparation versus upload timestamps, and multi-batch placeholders.
- [x] Add favourites and rate-limited daily check-ins; enforce uniqueness server-side.
- [x] Implement dietary labels with evidence state and expiry, including conflicting item/stall declarations.
- [x] Add OSM attribution, appropriate ordinary browser caching, configurable tile source, and list fallback on tile failure.
- [x] Subscribe to public-safe Supabase Realtime invalidation events for the visible market; include record versions and fetch canonical eligible results after updates/reconnect.
- [x] Retain 60-second polling fallback, stale badges and pause-on-hidden behaviour. Do not expose complaints/private rows through broadcast payloads.
- [x] Keep server-side location to an opted-in coarse approximately 1 km area cell; manual market choice works without GPS. Any precise local distance computation remains on-device.
- [x] Ensure missing review or promotion modules display correct seeded/empty states until those phases are complete.

### Deliverables

Functional customer browse-to-stall journey in both modes, with geographic queries and explicit schedule/dietary semantics.

### End-of-phase test gate

- Focused schedule boundary checks: midnight, cancelled session, opening and closing instants.
- Integration checks for distance filters, combined filters, pagination, and rank ties.
- Browser flow with denied location permission, empty search, unavailable tiles, and a non-halal/certified filter mismatch.
- Two-client update/reconnect check: changed offers appear within the five-second target when connected, out-of-order events do not restore expired offers, and no private rows appear in event traffic. Report actual latency.
- One relevant web build/type check; stub tile network requests in automated tests rather than repeatedly requesting public tiles.

**Done when:** map/list results agree, distance works with a chosen area, schedule labels are accurate, and no dietary filter is bypassed.

## 7. Phase 4 — Hawker listings, photos, and batch tracking

**Goal:** Vendors manage stalls and foods and create separate, auditable batches.

**Tools:** React Hook Form, Zod, FastAPI/Pydantic, Supabase Storage, SQL RPCs, pytest.

**PRD coverage:** HAWK-01, BATCH-01.

### Build tasks

- [ ] Build stall setup/edit, market selection, lot and map placement, opening status, and menu forms.
- [ ] Implement image capture/upload, file-content validation, size/dimension limits, compression, EXIF removal, and upload progress.
- [ ] Create authenticated upload authorisation with scoped paths; clean up orphaned uploads after failed entity saves.
- [ ] Implement “New batch prepared” with food selection, preparation time, handling declaration, optional quantity, and photo.
- [ ] Keep the preparation timestamp distinct from server creation/upload timestamps.
- [ ] Allocate batch sequence numbers and enforce idempotency in a transaction; guard concurrent submissions.
- [ ] Persist immutable batch identity and append-only events for quantity, correction, withdrawal, merge, and discard actions.
- [ ] Provide available/sold-out/withdrawn/discarded actions without allowing negative stock.
- [ ] Keep previous batches visible in hawker history and eligible customer detail views.
- [ ] Add a merge action that carries the earliest source deadline and closes the source batches; never reset old stock as freshly prepared.
- [ ] Implement the basic rule that published preparation corrections cannot move a deadline later; Phase 5 completes the policy calculations.
- [ ] Disable timing-sensitive writes offline; preserve unsent form text as a draft without implying a server save.

### Deliverables

Complete vendor stall/menu management, secure image uploads, independent batch records, and a useful event history.

### End-of-phase test gate

- API/database checks for ownership, duplicate retry, concurrent batch numbering, atomic stock updates, and earliest-time merge behaviour.
- Storage checks for invalid file contents, oversized upload, private/public path separation, and metadata removal.
- One browser journey: create food → Batch 1 → Batch 2 → sell out Batch 1 → inspect unchanged Batch 2 and original photos.
- Test a failed upload/save and confirm no phantom available batch appears.

**Done when:** two batches of the same food coexist correctly, retries do not duplicate records, and photo/time edits cannot reset old stock.

## 8. Phase 5 — Deterministic freshness rules and closing-time agent

**Goal:** Implement the product's food-waste workflow with explicit time limits and no claim of certified safety.

**Tools:** Versioned PostgreSQL rules, Open-Meteo/HTTPX, Supabase Cron/pg_net, SQL outbox, signed FastAPI dispatch, TanStack Query, pytest and frozen clocks.

**PRD coverage:** SAFE-01, ALERT-01, AGENT-01, PROMO-01, METRIC-01.

### Build tasks

- [ ] Replace the fixed-only policy with `DEMO_ADVISORY_V2`: confirmed ingredient risk class, cook time, temperature/humidity bands and uncertainty caps. Store synthetic numeric tables with provenance/approval state; refuse use for real food without reviewed applicable policy.
- [ ] Implement the PRD min-cap algorithm and non-increasing deadlines; no LLM may set risk rules, final time or eligibility. Missing cook time blocks publication; unknown ingredients/stale weather use a shorter configured cap.
- [ ] Add market-level Open-Meteo current temperature/humidity fetch, 15-minute cache, 30-minute stale threshold, timestamp/source tracking and adverse-condition reevaluation. Keep fixture weather separate and labelled.
- [ ] Validate preparation and handling data; unsupported/unknown handling cannot create an eligible timed offer.
- [ ] Compute deadlines through one authoritative transactional database function; subsequent risk/weather changes can shorten them and append audit events, never extend them. Fixture logic follows the same versioned examples.
- [ ] Separate inventory state from time eligibility; sold-out/withdrawn/moderated stock cannot return just because it has time remaining.
- [ ] Use database/server time for eligibility. Send `server_now` and absolute deadlines to the client; never trust the phone clock for an authoritative write.
- [ ] Add a minute-level SQL Cron job that inserts deduplicated 30-minute, 15-minute, and deadline alerts and closes offers as necessary.
- [ ] Extend that job into the closing-time agent: inspect batch and market close, persist a unique nudge/clearance draft, and await explicit hawker Confirm/Fix.
- [ ] On confirmation revalidate and atomically publish plus enqueue opted-in nearby recipients. Enforce deduplication, expiry, consent and notification-rate caps on dispatch, not only on draft creation.
- [ ] Use SQL jobs for deadline/draft work. A leased outbox with a scoped secret wakes FastAPI via pg_net only when dispatch/weather refresh is due; avoid an always-on worker. Log retries, run duration, lease recovery and vendor confirmation. Phase 10 adds real Web Push; this phase persists and exercises its queue with a fake transport.
- [ ] Add auditable input/rule explanations; optional LLM wording in Phase 6 must preserve computed facts and fall back to deterministic copy.
- [ ] Use a unique `(batch_id, policy_version, threshold)` alert key. Late creation/reconnect shows the most relevant current alert rather than a burst of obsolete alerts.
- [ ] Apply effective-time filters on every read and mutation independently of the scheduler; expiration must still work when a cron run is missed.
- [ ] Build the persistent hawker alert centre and dashboard warnings. Poll only while the relevant screen is visible, use backoff, and provide optional sound.
- [ ] Build percentage/fixed/70%/RM0/buy-one-get-one promotion drafts with confirmation, integer-sen totals, complete bundle stock accounting and maximum end time 15 minutes before the batch deadline.
- [ ] Disable creation once at most 15 minutes remain, and end an existing offer on sell-out, withdrawal, deadline, or earlier configured end.
- [ ] Add customer offer cards and active-offer filters; prevent stale cached availability after the end instant.
- [ ] Add vendor-reported sold-at-discount/discarded outcomes and simple summaries; do not describe these as independently verified waste saved.
- [ ] Add admin-only fixture time controls and ensure demo time override is unavailable in the connected production configuration.

### Deliverables

Working reminder-to-offer lifecycle, race-safe eligibility rules, recoverable alerts, and an honest waste-related metrics view.

### End-of-phase test gate

- Use frozen clocks to test just before, exactly at, and just after the 30-minute, 15-minute, and final cutoff boundaries.
- Test missing/future/backdated timestamps, unsupported handling, policy version changes, mixed batches, and attempted clock reset.
- Check ingredient-risk mapping, temperature/humidity band edges, invalid/stale weather, unknown ingredients and conservative uncertainty. Improved weather can never increase an existing deadline; arbitrary LLM JSON cannot write deadline fields.
- Race tests: concurrent stock sale and offer publish; offer publish at its deadline; duplicate cron runs; delayed/missed cron followed by a read.
- Verify Batch 2 does not extend Batch 1 and no endpoint/direct RPC can return a deadline-reached offer as eligible.
- One browser scenario: reminder → confirmed offer → customer discovery → automatic removal; include reconnect and stale cache.
- Agent gate: persisted draft without auto-publication, hawker fix/confirm, duplicate cron/dispatch, worker restart, revoked opt-in and expired queued notifications. Capture database audit/outbox proof, not just chatbot text.

**Done when:** deadline correctness does not depend on browser timers or scheduled job timing, and prohibited batches can never be promoted.

## 9. Phase 6 — Voice-to-JSON, confidence, fallback and evaluation

**Goal:** Add usable BM, English, and mixed-language updates without a paid AI service.

**Tools:** i18next, Transformers.js/Whisper, Web Worker, MediaRecorder, FastAPI LLM adapter (Gemini schema output or local Qwen/llama.cpp), Pydantic/Zod, quick-entry chips and evaluation harness.

**PRD coverage:** LANG-01, VOICE-01, EVAL-01, PRIV-01, INCL-01.

### Build tasks

- [ ] Complete BM/English translations across existing screens, errors, policy wording, and alert messages.
- [ ] Pin a compatible multilingual ONNX speech-model artifact and its license; do not choose an English-only `.en` model.
- [ ] Lazy-load speech code and model after user action; show download size/progress and let the user cancel.
- [ ] Implement microphone permission, recording, 30-second duration cap, playback, decoding/resampling, and worker transcription with WASM fallback where supported.
- [ ] Delete audio buffers/blobs immediately after transcription, cancellation or failure; stop microphone tracks and revoke URLs. Keep only transcript and validated fields. Do not upload raw audio to the backend/LLM or cache it.
- [ ] Send the permitted transcript to the real LLM extraction adapter; enforce JSON Schema for dish, quantity/unit, integer-sen price, ingredients, cook time/timezone, action, confidence and evidence text. Missing data remains null.
- [ ] Validate schema, ranges, ingredient confirmation, food matches and exact time context; attach heuristic field-confidence/ambiguity flags. Treat the displayed score as uncalibrated, not a probability of correctness/safety.
- [ ] Support common BM/English number and time forms; flag ambiguous or conflicting values rather than infer them silently.
- [ ] Present editable fields and the transcript side by side; publish only through the same validated APIs as manual forms.
- [ ] Add one-tap Confirm when all required fields are valid, easy field Fix, and known dish/quantity/price/ingredient/time chips if STT or LLM fails. Do not default to “cooked now” without selection.
- [ ] Bound LLM requests, timeout and token size; redact personal details, keep credentials server-side and never fall through to paid inference. Keep provider/model IDs configurable and version prompts.
- [ ] Add an optional “Why this time?” LLM paraphrase of deterministic facts with numeric verification and template fallback; no tools or authority to change the result.
- [ ] Handle cancellation, denied microphone, model-download failure, slow devices, unsupported audio, and browser memory pressure with a text alternative.
- [ ] Create 20 human-recorded fictional listing clips (10 BM, 10 Manglish, at least five consenting speakers) plus four English controls; annotate expected fields before evaluating. Keep these consented evaluation assets separate from user voice-note retention.
- [ ] Build paired voice-versus-typing timing tasks, counterbalanced order and an Evaluation screen/report that stays “Not measured” until execution at this phase gate.
- [ ] Label “Try a sample” clearly. If a prerecorded transcript is used without running inference, label it as a scripted example.

### Deliverables

Real STT → LLM → confirmed JSON flow, visible field confidence, reliable chips fallback, bilingual UI, and versioned evaluation corpus/report.

### End-of-phase test gate

- Run the 20 BM/Manglish samples plus four English controls once after the phase build. Report JSON validity, per-field accuracy, ingredient precision/recall, all-fields-correct, WER, correction rate and denominators; target at least 80% critical-field accuracy without concealing group failures.
- Measure paired voice-versus-typing median/p90 time including fixes and confirmation; record device/network/model, sample count and cold/warm load. Do not invent speedup or model accuracy.
- Test ambiguous preparation time, multiple menu matches, unsupported commands, and confirmation blocking.
- Perform one real microphone flow on desktop Chromium and one target Android device/emulator with usable audio; record cold model load separately from warm inference latency.
- Check denied permissions and Safari/iOS fallback if available. Mark unavailable device coverage explicitly instead of claiming it passed.
- Verify raw audio is not transmitted or retained and manual edits still receive server validation.
- Test deletion on success/failure/cancel, invalid LLM JSON, prompt injection in transcript, unknown ingredients and paid/quota failure. A transcript is untrusted data, never an instruction to run tools or change rules.

**Done when:** all three language styles produce editable drafts, the live path works on the documented baseline, and uncertain recognition cannot silently update a stall.

**If the accuracy target fails:** improve vocabulary/parsing or model configuration within the same phase, then rerun only affected clips plus a small unchanged sample. Do not secretly substitute canned transcripts for live results or add a paid API. Record a limitation if a device/language target remains unsupported.

## 10. Phase 7 — Verified reports, organiser triage and hawker reply

**Goal:** Complete community participation while protecting private reports and supporting moderation.

**Tools:** FastAPI, SQL/RLS, private Supabase Storage, React admin routes, pytest, Playwright.

**PRD coverage:** TRUST-01/02, ADMIN-01.

### Build tasks

- [ ] Add one editable customer review per stall, optional photo, publication status, and review-report action.
- [ ] Prevent self-reviews; compute average/count from published reviews only.
- [ ] Implement confidential complaint form, category, incident time, description, optional private synthetic image/video evidence and clearly simulated location stamps. Cap video at 10 seconds/5 MB and validate type/content.
- [ ] Display the precise anonymity promise before submission; no public complaint feed or automatic public risk score.
- [ ] Require confirmed-email or organiser-verified accounts for reports; remove the old guest capability. Enforce three new reports/account/day and one open report/account/stall/incident, with updates instead of duplicates.
- [ ] Restrict evidence to reporter/admin, use short-lived access URLs, and redact sensitive request/log fields.
- [ ] Add report status/history and reporter follow-up; vendor view receives only a separately approved redacted summary.
- [ ] Add market-scoped organiser access to early redacted reports, hawker right-of-reply, moderation/appeal history and a 48-hour demo reply opportunity.
- [ ] Add a neutral public “Reports under review” flag only after at least three distinct verified, independently reviewed reports within 14 days and a recorded moderator decision. Block duplicates/collusion indicators from threshold counts; support flag expiry/removal and display the approved reply.
- [ ] Build admin queues for complaints, review reports, dietary evidence, stall moderation, and market schedules.
- [ ] Audit moderation/privileged changes and rate-limit repeated submissions with database-backed counters appropriate to one small API instance.
- [ ] Add demo-only deletion/reset and document pilot retention/deletion policy decisions that must precede real data collection.
- [ ] Add verified/unverified fictional accounts and below-threshold/duplicate/collusive/appeal scenarios; unverified accounts cannot file reports even in fixture workflows.
- [ ] Prepare redacted referral payloads for Phase 9; do not send email or forward anything outside the simulated app.

### Deliverables

Working reviews and ratings, protected complaint/evidence workflow, and a restricted admin interface.

### End-of-phase test gate

- Verify own-stall review prevention, review uniqueness, hidden-review exclusion, and rate limits.
- Test reporter A versus reporter B, vendor versus reporter identity, visitor access, non-admin moderation, and evidence URL expiry.
- Exercise direct database/Storage paths, not just hidden UI controls.
- Browser journey: submit complaint → admin triage → redacted vendor summary → reporter status update.
- Check verified-account/rate limits, private early organiser access, independence threshold, reply opportunity, moderator approval, appeal/removal and no automatic public accusation. Verify no inference of ethnicity/religion/halal from names or photos.

**Done when:** moderation works and no unauthorised role can view reporter identity, raw report details, or private evidence.

## 11. Phase 8 — Commerce, ads, sponsorship and delivery simulations

**Goal:** Demonstrate the full commercial experience with fake money and synthetic results.

**Tools:** Existing React/FastAPI/Supabase stack, typed mock payment/ad/delivery providers, SQL transactions, Recharts, browser CSV and printable HTML receipts.

**PRD coverage:** COM-01, PAY-01, ADS-01, DEL-01, MON-01, commercial DATA-01.

### Build tasks

- [ ] Build customer cart, batch-specific quantity selection, reservation timer, pickup/delivery checkout, order history and demo collection code.
- [ ] Make pay-at-stall the default: reserve → vendor accepts → collect with code → both confirm payment/collection. No gateway, stored card or automatic charge.
- [ ] Add a configurable hypothetical 3% completed-clearance commission, integer-sen calculations, disputes/no-show exclusions/reversals and a monthly manual statement. Separate reserved value from collected value.
- [ ] Add council/organiser subscription preview for aggregated waste diversion, activity hotspots and hygiene trends; suppress small groups and scope every dashboard to its markets.
- [ ] Enforce atomic reservations bounded by offer end and batch fulfilment buffer. Expiry/cancellation releases stock once; never reopens deadline-reached inventory.
- [ ] Build vendor accept/reject, ready-for-pickup, collected and cancellation controls with visible order history.
- [ ] Create a fake payment provider with pretend balance and scenario choices, including success/failure/timeout/late callback. Never collect real payment credentials.
- [ ] Place fake online payments/refunds in an explicitly separate future-capability showcase; they are not necessary for the pilot purchase path.
- [ ] Add idempotent payment callbacks, fake ledger, full/partial refunds and watermarked `DEMO-` receipts; forbid over-refunds and duplicate stock/money effects.
- [ ] Build fictional advertiser onboarding, creative upload, market/radius/category targeting, dates, pretend budget, mock checkout and moderation queue.
- [ ] Implement sponsored search cards/map pins, native ads, banners and an optional non-blocking interstitial preview. Keep all labels visible and respect filters/availability.
- [ ] Simulate campaign scheduling, approval/rejection, pause/resume, budget exhaustion, ad fill/no-fill, impressions/clicks and performance charts.
- [ ] Add free/paid vendor tier comparison, simulated subscriptions, renewal failure/cancellation and multi-stall analytics with synthetic revenue/inventory exports.
- [ ] Build courier partner board with scoped assignment, route/ETA preview and accept/pickup/arrive/fail/cancel controls. Reject demo fulfilment beyond the listing constraints.
- [ ] Keep every provider in simulated mode in both data adapters; no ad SDK, checkout provider, real dispatch or real financial account.

### Deliverables

Working fake purchase-to-refund lifecycle, complete ad/sponsorship management, subscription management and delivery portal with generated results.

### End-of-phase test gate

- Reservation races, expiration, bundle stock counts, payment retry/late callback, refund caps and duplicate callbacks.
- Sponsor filter/dietary compliance, campaign date boundaries, moderation and budget exhaustion; paid tier cancellation preserves records.
- Organisation/user isolation for orders, advertiser spend and assigned delivery jobs.
- One browser journey per commercial branch: pickup purchase, failed payment/refund, sponsored campaign and delivery failure.
- Verify all provider events remain inside the simulator and all receipts/placements are marked demo.
- Verify no commission on booking/no-show/cancelled order, one ledger entry per confirmed collection, refund/dispute adjustments and market isolation/small-group suppression in organiser dashboards.

**Done when:** fake transactions and campaigns change state correctly, no real payment or ad traffic exists, and expired batches remain unavailable throughout checkout/delivery.

## 12. Phase 9 — Companies, agencies, authorities and collection partners

**Goal:** Demonstrate cross-organisation collaboration from request through resolution.

**Tools:** React scoped workspaces, FastAPI internal provider adapters, SQL/RLS, private Storage, deterministic event log and CSV exports.

**PRD coverage:** PART-01, GOV-01, COUNCIL-01, WASTE-01.

### Build tasks

- [ ] Add a fictional organisation directory and scoped media/editor, company, officer/council and collection roles.
- [ ] Use fictional partner brands and clearly labelled Foodie/KKM/Majlis Bandaraya-style concepts. No official logos, claimed affiliation or invented live agency API.
- [ ] Implement media/supplier collaboration request, request-changes/approve/reject, published feature, editorial badge and influencer food-trail builder.
- [ ] Build referral redaction preview, destination selection, explicit simulated consent, fake submit/acknowledge, `DEMO-CASE-*` reference and status timeline.
- [ ] Keep originals private; create a separate approved redacted case record for the assigned authority organisation. Enforce this in RLS/API, not only the screen.
- [ ] Reuse Phase 7's verified-report threshold and reply/moderation process; no automatic authority referral, public guilt score or external sending.
- [ ] Build officer queue, inspection schedule/checklist, corrective-action request, follow-up and resolution, plus retry after a simulated timeout.
- [ ] Build council permit apply/review/approve/reject/expiry/renewal with `DEMO-PERMIT-*` references, market occupancy and aggregate complaint/waste dashboard.
- [ ] Include simulated dietary-evidence verification without official certificates or seals.
- [ ] Build surplus donation matching with the same eligibility/buffer constraints as offers; create separate compost and BSF non-consumption pickup paths.
- [ ] Build collection request/accept/reject/schedule/collect/missed states, fake weights and watermarked receipt. Do not double-count reused batch/job events.
- [ ] Implement controllable integration success/pending/rejection/timeout/replayed callback scenarios; save visible outcomes in fixture and connected modes.

### Deliverables

Functional media/company, authority/council and charity/waste partner workspaces, all using fictional information and internal events.

### End-of-phase test gate

- Complete vendor-to-media-feature and customer-report-to-officer-resolution browser journeys.
- Consent required before referral; assigned officer sees only approved fields; another organisation cannot read/edit the case.
- Duplicate referral callbacks, timeout/retry, permit expiration and media publication permission checks.
- Eligible donation versus expired stock rejection; compost/BSF job acceptance and deduplicated weight totals.
- Confirm no agency/company endpoint is called and no generated screen/export implies a real affiliation.

**Done when:** each partner flow has a full state-changing journey, privacy holds across organisation boundaries, and all outcomes are explicitly simulated.

## 13. Phase 10 — Test Web Push, demand forecast and advanced previews

**Goal:** Make the rest of the future vision interactive without external infrastructure.

**Tools:** TypeScript/FastAPI simulators, fixture clocks, PostgreSQL events, Recharts, responsive device frames, existing local speech pipeline.

**PRD coverage:** NOTIFY-01, FORECAST-01, LAB-01, AI-01, APP-01, remaining DATA-01 and AGENT-01 delivery.

### Build tasks

- [ ] Build fake push/SMS/email preferences, consent/quiet hours, 1.5 km default radius and vendor bulk-message audience preview with pretend cost.
- [ ] Implement simulated recipient inboxes and queued/sent/failed/retried/suppressed delivery states. Opt-out changes later eligibility.
- [ ] Add real Web Push service-worker subscriptions, VAPID configuration and pywebpush dispatch for consenting test devices in connected mode. Consume the Phase 5 leased outbox, recheck offer expiry/opt-in before sending, delete invalid subscriptions and use stable event tags for deduplication.
- [ ] Seed fictional recipients/coarse area cells; use no real phone numbers or SMS/email gateway. Keep push secrets private, make opt-out immediate and record attempted versus acknowledged delivery honestly.
- [ ] Add synthetic hot/cold/ambient sensor timelines, missing-reading and excursion scenarios, fake weather controls and visible simulated-reading labels.
- [ ] Build isolated research preview for ingredient/weather model ideas with fictional non-operational output; prevent any write into authoritative batch deadline fields.
- [ ] Add cloud audio/photo extraction preview with editable fields, tentative ingredients, confidence, failure/quota scenarios and explicit “Scripted AI preview” labels.
- [ ] Include scripted Tamil/Mandarin/photo examples while preserving the real BM/English/mixed STT → LLM extraction path and confirmation step.
- [ ] Build Android/iOS styled interactive screen previews for onboarding, permissions, notifications and app deep links. Reuse actual demo routes; no native build or app-store account.
- [ ] Add date filters/drill-downs and demo exports for multi-stall, council, campaign and waste dashboards; distinguish reported/estimated/simulated measurements.
- [ ] Implement premium demand-forecast preview: same-stall weekday-median baseline, bounded rainfall adjustment, stockout flags, at least eight comparable sessions or “Insufficient data”, sample count and uncertainty. Use synthetic history for demo forecasts.
- [ ] Backtest forecast logic against the baseline with time-ordered holdout at this phase gate; do not let LLMs invent preparation quantities. The “20% less on rainy Tuesdays” example remains labelled synthetic unless supported by measured data.
- [ ] Add a scenario directory linking every advanced preview to its seeded happy/error path and reset control.

### Deliverables

Complete communication, telemetry, AI and native-experience previews with measurable simulated outcomes and clear capability labels.

### End-of-phase test gate

- Notification radius, consent/opt-out, quiet-hours, retry deduplication and fake-recipient isolation.
- Send one real push to an opted-in test browser through the confirmed-offer agent path; check consent revocation, stale queue expiry, restart/retry and invalid subscription cleanup. Device limitations are recorded, not masked by simulated success.
- Sensor/AI/research scenarios cannot extend a batch deadline or auto-publish a draft; scripted and live speech labels remain distinct.
- Native preview links open correct role-authorised routes and permission-denied states remain usable.
- Dashboard aggregates/exports match synthetic event data and contain demo markings.
- Forecast gate: time-ordered MAE versus baseline, insufficient-data state, stockout handling, bounded adjustment and no fabricated evidence.
- One full advanced-scenario walkthrough; allow only the configured live weather/LLM/test-Web-Push technical services and deny all real company/authority/SMS/email/payment actions.

**Done when:** every advanced feature is interactive and accurately labelled, real push works on the documented opted-in test device, forecasts expose their evidence/limitations, and no unauthorised business action or food/permission bypass is possible.

## 14. Phase 11 — Complete dataset, 100 generated images and presentation

**Goal:** Make the app presentation-ready with varied, consistent content and explicit simulation boundaries.

**Tools:** IMAGE_GENERATION_PROMPTS.md, available no-cost image generation or procedural fallback, Sharp, deterministic Node/Python seeds, fixture adapter, SQL seeds, Playwright.

**PRD coverage:** IMAGE-01, complete PRD Section 13 seed inventory, all-feature coverage matrix.

### Build tasks

- [ ] Expand all seeds to PRD Section 13 counts, including partner organisations/personas, commerce, referrals, permits, jobs, notifications, AI examples and telemetry. All business information is fictional.
- [ ] Generate the 100 listed images separately: 2 hero + 10 markets + 30 stalls + 30 foods + 12 personas + 6 partner scenes + 6 ads + 4 evidence/training scenes. One prompt produces one image; no collages/contact sheets.
- [ ] Save assets under their specified filenames, optimise WebP copies, supply alt text and record prompt/provenance/license in `docs/asset-manifest.json`. Use procedural generation per brief if no free image-generation service is available; never silently incur charges.
- [ ] Produce two short synthetic training videos from the evidence artwork/simple animation, with visible demo time/location captions and no external video service dependency. These are additional media assets, not replacements for any of the 100 individual images.
- [ ] Add fictional names, plausible MYR prices, categories, dietary diversity, realistic BM/English/mixed reviews, and explicit generated-content labels.
- [ ] Create stable scenario fixtures for fresh batch, reminder, ending offer, sold-out stock, missing handling data, rejected upload, and confidential report.
- [ ] Keep all fixture content public-safe: no true credentials, private connected records, or real complaint evidence in the static build.
- [ ] Implement frozen-time fixture scenarios and an explicit reset-to-today connected seed process. Guard every reset with the known demo project identity.
- [ ] Make fixture actions local to the current browser, with Reset Demo; never expose a public remote reset endpoint.
- [ ] Populate all Phase 8–10 simulation screens with varied pending/approved/rejected/failed/completed states; fix any placeholder-only feature.
- [ ] Ensure sponsors obey active filters, do not change organic rank, have visible labels, and disappear when campaign eligibility ends.
- [ ] Complete dashboard summaries for vendor-reported offer sales/discards and anonymous aggregate discovery events.
- [ ] Write both the five-minute core script and the full-vision script, with working persona switches and scenario resets. Complete `docs/feature-coverage.md` for every PRD requirement, with no deferred demo feature.
- [ ] Record dataset/asset provenance and model licenses in `docs/demo-guide.md`.
- [ ] Populate a synthetic **one market / 10 stalls / four weeks** pilot dashboard alongside the larger demo dataset. Clearly distinguish synthetic pilot values from actual Phase 6 evaluation measurements.
- [ ] Write `docs/pilot-plan.md`: week-one baseline/onboarding, weeks-two/three pay-at-stall trial, week-four review; define net RM recovered per participating stall-night and weighed kg diverted to human consumption, separately from compost/BSF and estimated weights.
- [ ] Prepare fictional WhatsApp/Facebook/TikTok share cards and QR posters for organiser-approved distribution after hawker onboarding; do not post or message anyone automatically.
- [ ] Include the sourced DOSM sector figure, scoped positioning statement, free basic tier and commission/council-subscription/forecast hypotheses from PRD Section 18 in the demo business view.
- [ ] Fill `docs/feature-coverage.md` for must-have/should-have requirements, privacy/halal/report safeguards, agent side effects and pilot KPI fields.

### Deliverables

Complete prefilling, original generated imagery, resettable presentation scenarios, revenue mock-ups, and demo guide.

### End-of-phase test gate

- Validate entity counts, foreign keys, unique IDs, image references, and review/stock aggregates in one dataset check.
- Run the same key scenario vectors against fixture and connected adapters to detect divergent batch/promotion rules.
- Verify repeated seeding does not duplicate accounts/records and that reset refuses a non-demo target.
- Walk through the core and full-vision scripts once at phone and desktop sizes; check no mixed-mode write, private-data leakage, or unlabelled fake certification/partnership.
- Validate all 100 prompt IDs and individual files, manifest mappings and generated labels; visually inspect the image library once and fix missing/incorrect subjects together.
- Check sponsor filter integrity and campaign time boundaries.
- Check pilot metric denominators for weekly markets, collection/weight deduplication, gross versus net RM, actual versus estimated/synthetic evidence, and the Evaluation screen's use of real recorded results only.

**Done when:** every feature has usable fictional content, every required image has a file and provenance, all journeys are repeatable, and the feature coverage matrix has no placeholder/deferred gaps.

## 15. Phase 12 — Deployment, full acceptance, handoff

**Goal:** Deliver the fixture demo on Vercel and connected demo on Vercel/Railway/Supabase, subject to free-account access and eligibility.

**Tools:** Vercel, Railway, Supabase dashboards/CLI, Dockerfile, provider logs, Playwright, pytest, Vitest, axe-core, browser performance tools.

### Build and deployment tasks

- [ ] Confirm account access, free-tier availability, remaining allowances, and a non-commercial demo use compatible with Vercel Hobby. Do not purchase plans or attach a paid add-on.
- [ ] Create the Supabase demo project; apply versioned migrations, policies and seeds; enable and inspect the SQL reminder schedule.
- [ ] Deploy one small Railway API container using the pinned Python runtime. Bind Uvicorn to `0.0.0.0` and the provider's `PORT`; use one worker initially.
- [ ] Set API health endpoint, restart behaviour, log redaction, allowed origins, and request limits. Store no durable uploads on Railway's filesystem.
- [ ] Enable idle/sleep behaviour if available on the actual free account; do not rely on it as a guaranteed entitlement. Use no keep-alive pings.
- [ ] Deploy the Vite static app to Vercel with SPA route rewrites and separate fixture/connected configuration.
- [ ] Configure exact Supabase Auth redirect URLs and public media/private signed-access behaviour for deployed origins.
- [ ] Add PWA manifest, icons, app-shell service worker, cache-version updates, and an offline explanation. Exclude API availability, private media, and OSM tiles from offline prefetch/cache rules.
- [ ] Add usage/runbook guidance: inspect Railway credit, Supabase storage/egress, service pausing, and recovery before presentations. Set account-supported caps/alerts; if free operation cannot continue, suspend connected service and retain fixture mode.
- [ ] Document environment variables, migration order, seed/reset, restoring paused services, rollback, and known limitations.
- [ ] Use code rollback plus a compatible schema strategy; back up/export demo data before risky schema changes. Do not rely on paid point-in-time recovery.
- [ ] Complete mobile layout, performance, accessibility, security, and failure-state fixes as one final preparation batch.

### Configuration contract

| Variable | Location | Handling |
| --- | --- | --- |
| `VITE_APP_MODE` | Vercel web | `fixture` or `connected`; visible to users. |
| `VITE_API_BASE_URL` | Connected web | Railway public API URL. |
| `VITE_SUPABASE_URL` | Connected web | Public project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Connected web | Public client key; security comes from RLS. |
| `VITE_MAP_TILE_URL` | Web | Configurable permitted raster tile source. |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Railway | Supabase endpoint and public-key context; forward caller JWT. |
| `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE` | Railway | Verification expectations; derive/cache JWKS from trusted project configuration. |
| `SUPABASE_SERVICE_ROLE_KEY` | Trusted seed/admin environment only | Never required by general customer requests or exposed to the frontend. |
| `ALLOWED_ORIGINS`, `APP_ENV` | Railway | Exact CORS origins and deployment environment. |
| `DEMO_PROJECT_REF`, `DEMO_SEED_ENABLED` | Trusted seed process | Reset guard; disabled for any future production deployment. |
| `INTEGRATION_MODE` | Railway | Business providers must remain `simulated`; technical adapter modes are configured separately. |
| `VITE_INTEGRATION_MODE` | Web | Business simulation label only; cannot enable a live technical or business service. |
| `WEATHER_MODE`, `EXTRACTION_MODE`, `PUSH_MODE` | Railway | Separate technical adapters: live/fixture, hosted/local/fixture, enrolled-test/simulated. Business integration mode remains simulated. |
| `GEMINI_API_KEY`, `EXTRACTION_MODEL` | Railway only | Scoped free-tier synthetic-transcript extraction; never expose a key in web code. |
| `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT` | Railway; public key only in web | Genuine push to opted-in demo subscriptions; no sensitive payload in notifications. |
| `AGENT_DISPATCH_SECRET` | Railway and protected scheduler configuration | Authenticate conditional outbox dispatch; never public. |

Do not place server-only secrets in any `VITE_` variable. Use a separate migration credential locally/within a trusted deployment job; never distribute it with the app.

### Final end-of-phase gate — run the full suite here once

- Full lint/type/build, unit, API, database permission, and fixture/connected contract suites.
- End-to-end coverage of every PRD feature, including commerce/refunds, ads/subscriptions, partner publishing, authority/council cases, waste collection, notification/AI/sensor/native previews and 100 image assets.
- Fresh-session checks in connected deployment, including CORS, JWT validation, Auth redirect, upload access, cron alert generation, and expired promotion filtering.
- Permission regressions for cross-vendor writes, role escalation, direct database access, private media, and time overrides.
- A focused mobile accessibility and performance pass, including touch targets, contrast, keyboard/focus, denied microphone/location, and first speech-model download.
- Failure scenarios: Railway unavailable/asleep, Supabase paused, tile failure, offline/stale content, slow upload, exhausted free allowance, and explicit sample-demo fallback.
- Inspect budgets, fixture-data labels, no privileged bundle secrets, and no real advertising/payment integration.
- Verify company/authority/payment/delivery/SMS/email adapters remain simulated; only allowlisted weather, permitted LLM extraction and consenting test Web Push make external calls. Inspect references, privacy, consent and organisation isolation.
- Include the 20 BM/Manglish evaluation results, voice-versus-typing evidence, realtime reconnect and agent side-effect trace; reject “Not measured” for required completed evaluation gates.
- Review audio deletion, coarse location retention, verified reports/reply/flag threshold, sponsored safety/halal filtering, basic-tier access and pilot KPI definitions. No real-food policy deployment without documented reviewer approval.

**Done when:** deployed links and documentation exist; critical acceptance checks pass; the sample demo is usable without the backend; connected writes are genuine; limitations and unsupported device coverage are stated accurately. If deployment is blocked by missing account access, deliver the complete local build/deploy instructions and mark deployment pending rather than claiming live URLs.

### Handoff package

- [ ] Vercel fixture demo URL and connected demo URL.
- [ ] Railway API URL and health route; Supabase project reference shared without secrets.
- [ ] `docs/demo-guide.md` with presentation steps, personas, mode differences, and reset instructions.
- [ ] `docs/deployment.md` with setup, environment variables, provider limits, rollback, and paused-service recovery.
- [ ] `docs/phase-status.md` and final acceptance report with actual results and remaining limitations.
- [ ] `docs/feature-coverage.md`, the 100-image asset manifest, and IMAGE_GENERATION_PROMPTS.md with one standalone prompt per asset.
- [ ] TECH_REFERENCES.md, measured `docs/evaluation-report.md`, `docs/privacy-data-map.md`, and `docs/pilot-plan.md`; clearly separate measured results from fake demo content.
- [ ] No public admin password, service role key, or real customer evidence.

## 16. Free-operation decisions

These are planning constraints checked on 1 October 2026, not unlimited-service guarantees.

- **Vercel:** Hobby is limited to personal, non-commercial use. The demo uses simulated sponsorship only and must meet those terms. Actual ad revenue/paid promotion needs an eligible commercial arrangement. [Vercel Hobby](https://vercel.com/docs/plans/hobby)
- **Railway:** Free currently lists a 30-day $5 trial followed by $1 monthly credit. Keep usage small; a continuously available backend may exceed that allowance. Retain the standalone fixture demo rather than silently spending money. [Railway pricing](https://railway.com/pricing)
- **Supabase:** Keep seed database and media substantially below free quotas; free projects may pause after inactivity. Document recovery and do not rely on scheduled jobs while a project is paused. [Supabase pricing](https://supabase.com/pricing)
- **Maps:** OSM data and rendering libraries do not imply unlimited free tile hosting. Follow attribution/cache policy, avoid automated tile-load testing, and do not package public raster tiles for offline use. [OSM policy](https://operations.osmfoundation.org/policies/tiles/)
- **Speech:** Browser inference avoids a hosted inference fee, but device capability and mixed-language accuracy must be measured. [Transformers.js](https://huggingface.co/docs/transformers.js/en/index)
- **LLM extraction:** Use the selected Gemini free quota for synthetic/redacted inputs only after reviewing availability/data-use terms, or a developer-local Qwen/llama.cpp adapter. Neither free hosting of a model nor unlimited hosted inference is assumed. Chips handle quota failures. [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)
- **Weather/push/agent:** Open-Meteo free hosted API is non-commercial. Cache by active market; use conditional job dispatch and free VAPID/Web Push libraries. Provider compute/egress still consumes quotas and push is not guaranteed. [Open-Meteo](https://github.com/open-meteo/open-meteo), [pywebpush](https://github.com/web-push-libs/pywebpush)
- **Food policy:** Use the PRD's explicitly labelled demo handling policy. Review it with a qualified local food-safety professional before a real-vendor pilot; do not implement the original unsupported thermal formula. [MOH guidance](https://hq.moh.gov.my/fsq/amr-antimicrobial-resistance-dan-keselamatan-makanan)

## 17. After the complete demo — replace simulations with real services

All corresponding screens and workflows are included in Phases 1–12. The steps below activate them for real use; they do not remove any feature from demo scope.

1. **Real-vendor pilot:** one market, 10 stalls, four weeks following PRD Section 18. First verify market facts, approved advisory policy, privacy/PDPA, provider terms and organiser agreement. Measure net RM recovered per actual stall-night and weighed food diverted, without inventing outcomes or contacting participants as part of this documentation task.
2. **Commercial release:** choose compliant hosting, actual sponsorship pricing, billing/refunds, ad disclosures, and operational moderation staffing. The requested providers may require a budget at this point.
3. **Notifications, commerce and scale:** replace mock push/SMS/email, payment, ad and delivery adapters with authorised live services and validate delivery/accounting behaviour.
4. **Partnerships:** replace fictional Foodie-style/authority/council/collector adapters with actual agreements, consent, approved data exchange and supported integration channels. Never assume a live government API exists.
5. **Advanced food handling and native apps:** replace synthetic sensor/AI research inputs only after expert validation; package real native apps only when distribution is required. Until then the PWA previews remain explicitly simulated.

## 18. Phase completion record template

Copy into `docs/phase-status.md` when implementation starts:

```markdown
### Phase N — Name
- Status: not started / building / gate failed / complete / blocked
- Deliverables completed:
- Files or modules changed:
- Phase-end checks run (command + concise result):
- Failures and focused reruns, if any:
- Known limitations or external blockers:
- Next phase:
```

No application tests are needed merely to create or edit these planning documents. During implementation, follow the phase gates above rather than repeatedly testing each small change.
