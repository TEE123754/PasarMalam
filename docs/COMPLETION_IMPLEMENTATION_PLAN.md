# PasarMalam — remaining-work implementation plan

Version 1.11 · 8 October 2026 · CP1/CP3 code/gates, CP2, CP4 passport/recording work, CP5 and CP6 complete; human registration/privacy acceptance pending.

This plan addresses the **27 remaining unchecked requirements** (57 at the planning baseline) in the [consolidated checklist](CONSOLIDATED_FEATURES_CHECKLIST.md). The [full partial/pending inventory](PARTIAL_AND_PENDING_JOBS.md) maps every requirement to exactly one primary completion phase. IDs such as `C05-04` mean checklist section 5, item 4, including checked items when counting positions.

Use **CP1–CP12** for these completion phases. They extend the original implementation plan; they do not restart its completed Phases 1–11. CP12 is the eventual original Phase 12 deployment, still on hold. Current feature counts are **124 checked / 27 unchecked** after CP1 closed three listing requirements and CP2 closed seven discovery requirements and CP3 closed three voice requirements and CP4 closed three passport/recording requirements and CP5 closed four clearance/accounting requirements; CP6 closed seven community/impact requirements; CP8 closed three photo/fallback requirements. Completed demo simulations do not establish live partnerships, human accuracy or expert-approved food rules.

## Phase overview

| Phase | Main outcome | Open items now | Prerequisites / external input |
| --- | --- | ---: | --- |
| CP1 | Registration acceptance; listing code complete | 1 | Existing app; signup-policy decision for live acceptance |
| CP2 | Complete locally — market discovery and filters | 0 | [Acceptance](CP2_ACCEPTANCE.md) |
| CP3 | Code/gate complete; human expression acceptance pending | 1 | [Evidence](CP3_ACCEPTANCE.md); recordings in CP7 |
| CP4 | Passports/recording complete; approved policy/accounting pending | 2 | [Review package](CP4_POLICY_REVIEW.md); qualified rules |
| CP5 | Complete locally — clearance decisions and accounting | 0 | [Acceptance](CP5_ACCEPTANCE.md) |
| CP6 | Complete locally — community and impact | 0 | [Acceptance](CP6_ACCEPTANCE.md) |
| CP7 | Human/device evaluation and measured evidence | 7 | Core CP1–CP6; consenting participants/devices |
| CP8 | Local photo/planning complete; real forecast evidence pending | 4 | Consented reconciled history; existing credits authorised |
| CP9 | Preparation complete; student/rules/video acceptance pending | 5 | Measured CP7 evidence; CP8 if included |
| CP10 | Real partner/data agreements and expansion readiness | 6 | Explicit agreements/approved external targets |
| CP11 | Dedicated Android/iOS local builds | 1 | Accepted web core; Android device; Mac for iOS |
| CP12 | Final deployment and operational handoff | Separate | Later deployment instruction and readiness review |
| **Total in CP1–CP11** | | **27** | |

CP1–CP6 are the main local coding sequence. Start recruiting/recording and requesting human review early, without sending messages on the user's behalf. Code-only work in later phases can proceed while external inputs are pending, but acceptance boxes remain open. CP8–CP11 are enhancements or external activation work and must not prevent a clear core-demo handoff.

## Stack, scope and spending

Reuse the existing React/TypeScript/Vite PWA, React Router, TanStack Query, React Hook Form/Zod, i18next, Lucide/CSS, Leaflet and Supabase PostgreSQL/PostGIS/Auth/Storage/Realtime. Backend remains FastAPI/Pydantic/Python. Keep existing local Whisper/Transformers.js and consented, backend-only Morpheus `qwen35-9b` text extraction; CP8 separately configures gemma-4-31b vision, verified on a supplied illustration.

Use SQL and Python for deterministic eligibility, ledger aggregation and transparent forecasting. Reuse the existing QR/export/media tooling. Use Vitest, pytest, TypeScript, ESLint, Ruff and browser checks at phase boundaries. CP11 proposes Capacitor to reuse the web app, with Android Studio/SDK and Xcode on macOS; verify compatible versions before introducing dependencies. CP12 retains Vercel frontend, Railway backend and Supabase database targets.

Existing database/AI settings are already private. No new keys are needed for current local text/demo workflows. Vision, native hardware, reviewed policies and real partner endpoints have separate prerequisites. Use free local tools and existing Morpheus credits explicitly authorised by the owner on 8 October 2026; do not assume free cloud vision, live agency APIs, paid app-store distribution or unlimited AI usage. No purchase, hosting activation, public signup-policy change, real referral, partner outreach or external publishing is authorised by this planning request.

All 12 supplied images are already integrated. Reuse them and existing placeholders; do not request another 100 images. They remain representative illustrations, never evidence of a newly prepared batch, a certification or a complaint.

