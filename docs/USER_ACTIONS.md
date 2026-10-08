# PasarMalam — setup and acceptance actions for later

**Start with [your current action checklist](YOUR_ACTION_CHECKLIST.md)**, updated 8 October 2026: it excludes deployment, lists the remaining human/device actions and includes all 12 recommended generation prompts. You are no longer asked to generate 100 images. This longer document retains historical setup/recovery details; current Supabase/Morpheus/media configuration is already complete.

This guide consolidates the setup you need to supply when ready. Development can continue in the isolated, prefilled `/demo/*` without account credentials. All business companies, authorities, advertisers, reviews, allegations and transactions remain fictional. Do not enter real complaints or private personal information into this demo. All 12 supplied images are now integrated locally as labelled representative illustrations; unmatched subjects and original batch/evidence slots remain separate.

## Current sequence — 8 October 2026

The new Supabase Session pooler is connected. Schema, trusted fictional accounts/full seed, scoped jobs and 44 connected acceptance cases are verified. Supabase/Morpheus/VAPID/media/agent secrets are already stored privately. **No further database or AI key is required for local work.** Follow [local operations](local-operations.md) to launch the frontend/API/worker.

Your remaining actions are device/human inputs:

1. For actual notification receipt, open `http://127.0.0.1:5174/sandbox/profile` in a supported browser on this computer, sign in to a fictional shopper, enable coarse nearby consent and enrol at `/sandbox/advanced`. The Codex in-app browser did not resolve the notification permission request; desktop browser-control approval timed out. There is no device delivery claim. You already approved this computer's notification test. A fictional vendor must confirm an eligible offer during an open market window; never extend its deadline just to trigger delivery.
2. Supply consenting human BM/Manglish/English fictional recordings and paired task timings as described below. Actual microphone/cheap-phone memory and PWA installation/offline checks need your target devices; phone speech/push requires a trusted secure origin.
3. Confirm generator/model/date and public-use rights for the 12 supplied originals before future public release. Local image integration is complete; no more images are requested. See [provenance](supplied-image-provenance.json).
4. Review food policy, privacy/PDPA/provider handling and organiser/pilot decisions before inviting real people or serving real food through this app.

For offline acceptance, use a supported browser's production preview and wait for **Fictional demo ready offline**. The 8 October update now acknowledged this status, superseding the earlier unconfirmed-readiness observation. A successful network-disconnected reload remains unverified. The manifest/readiness checks and a cache acknowledgement do not replace device reload acceptance. Leave the local preview reachable until this check can be completed. Private account actions, map tiles and initial speech downloads require internet; unavailable artwork must fall back to placeholders.

Morpheus uses `qwen35-9b`, explicit transcript consent and bounded validated extraction. Three real fictional text samples passed; human accuracy and account free allowance remain unmeasured. Business integrations remain internal simulations. Deployment remains Phase 12, on hold. See [remaining jobs](REMAINING_JOBS.md) and [current evidence](local-readiness-acceptance.md). Historical phase setup below is for future recovery/reconfiguration, not a new request for keys or an unexecuted current database gate.

## Configuration and keys

Copy example files to their ignored `.env` locations and enter values locally. Never paste secret keys into chat, commit them, or put them into `VITE_` variables. The client requires only a publishable Supabase key; protected writes rely on RLS and trusted assignments.

| Setting | Where / action |
| --- | --- |
| `VITE_API_BASE_URL` | Web: local FastAPI now; Railway endpoint after deployment |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Web: disposable Supabase URL and publishable/anon key; never service-role key |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | API: same configured disposable project |
| `DATABASE_URL`, `SUPABASE_SECRET_KEY` | Trusted operator only: migrations, seeding and explicit job acceptance |
| `APP_ENV=demo`, `DEMO_PROJECT_REF`, `DEMO_DATABASE_ID` | Operator: matching disposable target and guard UUID; production is deliberately rejected |
| `DEMO_SEED_PASSWORD` | Operator: private fictional account password of at least 16 characters |
| `SUPABASE_JWT_ISSUER` / local JWT secret | API: trusted issuer/JWKS; legacy local secret only for loopback Supabase |
| `ALLOWED_ORIGINS` | API: exact preview/deployed frontend origins |
| `MEDIA_SIGNING_SECRET` | API and protected DB: matching random secret via `phase4:media-setup`; authorizes validated listing and complaint uploads |
| `AGENT_DISPATCH_SECRET` and scoped dispatcher settings | API/job: follow Phase 5 acceptance and guarded `phase5:agent-setup`; do not give general handlers operator credentials |
| `LOCAL_LLM_URL`, `LOCAL_LLM_MODEL`, `LOCAL_LLM_KEY` | Private API process: authenticated loopback Qwen/llama.cpp; start scripts manage the ignored local key. No paid AI key needed for the current local implementation |
| Map / weather | Current configured adapters do not use a commercial API key. Respect provider usage terms; production usage/provider selection needs review before launch |
| Future VAPID push keys | Phase 10: create keys for explicit opt-in subscriptions; private key server-side only. Not currently needed for simulated dispatch |
| Company / authority / advertising / payment keys | None needed for the fictional demo. No real referral, message, ad purchase or online payment is enabled |

