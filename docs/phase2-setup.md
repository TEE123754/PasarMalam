# Phase 2 connected setup

No accounts or hosting are silently provisioned. Use a disposable Supabase project, never a production database.

## Local option

Supabase CLI needs a running Docker-compatible engine. Neither Docker nor a Supabase stack was available in the workspace when Phase 2 started. Install/configure a suitable local runtime through its normal setup, then use the [official Supabase local workflow](https://supabase.com/docs/guides/local-development/cli-workflows).

Run a pinned Supabase CLI via the project's tooling or an installed official CLI: `supabase start`. The committed `supabase/config.toml` uses API port 54321, DB port 54322, disabled public signup and private evidence buckets from migrations. CLI startup may apply migrations automatically. Obtain local API/public/secret values privately; do not paste keys into chat.

## Operator environment

Copy `apps/api/.env.example` to ignored `apps/api/.env`. Set `APP_ENV=demo`, the exact `SUPABASE_URL`, public key, operator secret key, database connection string and `DEMO_PROJECT_REF` (`local` or exact hosted project ref). Provide a random seed password of at least 16 characters. Hosted projects should use asymmetric signing keys/JWKS; legacy HS256 verification is allowed only for the local loopback stack. If its configured issuer differs, set `SUPABASE_JWT_ISSUER` to that exact trusted issuer.

If migrations were applied by the CLI/SQL runner, obtain the non-secret guard UUID with:

```sql
select id from private.environment_guard;
```

Set `DEMO_DATABASE_ID` to that UUID. It must match before seed/reset/live testing. For a fresh **empty** hosted application/Auth database, the guarded migration helper can initialise it:

```powershell
uv run --project apps/api python scripts/demo_db.py --initialise
```

The helper requires matching API/DB project identity and an empty public/Auth database for initialisation. It prints only migration names and the new non-secret guard UUID; set that UUID before running the seed. Subsequent migration runs omit `--initialise` and validate checksums and the marker. Apply all available migrations in order (four Phase 2 migrations and discovery migration 005 for Phase 3); do not regenerate an already-applied migration.

## Seed and connected browser

```powershell
uv run --project apps/api python scripts/demo_seed.py
```

This provisions/reuses confirmed `.invalid` accounts without sending invitations and binds the returned Auth IDs privately. Fixed UUIDs identify two markets, two stalls, three menu items, two reviews and two isolation-test organisations. Repeating seed preserves counts and ownership. It never changes existing passwords or assigns roles from user metadata.

`--reset` removes only the stable Phase 2 business seed IDs, then recreates them. It refuses any database containing batches/reports and cannot delete Auth users or their audit history. Restrictive future foreign keys also stop unsafe resets. This is not a blanket database reset.

Copy the root `.env.example` to `apps/web/.env.local` and set **only** `VITE_APP_MODE=connected`, public Supabase URL/public key and local API URL. Disable hosted public signup in the Supabase Auth settings. The five login emails are `vendor-a`, `vendor-b`, `customer-a`, `customer-b` and `admin`, each at `pasarmalam.invalid`; the shared operator-chosen seed password is never committed or shown in the UI.

```powershell
uv run --project apps/api uvicorn app.main:app --app-dir apps/api --host 127.0.0.1 --port 8000
npm run dev
```

The Profile page provides sign-in/sign-out. Sessions are memory-only and refresh automatically; browser reload requires sign-in. Database roles determine connected hawker/admin access. Fixture role switching cannot grant it. API calls forward the verified caller JWT using a public key so direct Supabase and API access retain the same RLS boundary.

## Phase gate

Build the whole phase before executing:

```powershell
npm run phase2:check
$env:RUN_LIVE_PHASE2 = '1'
npm run phase2:live
```

The local check skips live groups when `RUN_LIVE_PHASE2` is absent. It cannot mark the phase complete. The live gate seeds twice, signs in real synthetic accounts and exercises direct REST/API/Storage. Use a fresh disposable test environment for a full rerun because hygiene limits and append-only audit artifacts intentionally persist. Complete the connected browser sign-in/logout/expiry check separately; record real results and pending items.

Contracts can be regenerated after an intentional API change with `uv run --project apps/api python scripts/export_contract.py`. Exact web types and OpenAPI are committed; fixture JSON passes the same discovery response model.

Sources: [RLS/invoker views](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access policies](https://supabase.com/docs/guides/storage/security/access-control), [JWT verification and key cache](https://supabase.com/docs/guides/auth/jwts).
