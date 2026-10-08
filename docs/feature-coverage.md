# Requirement coverage

## CP4 additions — 8 October 2026

Public current/closed batch passports and local QR routes are implemented with private append-only measurements, transitions and correction history. Effective/server-recorded times and source/actor audit are preserved. Temperature observations cannot extend a timer. Storage changes block clearance; restore/merge guards protect existing history, including direct underlying command calls. Qualified approval and cumulative policy accounting remain pending. [Evidence](CP4_ACCEPTANCE.md) · [Review package](CP4_POLICY_REVIEW.md).

## CP3 additions — 8 October 2026

Owned stall/dish/existing-batch suggestions, short clarification questions, correction evidence and English/BM summary readback are implemented. Distinct menu/new-batch/stock commands save atomically and idempotently; stock reductions preserve original preparation time and deadline. The local browser and five connected cases passed. Held-out BM/Manglish expression accuracy remains pending in CP7. [Evidence](CP3_ACCEPTANCE.md).

## CP1 additions — 8 October 2026

| Requirement | Local implementation and evidence | Remaining acceptance |
| --- | --- | --- |
| Dedicated description | Hawker form → demo or guarded vendor RPC → public customer detail; 1,000-character validation | Complete in fictional local scope |
| Transparent declarations | Voluntary yes/no/unknown pork-free, alcohol-free and Muslim-owned, independent of certificate evidence/expiry and filters | Human privacy review before real ownership data |
| Confirmed allergens | Explicit selected list, source/time audit and cross-contact; ingredient/voice updates invalidate confirmation; unknown fallback | Complete in fictional local scope; no exhaustive/allergen-free guarantee |
| Registration/onboarding | Disabled-by-default public adapter; invite/confirmation handling; verified invited new profiles get customer only; metadata cannot grant roles | Owner signup policy and actual human email/password journey; no public signup enabled |

[CP1 gate evidence](CP1_ACCEPTANCE.md): 78 selected frontend and 21 backend tests passed, including four connected CP1 cases. [Privacy/provider/audit-retention draft](CP1_PRIVACY_REVIEW.md) awaits human review. Deployment remains held.

The original Phase 1 mapping below is followed by phase implementation evidence. As of 7 October 2026, feature journeys are implemented in the fictional demo; connected/device/human acceptance is distinct and remains tracked in `REMAINING_JOBS.md`. A screen or passing fixture test does not prove live SQL/Storage/device behaviour.

Current local additions: full connected seed/history and preserved-audit reset, loopback dispatcher/media worker, private VAPID setup and prepared launch/recovery/deployment files. The replacement Supabase target is migrated/seeded and reachable from Python; 44 connected cases and two-client Realtime passed. The 8 October customer/hawker UI refresh integrates all 12 supplied originals, with 92 focused frontend tests and representative browser interactions passing. See [refresh evidence](UI_UX_REFRESH.md) for exact scopes. Human speech numbers remain unmeasured; image generation metadata/public-use rights remain pending.

