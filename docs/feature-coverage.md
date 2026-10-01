# Requirement coverage

Status key: `foundation` means a Phase 1 route or contract exists; `planned` means the named later phase owns the working journey. Each later phase must replace its planned entry with an actual screen, scenario result and gate evidence. A blank card does not count.

| Requirement | Demo screen / contract | Scenario and material boundary | Phase | Status |
| --- | --- | --- | --- | --- |
| DISC-01 markets and schedule | Discover, market detail | Fictional open/day/night/closed; later midnight/cancellation | 3 | foundation |
| DISC-02 search and rankings | Discover search | Name/dish search; later distance/filter/rank ties | 3 | foundation |
| DISC-03 stall/food detail | Stall detail | Menu, per-batch timestamps/availability | 3–4 | foundation |
| DIET-01 halal transparency | Stall label | Declared versus reviewed certified; never infer identity | 3 | foundation |
| HAWK-01 stall/menu | Hawker stall | Own stall edits; cross-owner denial | 4 | foundation |
| BATCH-01 batches | Hawker batches | Two independent batches; duplicate retry and merge | 4 | foundation |
| SAFE-01 deterministic advisory | Batch detail | Confirmed ingredients/time/weather; stale/unknown shortens | 5 | planned |
| ALERT-01 reminder centre | Hawker alerts | Deadline boundary, reconnect, missed scheduler | 5 | foundation |
| PROMO-01 clearance | Hawker promotions | Confirmed offer; expiry hard stop and halal filter | 5 | foundation |
| AGENT-01 closing workflow | Draft, alerts, offer, outbox | Nudge → confirm → DB write → push; retry/expiry | 5,10 | planned |
| REALTIME-01 live map | Discover/map | Two clients, reconnect and polling fallback; no private payloads | 3 | planned |
| LANG-01 BM/English | All foundation routes | Switch language and refresh; untranslated/error state | 1,6 | foundation |
| VOICE-01 STT + LLM JSON | Hawker batch/voice | Confidence, confirm/fix; failure chips and transcript deletion | 6 | planned |
| EVAL-01 voice metrics | Evaluation screen/report | 20 BM/Manglish clips, four English controls; actual timing | 6 | planned |
| TRUST-01 reviews | Stall detail | Own review, hide report; vendor cannot self-review | 7 | planned |
| TRUST-02 verified hygiene reports | Complaint/organiser/reply | Private early triage; independent threshold + moderator | 7 | planned |
| ADMIN-01 moderation | Restricted admin | Real role denied/allowed; audit | 2,7 | foundation |
| MON-01 ads and tiers | Advertiser/hawker | Labelled slots, mock budget, free basic tools | 8 | planned |
| METRIC-01 outcomes | Hawker/organiser | Synthetic versus actual measures; no duplicated weights | 8–11 | planned |
| COM-01 reservations | Checkout/vendor | Pay at stall, no-show, stock release | 8 | planned |
| PAY-01 payment showcase | Demo checkout | Fake success/fail/refund; no card data | 8 | planned |
| ADS-01 campaigns | Advertiser/admin | Targeting, moderation, budget, safety/halal filters | 8 | planned |
| DEL-01 delivery showcase | Courier portal | Fake dispatch and failed arrival | 8 | planned |
| PART-01 media/company | Partner portal | Request → editorial approval → featured trail | 9 | planned |
| GOV-01 authority | Referral/officer | Consent → redaction → fake case; no real filing | 9 | planned |
| COUNCIL-01 permits/dashboard | Council portal | Fake permit expiry and aggregate view | 9 | planned |
| WASTE-01 donation/collection | Collection portal | Eligible donation versus expired compost/BSF | 9 | planned |
| NOTIFY-01 channels | Preferences/inboxes | Consent, quiet hours, push test; SMS/email simulated | 10 | planned |
| LAB-01 sensor/weather research | Lab | Synthetic readings cannot extend deadline | 10 | planned |
| AI-01 preview assistance | AI lab | Scripted photo/extra language distinct from live voice | 10 | planned |
| APP-01 native previews | Device frames | Links to PWA routes; no app store claim | 10 | planned |
| DATA-01 analytics | Hawker/council | Scoped synthetic charts and marked exports | 8–10 | planned |
| FORECAST-01 demand | Premium view | Bounded weekday/rain model; insufficient-data state | 10 | planned |
| PRIV-01 privacy/PDPA | Consent/profile/data map | Opt-in coarse location, audio deletion, rights | 1,2,6,7 | foundation |
| INCL-01 accessibility | All routes | 48 px actions, chips, low-cost device and free basic tier | 1,6 | foundation |
| BIZ-01 commissions/subscriptions | Hawker/organiser | Pay-at-stall ledger, no fee on booking, scoped dashboards | 8 | planned |
| PILOT-01 pilot | Pilot dashboard/guide | One market, 10 stalls, four weeks; real vs synthetic | 11 | planned |
| IMAGE-01 100 generated assets | Image manifest/screens | One prompt/one file and generated labels | 11 | planned |

## Phase 1 contracts

- `DataGateway`: `getPublicConfig()` and `getDiscovery()` with an explicit mode.
- `ScenarioAdapter`: business simulation with `success`, `pending`, `rejected` and `timeout`; future phases add real domain actions behind this boundary.
- Implemented shared controls: `apps/web/src/integrations/ScenarioControls.tsx`, rendered in the fixture Profile screen; every outcome returns a labelled `DEMO-` reference. All four outcomes passed the Phase 1 browser gate.
- `AppClock`: real/system versus session-only fixture time.
- Privileged routes show a restricted state until the Phase 2 auth/role policy exists.
- Consent controls store local choices only; no browser permission is requested by the foundation.