## Testing and completion rules

1. Build the **whole phase** before executing its focused tests. Do not run watch mode, full suites after every edit, or repeated successful builds for minor changes.
2. Run one phase gate: affected static checks/build, meaningful domain/API/SQL tests and a short browser journey. Select tests based on the actual changed contracts; do not rerun unaffected backend suites for copy-only changes.
3. Group failures and rerun only failed checks and directly affected regressions. A later contract change may justify a focused rerun of an earlier dependency.
4. Append new Supabase migrations; preserve existing applied migration files/checksums, preparation times and audit history. Execute connected gates only against the guarded disposable target and authorised test fixtures.
5. Record commands, actual results, browser/device context and what remains in `docs/phase-status.md`. Separate **code complete** from **acceptance complete**. Do not tick a combined requirement because only a mock or UI exists.
6. Run the broad regression gate once when the complete local release batch is ready, covering material changes since the prior accepted build. CP12 uses deployed-origin smoke checks, broadening only when deployment changes invalidate local evidence.
7. Human-data phases use measured inputs; missing recordings, cost data, expert review or partner agreements remain pending. Do not manufacture percentages, interviews, partnerships, clinical thresholds or competition eligibility.

CP1 used one focused phase-end batch; see [commands/results and limitations](CP1_ACCEPTANCE.md). Later phases follow the same rule.

## CP1 — Registration, listing details and transparent declarations

**Requirements:** `C01-03`, `C03-07`, `C04-01`, `C04-09`. **Status:** local code and focused gate complete; registration-policy/human acceptance pending. **Owner:** engineering; owner decision for signup acceptance.

**Tools:** existing React forms/Zod/i18next, FastAPI/Pydantic, Supabase Auth/RLS and additive SQL migrations.

- [x] Add dedicated stall description to forms, API contracts, persisted records and customer detail. Preserve specialty and existing seed values.
- [x] Add explicit vendor-confirmed allergen records: identified allergens, declaration source/time and unknown/unconfirmed states. Ingredient text is not automatic allergy certification or a complete negative-allergen guarantee.
- [x] Separate halal certificate/evidence/expiry from optional self-declared business/dietary statements. Pork-free/alcohol-free/owner declaration must not satisfy a certified-halal filter. Never infer identity from stall names or photos; any owner declaration is voluntary and needs privacy review.
- [x] Implement registration/confirmation/error/invite handling behind a configuration flag. Default new accounts to customer; vendor access needs protected organiser/admin approval. Never grant roles from a browser-selected mode.
- [x] Preserve invite-only admission in the current disposable project. Newly provisioned profiles require a verified email and organiser invitation; roles never come from user metadata.
- [ ] Owner agrees invite-based versus public registration and accepts an actual email/password journey on an approved target. Public signup remains disabled; provider/redirect settings and production-boundary acceptance are still pending.
- [x] Update fixture scenarios, connected contracts, English/BM labels and migration notes together.
- [x] Prepare [owner-reviewable privacy/provider/retention notice](CP1_PRIVACY_REVIEW.md) and English/BM onboarding notice.
- [ ] Obtain human privacy/provider/retention review before real participant/pilot collection. Fictional local workflows continue without claiming approval.

**Phase-end gate:** valid/invalid description and declaration input; own/foreign edit denial; declaration/certification filter separation; duplicate email, expired invitation and verification failure; default-role and vendor escalation denial. Walk through registration/profile and stall detail once. Code may pass locally while a disabled public-signup acceptance remains pending.

**Done when:** the listing/declaration fields work in both adapters, and the agreed registration journey has actual acceptance evidence. A deliberately disabled public journey cannot be reported as publicly available.

**Completed gate:** lint, TypeScript/build, 78 selected frontend tests, 21 selected backend tests (including 4 connected CP1 tests), Ruff, credential scan and browser journey passed. Two additive migrations applied; prior migrations preserved. Evidence and remaining acceptance: [CP1 acceptance](CP1_ACCEPTANCE.md). No further CP1 code task is pending; owner-policy, actual email/password and privacy acceptance remain open.

## CP2 — Complete market discovery and filters

**Requirements:** `C02-01`, `C02-07`, `C02-08`, `C02-09`, `C03-05`, `C03-08`, `C03-10`. **Status:** complete locally, 8 October 2026. **Depends on:** CP1 declarations.

**Tools:** React/TypeScript, existing discovery engine, Leaflet/OSM, Supabase SQL/PostGIS/Realtime; external navigation links without a paid routing API.

