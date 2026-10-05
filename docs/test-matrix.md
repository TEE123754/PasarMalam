# Phase 2 permission matrix and acceptance gate

Implementation exists in SQL/API/browser code. A passing unit test is **not** evidence that Supabase RLS or Storage is deployed. Record actual environment and live results in `phase-status.md`.

| Resource/action | Visitor | Customer | Vendor A | Vendor B | Admin | Org member |
| --- | --- | --- | --- | --- | --- | --- |
| Published safe market/stall/menu/review projections | Read | Read | Read | Read | Read | Read |
| Own profile/trusted roles | No | Own read | Own read | Own read | Read | Own read |
| Change role/verified/membership by table write or metadata | Deny | Deny | Deny | Deny | Direct table deny | Deny |
| Create/consume batch through RPC/API | Deny | Deny | Own stall | Own stall | Allowed, audited | Deny |
| Create offer | Deny | Deny | Own eligible batch only | Own eligible batch only | Eligible batch only | Deny |
| Direct batch/offer/inventory write | Deny | Deny | Deny | Deny | Deny | Deny |
| Submit review | Deny | Pending review, not own stall | Deny unless separate customer role and not own stall | Same | Needs customer role | Needs customer role |
| Submit hygiene report | Deny | Verified only; 3/hour | Deny without customer role | Same | Needs customer role | Needs customer role |
| Raw report / private evidence | Deny | Own | Deny | Deny | Read/moderate via RPC | Deny |
| Organiser early report inbox | Deny | Deny | Only if independently assigned organiser | Same | Allowed | Only assigned market; generic summary |
| Listing media writes | Deny | Deny | Owned stall + own uploader path | Cannot upload to A | Owned-path checked | Deny |
| Private certificates | Deny | Deny | Own upload/read | Own upload/read | Read | Deny |
| Partner records | Deny | Own-scoped only | Assigned org/own stall only | No A org access | Privileged read | Assigned org only |
| Push token, transcript, preferences | Deny | Own | Own | Own | Privileged read | Own |

Roles come from protected `user_roles`; stall/organisation/market assignments come from protected memberships. A browser role switch is fixture-only. Definer RPCs have fixed empty search paths, explicit actor checks and scoped grants. Invoker public views preserve RLS; column grants protect reviewer identity even through raw table access.

## One focused gate after Phase 2 code is complete

1. `npm run phase2:check`: web lint/type/build, Ruff and focused pytest. Without a configured disposable database, the five live groups are explicitly skipped and the phase stays pending.
2. On a disposable Supabase project, apply migrations once, then `RUN_LIVE_PHASE2=1` and run `npm run phase2:live`. The live fixture seeds twice and compares counts before direct REST, FastAPI and Storage tests.
3. Live groups: anonymous write/projection restrictions; vendor cross-owner denial and idempotent stock changes; metadata escalation and organisation isolation; public/private Storage; verified report rate limits and confidential read/moderation permissions.
4. Browser connected gate: sign in as each demo role, verify trusted navigation, sign out, force/observe session expiry, and confirm private data/cache disappears. Signup must be disabled on the hosted project. The local config disables signup.
5. Confirm no privileged key appears in the production bundle. The local scan checks key names and credential prefixes; on a configured project additionally compare the actual secret value against built files without printing it.

`pglast` syntax checks parse the migrations and detect duplicate columns. They do not execute PL/pgSQL bodies, RLS or Storage policies. Final live results must come from Supabase itself. The live fixture creates synthetic batch/report/media test artifacts; use a fresh disposable test project for a full rerun rather than deleting audit records to make tests pass.


## Phase 5/6 acceptance additions

Use `npm run phase6:check` once after the completed phase build. Existing frontend tests plus voice/evaluation/recorder tests cover advisory boundaries, stale/missing weather, publication cutoff/stock, leased simulated delivery, strict extraction schemas, ambiguity, explicit confirmation, cancellation and honest metric denominators. Python checks cover caller/provider boundaries, injected deadline rejection, signed weather and optional explanation fallback. These local tests do not replace SQL runtime or real inference.

