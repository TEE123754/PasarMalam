# PasarMalam — complete local market experience

Updated 9 October 2026. Web preview: http://127.0.0.1:5174/demo/discover.

The demo uses the product's customer and hawker interfaces with complete browser-local sample records. Fictional people, declarations, organisations, media, payments and agency integrations are explained in the entry dialog on the landing page. Ordinary screens use product language and do not repeat demo or fictional labels. Connected records, database migration history and external integrations are unchanged.

## Completed

- [x] Landing-page entry dialog explains the separate fictional world, advisory limitations and simulated external services.
- [x] Complete stall descriptions, lots, coordinates, dietary statements, ingredients, allergens and sample users.
- [x] Prepared-today food cards show cooking times, batch numbers, stock and live advisory countdowns.
- [x] The evening clock advances rather than freezing countdowns. Expired batches and offers remain blocked.
- [x] Prefilled clearance offers, collection reservations, order history and advertising profiles.
- [x] Visible labelled sponsored placements, capped slots and preserved dietary, budget and availability filters.
- [x] Market map opens by default and shows all matching market pins, rather than only the current list page.
- [x] Customer reviews and private hygiene reports save through the existing moderated workflow. Private reports do not automatically create public flags.
- [x] Populated account profile, saved stalls, customer/hawker switching and links to all principal workspaces.
- [x] Agency and company directory: food discovery, health teams, municipal councils, donation, circular collection, suppliers and delivery.
- [x] Agency workspaces expose existing permit, referral, inspection, collection and collaboration actions with populated records.
- [x] Community impact view presents meals, hawker savings, separate circular routes and batch-safety safeguards.
- [x] Supplied images are reused where they match the dish; other dishes retain a box with a clear image description.
- [x] Narrow-screen layouts checked; mobile header overflow corrected.

## Verification

One consolidated frontend gate was run after implementation. Lint and TypeScript checks passed. The existing 318 tests passed; the three new tests passed after repairing their browser-only import and a remaining sample-name suffix. Relevant affected suites were then checked following browser-discovered corrections (60 passing tests). Production web builds passed.

An isolated browser session checked 15 principal routes, map pins, a changing countdown, saved review, saved private report, saved reservation, the entry clarification, and 390-pixel mobile profile/discovery layouts. No browser page errors were recorded. A final check confirmed 11 matching market pins, three labelled advertising cards across different placements, and campaign start times retained after reload. A persistence bug that recreated commerce fixtures during reads was repaired; 50 affected regression tests passed afterward. The public passport URL intentionally retains `/demo/` to preserve the environment boundary.

Local evidence is in ignored `.local-acceptance/demo-preview-report.json`, with desktop and mobile screenshots beside it. These checks use sample accounts and prove local workflows; they do not establish real agency agreements, measured pilot outcomes or expert-approved food rules.

## Remaining outside this update

- Deployment remains on hold.
- Real partner activation, human/device evidence and food-rule approval retain their existing pending status in the completion plan.
- Native device builds and physical-device verification retain their existing status; this update refreshes the local web preview.
