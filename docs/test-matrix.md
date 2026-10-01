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
