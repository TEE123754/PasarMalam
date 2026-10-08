# Local launch, reset and recovery

Frontend and API stay on localhost. Database/Auth/Storage/Realtime may use the explicitly guarded disposable Supabase project. Business companies, authorities, payments, delivery, advertisements and SMS/email remain simulations. All food/stall pictures stay white described placeholders.

## Start the product

Use Node 24, npm and uv/Python 3.12. From the repository root, install locked dependencies with `npm ci` and `uv sync --frozen --project apps/api`. Keep `.env` files ignored; the browser receives only public settings. On machines with restricted default caches, set `$env:UV_CACHE_DIR='.uv-cache'` and `$env:npm_config_cache='.npm-cache'`.

Build once using `npm run build`. Open two PowerShell terminals:

```powershell
./scripts/start-local.ps1 -Service api
./scripts/start-local.ps1 -Service web
```

Web: `http://127.0.0.1:5174`. API health: `http://127.0.0.1:8010/health`. Port conflicts fail rather than silently choosing another port. Stop only your own terminal with Ctrl+C.

- `/demo/discover`: complete prefilled browser-local product; no login needed.
- `/demo/presentation`: reset scenarios, complete feature tour and synthetic pilot.
- `/sandbox/profile`: sign in to a trusted fictional Supabase account; then use `/sandbox/discover`, hawker, community, commerce and partner routes.
- Root real-app routes refuse the disposable sandbox. They require a separately reviewed production implementation; do not remove that boundary to make demo accounts work.

## Initialise connected acceptance

1. Supply the disposable project's URL/public key to `apps/web/.env.local`. Put the URL/public/operator keys, `APP_ENV=demo`, matching `DEMO_PROJECT_REF` and reachable **Session pooler DATABASE_URL** in `apps/api/.env`. The direct IPv6 endpoint can fail on this machine; GitHub integration does not provide an IPv4 endpoint. Copy the pooler host/username from Supabase's Connect dialog, including the project suffix in the username. [Official connection guidance](https://supabase.com/docs/guides/troubleshooting/tenant-or-user-not-found).
2. On a genuinely empty application/Auth database only: `uv run --project apps/api python scripts/demo_db.py --initialise`. Save the printed guard UUID as `DEMO_DATABASE_ID`. Existing targets use the same helper **without** `--initialise`. The helper refuses mismatched targets and changed applied checksums. Apply every migration in filename order, including all 22 current files through `20261006184041_voice_retention_restore.sql`.
3. Run `npm run local:setup`. This creates missing private seed/media/agent secrets and derives an agent connection using its restricted database role. It never buys services or modifies providers.
4. Run `npm run phase4:media-setup` and `npm run phase5:agent-setup`. Local agent setup registers the minute-level SQL tick with no remote request to localhost. The dispatcher role has function grants, not general table access. Restart API after configuration changes.
5. Run `uv run --project apps/api python scripts/demo_seed.py` for the five-account acceptance foundation. Run `npm run local:connected-check` after the build batch. This enables all Phase 2–11 plus connected-edge SQL/REST gates in one process; failures are failures, never substituted with fixture results. It does not send browser notifications. Complete connected browser/Realtime/media journeys separately.
6. Run `npm run phase11:seed` for the expanded 99-person catalog, 10 markets, 30 stalls, 90 foods, 150 catalog batches/reviews and 12 organisations. Twenty-four additional **closed historical batches** back the archived orders; historical ledgers do not consume current stock. Seeded reports remain private and do not automatically qualify as independent reports/public flags. Synthetic weather and timers remain demo advisory policy.
7. Run `npm run local:worker` in a third terminal. It calls the loopback API each minute and runs the guarded media sweep hourly. `local:worker-once` is a bounded operational probe. An unavailable API prints its HTTP status and retries on the next minute. A stopped computer/project cannot keep local jobs running.

## Reset without falsifying food age

Repeated `phase11:seed` leaves preparation timestamps and records unchanged. `npm run phase11:reset` explicitly retires the current generation, cancels only tagged simulation holds, pauses its campaigns, archives its public partner stories and creates **new** batches anchored to the database clock. Old batches, ledger entries, reports and audit rows remain. Untagged outstanding reservations cause refusal; fulfil/cancel them through their proper role first. Counts for the current generation are stored privately. No Auth account is deleted and no SQL table is truncated.

At a closed market hour, new offers still remain unavailable; a seed is not permission to bypass a closing/advisory cutoff. Unknown handling and expired batches remain blocked. Demo Studio's frozen browser-local evening scenario is the presentation option.

## Evidence video and genuine push

Run `./scripts/setup-media-tools.ps1` once for Windows. It downloads the Windows build linked by [FFmpeg's official download page](https://ffmpeg.org/download.html), verifies the provider SHA256 and extracts inside ignored `.local-tools`. `start-local.ps1` adds that directory to this process PATH. Synthetic test videos must be at most 10 seconds/5 MB and are transcoded without audio/metadata; images are decoded/re-encoded. No final stall/food artwork is generated.

Generate VAPID keys with `scripts/push_key_setup.py` only if absent; merge ignored `.env.push` into backend `.env` and restart API. Keep device enrolment explicit at `/sandbox/advanced`; enable nearby market consent in Profile. Never paste private keys into a VITE variable. A provider-accepted result does not prove a displayed/read notification. The local test contact is fictional; set a valid operator contact before deployment. User approval to test this computer's notifications was received on 7 October 2026; receiving one still requires a supported browser and connected database.

## Recovery and backup

- API unavailable: stop/restart its own terminal, check `/health`, then the public config route. Recheck exact CORS origin and backend settings. Do not print full environment files or database exceptions.
- Supabase unavailable: resume the disposable project in its dashboard and verify the guard before retrying. Fixture demo remains usable. Never replace permission checks with operator keys in browser requests.
- Worker interrupted: restart it; expired leases can be claimed again, while event keys and fencing prevent stale completion. Do not record an attempted dispatch as delivered.
- Stale PWA: use the update control or reload once; service workers cache only public app-shell assets. Private requests, evidence and map tiles are excluded.
- Offline readiness: production builds generate a bounded public JS/CSS manifest and confirm every required cache entry through the controlling worker. Do not stop the preview or claim offline support while the status says unconfirmed. The available in-app browser did not pass a real offline reload; complete that acceptance in a supported browser/device.
- Before a migration/reset, make a private database backup using the Supabase dashboard/export tools. Store backups outside Git with access restrictions; Auth/Storage objects need their own backup inventory. On free accounts do not assume a paid backup/PITR entitlement.
- Roll back application code to a compatible prior commit; keep forward-compatible additive migrations. Do not drop tables or rewind preparation times. If database rollback is necessary, restore a private backup to a **separate** disposable project and verify its guard/accounts/media before switching local settings. Record the lost activity interval honestly.

Human BM/Manglish recordings, cheap-phone behaviour and real pilot/food-policy/PDPA decisions require people/devices; executable code and fake metrics cannot complete those acceptance steps.

Current target is already initialized and seeded: do not rerun `--initialise`. Supplied pooler and operator settings are privately configured. Use `node scripts/realtime_acceptance.mjs` only as an explicit affected transport gate; it signs in to fictional accounts, restores its owned stall edit and signs out only those probe sessions. Actual current acceptance is recorded in [local-readiness-acceptance.md](local-readiness-acceptance.md).