- [x] Add a farmers' market classification while keeping day/night session timing separate. Backfill old records and add a fictional pasar tani journey, schedules, list/filter and map labels.
- [x] Add complete stable category IDs for rice/noodles, skewers/BBQ, kuih/pastries, drinks, fried food and fresh produce. Maintain existing aliases and menu associations.
- [x] Add vendor-declared vegetarian/vegan information with unknown/conflict handling; keep it separate from halal and allergen status.
- [x] Add RM5/RM10/custom maximum-price filters. Define whether the selected filter targets menu-unit prices or available offer/bundle prices and show that basis. Do not rank a multi-unit bundle as a cheaper single portion.
- [x] Add an explicit closing-soon market state, including overnight sessions, cancellations and Malaysia time. Do not confuse a market schedule with the hawker's reported stall status.
- [x] Persist/display per-stall availability-confirmed timestamp and stale-availability text using a documented configurable age rule. Realtime invalidation is not evidence that a hawker reconfirmed stock.
- [x] Add Directions for markets and stalls using verified destination coordinates. Offer an external navigation handoff or destination-only copy when location consent is absent; no automatic precise-origin sharing.
- [x] Retain labelled sponsorship caps, dietary/eligibility filters, matching map/list results and list fallback.

**Phase-end gate:** day/night/farmers compatibility, missing coordinates, overnight close boundaries, stale timestamps, category migrations, dietary unknown/conflicts, zero/edge price values and bundle pricing. One browser journey combines radius, category, dietary and budget; confirm sponsored results cannot bypass them.

**Done when:** all seven gaps are usable in local fixtures and guarded connected queries without breaking existing filtering or schedule semantics.

**Actual gate:** 91 selected frontend tests (18 new CP2 cases), 26 selected backend tests (3 connected CP2 cases), lint/TypeScript/build/Ruff/final credential scan and browser filter/market/stall/hawker/BM walkthrough passed. Initial test-import and formatting failures were repaired with affected checks only. **CP2 remaining: 0.** See [evidence and limits](CP2_ACCEPTANCE.md).

## CP3 — Voice targeting, local expressions, clarification and readback

**Requirements:** `C05-04`, `C05-05`, `C05-07`, `C05-09`. **Status:** local code and focused gate complete, 8 October 2026; held-out expression accuracy pending. **Depends on:** CP1; existing transcription/extraction.

**Tools:** existing Whisper worker, consented Morpheus backend adapter, typed JSON/Zod/Pydantic, deterministic reference resolution and browser speech synthesis with visible-text fallback.

- [x] Extend extraction to suggested stall references, dish references and a typed existing-batch intent. Resolve only within the authenticated hawker's permitted stalls and batches; duplicate names require a choice.
- [x] Separate new-batch creation from stock update. "Kuali kedua" cannot reset an old timer or fabricate Batch 2. Existing-batch references need exact dish/stall context and final confirmation.
- [x] Handle BM/Manglish quantities and price expressions, including "tinggal sepuluh bungkus" and "dua seringgit", with explicit unit/bundle pricing. Ask whether the latter means two units for RM1 rather than inventing a per-portion price.
- [x] Add short, field-specific clarification turns for ambiguous AM/PM/date, dish/batch, quantity/unit, ingredients and price. Keep the draft evidence and correction history; all critical unresolved fields block writes.
- [x] Read back a concise draft summary in the selected language after a user action. When a suitable browser voice is unavailable, show readable text; never silently claim audio was played.
- [x] Preserve transcript consent/redaction/deletion, bounded calls and fallback chips. Save a confirmed stock/menu/batch command atomically and idempotently.
- [x] Prepare adversarial/local-expression fixtures and expand the held-out recording brief; do not call synthetic examples measured human accuracy.

**Phase-end gate:** ambiguous clocks, duplicate stall/dish names, nonexistent/foreign batch, units/bundle price ambiguity, stale stock, unsupported timer edits, provider failure, retry conflict and voice-unavailable fallback. Demonstrate speech/text draft → clarification → readback → confirm → correct customer batch once. Human expression accuracy closes in CP7.

**Done when:** the richer confirmed workflow is implemented; `C05-05` remains acceptance-pending until held-out human expression results support the claim.

**Actual gate:** 55 selected frontend tests and 39 selected backend cases passed across the initial gate and affected retries, including five connected CP3 cases. Lint, TypeScript/build, Ruff, contract export, credential scan and browser new-batch → readback → stock reduction → customer audit passed. Two additive migrations applied; private-table RLS/client privileges and RPC permissions verified. [Detailed evidence](CP3_ACCEPTANCE.md).

**CP3 left:** no local code task. `C05-05` stays unchecked until consenting held-out recordings establish expression accuracy in CP7. No synthetic percentage is claimed. CP4 passport/recording work is now complete; CP5 is complete; CP6 is complete; CP7 is next and deployment remains held.

## CP4 — QR batch passports, handling measurements and reviewed rules

**Requirements:** `C06-10`, `C06-11`, `C07-01`, `C07-12`, `C07-13`. **Status:** local passport/recording code and focused gate complete, 8 October 2026; reviewed policy and cumulative accounting remain pending. **Depends on:** current batch audit; expert policy input for real-food acceptance.

