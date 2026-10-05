# Phase 9 acceptance — 2 October 2026

Status: locally implemented and verified. Connected database execution, authenticated connected browser journeys and deployment remain pending.

## Delivered and boundaries

`/demo/partners` contains fictional media/editor, supplier, moderator, health-office, council, charity, compost and BSF workspaces. Profile links to the portal. The directory names fictional organisations and labels Foodie/KKM/Majlis Bandaraya-style concepts as proposed simulations without affiliation. Images remain description placeholders, with no official logos, seals or certificates.

- Media/supplier applications support submission outcomes, request changes, approval/rejection and editor-only publication. Public discovery can show an editorial badge separately from paid sponsorship. Three prefilled trails, media/supplier requests and a 2–5-stop trail builder use fictional stalls. Engagement figures are fixed synthetic samples.
- Referrals copy only the moderator-approved redacted text, stall and market into a separate case. Explicit simulated consent, three independent reviewed reports and the hawker reply opportunity are required. There is no automatic referral or public accusation. A private source-to-case link is never included in officer projections.
- Cases support timeout/retry, fake acknowledgement, scheduling, synthetic observation checklists, corrective action, follow-up and resolution. References begin `DEMO-CASE-`. Another organisation cannot view or modify the case.
- Council workflows cover permit application/review/approval/rejection/expiry/renewal and separate `DEMO-CLAIM-` dietary-evidence decisions. No decision creates an official certificate or changes certified-halal status. Capacity is a fictional 20 lots. Complaint hotspots are coarse market aggregates; complaint/waste results suppress groups below five independent stalls. These are reporting activity, not proven violations.
- Donation, compost and BSF pickups have separate routes and destinations, with request/accept/reject/schedule/collect/missed/cancel states. Donation requires confirmed advisory eligibility and the same 15-minute fulfilment buffer used by commerce. Deadline-reached food is blocked from consumption donation.
- Pickups share stock holds with commerce reservations, existing vendor stock controls and reported clearance outcomes. Collection consumes portions once. Separate synthetic estimated and weighed kilograms are never added together; completed job IDs deduplicate totals. Receipts are labelled DEMO.
- Scenario controls support success/pending/rejection/timeout. Explicit replay reuses the original request key; ambiguous network errors retain the exact action for retry.

`/sandbox/partners` uses caller-authenticated FastAPI RPCs. The migration `20261002060812_partner_simulation.sql` creates private records, source links, requests and event logs with RLS and direct caller access revoked. Security-definer functions use an empty search path, protected role/membership assignments and market scopes. Commerce and pickup transactions share the same stock lock. Only public approved editorial fields are exposed anonymously. The API accepts strict discriminated actions and labels its provider simulated. This implementation has not been executed against Supabase here.

No agency/company/payment/delivery endpoint is called. The existing community media pipeline retains original evidence; this phase sends neither original evidence nor its storage keys to officers. Text redaction is assisted by identifier masking and requires moderator review; it cannot guarantee removal of every identifying detail.

## Local gate evidence

At the phase boundary, the full frontend suite passed **169 tests**. The full API run passed **115 tests**, failed one new migration parsing check and skipped **31 live cases**. Repairs removed unused imports, fixed Python formatting and replaced a schema-dependent row-field parser target with an explicit UUID variable; all **10 Phase 9 API checks then passed**.

After browser-driven fixes, the focused commerce/vendor/freshness/partner suite passed **92 tests**, including one additional eligible-donation/BSF regression. Web lint/type/production build, Ruff, SQL/PLpgSQL syntax parsing and the credential scan passed. The three guarded Phase 9 live tests remain skipped. Final presentation fixes were compiled separately; the full suites were not repeatedly rerun. Dependency annotation and large application/speech-chunk warnings remain for the later device/performance gate.

SQL parsing is syntax evidence, not runtime bindings, RLS, query-plan or transaction-isolation proof. Neither fixtures nor mocked API tests certify live permissions.

## Browser evidence

- Hawker application → assigned editor approval → published editorial feature; foreign editor saw no private record.
- Existing community moderator reviewed the third independent synthetic report, then advanced the 48-hour reply clock. A referral without consent failed; consent created `DEMO-CASE-*`. Timeout → success retry retained one case. Foreign officer saw none; assigned officer acknowledged, scheduled, inspected, requested corrective action, followed up and resolved.
- Council approved a permit; advancing eight days changed it to expired, and the hawker renewed it.
- Expired-food compost request → collector accept/schedule/collect produced one synthetic receipt and separate weight totals.
- A separate fresh evening scenario produced an eligible donation pickup. Replaying the collection callback retained one job and unchanged totals. Advancing beyond the advisory deadline blocked another donation.
- Editor selected two distinct stalls and published a new trail. Connected portal required sign-in and did not load demo personas or records. No console errors were observed.
- Mobile dropdown overflow was repaired. At the phone preview the document/client widths both measured **375 px**. This is layout evidence, not target-phone performance evidence.

Screenshots: [resolved authority case](screenshots/phase9-authority.png), [mobile collection](screenshots/phase9-collection-mobile.png), [eligible donation](screenshots/phase9-donation.png).

## How to demonstrate

1. Open `/demo/partners` directly or through Profile. Use the hawker persona and choose the appropriate directory destination before applying. Each record has its own submit/retry control.
2. Switch to its assigned editor, supplier or council persona to review. Editors can publish approved media features and create their own trails; suppliers cannot publish editorial badges.
3. For referrals, use `/demo/community` first. Explicitly review independent groups, exclude duplicates, approve a redacted summary and allow the reply period. Return as the partner moderator, choose the health-office destination and approve the consented preview.
4. For fresh donation eligibility, use `/demo/commerce` to reset the fictional evening and prepare its clearance offer. This replaces the demo vendor/commerce/partner scenario in that browser, so finish or screenshot existing journeys first. Return to partners and select the active second satay batch with charity/donation. Schedule inside its cutoff and advance the demo two minutes to collect.
5. Compost/BSF uses the matching fictional collector and an explicitly non-consumption path. Missed/rejected/cancelled pickups release holds. Neither collection method is a real processing suitability recommendation.

## Remaining acceptance

- Apply the migration only to the guarded disposable project after prior migrations/live gates. Run `RUN_LIVE_PHASE9=1 npm run phase9:live`. Existing guarded cases cover media scope/publication/retry/direct-write denial, referral consent/source-link denial and permit expiry/renewal.
- Execute complete connected referral privacy/resolution, donation versus shopper races, collection callback/weight deduplication, cutoff changes, anonymous publication and council suppression cases against the configured project. Additional live scenario coverage is still needed; local model tests do not replace it.
- Verify authenticated role switching, sign-out/session expiry, offline/reconnect and ambiguous retry in the connected browser. Provision synthetic partner memberships and market assignments privately.
- Complete target Android/network, accessibility and BM/English copy polish in the final demo gate. Current new partner copy is English.

See [USER_ACTIONS.md](USER_ACTIONS.md). No new business API keys are required. No deployment, real permit, real complaint filing or external partner communication was performed.
