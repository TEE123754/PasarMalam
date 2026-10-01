# Phase 4 — vendor listings, photos and batches

Date: 1 October 2026. Status: implemented and locally verified; live acceptance pending.

## Workspace boundary

| Workspace | URL | Data and permissions |
| --- | --- | --- |
| Real app | `/discover`, `/profile`, `/hawker/*` | Connected only; rejects a backend declaring `disposable-demo`. No sample fallback. Production project/schema activation remains pending. |
| Standalone demo | `/demo/discover`, `/demo/hawker/*` | Prefilled fictional markets, stalls, menus, batches and reviews. Browser-local writes, fictional hawker/customer role switch, no Supabase Auth or real API calls. Separate drafts, role, locale, privacy choices and vendor data. |
| Technical sandbox | `/sandbox/discover`, `/sandbox/profile` | Explicitly labelled connected fictional data. A dedicated disposable Supabase project with real JWT/RLS/RPC/Storage operations; no production records. |

The **Try demo** dialog explains the playground and **Open prefilled demo** performs a full navigation. **Exit demo** returns to the real app with fresh in-memory query/auth state. Profile → **Restore prefilled demo** resets only demo storage. Old `VITE_APP_MODE` and sticky sample-session flags no longer select data sources.

All future company, agency, authority, advertising, sponsorship, reservation, analytics and notification previews remain in the demo plan. Their screens are delivered in the assigned later phases. This phase does not pretend those later features are implemented. Generated image delivery remains Phase 11; the existing 100 individual prompts are unchanged. Browser QA used explicitly labelled synthetic test photos, not generated final assets.

## Implemented

- React Hook Form/Zod stall setup and edit, published-market selection, lot/hours/open status, manual coordinates and a Leaflet pin picker. Menu creation/editing uses integer sen and explicit ingredients/halal declarations. Saved lot, hours, coordinates and photos appear in customer profiles.
- JPEG/PNG/WebP byte-signature/decode checks, 5 MB input and 16 MP/32 px limits, orientation handling, 1280 px resize, clean JPEG output up to 1 MB, EXIF/GPS/other metadata removal, capture input and transfer progress. The server independently decodes the upload using Pillow 12.3.0.
- Signed stall/actor/nonce upload tickets. The API forwards the caller JWT and public Supabase key; no service key is used by handlers. Storage denies raw unapproved public uploads and overwrites; a committed batch photo cannot be deleted by the client. Evidence/certification buckets remain private and separate.
- SQL transaction commands and per-actor idempotency records, plus a food-row lock for concurrent numbering. The demo coordinates local writes using Web Locks and reports unsupported browsers instead of racing writes.
- Optional quantities remain unknown rather than guessed. New batches default to `needs-information`, with no invented policy/deadline or clearance. Originally prepared and server-recorded upload times are distinct; original identity, quantity, timestamps and photo remain immutable.
- Atomic stock consumption, sold-out/withdraw/discard and controlled restoration. No negative or unknown-stock consumption. A valid original policy/window is needed to restore availability. Unknown stock cannot pass clearance comparisons through SQL NULL behavior.
- Append-only batch events and history; earlier-only preparation corrections shorten existing deadlines. Merges accept compatible open batches of the same food, carry the earliest effective preparation/deadline, close sources and withdraw source promotions, preserve unknown quantities/windows, and require policy reevaluation.
- Offline write rejection, tab-local text drafts, exact request/content retry after ambiguous saves and rejected-save photo cleanup. A successful save clears its pending retry marker synchronously.

## Local phase-end evidence

