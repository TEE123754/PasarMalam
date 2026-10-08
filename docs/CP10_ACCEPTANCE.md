# CP10 acceptance — 8 October 2026

**Local preparation and contract gate complete; six real activation requirements remain pending.** Overall checklist remains **124 checked / 27 open**. Deployment is held.

## Delivered

- Six non-overwriting private evidence templates: media, badge, authority, permit, collection and expansion.
- Offline strict Pydantic review of agreement/source references, ownership, review/expiry, revocation, channel checks and approved draft scope. Unknown fields, boolean coercion, timezone-free dates and reporter identifiers are rejected.
- Explicit consent/review and exact field projection for an offline authority draft. No network sender, activation flag, credentials or new API route. Filled references still need independent human authentication; free-text redaction remains a human responsibility.
- [Owner handoff guide](CP10_PARTNER_GUIDE.md), covering all six briefs, adapter acceptance, custody/receipt provenance, source disputes and staged local review.

## Phase-end evidence

Built the complete phase before running this focused batch:

```powershell
uv run --project apps/api pytest apps/api/tests/test_cp10_readiness.py apps/api/tests/test_partners.py --basetemp=.local-acceptance/cp10-tests-20261008-a -q
npm run test --workspace apps/web -- src/partners/model.test.ts
uv run --project apps/api ruff check apps/api/app/partner_readiness.py apps/api/tests/test_cp10_readiness.py scripts/cp10_prepare.py
uv run --project apps/api python scripts/cp10_prepare.py
uv run --project apps/api python scripts/cp10_prepare.py --review
node scripts/check-repo-secrets.cjs
node scripts/check-web-secrets.cjs
```

**32 Python cases passed** (22 CP10, 10 existing partner API/syntax cases); **14 existing frontend partner cases passed**, covering organisation privacy, consent, timeout/retry, editorial separation, expiry, shared stock, duplicate receipts, weights and donation versus non-consumption routes. Ruff initially found two import-only issues; those were fixed and only the failed static check rerun. Existing Starlette/httpx deprecation warning remains. Secret scans passed. Six templates were actually created, all reported missing evidence, and Git-ignore verification passed. Tests also verified repeated preparation preserves files and errors do not print private values.

No UI, runtime route or database schema changed, so no unrelated web rebuild, browser journey, migration, API restart or broad regression was necessary. Existing simulator tests do not establish provider responses or actual permissions at a real organisation. No external call, AI charge, message, referral, collection dispatch, publication or deployment occurred.

## Still needed

All six `C11-01/02/03/05/06/07` requirements stay unchecked: real media agreements, verified badge permission, agreed authority intake, authoritative licensing sources, collector agreements and verified expansion/pilot evidence. Approved samples, provider-specific adapters and separately authorised real response tests follow those inputs. The generic offline validator cannot implement an unknown provider API or authenticate agreements. See the [guide](CP10_PARTNER_GUIDE.md) for concrete material to supply.
