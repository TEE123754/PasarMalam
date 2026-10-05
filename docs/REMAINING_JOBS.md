# PasarMalam — remaining jobs

Updated 5 October 2026. Current instruction: keep the frontend and API on localhost. Deployment is the final phase. Phases 1–11 have local implementation, but connected, human-evaluation and complete device acceptance remain unfinished. Existing checked items are not proof of live database acceptance.

## A. Finish before deployment

Complete these batches in order. Build a batch first, run its phase-end checks once, then rerun only failed or affected checks. Do not run tests continuously.

### 1. Configure the local connected sandbox

- [x] Put supplied public Supabase configuration in ignored `apps/web/.env.local`; API base is localhost port 8010. Browser preview uses port 5174.
- [x] Store supplied Supabase/Morpheus settings only in ignored backend configuration. Direct DB connectivity still fails; no guard or schema was verified remotely.
- [ ] Apply all existing migrations in order through `20261002104837_test_push.sql`; configure Auth, RLS, Storage and test jobs. Preserve applied migration checksums.
- [ ] Verify sign-in/logout/session expiry from localhost with fictional accounts. Keep `/demo/*` browser-local, `/sandbox/*` connected to the disposable project, and root real-app routes separate.

A hosted Supabase **test database** is allowed while the web/API stay local. It is an external service connection, not Vercel/Railway app deployment. The alternative is local Supabase with a Docker-compatible runtime.

### 2. Finish full connected data provisioning — Phase 11

- [x] Add guarded core seed scaffold for 99 fictional identities, roles/memberships, markets/stalls/menu/batches/reviews and partner organisations in `scripts/phase11_seed.py`. Unexecuted; no connected counts claimed.
- [ ] Complete full commerce/partner history provisioning, execute the core dataset and verify scoped memberships against actual SQL.
- [ ] Implement guarded reset-to-today and preserve cross-record links, audit trails and correct stock/history separation.
- [ ] Execute repeat-seed deduplication, non-demo reset refusal and fixture-versus-SQL scenario parity. Do not weaken guards to load fictional records into production.

### 3. Add Morpheus AI extraction

- [x] Provider selected by user: Morpheus; model selection delegated to the implementation agent. Railway remains the backend host for the final deployment phase. FastAPI runs locally now.
- [x] Select available `qwen35-9b`, verify official endpoint/rates and exercise three fictional BM/English/Manglish text samples. All returned expected fields without flags. Free allowance and human quality remain unmeasured.
- [x] Implement backend-only Morpheus adapter; preserve loopback Qwen/llama.cpp option.
- [x] Add schema/evidence validation, confidence, one-tap correction, response/token/time/concurrency limits, error fallback and no automatic retries.
- [x] Configure key only in ignored backend environment; frontend/upload scans pass.
- [x] Require external transcript consent and redact sensitive patterns. Audio stays on-device; only redacted transcript/menu and extraction context go to the provider. Provider retention remains a pilot review item.
- [x] Exercise real fictional extraction and mocked failure boundaries. Browser extraction/review/batch confirmation passed. Deterministic freshness remains separate.
- [ ] Measure human BM/English/Manglish recordings and timing; verify connected confirmation/quota/retention and provider handling before a real-user pilot.