| Check | Actual result |
| --- | --- |
| Web lint, TypeScript and production build | PASS after collected gate/browser fixes |
| Vitest | 58 PASS: existing discovery 30, vendor model 19, workspace boundary 9 |
| Python API/image/schema suite | 44 PASS at the phase gate; 11 live groups skipped at that point |
| Final affected Python checks | 7 PASS for six migration parses and shared fixture contract; 4 Phase 4 live groups skipped after adding the known-deadline live scenario |
| SQL verification | Outer PostgreSQL syntax/unique-column parsing only. PL/pgSQL execution, grants, locks and Storage RLS are **not** proven locally. |
| Bundle secret scan | PASS; no privileged token/private values in the frontend |
| Browser journey | Modal → isolated demo; create dish; Batch 1 with photo/8 units; Batch 2 with different photo/12 units; sell out Batch 1; Batch 2 text, times, quantity and photo unchanged; idempotent pending-save retry did not duplicate a batch |
| Failure / edit / exit | Fake JPEG contents rejected; batch count stayed at four; lot edit persisted; existing stall form/map rendered; full-page exit returned to real routes without sample records |
| Phone | 390 × 844 review; settled document/client content widths both 375 px; no horizontal overflow |
| External tiles | Disabled during preview review; no automated public tile loads |

Tests began only after the implementation batch. Gate failures were collected and fixed: a JSX delimiter, TypeScript narrowing/ES2022 compatibility, UUID parameter inference and import ordering. Browser review found a stale pending retry marker and phone header overflow. Affected checks were rerun; there was no test watch mode or whole-suite run after every edit.

The production build still warns about an initial JS chunk over 500 kB minified and upstream Zod annotations. Further splitting belongs to the final performance work. Existing synthetic JWT-key and Starlette TestClient warnings are unchanged.

Screenshots: [demo dialog](screenshots/phase4-demo-dialog.png), [two batches with original photos](screenshots/phase4-batches.png), [phone dashboard](screenshots/phase4-mobile.png).

## Live gate — remaining work

No ignored environment, local Supabase/Docker stack or cloud project is configured here. Never use the production project for these commands.

1. Follow `docs/phase2-setup.md`, target a disposable project with `APP_ENV=demo`, matching project/DB URLs and the verified `DEMO_DATABASE_ID`. Apply all migrations in order through `202610010006_vendor_workflows.sql` using the guarded migration runner. Review runtime errors before proceeding. Complete Phase 2 and Phase 3 live acceptance too.
2. Place a fresh random `MEDIA_SIGNING_SECRET` of at least 32 characters in the ignored API environment and run `npm run phase4:media-setup`. The guarded operator installs the matching secret into inaccessible `private.media_secret`; it prints no secret. Restart the API after configuration. Never put it in a `VITE_` variable.
3. Set `RUN_LIVE_PHASE4=1` and run `npm run phase4:live`. Missing target/secrets fail this command; they cannot produce a mock pass. Four groups exercise real caller ownership/retry/concurrent numbering/atomic stock, unknown merge/direct-write denial, earlier correction/earliest known deadline, and decoded image authorization/metadata/cleanup/immutable attachment.
4. On a separately configured technical deployment, use `/sandbox/profile` to sign in as the synthetic vendor, then repeat the two-photo browser journey against real Storage. Also verify failed-save cleanup, offline draft recovery, expiry restoration denial and realtime customer visibility. Record actual results, not fixture results.
5. Inspect remaining unattached uploads after induced server/network failure. Cleanup is best-effort if Storage is unreachable; unknown upload outcomes cannot make a batch available. Remove only verified unattached objects through the guarded operator. Keep ambiguous entity saves and their photos until their exact retry resolves.

## Practical limits and follow-up

- No live SQL/Storage execution, deployed URLs or production readiness is claimed. The API currently declares `disposable-demo`; real root routes therefore refuse it. Production activation requires its own reviewed migrations/project, account provisioning, provider terms/privacy review and expert-reviewed food policy.
- Freshness calculation, weather adjustments and agent actions remain Phase 5. Photos/timestamps do not prove food safety; the demo's seeded timers are fictional.
- Periodic orphan sweeping belongs to Phase 6 operations. Ordinary rejected-form cleanup is implemented; a process crash/network partition can leave an unattached normalized object for operator cleanup. Original batch photos remain retained with history.
- Browser-local demo photos share browser storage quotas. Quota failures are reported, with no partial batch commit. Text drafts/pending requests survive tab reloads, not closing the tab; unsaved files must be selected again. Web Locks are required for coordinated demo writes.
- Newly added vendor forms use English copy; a full BM terminology/accessibility pass remains in the final preparation phase. Existing discovery/profile locale choices remain available and are now isolated by workspace.