Copy root `.env.example` to `apps/web/.env.local` for public browser settings. Refer to `apps/api/.env.example` and the existing phase setup documents for exact settings; this is not a request to send keys to the assistant.

## Supabase acceptance

Choose a new disposable hosted project or configure Docker/Supabase locally. Follow [Phase 2 setup](phase2-setup.md). Disable public signup and use invited fictional identities. Apply all migrations in order through the latest file in `supabase/migrations` (all 22 current files) with the guarded migration helper; do not edit an already applied migration silently. Record its guard UUID locally. Seed the fictional users and trusted vendor/admin/organiser memberships; never let a browser assign itself a privileged role. Phase 7 organiser membership must be scoped to its actual markets.

Complete Phase 2–6 live gates before Phase 7. Configure matching media secrets with `npm run phase4:media-setup`. Then enable the relevant live flag and run its command:

Use `/sandbox/community` for disposable connected acceptance. `/demo/community` stays fixture-only; root real-app routes deliberately refuse a disposable/demo backend. Do not try to bypass that separation by copying fictional data into a production project.

```powershell
$env:RUN_LIVE_PHASE7='1'
npm run phase7:live
```

Absent infrastructure means skipped/pending evidence, not passed SQL/RLS/Storage. Phase 7 additionally needs actual reporter A/B, vendor, organiser, visitor and admin tests: foreign raw-report/evidence denial; upload forgery denial; 60-second signed link expiry; quotas and concurrent duplicate updates; three independent verified reports after 48-hour reply opportunity; group/duplicate exclusion; moderator flag/reply/appeal/removal/expiry; direct database and Storage access. Save real evidence in `docs/phase7-acceptance.md`.

## Evidence/media runtime

Private complaint images are decoded and metadata-stripped before upload. MP4 requires free official FFmpeg and ffprobe installed on the API runtime PATH; this workspace has not installed them. The validator rejects missing/invalid tools, videos over 10 seconds/5 MB and oversized dimensions. It transcodes video without audio or original metadata in temporary files, then removes those files. Supply only synthetic/consented test assets. Verify actual valid/invalid video and image uploads, private access and cleanup on the connected environment. Until configured, text reporting and image placeholders still work in the demo.

Evidence links expire after 60 seconds, but a permitted viewer could save a copy. Moderator-approved summaries/replies need human redaction review; automatic phone/email masking cannot guarantee removal of every identifying detail. Public/vendor anonymity does not mean anonymity from authorised moderators.

## Voice participants and devices

Follow [Phase 6 user actions](phase6-user-actions.md). Supply 10 BM, 10 Manglish and four English recordings from at least five consenting speakers; measure actual extraction accuracy/WER and paired voice/typing tasks. Grant microphone permission deliberately on desktop and a target Android device. Record cold/warm latency and cheap-phone memory behavior. Current synthetic smoke checks do not establish human accuracy or speedup. Local extraction can require corrections; conflicting explicit cook clocks are cleared before confirmation.

## Deployment and operations — final phase only

Frontend deployment remains planned for Vercel; API/job deployment for Railway; database for Supabase. Supply those accounts and configure exact Auth redirect/CORS URLs when the deployment phase begins. Check the actual account's available free resources before deploying; no paid subscription or guaranteed free model hosting is assumed. Keep the local model private; the deployed app needs manual entry when inference is unavailable. Verify minute-level agent work and the separate hourly media sweep actually run; config files alone are not operational proof. No hosting was activated automatically.