**Tools:** existing QR generator, React audit UI, FastAPI, append-only SQL events and deterministic versioned policy functions. Human food-safety review is a separate input, not an AI tool.

- [x] Add public batch-passport routes/QRs containing only public batch ID/context. Display server-current batch state and a closed/expired view; QR scans never restore an offer or expose reporter/private media data.
- [x] Use the local origin for same-computer demos and an approved trusted local device origin for phone scans. Phone localhost is not the PC; public QR destinations are deferred to CP12.
- [x] Add explicit storage-transition records with effective/recorded times, source, actor and edit audit. Preserve original preparation time and earlier-only corrections.
- [x] Add manual measured-temperature entries with unit, measurement time, method/source and missing-data indicators. Keep weather and synthetic sensor timelines separate. No real sensor hardware integration is assumed.
- [x] Prepare a reviewable policy package: version/provenance, supported food/handling cases, uncertainty rules, non-increasing deadlines, transition accounting and fail-closed behaviour.
- [ ] Obtain qualified human review and record what the reviewer approved. Keep the current synthetic policy clearly labelled until that happens; do not invent cooking/holding thresholds or a safe badge.
- [x] Add conservative transition/restore/merge gates in SQL and demo code, with private append-only records, atomic corrections, idempotency, explicit unknown cumulative exposure and no timer extension.
- [ ] Implement cumulative exposure only under the approved policy. Unknown transition history or invalid measurements must not extend eligibility. Persist the decision's complete rule/input audit.

**Phase-end gate:** QR expired/unknown/unauthorised cases; earlier/later-recorded transition and measurement validation; duplicates/retries; missing/contradictory readings; non-increasing timers; no reset via merge/new batch/reheating. Compare approved policy vectors in SQL and fixture engines after human rules are supplied.

**Done when:** passport/recording code passes, and reviewed-policy/transition acceptance has real reviewer evidence. Code-only ambient demonstrations may continue while review is pending; unsupported handling stays blocked.

**Actual gate:** 68 selected frontend tests and 25 selected backend tests (one connected CP4 journey) passed; lint/TypeScript/build/Ruff, contract export, final credential scan and SQL permission checks passed. Three additive migrations applied (30 total); prior checksums preserved. Connected tests verified direct trigger protection even when the underlying older command is invoked, preserving protection across fresh migration order. Browser recording → correction → storage transition → public QR passport passed. [Detailed evidence](CP4_ACCEPTANCE.md).

**CP4 left:** qualified approval (`C07-01`) and the approved cumulative interval algorithm/parity vectors (`C07-13`). The second includes follow-up implementation once rules exist; a fail-closed gate is not a completed exposure calculation. [Review package and required inputs](CP4_POLICY_REVIEW.md). Same-computer QR works; actual phone scanning needs an approved reachable trusted local origin/device and remains device acceptance. **Next phase: CP7 human/device evaluation.** Deployment stays held.

## CP5 — Better clearance decisions and completed-sale accounting

**Requirements:** `C08-11`, `C08-12`, `C13-01`, `C13-02`. **Status:** local implementation and focused phase gate complete, 8 October 2026. **Depends on:** CP3–CP4 contracts and current commerce ledger.

**Tools:** deterministic SQL/Python aggregates, existing FastAPI/React commerce flows and CSV exports; no payment gateway or paid route service.

- [x] Add explicit per-session reconciliation of prepared, normal sales, clearance sales, giveaway/donation, discard and closing leftovers. Distinguish estimates, vendor reports and confirmed collection. Unknown original quantities remain unknown.
- [x] Attribute stock consumption exactly once across direct sales, holds, collections and surplus routes. Existing held stock and independent batch timers remain protected.
- [x] Snapshot original/offer prices and unit/bundle basis at sale time. Calculate completed-sale clearance revenue and customer savings; account for cancellations, refunds and free/BOGO bundles without repricing history.
- [x] Add promotion explanations using eligible stock, completed recent sales and remaining time. Suppress unreliable sales-history recommendations and show why; no LLM decides eligibility or expiry.
- [x] Include shopper-entered/available collection ETA in recommendations, with source/uncertainty and the conservative fulfilment buffer. Do not claim live traffic/routing estimates without an actual approved provider.
- [x] Preserve hawker approval, expiry hard stop, stock holds and final collection rechecks.

**Phase-end gate:** stock reconciliation, missing counts, overlapping reservation/direct-sale races, source deduplication, cancelled/no-show/refunded orders, BOGO/free accounting and ETA exceeding the window. Check exported totals against the ledger and walk through one confirmed collection.

**Done when:** the four calculations/recommendations are visible and reproducible in both adapters; no actual customer savings or waste diversion is claimed from synthetic transactions.

