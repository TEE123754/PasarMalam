# Phase 11 local acceptance — 2 October 2026

Status: local presentation build implemented; complete Phase 11 acceptance remains pending.

## Delivered

- `/demo/presentation`: frozen scenario controls, complete browser-local reset, workflow links, synthetic one-market/10-stall/four-week pilot, business view, asset library and record explorer.
- Deterministic catalog: 10 markets (six night/four day), 30 stalls/owners, 50 customers, 90 menu items, 150 batches and reviews; partner, commerce and advanced historical examples at planned counts. Operational portal fixtures share guarded stock and caller projections; the generic catalog history is labelled reference content, not connected database state.
- 100 separate image slots with accessible descriptions, filename, exact market/stall/food association and one-image prompt. Original optional prompts retained as reference; no raster imagery generated or supplied.
- Two distinct, decodable eight-second synthetic text/diagram MP4s, captioned DEMO/time/location. Three fictional community poster drafts with SVG QR pointing to `http://127.0.0.1:5173/demo/discover` on the same device. No posting, messaging or affiliation claimed.
- Core/full-vision walkthrough and provenance in `demo-guide.md`; real-pilot proposal and metric definitions in `pilot-plan.md`; setup and supplied evidence in `USER_ACTIONS.md`.

## Verification

Build first, tests at the phase boundary. Lint, typecheck, production build and credential scan passed. Main bundle was approximately 244 KB gzip; existing large-chunk/speech-worker warnings remain and do not establish target-phone performance.

Initial broad frontend run: 181 passed, two obsolete commerce fixture assertions failed after expanding the seed. Initial Python run: 140 passed, 33 live skipped, one Windows external temp-directory fixture error. Focused repairs updated historical-state/customer-projection expectations and used disposable workspace `--basetemp .phase11-qa`. The final focused frontend catalog/commerce/discovery run passed all 39 tests; Python catalog counts/links/media/rebuild passed all three. Ruff passed after import repair. The full suite was not repeatedly rerun.

Browser checks on the temporary local preview verified reset and fresh scenario status, discovery with 30 stalls and all ten market choices, pilot week-one baseline RM/kg zero and week-two nine participants/net RM190.02/RM21.11 per participant/7.92 weighed kg, 30 FOOD slots and both video durations of eight seconds without media errors. Desktop document/client widths both 1265 px; at the 375 px viewport override document/client widths both 360 px (scrollbar), without horizontal overflow. No console errors observed. These are representative checks, not a complete core/full-vision script, actual download or hardware acceptance.

Browser inspection found and repaired Friday weekday mapping, food slots pointing to stalls instead of actual menu IDs, and discovery cache invalidation after resetting/advancing scenarios. Original template prompts are preserved separately; current mapped prompts describe the actual fictional subject. A final browser revisit after reset confirmed Senja Kenari was Open at the Friday anchor with no console errors; final lint/typecheck passed.

Evidence: `screenshots/phase11-studio.png`, `screenshots/phase11-mobile.png`. Temporary browser tabs and preview server are closed after verification; the user's original preview is untouched.

## Still required

- Implement full guarded connected Phase 11 owner/customer/partner provisioning, business seed and reset-to-today; current operator seed is the earlier five-account foundation. Execute SQL/fixture parity, repeated seed and refusal gates on the disposable project.
- Full core/full-vision desktop/phone journeys, filtered CSV actual-download evidence, BM/English accessibility/localisation and target hardware/network checks. Representative browser inspection does not complete these.
- Consented human speech clips and actual paired timing measurements; scripted/synthetic content must not count as evaluation results.
- Validate and optimise the 100 user-supplied images with provenance when supplied.
- Regenerate QR for an approved deployed origin, organiser review and explicit distribution instruction.
- Finish prior connected/live permission, concurrency and opted-in device push acceptance before deployment claims.

No keys, migration, remote reset, hosting, paid service or business-provider traffic used.
