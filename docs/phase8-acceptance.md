# Phase 8 acceptance — 2 October 2026

Status: local implementation and browser acceptance complete. Connected Supabase execution and deployment acceptance remain pending. Implementation checkmarks do not certify a live database.

## Delivered

- `/demo/commerce`: isolated, prefilled fictional accounts, orders, campaigns and ledger. Reset to an evening scenario, then prepare the fictional clearance offer. No credentials required.
- Batch-specific carts, integer-sen pricing, bounded stock holds, pay-at-stall pickup, two-sided code confirmation, stock consumption once, commission snapshots, disputes, cancellations and partial/full refunds.
- Future fake payment balance, success/failure/timeout/late scenarios and watermarked CSV/printable receipts. Active paid orders must close before refunds; collected food is never restored to stock.
- Advertiser profiles, described creative placeholders, market/category/radius/date targeting, pretend checkout, moderation, pause/resume, capped spend, no-fill events and performance meters.
- Labelled capped sponsored search/map placements, banner/native and optional interstitial previews. Current filters, clearance availability and deadlines remain authoritative. No implicit location permission.
- Free/premium comparison, renewal failure/cancellation, assigned-stall inventory/revenue, synthetic exports and monthly commission statements. Basic tools remain free.
- Assigned courier board, coarse route/ETA and delivery state transitions; no courier code, money or ledger access. Failure closes the reservation and releases its hold.
- Market-scoped organiser aggregates over 30 days, with at least five independent stalls per published group. Estimated weight is synthetic (150 g per adjusted portion), not weighed food. Fully refunded orders do not qualify a group.
- `/sandbox/commerce`: authenticated FastAPI commands backed by `20261002051951_commerce_simulation.sql`. Database roles, memberships and assignments govern access; private tables deny direct caller writes. Requests are idempotent and transactions serialize shared stock/account updates. Uncertain network requests retain their exact action/key for explicit retry.

All payment, subscription, advertisement and delivery operations remain internal simulations. Images stay as description placeholders. No external business provider or agency is contacted.

## Phase-boundary checks

The initial complete gate passed web lint/type/build, **154 frontend tests**, Ruff, **105 API tests**, migration SQL/PLpgSQL syntax parsing and the frontend credential scan. **26 live tests were skipped** because infrastructure was not configured.

After final boundary fixes and two additional frontend regressions/two guarded live cases, only affected checks were rerun: lint/type/production build, **78 commerce/vendor/freshness frontend tests**, Ruff, **12 commerce API tests**, and credential scan all passed. The **five Phase 8 live tests skipped**. No live pass is claimed. Existing build warnings concern large application/speech chunks and dependency annotations; cheap-phone performance remains a later device gate.

SQL parsing checks syntax, not runtime name bindings, RLS, transaction isolation or query plans. Connected behavior must be verified against the guarded disposable database before calling that acceptance complete.

## Browser evidence

Verified in the local in-app browser:

1. Reserve → hawker accept/ready → matching-code confirmation by both sides → completed. One portion consumed, RM 0.13 commission; RM 1 partial refund reduced it to RM 0.10.
2. Fake payment failure closed the order without debiting the pretend balance.
3. Premium → renewal failure → free retained order history and disabled premium inventory export.
4. Advertiser onboarding → pending campaign → moderator approval. A one-sen budget accepted one impression and recorded a subsequent click as no-fill without overspending.
5. Delivery reservation visible to rider A, absent for rider B; accept/failure released the hold and earned no commission.
6. Council A showed only its market's qualifying aggregate; Council B suppressed its small group. No raw order/report data appeared in organiser views.
7. A sponsored result appeared for the selected market and disappeared under the certified-halal filter because its stall was only hawker-declared.
8. `/sandbox/commerce` required sign-in and displayed no fallback fixture orders. No browser console errors were observed. The phone preview measured document/client widths both 375 px with no horizontal overflow.

Evidence: [commerce](screenshots/phase8-commerce.png), [phone](screenshots/phase8-mobile.png).

## Remaining external acceptance

- Apply migrations through `20261002051951_commerce_simulation.sql` to the guarded disposable project and complete prior live gates.
- Run the five Phase 8 database cases with `RUN_LIVE_PHASE8=1 npm run phase8:live`: retry/collection/refund isolation; competing stock reservations/direct-write denial; campaign moderation/privacy; delivery/organisation scopes; stock guard/expiry/late-payment rejection.
- Complete authenticated connected browser journeys for each protected role, including session expiry, reconnect/ambiguous retry, public sponsored filters/map pins and aggregate suppression after refunds. Inspect actual SQL execution and scoped query plans.
- Complete target Android/network/accessibility and BM/English copy review in the later final-demo gate. Browser viewport checks are not hardware performance measurements.

Use [USER_ACTIONS.md](USER_ACTIONS.md) for setup. No payment/ad/delivery API key is needed for this phase. No hosting or production activation has been performed.
