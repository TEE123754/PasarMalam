# PasarMalam — setup and acceptance actions for later

This guide consolidates the setup you need to supply when ready. Development can continue in the isolated, prefilled `/demo/*` without account credentials. All business companies, authorities, advertisers, reviews, allegations and transactions remain fictional. Do not enter real complaints or private personal information into this demo. All photos currently remain described placeholders; supply final images later.

## Current sequence — 5 October 2026

Finish local implementation and connected acceptance first; deployment is Phase 12 and will be last. See [REMAINING_JOBS.md](REMAINING_JOBS.md) for the separated local and deployment checklists. A disposable hosted Supabase database and Morpheus API may be used by the local FastAPI server; Vercel/Railway publishing stays deferred. Railway is the chosen eventual backend host. Morpheus is the chosen AI provider, with model selection delegated to the agent during adapter implementation after availability/quality/free-allowance checks.

Morpheus is now implemented and configured privately: `EXTRACTION_PROVIDER=morpheus`, `MORPHEUS_BASE_URL=https://api.mor.org/api/v1`, `MORPHEUS_MODEL=qwen35-9b`, and `MORPHEUS_API_KEY` in the ignored backend `.env`. Three fictional text samples passed real extraction; human speech quality is unmeasured. External transcript consent is required. Free allowance is not established; local-model/text fallback remains available. See [local readiness evidence](local-readiness-acceptance.md).

The supplied Supabase direct DB endpoint remains unreachable from this machine. Your requested private GitHub backup contains source/migrations and no credentials. After reconfiguring Supabase, put the new credentials and a reachable Session pooler database URL in ignored local environment files. GitHub backup alone does not mean migrations, seed or acceptance ran. Then apply guarded migrations and finish the connected history/reset and runtime checks in [REMAINING_JOBS.md](REMAINING_JOBS.md). Images can still be supplied later; deployment remains on hold.

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

Choose a new disposable hosted project or configure Docker/Supabase locally. Follow [Phase 2 setup](phase2-setup.md). Disable public signup and use invited fictional identities. Apply all migrations in order through `20261002104837_test_push.sql` with the guarded migration helper; do not edit an already applied migration silently. Record its guard UUID locally. Seed the fictional users and trusted vendor/admin/organiser memberships; never let a browser assign itself a privileged role. Phase 7 organiser membership must be scoped to its actual markets.

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

Provide final stall/food images later, with rights/consent and descriptions. Phase 8 includes fake ads, reservations, subscriptions and delivery. Later phases add company/agency integrations and other scenarios. Real partnerships, referrals and public launch require separate agreements/approval and reviewed food policy; no external messages or authority referrals are sent by the current app.

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

Record actual transaction races, direct-write denial, cross-user/organisation/courier isolation, refunds, late retries, campaign privacy and council suppression in [Phase 8 acceptance](phase8-acceptance.md). This workspace has not applied or executed the migration against Supabase. Also retain the later target-phone, network and localisation checks. Local SQL syntax parsing and simulated browser roles do not substitute for database acceptance.

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