**Actual gate:** 118 distinct selected frontend tests and 36 backend tests passed, including eight connected CP5 cases. Final lint/types/build/Ruff, credential scan, refreshed contracts and targeted SQL permissions passed. One additive migration (31 total); fixture cleanup preserved 33 stalls / 96 foods. Browser normal sale → closing count, unknown/feasible/excessive ETA and actual session/source CSV comparison passed. [Evidence](CP5_ACCEPTANCE.md).

**CP5 left: 0 local jobs.** No new key, payment provider or traffic service required. Sessions mean Malaysia preparation date per stall, not inferred market attendance. Older unexplained stock or missing prices stay unknown. CP4 qualified policy and cumulative accounting remain pending; CP6 impact weights and human pilot evidence remain separate. **Next: CP7. Deployment remains held.**

## CP6 — Review replies, moderation assistance and impact telemetry

**Requirements:** `C09-03`, `C09-05`, `C09-12`, `C10-01`, `C13-03`, `C13-05`, `C13-06`. **Status:** complete locally, 8 October 2026. **Depends on:** CP1 and CP5.

**Tools:** existing community permissions/UI, Supabase RLS/SQL, FastAPI, opt-in backend-only Morpheus text assistance, scoped event aggregation and CSV.

- [x] Add replies tied to individual published reviews, with ownership, edit history, moderation, abuse reporting and public visibility rules.
- [x] Add spoiled-food, pests, cross-contamination and unhygienic-handling categories with old-category migration/alias handling. Preserve verified-account limits and confidential early organiser triage.
- [x] Add private, editable complaint-summary drafts for authorised moderators. Redact before any consented provider call, retain source references privately and require human review before sharing. Never let generated text create a public flag or send a referral.
- [x] Add deduplicated stall-view, offer-engagement and confirmed-batch-posting events; define active-user window and session semantics. Separate real consenting measurements from fixture/campaign simulations. Avoid precise location, raw transcripts or complaint identities in analytics.
- [x] Compute leftovers per 100 prepared portions for comparable baseline/trial sessions. Show denominator, missing-data exclusions and comparable market/session definitions; use CP5 reconciled quantities.
- [x] Add measured portion-weight samples and quantity-based weight estimates with method/date/sample count and uncertainty. Keep estimated, actually weighed, discarded and human-consumption routes separate.
- [x] Expose role-scoped/small-group-suppressed aggregates and exports, including reported concern counts without implying verified guilt or food safety.

**Phase-end gate:** reply ownership/moderation, category migration, confidential-summary redaction/consent, malicious report content, duplicate/replayed telemetry, zero/missing denominators, estimate-versus-weighed labels and aggregate privacy. One organiser export must match its filtered source records.

**Done when:** all seven features have permission-safe, reproducible outputs; human pilot effects remain unmeasured until CP7.

**Actual gate:** 47 distinct selected frontend and 25 backend tests passed, including five connected CP6 journeys. Final lint/types/build/Ruff, client credential scan, scoped permissions and filtered organiser browser CSV comparison passed. Three additive migrations (34 total); fixture cleanup retained 33 stalls / 96 foods. [Acceptance](CP6_ACCEPTANCE.md).

**CP6 left: 0 local jobs.** Existing Morpheus configuration is reused; no new key is required. Provider calls were mocked for privacy/failure checks, not human quality evidence. Pilot effects remain unmeasured; CP7 is next. Deployment remains held.

## CP7 — Human benchmarks, actual devices and measured evidence

**Requirements:** `C14-01`, `C14-02`, `C14-03`, `C14-04`, `C14-05`, `C14-08`, `C15-06`. **Status:** local collection/scoring preparation complete, 8 October 2026; seven human/device requirements remain pending. **Depends on:** CP1–CP6 for final measurement; preparation can begin earlier.

**Tools:** existing evaluation/timing UI, private audio folder, recording guide, actual Whisper/Morpheus inference, Python metric/CSV analysis and consenting Chrome/Edge/Firefox/phone users. Local trusted device origin is prepared only when a device is available.

### Local preparation completed

- [x] Expanded 24-case BM/Manglish/English recording contract with bundle prices, batch references, explicit ambiguity and planned noise cases.
- [x] Private ignored collection files, actual consent/audio/hash/annotation requirements and freeze-integrity workflow.
- [x] Offline accuracy/WER, failure/clarification/correction, paired live timing and latency/token/billing scorer with honest unknowns.
- [x] Interview/trial/device CSV templates, predeclared targets and complete collection/measurement guide.
- [x] Evaluation-page pack download; legacy importer/timers clearly separated from the CP7 holdout.
- [x] Preparation gate: 15 distinct Python scorer tests, six frontend timing tests, final lint/types/build/Ruff, credential and actual browser-download comparison passed. Synthetic fixtures are excluded from human evidence.

