# Prepared deployment handoff — execution deferred

No Vercel/Railway service was deployed. Complete the connected/local acceptance in [local-operations.md](local-operations.md) first, then obtain a later instruction to publish. Free-account availability/eligibility must be checked then; configuration files do not prove hosting, backups or scheduled operation.

## Configuration prepared locally

| Target | Prepared configuration | Later action |
| --- | --- | --- |
| Vercel frontend | Root `vercel.json`, locked Node 24/npm workspace, `apps/web/dist` | Choose repository root, public browser environment, build `npm run build`; SPA rewrites exclude API/assets/files; PWA scripts and manifest use no-cache |
| Railway FastAPI | Root `Dockerfile`, `.dockerignore`, `railway.toml` | Set exact secrets/origins; container binds provider `$PORT`, runs as non-root, includes ffmpeg/ffprobe, health `/health`; no access-log tokens |
| Railway agent dispatch | Existing scoped dispatch endpoint and guarded agent setup | Set an approved HTTPS `.up.railway.app` dispatch URL, register scheduled SQL wake and observe it; no operator key in caller requests |
| Hourly media sweep | `scripts/media-sweep.railway.toml` and guarded sweep | Run separately with only its operator settings, observe retries/cleanup; never combine the public API role with schema reset permissions |
| Supabase | Ordered checksum migrations and operator-only demo seed generations | Verify accepted guard and current migration history; do not automatically reset existing state |

Frontend public variables: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, optional permitted map tile configuration. Set exact local/deployed CORS/Auth redirects, use HTTPS, and retain explicit technical consent. Business adapters remain simulated; no agency/company credentials, real ads or payments are needed for the demo.

Server variables: Supabase public URL/key and trusted issuer/JWKS; Morpheus private key/base/model; media signing secret; scoped agent secret/database connection; optional private VAPID configuration. Migration/provisioning secrets belong to trusted operator jobs only. The Docker context excludes environment files, local model weights, downloaded tools and acceptance artifacts.

## Later release gate

Verify account allowance, business/non-commercial provider terms, intended team/project/commit and secret separation. Build/test before publishing; Git integration may deploy automatically when enabled, so leave it disabled until the release is authorised. Run deployed-origin smoke checks and supported phone microphone/push/Realtime checks; record observed outcomes. Replace localhost QR destinations only after a verified public URL exists; distribution requires its own instruction.

Use an application rollback compatible with the retained schema. Restore a database backup to a separate guarded target if necessary; never drop audit history as a rollback shortcut. Recover paused Supabase/asleep backend services and observe agent/media jobs again. The fixture demo remains the fallback.

Provider references: [Vercel rewrites](https://vercel.com/docs/routing/rewrites), [Vercel configuration](https://vercel.com/docs/project-configuration), [Railway config](https://docs.railway.com/reference/config-as-code), [Supabase connections](https://supabase.com/docs/guides/database/connecting-to-postgres).

Local connected gates now pass, but no Docker container build was run because this machine has no Docker runtime. Build the container and verify deployed-origin behaviour only in the final deployment phase; do not present prepared files as deployment proof.