Phase 5's 15 skipped live groups across Phases 2–5 remain pending. Phase 6 migration 009 requires connected atomic confirmation/retry/quota/cross-owner/30-day-retention acceptance; no Phase 6 live pass is claimed. Use [Phase 6 acceptance](phase6-acceptance.md) for real microphone/device, consented corpus and paired timing gates. Model loading succeeded on this browser; transcription accuracy remains unmeasured.

## Phase 8 acceptance

Run `npm run phase8:check` only at the completed phase boundary. Commerce tests cover bundle holds/races, deadlines and shortened offers, vendor stock guards, two-sided codes, integer commission snapshots/refunds/disputes, fake callback retry/late/failure, assigned couriers, campaign moderation/dates/budgets/filter slots, tier cancellation, safe exports and council suppression. API tests validate strict action fields, caller forwarding/authentication, simulation mode and SQL/PLpgSQL syntax. Parsing does not execute policies or verify database runtime bindings.

On the configured guarded disposable project, run `RUN_LIVE_PHASE8=1 npm run phase8:live` after prior live gates and the commerce migration. Five guarded tests cover actual transactions, competing stock requests, private direct-write denial, user/organisation/delivery scopes, moderation, refunds, stock guards and late-payment rejection. They currently skip. See [Phase 8 acceptance](phase8-acceptance.md) for actual local results and browser evidence; connected sign-in/session/reconnect and device journeys remain separate external gates.

## Phase 9 acceptance

`npm run phase9:check` runs the full local gate after the implementation batch. Partner model tests cover editorial approval/publication scopes, supplier request changes, trail validation, consent/independence/reply gates, private case projection, officer transitions, permit expiry/renewal, council market denial, shared donation/shopper/vendor stock, donation cutoff, separate compost/BSF collection, missed pickups, weights and replay deduplication. Strict API tests cover injected fields, bounded integer quantities, simulated-only actions, caller JWT forwarding/auth and SQL/PLpgSQL parsing. Actual results and browser evidence are in [Phase 9 acceptance](phase9-acceptance.md).

`RUN_LIVE_PHASE9=1 npm run phase9:live` requires the guarded disposable project and partner migration after prior gates. Three guarded cases currently cover media scope/publication/retries/direct-write denial, referral consent/source-link denial and permit expiry/renewal. They are not executed here. Complete connected referral-resolution/privacy, donation/shopper concurrency, collection deduplication/cutoff and aggregate/publication cases separately and extend the live suite; do not treat syntax parsing as database execution proof.

## Phase 10

`npm run phase10:check` is the phase-end local lint/type/build/Frontend/Ruff/API/credential gate. Advanced tests cover coarse radius, consent/expiry/quiet eligibility, stable event IDs, explicit capped retries, chronological same-stall/weekday forecasts, stockout exclusion, insufficient samples, bounded rainfall and matching analytics filter aggregates. Push tests mock the official transport for provider acceptance/404/410/retry failures and prohibit arbitrary HTTP hosts/redirects; SQL parsing proves syntax only. `npm run phase10:live` explicitly guards the disposable target; two tests cover credential-read denial, endpoint validation and own revocation. Full live concurrency, expiry/restart and actual opted-in device delivery remain required. Do not convert skipped tests or simulated sent states into live acceptance evidence. See phase10-acceptance.md for browser/download/device limitations.

## Phase 11
Catalog checks validate counts, unique linked core inventory/reviews, exact food-image IDs, and deterministic rebuild. Frontend tests exercise shared offer/reservation caps, expiry, synthetic pilot denominators/net RM and distinct routes. Video checks decode both eight-second clips. Browser evidence and the precise incomplete connected/device/download gate are recorded in phase11-acceptance.md. Run phase11:check only at the phase boundary; repair focused failures before any repeated broad run.