[Guide](CP7_MEASUREMENT_GUIDE.md) · [Preparation evidence and remaining work](CP7_ACCEPTANCE.md). **CP7 acceptance jobs left: seven feature requirements**, covering all human/device tasks below. No participant results have been supplied. The CP7 preparation checkpoint was 121 checked / 30 open; after CP8, the current overall count is 124 checked / 27 open. No deployment.

### Human/device acceptance still pending

- [ ] Conduct consented hawker/customer interviews; record participant counts, workflow findings and limitations with anonymous IDs.
- [ ] Prepare a held-out set of at least 24 recordings from five consenting speakers: 10 BM, 10 Manglish and four English, adding dish/batch references, bundle prices, accents/noise and ambiguous cases beyond the narrow original scripts. Freeze development versus held-out membership before tuning.
- [ ] Record transcription WER, critical-field accuracy, JSON validity, clarification/correction rates and failure counts by language/task. Include exact denominator and unsupported cases.
- [ ] Collect paired live voice-versus-typing tasks with counterbalanced order and all fixes/confirmation included. Separate cold model download, warm use, supplied audio and live microphone timing.
- [ ] Capture request latency, failed/retried requests and actual token/usage records. Report cost per successful confirmed update only from known billed/free-allowance data; label estimates and unavailable pricing instead of assuming a free balance means measured zero cost.
- [ ] Run a documented local user trial and report feedback plus observable outcomes. Keep synthetic pilot history out of measured participant results.
- [ ] Verify actual displayed notification and click in a consenting supported browser. Existing notification consent on this computer remains valid; phone or microphone permission must be granted by its user.
- [ ] Verify a real disconnected reload and an unvisited lazy demo route after cache-ready acknowledgement. Confirm image fallbacks and that private connected writes stay unavailable offline.
- [ ] Run the target cheap-phone matrix: recording allow/deny, memory/model download, BM/English, large-button use, slow network/reconnect, installation, update and main shopper/hawker workflows.
- [ ] Publish an anonymised evidence report with actual model/version/device/network context, measured results and failures. Apply predeclared acceptance targets; repair only failed cases and retest affected clips plus an unchanged holdout sample.

**Phase-end gate:** one scheduled measurement batch after tooling/core changes are finished; validate evidence provenance, pairing, held-out membership, denominators and privacy. Successful software checks cannot complete interviews, real notification receipt or human accuracy boxes.

**Done when:** actual participant/device evidence satisfies the seven requirements. If people/devices are unavailable, record acceptance pending and continue independent code work rather than inventing results.

## CP8 — Photo assistance and evaluated leftover forecasting

**Status:** local implementation and focused gate complete; four real-history acceptance requirements open. **Tools:** React/TypeScript PWA, FastAPI/Pydantic, Pillow, Morpheus gemma-4-31b, existing Supabase CP5 journal, Python chronological forecasting, pytest/Vitest/Ruff/ESLint and browser.

- [x] Verify vision contract/catalogue/balance and actual supplied-image response. Existing credits owner-authorised; account billing unchanged. Qwen hosted capacity returned 503; Gemma succeeded. Record actual tokens, not assumed price.
- [x] Add consented metadata-stripped bounded photo suggestions with uncalibrated confidence and human review. Constrain evidence to apparent categories; never accept hidden-ingredient, halal, cooking-time or safety evidence.
- [x] Compare the shared speech/photo dish field, flag disagreements, require human choice and confirmation. Reviewed draft export uses the existing confirmed save workflow.
- [x] Read owned reconciled prepared/sold/leftover history; exclude censored/incomplete/unknown/future sessions and reject duplicate historical days.
- [x] Add historical-average/median baselines, bounded trend, chronological train/validation/calibration/holdout errors and disclosed release gate with baseline fallback.
- [x] Add residual intervals and covered/total holdout reporting with time-series caveats. Synthetic observed coverage 75%, below nominal 90%.
- [x] Add conservative manual small-first-batch guidance and latest observation where available; no precise quantity below 30 usable same-weekday sessions.
- [x] Phase-end gate: 22 distinct backend cases including one connected journey, four frontend cases, static/build/contract/credential checks and browser confirmed download. No new migration; 34 total. Local API refreshed; deployment held.
- [ ] C12-01: review enough consented actual reconciled history; evaluate sales/demand and likely-unsold estimates.
- [ ] C12-04: evaluate calibration and coverage on actual held-out history.
- [ ] C12-05: run frozen real average/median comparison; keep all candidate errors and baseline fallback.
- [ ] C14-11: retain reviewed real forecast benchmark; use new untouched data after holdout-driven iteration.

**Closed locally:** C05-11, C05-12, C12-06. **Remaining:** four real-history requirements; no remaining CP8 coding task identified. [Acceptance](CP8_ACCEPTANCE.md) · [History/benchmark guide](CP8_FORECAST_GUIDE.md). Credits and synthetic data cannot replace real history. One image smoke proves capability, not population accuracy. No deployment.

