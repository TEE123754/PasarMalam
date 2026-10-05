# Phase 10 acceptance — 2 October 2026

Status: advanced fixture build locally verified; connected Web Push implementation present, device/database acceptance pending. Phase 10 is not fully accepted.

## Implemented

Open `/demo/advanced` from Profile. Seven query-linked scenarios cover fictional push/SMS/email preferences and inboxes, sensor timelines, ingredient/weather research, scripted BM/Tamil/Mandarin/photo extraction, Android/iOS web frames, filtered synthetic analytics and premium deterministic forecasting. Four fictional recipients have coarse cells, 1.5 km default radius, channel opt-ins and Malaysian quiet hours. Delivery records deduplicate by event/channel/recipient; retry is explicit, capped at three attempts and rechecks consent/expiry. No real SMS or email address, provider, partner or authority action exists.

The dataset contains six fictional stalls and 112 dated sessions each (672 rows). Reported fictional gross revenue, estimated discard and separately synthetic weighed discard are different fields; they are not claims of net recovery or human-consumption diversion. Council display suppresses fewer than five stalls. CSV uses the identical filtered rows and the existing formula-safe exporter. These are additional generated analytics fixtures, not replacements for the authoritative commerce/partner ledgers.

Forecasts use only earlier same-stall weekday sessions, exclude censored stockouts, require eight usable samples, apply a 0–20% bounded rain reduction and expose sample/exclusion counts and descriptive historical spread. The chronological 75% training set is frozen for holdout scoring. Stall 1: 84 training rows through 2026-08-23, 27 eligible holdout rows; baseline MAE 2.89 portions, adjusted MAE 0.00. The perfect adjusted score is a consequence of the scripted data-generation rule, not measured predictive performance. Real pilot validation/calibration remains necessary. No LLM creates quantities.

Research/sensors/AI have no import of vendor mutations, deadline engine writes or publication endpoints. AI confirmation only acknowledges editable local preview fields. Real local BM/English/mixed voice and evaluation routes remain separate. No images generated: the photo example is a described placeholder.

## Connected test push implementation

Free pywebpush 2.5.0 is locked in uv.lock. Authenticated FastAPI enrol/revoke RPCs store one device per account in a private RLS-enabled table; public legacy subscription credential reads are revoked. VAPID private key stays on the server; only an enabled public key is exposed. Browser permission is requested only by the explicit connected-sandbox enable button. No permission was granted during this turn.

The Phase 5 scoped dispatcher consumes leased confirmed-offer outbox events. Test mode performs a preflight against consent/location validity, quiet hours, caps, active stock, expiry and deterministic advisory before network dispatch. Preflight holds recipient/outbox row locks through the bounded five-second transport call to serialize concurrent sends; opt-out submitted during an in-flight send may wait for that transaction. Completed opt-out cancels pending/leased records. Already provider-accepted messages cannot be recalled. Stale claims cannot finalize; retries use stable event tags. Provider acceptance is recorded separately from attempted outcomes and is never called a device/read acknowledgement. 404/410 deletes only the matching invalid endpoint, protecting a replacement device. Supported endpoints are restricted to exact Google/Mozilla/Apple HTTPS hosts, and redirects are disabled. The notification worker caches nothing, discards stale payloads and routes clicks to `/sandbox/offers` for fresh availability checks.

Migration `20261002104837_test_push.sql` was created with Supabase CLI. It was not applied. SQL/PLpgSQL syntax parsing does not validate live grants, name binding, transaction races or device receipt. The connected enqueue trigger and matcher use PostGIS distance between coarse cell centres with 500–5000 m radius (default 1500 m). Caller-scoped history projects only event states/attempt outcomes, never endpoints or subscription keys. Device receipt instrumentation is not collected; its acknowledgement field is null.

Sources used for the transport implementation: [MDN subscription API](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe) and [official pywebpush repository](https://github.com/web-push-libs/pywebpush).

## Verification

- One full phase-end gate: lint/typecheck/production build, 178 frontend tests, Ruff, 131 Python tests and frontend credential scan passed; 31 previous live tests skipped.
- Grouped safeguards then focused checks: eight advanced tests and 21 push tests passed, Ruff/lint/production build passed. The two newly added guarded Phase 10 database tests remain unexecuted against a real target.
- Browser: notification failure → explicit retry → simulated sent, same-event deduplication, subsequent opt-out suppression; hot timeline missing/excursion labels; Tamil confirmation and Photo quota fallback; simulated permission denial still opens `/demo/discover`; forecast sample counts, holdout errors, insufficient history and single-stall council suppression.
- Requested phone override: DOM reported client/scroll widths both 360 px, no overflow; no console errors observed. Screenshots: [phone preview](phase10-phone.png) and [desktop preview](phase10-preview.png). This is browser emulation, not an actual cheap-phone acceptance.
- Advanced reset restored fictional inbox/preferences; unauthenticated connected sandbox showed disabled enrol/revoke controls and no fixture fallback.
- Browser download event wait timed out; download delivery itself remains unverified. Aggregate/row selection logic and shared CSV escaping are unit-tested. Do not interpret the click as a successful downloaded-file check.
- Existing large JS/WASM chunk and third-party annotation/deprecation warnings persist; low-memory phone performance remains Phase 12 acceptance.

## Remaining gates / implementation

- [x] Add connected configurable coarse radius, quiet-hours preferences and caller-scoped attempted/provider-accepted history. Device acknowledgement is uncollected (null), never invented. Live execution remains unchecked below.
- [ ] Execute migration and `phase10:live` on the guarded disposable Supabase project; add full lease-expiry/restart, concurrent dispatch/revoke/re-enrol and 404/410 cleanup live vectors.
- [ ] From a real opted-in browser, confirm an eligible offer through the hawker agent path, observe one notification, revoke, expire/retry and inspect private attempt logs. Record browser/OS/secure origin; unsupported devices remain usable.
- [ ] Verify an actual filtered CSV download and desktop/phone scenario reset/deep links, role/session/reconnect behavior and accessibility/BM copy polish.
- [ ] Configure explicit VAPID test transport only when a consenting device is available. Setup: [USER_ACTIONS.md](USER_ACTIONS.md).

No deployment, actual database write, agency filing, company message, real SMS/email/payment or device push occurred.