Before collecting real pilot data, approve Malaysia PDPA notices/rights/provider/cross-border handling and operational retention decisions. The proposed demo retention is 30 days for confirmed voice transcripts and a future operator-reviewed 90-day closed-complaint/evidence window; the latter is a proposal, not an implemented or approved automatic purge. Decide appeal/legal-hold handling, moderator membership review, incident response and auditable deletion first. The demo reset deletes only this browser's fictional community state; it does not erase Supabase accounts or production records.

## Assets and business handoff

All 12 supplied originals are integrated with alt text and demo labels; confirm missing generation metadata/public-use rights before a public release. Phase 8 includes fake ads, reservations, subscriptions and delivery. Later phases add company/agency integrations and other scenarios. Real partnerships, referrals and public launch require separate agreements/approval and reviewed food policy; no external messages or authority referrals are sent by the current app.

## Phase 8 — connected commerce acceptance

Nothing is required to use `/demo/commerce`: reset its evening scenario, prepare the fictional clearance offer and select its prefilled personas. Do not add real payment, ad-network or delivery credentials; every commercial provider is simulated.

For connected acceptance, configure the ignored operator environment described above and in [Phase 2 setup](phase2-setup.md). Apply all migrations in order through `20261002051951_commerce_simulation.sql` using the guarded helper, then complete prior live gates. For an already initialized guarded project:

```powershell
uv run --project apps/api python scripts/demo_db.py
$env:RUN_LIVE_PHASE8='1'
npm run phase8:live
```

The gate requires the matching disposable database URL/project reference, `DEMO_DATABASE_ID`, operator `SUPABASE_SECRET_KEY` and `DEMO_SEED_PASSWORD`; keep them private. The app itself forwards caller JWTs with the public key and does not use the operator secret.

Provision trusted customer/vendor/admin roles, vendor-stall assignments, organiser-market assignments and partner organisation memberships for advertiser/delivery previews. Courier jobs must be assigned to a delivery member. Browsers cannot choose privileged database roles. The live tests create temporary synthetic commerce fixtures; perform browser role journeys separately through `/sandbox/profile` and `/sandbox/commerce`.

Record actual transaction races, direct-write denial, cross-user/organisation/courier isolation, refunds, late retries, campaign privacy and council suppression in [Phase 8 acceptance](phase8-acceptance.md). Current replacement-target migration and connected runtime checks passed on 7 October; retain target-phone acceptance separately. Also retain the later target-phone, network and localisation checks. Local SQL syntax parsing and simulated browser roles do not substitute for database acceptance.

## Phase 9 — partner setup and acceptance

The standalone `/demo/partners` portal needs no keys. It includes fictional organisations, media/supplier requests, three trails, described evidence placeholders, permit/case/collection workflows and internal scenario controls. Use [Phase 9 demo steps](phase9-acceptance.md) for the explicit report-review/consent and fresh donation setup.

For connected acceptance, apply guarded migrations through `20261002060812_partner_simulation.sql` and complete prior live gates. Keep the same private operator configuration; no new company, government, payment or collector API key is needed.

```powershell
uv run --project apps/api python scripts/demo_db.py
$env:RUN_LIVE_PHASE9='1'
npm run phase9:live
```

Privately provision synthetic `media`, `advertiser` (supplier concept), `authority`, `council`, `charity` and `waste` organisations with protected memberships. Editors/company/officers/collectors need trusted partner roles; council reviewers need organiser roles and actual market assignments. Vendor stall ownership and verified moderator roles remain protected. Use two separate organisations/accounts to test denial. Do not add real logos, seals, certificate files or recipients.

Record actual connected privacy/transaction/browser results after setup. The current three live cases cover media publication/scope/retry/direct access, referral consent/source-link denial, and permit expiry/renewal; full connected referral resolution, donation/shopper concurrency, weight/callback deduplication and aggregate suppression still require acceptance coverage. None was executed here. A qualified operator must manually review redacted text; phone/email masking alone cannot remove every identifier. Fake receipts and permits convey no real acceptance or legal permission.

## Phase 10 — later Web Push setup and acceptance

The complete advanced fixture preview at `/demo/advanced` needs no keys. Real notifications are optional technical tests in `/sandbox/advanced`; SMS/email, companies, authorities and payments stay simulated.