## CP9 — Competition evidence and rehearsed student showcase

**Requirements:** C15-08, C15-09, C15-10, C15-11, C15-12. **Status:** local preparation and focused technical gate complete; all five human/competition acceptance requirements remain open. **Tools:** Markdown/JSON evidence/storyboard, React/TypeScript studio download, existing fixture/clock controls, Python private templates, Vitest/pytest/Ruff/ESLint and browser; participating student/local recorder for the final deliverable. No deployment/submission.

- [x] Prepare a claim-to-evidence map with actual CP1–CP8 records, missing human/device evidence and a provisional TRL reviewer matrix. No readiness level assigned.
- [x] Prepare conditional prior-version/no-prior-version drafts and private team/supervisor/rules fields; unconfirmed facts remain blank.
- [x] Prepare seven contiguous English scenes and captions spanning 300 provisional seconds. Official video limit remains unverified; measured human claims remain pending.
- [x] Add actual downloadable CP9 pack to the studio and non-overwriting private rehearsal/video-review templates.
- [x] Add earlier clearance and explicit expired scenarios. Existing reminder is at the 15-minute new-offer cutoff; do not weaken it.
- [x] Execute desktop technical rehearsal: scripted draft/date clarification/confirmed Batch 3 versus old Batch 1, eligible approval/customer offer, same-workspace clock advance/delisting, missing-handling block and Not measured evidence.
- [x] Finish preparation gate: nine distinct frontend and one Python case, lint/types/build/Ruff, credential/template-ignore checks and browser-download parity. Affected selection/scenario retries only; no database/provider call or migration.
- [ ] Confirm official competition name/rules/track/eligibility/duration/evidence/TRL criteria.
- [ ] C15-11: obtain actual participating students, eligibility and academic supervision.
- [ ] C15-09: confirm prior SantanSafe history and review an evidence-backed advancement declaration.
- [ ] C15-10: complete reviewer assessment against official TRL definitions and actual evidence.
- [ ] C15-08: record and review a complete participating-student English video, observed duration and captions.
- [ ] C15-12: complete intended-device student live rehearsal and full backup recording/playback review.
- [ ] Obtain supplied-image generator/date/public-use rights before future publication; no additional images needed.
- [ ] Add CP7 actual measurements/costs and CP8 real-history results if making those performance claims.

**Remaining:** five combined requirements. The local technical rehearsal/screenshots and existing diagram animations are not a student-narrated backup video. Overall remains 124 checked / 27 open. [Acceptance](CP9_ACCEPTANCE.md) · [Recording guide](CP9_SHOWCASE_GUIDE.md) · [Evidence/declaration pack](CP9_EVIDENCE_PACK.md). Optional user input for rules/team/history is pending; no missing answer treated as confirmation.

## CP10 — Real partnership, authority and expansion activation readiness

**Requirements:** `C11-01`, `C11-02`, `C11-03`, `C11-05`, `C11-06`, `C11-07`. **Status:** local preparation and contract gate complete; six real activation prerequisites pending.

**Tools:** existing typed mock adapters, FastAPI/SQL audit, contract fixtures, approved provider endpoints and scoped credentials supplied later. No assumed Foodie/KKM/BKKM API.

- [x] Prepare six private onboarding/evidence contracts, owner handoff briefs and an offline strict validator. [Guide](CP10_PARTNER_GUIDE.md).
- [x] Gate local contract/privacy rejection and existing simulated timeout/retry/duplicate receipt/provenance behaviour: 32 Python and 14 frontend cases passed. [Evidence](CP10_ACCEPTANCE.md).
- [ ] Obtain actual agreements and approved data contracts for real food creators/media organisations before claiming collaboration or displaying genuine endorsement badges.
- [ ] Record approved partner identities, badge wording, scope, expiry/revocation and evidence; distinguish editorial recognition from purchased sponsorship.
- [ ] Obtain agreed authority/municipal intake procedures, consent/data scope and a confirmed target. Prepare a reviewed export/draft if no sanctioned API exists. Keep real complaint transmission disabled without a separate authorised action.
- [ ] Obtain authoritative permit/licensing data or approved manual verification procedures; record provenance, freshness and disagreement handling. Do not convert a demo permit into official evidence.
- [ ] Obtain collection/compost partners, fulfilment requirements and chain-of-custody/receipt rules. Preserve eligible donation versus non-consumption waste separation.
- [ ] Activate location expansion from verified market/schedule/organiser/stall data and execute a reviewed onboarding/pilot plan. More fictional pins are not a real rollout.
- [ ] Obtain approved real samples, build provider-specific adapters and contract tests, then validate credentials and real responses only within the approved scope. No external messages, referrals or publications are sent automatically.