| Requirement | Demo screen / contract | Scenario and material boundary | Phase | Status |
| --- | --- | --- | --- | --- |
| DISC-01 markets and schedule | Discover, market detail | Fictional open/day/night/closed; later midnight/cancellation | 3 | foundation |
| DISC-02 search and rankings | Discover search | Name/dish search; later distance/filter/rank ties | 3 | foundation |
| DISC-03 stall/food detail | Stall detail | Menu, per-batch timestamps/availability | 3–4 | foundation |
| DIET-01 halal transparency | Stall label | Declared versus reviewed certified; never infer identity | 3 | foundation |
| HAWK-01 stall/menu | Hawker stall | Own stall edits; cross-owner denial | 4 | foundation |
| BATCH-01 batches | Hawker batches | Two independent batches; duplicate retry and merge | 4 | foundation |
| SAFE-01 deterministic advisory | Batch detail | Confirmed ingredients/time/weather; stale/unknown shortens | 5 | implemented; connected advisory gates passed |
| ALERT-01 reminder centre | Hawker alerts | Deadline boundary, reconnect, missed scheduler | 5 | foundation |
| PROMO-01 clearance | Hawker promotions | Confirmed offer; expiry hard stop and halal filter | 5 | foundation |
| AGENT-01 closing workflow | Draft, alerts, offer, outbox | Nudge → confirm → DB write → push; retry/expiry | 5,10 | implemented; connected agent/push SQL gates pass; actual device receipt pending |
| REALTIME-01 live map | Discover/map | Two clients, reconnect and polling fallback; no private payloads | 3 | implemented; two-client Realtime and geographic gates passed |
| LANG-01 BM/English | All foundation routes | Switch language and refresh; untranslated/error state | 1,6 | foundation |
| VOICE-01 STT + LLM JSON | Hawker batch/voice | Confidence, confirm/fix; failure chips and transcript deletion | 6 | implemented; connected voice gates pass; human evaluation pending |
| EVAL-01 voice metrics | Evaluation screen/report | 20 BM/Manglish clips, four English controls; actual timing | 6 | implemented; connected voice gates pass; human evaluation pending |
| TRUST-01 reviews | Stall detail | Own review, hide report; vendor cannot self-review | 7 | implemented; representative connected permission/Storage gates passed |
| TRUST-02 verified hygiene reports | Complaint/organiser/reply | Private early triage; independent threshold + moderator | 7 | implemented; representative connected permission/Storage gates passed |
| ADMIN-01 moderation | Restricted admin | Real role denied/allowed; audit | 2,7 | foundation |
| MON-01 ads and tiers | Advertiser/hawker | Labelled slots, mock budget, free basic tools | 8 | implemented; representative connected runtime gates passed |
| METRIC-01 outcomes | Hawker/organiser | Synthetic versus actual measures; no duplicated weights | 8–11 | planned |
| COM-01 reservations | Checkout/vendor | Pay at stall, no-show, stock release | 8 | implemented; representative connected runtime gates passed |
| PAY-01 payment showcase | Demo checkout | Fake success/fail/refund; no card data | 8 | implemented; representative connected runtime gates passed |
| ADS-01 campaigns | Advertiser/admin | Targeting, moderation, budget, safety/halal filters | 8 | implemented; representative connected runtime gates passed |
| DEL-01 delivery showcase | Courier portal | Fake dispatch and failed arrival | 8 | implemented; representative connected runtime gates passed |
| PART-01 media/company | Partner portal | Request → editorial approval → featured trail | 9 | implemented; representative connected runtime gates passed |
| GOV-01 authority | Referral/officer | Consent → redaction → fake case; no real filing | 9 | implemented; representative connected runtime gates passed |
| COUNCIL-01 permits/dashboard | Council portal | Fake permit expiry and aggregate view | 9 | implemented; representative connected runtime gates passed |
| WASTE-01 donation/collection | Collection portal | Eligible donation versus expired compost/BSF | 9 | implemented; representative connected runtime gates passed |
| NOTIFY-01 channels | Preferences/inboxes | Consent, quiet hours, push test; SMS/email simulated | 10 | implemented; connected database gates passed; actual device acceptance pending |
| LAB-01 sensor/weather research | Lab | Synthetic readings cannot extend deadline | 10 | implemented; connected database gates passed; actual device acceptance pending |
| AI-01 preview assistance | AI lab | Scripted photo/extra language distinct from live voice | 10 | implemented; connected database gates passed; actual device acceptance pending |
| APP-01 native previews | Device frames | Links to PWA routes; no app store claim | 10 | implemented; connected database gates passed; actual device acceptance pending |
| DATA-01 analytics | Hawker/council | Scoped synthetic charts and marked exports | 8–10 | implemented; connected commerce gates and actual filtered CSV verified; metrics remain synthetic |
| FORECAST-01 demand | Premium view | Bounded weekday/rain model; insufficient-data state | 10 | implemented; connected database gates passed; actual device acceptance pending |
| PRIV-01 privacy/PDPA | Consent/profile/data map | Opt-in coarse location, audio deletion, rights | 1,2,6,7 | foundation |
| INCL-01 accessibility | All routes | 48 px actions, chips, low-cost device and free basic tier | 1,6 | foundation |
| BIZ-01 commissions/subscriptions | Hawker/organiser | Pay-at-stall ledger, no fee on booking, scoped dashboards | 8 | implemented; representative connected runtime gates passed |
| PILOT-01 pilot | Demo studio / pilot guide | 10 stalls, four weekly nights; net RM and separate weighed routes | 11 | local synthetic dashboard implemented; real pilot pending |
| IMAGE-01 100 logical slots / 12 originals | Studio library / legacy manifest / supplied provenance | Curated matching subjects, 24 WebP outputs, labelled representative art; batch/evidence/unmatched slots stay separate | 11 / UI refresh | all 12 originals integrated locally; public-use rights/model/date pending |