1. Complete the earlier disposable Supabase/API/agent setup, then apply `20261002104837_test_push.sql` with the guarded migration process. The dispatcher must log in as `pasarmalam_agent`, never the owner/service-role database account. No migration was applied during Phase 10.
2. Generate free local VAPID settings: `uv run --project apps/api python scripts/push_key_setup.py --subject mailto:YOUR_OPERATOR_EMAIL`. This creates ignored `apps/api/.env.push` exclusively and refuses overwriting an existing file. Merge its values into your private server environment; this file is not automatically loaded. Do not paste private values into chat, git or browser variables. Add `PUSH_MODE=enrolled-test`, `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT` alongside existing agent credentials; keep `APP_ENV=demo`. The public key is exposed by the enabled API config; no frontend VAPID private setting exists. Keep simulated mode when not using a consenting device. Incomplete test-mode settings fail dispatch instead of silently recording fake success.
3. Restart API with exact allowed origins. Use HTTPS for deployed testing or a trusted localhost origin; use a browser supporting Service Worker/PushManager. Open `/sandbox/profile` and sign in to an assigned customer test account. Enable the existing coarse nearby-market consent (two-hour expiry), then open `/sandbox/advanced` and explicitly click “Enable notifications on this test browser”. The user of that device decides whether to grant the browser permission. One device per account is retained; enrolling a replacement supersedes the previous device. Default radius is 1.5 km with 22:00–08:00 Malaysian quiet hours; preferences can be changed without granting consent.
4. Publish a hawker-confirmed eligible fictional clearance listing, run the configured agent dispatcher, and observe a real notification. Inspect scoped history: attempted/failed/provider-accepted are different outcomes; device/read acknowledgement is not collected. Do not call HTTP provider acceptance a received/read notification. Chrome/Mozilla/Apple endpoint hosts are allowlisted; other providers require a reviewed implementation change, not an arbitrary URL override.
5. Revoke through the connected test screen; pending/leased outbox entries cancel and the private device record is deleted. Also test nearby consent expiry, stale queue expiry, quiet hours/radius, worker restart/retry and invalid endpoint 404/410. Already provider-accepted messages cannot be recalled. Opt-out submitted during the bounded five-second send may wait for the recipient transaction lock, then blocks subsequent sends.
6. Set `RUN_LIVE_PHASE10=1` only after guarded migrations/prior gates and run `npm run phase10:live`. Current live tests cover direct credential-read denial, endpoint rejection and own revocation; full concurrency/device vectors still need acceptance coverage. Record OS/browser/secure origin and any unsupported device limitation in `docs/phase10-acceptance.md`.
7. Verify an actual filtered CSV download in a normal browser. The in-app browser download-event capture timed out; it is not recorded as passed. Finish target-phone accessibility/BM copy/performance acceptance with no permission bypass.

No SMS/email API key, agency/company account, payment gateway, paid subscription or new native app-store account is required. VAPID generation, connected migration and real device permission have not been performed automatically.

## Phase 11 — later setup and remaining acceptance

The full fixture studio is `/demo/presentation`. It requires no account/API key. Use Reset complete local demo to replace older local fixtures with the expanded catalog; this is browser-local and does not touch connected accounts. Frozen scenario anchor is 2 October 2026, 20:30 Malaysia time.

- Supply final images later: all 100 IDs/descriptions/individual prompts/filenames/entity mappings are in `docs/asset-manifest.json`. No raster image was generated. We still need to validate/optimise your supplied files and record provenance/licence.
- Full connected Phase 11 provisioning/reset-to-today is not implemented or executed yet. Current connected seed is still the earlier five-account foundation. Create/configure the known disposable Supabase target with previous guarded migrations first; retain private operator secrets, and never run an arbitrary production reset. Complete full catalog memberships and fixture/SQL parity before claiming connected dataset counts.
- Consent/human audio and paired listing timings remain Phase 6 inputs. `contracts/voice-evaluation.json` contains 24 labelled scripts; generated training MP4s and synthetic pilot metrics cannot be used as measured recognition/task performance.
- QR posters currently encode `http://127.0.0.1:5173/demo/discover`, usable only on the same device. After an approved deployed preview exists, regenerate with `uv run --project apps/api python scripts/render_demo_media.py --origin https://YOUR_APPROVED_PREVIEW_ORIGIN`. Review the fictional WhatsApp/Facebook/TikTok HTML drafts with the organiser before any distribution. No posting/message action occurred.
- Complete desktop/phone guided scripts, actual exported-file checks, BM/accessibility/low-memory-device acceptance and previous live Supabase/agent/push gates. Instructions/provenance: `docs/demo-guide.md`, `docs/pilot-plan.md`, `docs/phase11-acceptance.md`.