Free allowance is not established. Published Qwen rates are USD 0.05 input / 0.15 output per million tokens ([official pricing](https://apidocs.mor.org/documentation/models/pricing)); bounded fictional calls used the supplied account. No credits/plan were purchased and there is no automatic paid fallback. Local extraction/text remain free options.

### 4. Execute connected feature acceptance — Phases 2–9

- [ ] Auth/permissions: cross-account and cross-organisation denial, role escalation, direct REST/database access and caller-scoped writes.
- [ ] Discovery: geographic filters, two-client Realtime updates, reconnect timing and private-payload isolation.
- [ ] Listings/media: concurrent batch numbering, forged paths/metadata/bytes, ownership, upload quotas and private Storage access.
- [ ] Freshness/agent: real market weather cache and stale/failure paths, eligibility/stock races, advisory audit rows, consent revocation, leased dispatch/restart, outbox fencing and actual SQL schedule evidence. Run the dispatcher locally; no Railway endpoint is needed now.
- [ ] Voice: confirmation/quota/RLS, transcript and abandoned-upload cleanup, scheduled media sweep.
- [ ] Reports: verified-independent thresholds, rate limits, reply opportunity, moderation/appeal/removal, private report/evidence projections and signed-link expiry. Configure local FFmpeg/ffprobe and test valid/invalid synthetic image/video content.
- [ ] Commerce: reservation races, expired stock, refunds/replayed callbacks, sponsor safety/halal filters and budget boundaries, courier/advertiser/council isolation.
- [ ] Partners: referral privacy/resolution, permits, editorial publication, donation/shopper races, pickup cutoff and collection/weight deduplication, council small-group suppression. Add missing live acceptance vectors.

Business company/authority/payment/delivery/ad/SMS/email operations remain internal simulations, even when their records are stored in Supabase. Never treat skipped live tests or SQL parsing as runtime proof.

### 5. Finish genuine test push — Phase 10

- [ ] Configure local VAPID and scoped agent credentials; enrol one consenting supported desktop browser on localhost.
- [ ] Send and observe an actual notification from a hawker-confirmed eligible fictional offer.
- [ ] Verify lease timeout/restart, concurrent delivery/revocation/re-enrolment, coarse radius/quiet hours, invalid subscription cleanup, expiry, stable tags and private history.
- [ ] Record supported OS/browser and observed device outcome. Transport acceptance is not proof that a notification was displayed.

Cross-device mobile microphone/push acceptance requires a secure origin reachable from that phone. A plain LAN HTTP address is not enough. Use a suitable trusted local HTTPS setup if available; otherwise leave that specific device gate pending until the final deployment smoke check, without blocking other local work.

### 6. Complete presentation, PWA and device preparation

- [x] Build PWA manifest, code-native icon, public app-shell worker, cache update control and offline explanation. Automated cache/private-route tests pass; no private API/media or map prefetch.
- [ ] Observe installation, actual offline/update behaviour and low-memory speech on supported target devices.
- [ ] Walk through the complete core and full-vision scripts on desktop and a target phone; check reset/deep links, caller sessions, reconnect and isolated modes.
- [ ] Verify actual filtered CSV downloads and their contents, not just the export button or generated string.
- [ ] Finish BM/English copy, keyboard/focus/contrast/touch targets, denied microphone/location, low-memory speech performance and slow/offline/service-unavailable paths.
- [ ] Prepare local launch/recovery instructions, environment/migration order, backup/rollback procedure and deployment configuration files before publishing.
- [ ] Run one final pre-deployment regression/acceptance batch after implementation is complete; record actual results and unsupported coverage.

### 7. User-supplied evidence and assets

- [ ] Obtain 10 BM, 10 Manglish and four English fictional listing recordings from at least five consenting speakers; measure accuracy/WER and paired voice-versus-typing times. Current scripts and synthetic videos are not measured human results.
- [ ] Validate/optimise the 100 user-supplied image files and record rights/provenance when supplied. Until then keep described placeholders; do not generate artwork.
- [ ] Review the draft posters and real-pilot proposal. Real food-policy, privacy/PDPA, retention and organiser decisions are prerequisites for a real-user pilot, not required to browse fictional fixtures.

## B. Deploy last — Phase 12

Do not execute these now. Begin only after the local readiness gate and a later instruction to deploy.

- [ ] Confirm Vercel/Railway/Supabase account access, current free allowances and usage eligibility without buying a plan.
- [ ] Deploy the static frontend to Vercel with SPA rewrites and PWA delivery.
- [ ] Deploy the FastAPI backend and appropriate dispatcher/media runtime to Railway; configure port, health, logs, limits and restart/sleep behaviour.
- [ ] Configure deployed server secrets, exact CORS/Auth redirects and approved AI provider endpoint. Transfer/verify the accepted Supabase sandbox configuration or initialise a separately guarded target if chosen; never overwrite it casually.
- [ ] Connect public-origin scheduling/dispatch and verify deployed weather, media sweep, realtime and opted-in push. Local scheduling acceptance is not proof of deployed operation.
- [ ] Check quotas, recovery from paused/asleep services, backups, compatible rollback and the standalone demo fallback.
- [ ] Run focused deployed-origin smoke checks: sign-in, upload access, API health, reconnect, PWA update/offline, jobs and supported device notification/microphone. Repeat the full regression suite only if deployment changes invalidate the earlier gate.
- [ ] Replace localhost QR destinations with approved deployed URLs; distribute only after organiser review and explicit instruction.
- [ ] Deliver verified demo/API links, `docs/deployment.md`, final acceptance evidence and known limitations.

Deploying the fictional demo does not authorise real-vendor production activation or external business integrations. Those remain separately reviewed work.

## C. What to provide for local work

| Item | Destination | Why |
| --- | --- | --- |
| Supabase project URL and publishable/anon key | `apps/web/.env.local` and API configuration | Local app authentication and caller-scoped access |
| Disposable project reference, database connection string/password, operator secret/service-role equivalent | Ignored backend/operator environment only | Guarded migrations, account provisioning and live checks; never browser variables |
| Morpheus account endpoint/key; model chosen during implementation | Provider details may be shared as text; private key stays in backend `.env` after adapter setup | Real extraction through the selected provider |
| Test device consent, recorded samples and paired times | Evaluation workflow | Actual voice/push evidence |
| Final images with descriptions/rights | Asset workflow when ready | Replace the described placeholders |

Media/agent secrets and VAPID keys can be generated locally during setup. No business partner/payment/advertising key is needed. Store secrets in ignored files; do not paste them into chat or commit them. See [USER_ACTIONS.md](USER_ACTIONS.md) for the existing configuration and phase commands.
