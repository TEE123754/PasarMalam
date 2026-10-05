# Phase 5 — locally verified; live acceptance pending

The demo now persists ingredient declarations, non-increasing advisory deadlines, current reminders, clearance drafts, confirmed offers, reported outcomes and simulated notification records. Images are described placeholders throughout; the user will provide final assets later.

The canonical `contracts/advisory-policy.json` is an unreviewed synthetic demonstration policy. It must not be activated for real food. Weather is an ambient proxy, not measured food temperature. Missing/stale observations shorten the cap. Database time, stock and confirmation determine connected eligibility; an LLM has no authority over these rules.

Local phase gate: lint, type checking, build and frontend secret scan passed. 86 frontend tests and 56 Python checks passed after grouped type/import/contract repairs. Fifteen live groups were skipped. The final interrupted review fix then passed 28 affected freshness tests, 10 Python checks and type checking. Outer SQL parsing is not execution of PL/pgSQL or proof of permissions/concurrency.

Browser evidence: reminder and unique draft → hawker confirmation → 70% clearance offer at RM1.80 → one fake delivery → customer offer → forward-only demo clock → offer removed and publication disabled. Dashboard and alerts fit a 390×844 viewport (375 px document width, no horizontal overflow). Screenshot files are under `docs/screenshots/phase5-*`.

## Connected setup and remaining acceptance

1. Configure the ignored disposable Supabase environment using `phase2-setup.md`; apply migrations 007–008 with the guarded migration operator.
2. Configure separate `AGENT_DISPATCH_SECRET` and scoped `AGENT_DATABASE_URL`. The dispatcher refuses owner credentials, arbitrary environments and invalid signatures.
3. `npm run phase5:agent-setup` installs the scoped role, explicit Railway dispatch URL and minute-level Cron job. Actual execution was not possible here. On-demand HTTP wakes are bounded to five-minute intervals; local fixture dispatch is explicit. No always-running worker or real push is enabled.
4. Use `WEATHER_MODE=open-meteo` only for actual current-weather fetching. Fixture weather is labelled separately. Cache refresh is due after 15 minutes; observations older than 30 minutes use the conservative cap. Fetch failure preserves uncertainty rather than substituting pleasant weather.
5. Run `RUN_LIVE_PHASE5=1 npm run phase5:live`, then validate publish/stock races, real RLS, outbox lease fencing/restart/revocation/quotas, audit persistence and Cron/pg_net runs. Capture database proof and repeated connected browser behavior. No live SQL, weather persistence, deployed dispatcher or production policy has been validated.

Direct public projections apply absolute time and a stale-weather effective cap even if maintenance is missed. Legacy `create_promotion` is deliberately rejected: callers must use the confirmed publication workflow. These database changes still require live acceptance.

Provider references: [Open-Meteo API](https://open-meteo.com/en/docs), [Supabase Cron](https://supabase.com/docs/guides/cron), [pg_net](https://supabase.com/docs/guides/database/extensions/pg_net).