**Phase-end gate:** local contract rejection, timeout/retry, duplicate receipts, permission/privacy and label/provenance checks in one batch. Real acceptance additionally needs agreements and explicitly authorised provider tests.

**Done when:** each real agreement/data source/rollout requirement has evidence and its approved adapter works. Local simulations remain available while external items are pending; collecting partner names or writing an adapter does not complete collaboration.

## CP11 — Dedicated native applications, built locally

**Requirement:** `C01-07`. **Status:** fictional wrapper preparation complete; binary/device/toolchain checks skipped at owner request; connected native acceptance pending. **Depends on:** accepted core PWA; CP7 device findings.

**Tools:** pinned Capacitor 8.4.3 with App 8.1.2 and Local Notifications 8.3.1 wrapping the existing React/Vite app, Android Studio/SDK and local Android debug APK; Xcode on an available Mac for iOS. The [official Capacitor environment guide](https://capacitorjs.com/docs/getting-started/environment-setup) confirms that iOS builds need macOS/Xcode and Android builds need Android Studio/SDK. Verify compatible locked versions when this phase starts.

- [x] Audit source compatibility and generate Android/iOS projects with an isolated fictional native build, restricted demo links, safe-area/back handling and no inherited connected Auth configuration. [Evidence](CP11_ACCEPTANCE.md).
- [x] Add explicit local-notification permission/deny/clear, microphone pause cleanup and picker usage descriptions. Browser/mock checks passed; actual OS/device flows remain pending.
- [ ] Validate connected native API/Auth origins/redirects and native speech/WASM memory on intended devices.
- [ ] Verify microphone, picker and notification flows with denial/manual-entry fallbacks on the actual operating systems; validate connected native API/domain rules in an approved connected build.
- [ ] Build and exercise an Android APK locally on an actual device. Do not call the current browser frame a native app.
- [ ] Build and exercise the iOS app on a provided Mac/device or supported simulator. iOS cannot be marked complete from the current Windows-only environment.
- [x] Document signing/testing/distribution limitations and [resume/device matrix](CP11_NATIVE_GUIDE.md). Personal on-device learning/testing can use a free Apple Account, but store distribution requires the appropriate programme; do not promise free app-store publication. [Apple membership comparison](https://developer.apple.com/support/compare-memberships/).
- [x] Keep store submission, hosted origins and public distribution held.

**Local source gate:** 57 distinct selected frontend tests, lint, native/browser builds, generation/sync, config/credential checks passed. Binary/device gate skipped by owner; no APK/iOS compilation claim.

**Remaining phase-end gate:** one platform test matrix after the wrapper build: installed binaries, API/Auth, deep links, recording/denial, slow-network/restart, keyboard/safe areas and batch/expiry integrity. Native push requires its own actual consented receipt evidence; browser push results do not prove it.

**Done when:** actual Android and iOS binaries have platform evidence. An Android-only APK leaves the combined requirement partial. Public distribution remains CP12 or a separately reviewed future release.

## CP12 — Final deployment, separately authorised and last

**Original phase:** Phase 12. **Status:** on hold; outside the 57-item completion count.

**Tools/targets:** prepared Vercel frontend configuration, Railway FastAPI/worker/container configuration and Supabase; native distribution only if later explicitly requested and eligible.

- [ ] Review local evidence and open human/partner limitations; agree whether release means fictional demo or real-user pilot. Pending optional native/partner activation must be disclosed rather than treated as a hidden reason to fabricate completion.
- [ ] Obtain the later deployment instruction; confirm provider account allowances, eligibility and any unavoidable spending before activation.
- [ ] Deploy web/API/worker, configure private secrets, exact CORS/Auth redirects, public origin and controlled signup policy. Preserve guarded demo/real data separation.
- [ ] Verify public-origin schedules/weather, Storage/RLS, Realtime, consented push, origin/QR links, offline/update and rollback/backup recovery.
- [ ] Run focused deployed-origin smoke checks. Repeat broader regression only if deployed changes invalidate the accepted local build.
- [ ] Deliver URLs, actual operational evidence, runbook and remaining boundaries. Submit competition/store material or send external referrals only under their separate explicit instructions.

No deployment or external transmission takes place while executing CP1–CP11 local preparation. Details remain in [deployment handoff](deployment.md) and [existing remaining jobs](REMAINING_JOBS.md).

## Checklist update procedure

After each phase, update its task boxes here, the matching `Cxx-yy` rows in [partial/pending inventory](PARTIAL_AND_PENDING_JOBS.md), the original consolidated item and `docs/phase-status.md`. Cite code/evidence and distinguish code complete, acceptance pending and external activation. Regenerate counts from actual checkboxes; do not add counts across repeated test runs. A multi-part requirement stays unchecked until all required parts pass.