## Phase 1 contracts

- `DataGateway`: `getPublicConfig()` and `getDiscovery()` with an explicit mode.
- `ScenarioAdapter`: business simulation with `success`, `pending`, `rejected` and `timeout`; future phases add real domain actions behind this boundary.
- Implemented shared controls: `apps/web/src/integrations/ScenarioControls.tsx`, rendered in the fixture Profile screen; every outcome returns a labelled `DEMO-` reference. All four outcomes passed the Phase 1 browser gate.
- `AppClock`: real/system versus session-only fixture time.
- Privileged routes show a restricted state until the Phase 2 auth/role policy exists.
- Consent controls store local choices only; no browser permission is requested by the foundation.

Phase 11 studio links all operational demo portals. Fixture business counts, synthetic pilot KPIs and described media slots are separate from connected provisioning, live speech recordings/realtime/agent/device acceptance. No fake metric is substituted for measured evaluation evidence.

## CP2 discovery completion — 8 October 2026

Seven gaps closed: independent farmers classification, six category IDs, declared plant diet, menu-unit budget, closing soon, availability confirmations and destination directions. Fixture and guarded connected adapters are covered; **91 frontend / 26 backend selected tests passed**, including 3 connected CP2 cases. See [acceptance](CP2_ACCEPTANCE.md). No whole-project rerun, real-device route test, deployment or additional imagery claimed.

## CP5 additions — 8 October 2026

Owner-scoped preparation-date reports reconcile reported versus confirmed portion movements and final closing snapshots. Immutable sale-time prices support completed-clearance net revenue/retained savings, refunds/free/BOGO and missing-price/dispute exclusions. Shared stock locks and append-only captured source references prevent double counting; older unexplained changes remain explicit gaps. Deterministic recommendations use reliable completed-sale pace, reconciled unheld portions, cutoff and entered ETA with uncertainty; unknown/infeasible ETA suppresses numeric advice. Source/session CSVs match browser examples. [Acceptance and reproducible gate](CP5_ACCEPTANCE.md). No real impact, live traffic, expert food-policy approval or deployment is implied.

## CP6 — community and impact, 8 October 2026

Complete locally: seven requirements closed; **121 checked / 30 open**. Review replies/moderation, dedicated report categories, minimised private summaries, opt-in deduplicated telemetry, comparable leftover metrics, measured-weight provenance and suppressed scoped exports are delivered. 47 distinct selected frontend and 25 backend tests passed, including five connected cases; three additive migrations (34 total), fixture baseline 33 stalls / 96 foods preserved. Browser private-draft/public-reply and organiser CSV evidence recorded. [Acceptance](CP6_ACCEPTANCE.md). CP7 human/device evidence is next; provider quality and real pilot effects are not claimed. Deployment held.

## CP7 preparation — 8 October 2026

Collection/scoring preparation complete; all seven human/device requirements remain pending. Expanded 24-case holdout template, consent/audio/hash freeze checks, offline metric/timing/request-cost scorer, interview/trial/device templates and browser pack download are ready. 15 distinct Python tests and six frontend timing tests passed; final static/build/credential and browser download evidence recorded. These are synthetic software checks, not measured human accuracy or pilot effects. Counts stay **121 checked / 30 open**. [Guide](CP7_MEASUREMENT_GUIDE.md) · [Preparation evidence](CP7_ACCEPTANCE.md). No deployment.