1. Complete the earlier disposable Supabase/API/agent setup, then apply `20261002104837_test_push.sql` with the guarded migration process. The dispatcher must log in as `pasarmalam_agent`, never the owner/service-role database account. The replacement target is now migrated and configured; these are recovery instructions.
2. Generate free local VAPID settings: `uv run --project apps/api python scripts/push_key_setup.py --subject mailto:YOUR_OPERATOR_EMAIL`. This creates ignored `apps/api/.env.push` exclusively and refuses overwriting an existing file. Merge its values into your private server environment; this file is not automatically loaded. Do not paste private values into chat, git or browser variables. Add `PUSH_MODE=enrolled-test`, `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT` alongside existing agent credentials; keep `APP_ENV=demo`. The public key is exposed by the enabled API config; no frontend VAPID private setting exists. Keep simulated mode when not using a consenting device. Incomplete test-mode settings fail dispatch instead of silently recording fake success.
3. Restart API with exact allowed origins. Use HTTPS for deployed testing or a trusted localhost origin; use a browser supporting Service Worker/PushManager. Open `/sandbox/profile` and sign in to an assigned customer test account. Enable the existing coarse nearby-market consent (two-hour expiry), then open `/sandbox/advanced` and explicitly click “Enable notifications on this test browser”. The user of that device decides whether to grant the browser permission. One device per account is retained; enrolling a replacement supersedes the previous device. Default radius is 1.5 km with 22:00–08:00 Malaysian quiet hours; preferences can be changed without granting consent.
4. Publish a hawker-confirmed eligible fictional clearance listing, run the configured agent dispatcher, and observe a real notification. Inspect scoped history: attempted/failed/provider-accepted are different outcomes; device/read acknowledgement is not collected. Do not call HTTP provider acceptance a received/read notification. Chrome/Mozilla/Apple endpoint hosts are allowlisted; other providers require a reviewed implementation change, not an arbitrary URL override.
5. Revoke through the connected test screen; pending/leased outbox entries cancel and the private device record is deleted. Also test nearby consent expiry, stale queue expiry, quiet hours/radius, worker restart/retry and invalid endpoint 404/410. Already provider-accepted messages cannot be recalled. Opt-out submitted during the bounded five-second send may wait for the recipient transaction lock, then blocks subsequent sends.
6. Set `RUN_LIVE_PHASE10=1` only after guarded migrations/prior gates and run `npm run phase10:live`. Current SQL gates cover subscription privacy/replacement/revocation, lease expiry/reclaim, stale completion, radius/quiet hours and invalid cleanup. Actual device receipt still needs observation. Record OS/browser/secure origin and any unsupported device limitation in `docs/phase10-acceptance.md`.
7. The actual Week 2 CSV was downloaded and its nine rows/RM190.02/7.92kg verified. The event listener timeout did not prevent the file download. Finish target-phone accessibility/BM copy/performance acceptance with no permission bypass.

No SMS/email API key, agency/company account, payment gateway, paid subscription or new native app-store account is required. VAPID generation and connected migration/setup are complete. This computer's consent was given, but the in-app browser did not resolve its permission prompt or enrol a device.

## Phase 11 — later setup and remaining acceptance

The full fixture studio is `/demo/presentation`. It requires no account/API key. Use Reset complete local demo to replace older local fixtures with the expanded catalog; this is browser-local and does not touch connected accounts. Frozen scenario anchor is 2 October 2026, 20:30 Malaysia time.

- Supply final images later: all 100 IDs/descriptions/individual prompts/filenames/entity mappings are in `docs/asset-manifest.json`. No raster image was generated. We still need to validate/optimise your supplied files and record provenance/licence.
- Full connected Phase 11 seed/history/reset executed successfully on 7 October using the supplied pooler; follow `local-operations.md` for recovery. Reset retains previous batch/audit history and refuses untagged active reservations; never run it on a production target. Current-generation counts and key advisory parity, repeat seed and refusal gates passed.
- Consent/human audio and paired listing timings remain Phase 6 inputs. `contracts/voice-evaluation.json` contains 24 labelled scripts; generated training MP4s and synthetic pilot metrics cannot be used as measured recognition/task performance.
- QR posters currently encode `http://127.0.0.1:5173/demo/discover`, usable only on the same device. After an approved deployed preview exists, regenerate with `uv run --project apps/api python scripts/render_demo_media.py --origin https://YOUR_APPROVED_PREVIEW_ORIGIN`. Review the fictional WhatsApp/Facebook/TikTok HTML drafts with the organiser before any distribution. No posting/message action occurred.
- Finish target-phone guided scripts, BM/accessibility/low-memory-device acceptance and actual push receipt. Representative desktop journeys, actual export and connected database/agent gates already pass. Instructions/provenance: `docs/demo-guide.md`, `docs/pilot-plan.md`, `docs/phase11-acceptance.md`.
