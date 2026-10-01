# Phase status

Update this file at the end of each phase gate. Phase 1 is complete locally. Phases 2–12 have not started.

## Phase 1 — Foundation and application shell

- Status: **complete**, 1 October 2026.
- Checklist: **15/15 build tasks complete; 0 remaining Phase 1 tasks**.
- Deliverables: Git/npm/uv scaffolds and lockfiles; responsive customer/hawker shell and restricted Admin state; BM/English catalogue; typed fixture/connected data boundary; local privacy choices and optional read-back; scenario clock; four shared business mock controls; health/config/OpenAPI API; coverage matrix and architecture decisions.
- Final additions: Profile success/pending/rejected/timeout controls, translated error/navigation/close labels, 48 px control sizing, Malaysian calendar date for closing scenarios, exact direct web dependency versions, and both local CORS origins.
- Files/modules: `apps/web/`, `apps/api/`, root toolchain/setup files, `docs/` and the implementation checklist. The original `PasarMalam.md` is preserved.

### Focused phase gate

The first gate was run after building the foundation. It found an unused import, an API line-length issue and a Windows Vite config-loader access issue; those were fixed. The remaining foundation additions invalidated the old web/API results, so one final complete batch was run after finishing those additions. No watch-mode or test-on-edit loop is configured.

Command: `npm run phase1:check` with local `UV_CACHE_DIR=.uv-cache`.

| Check | Final result |
| --- | --- |
| Web ESLint | PASS; no errors |
| TypeScript | PASS; no errors |
| Vite production build | PASS; 1,727 modules; JS 132.36 kB gzip, CSS 5.50 kB gzip |
| API Ruff | PASS; all checks passed |
| Local API contract | **5/5 PASS**: health + aware UTC timestamp, public config, OpenAPI paths, localhost CORS, unavailable privileged route |
| Browser routes | PASS: Discover, Offers, Saved, Profile, five hawker routes, restricted Admin |
| Demo interactions | PASS: role switching, BM/English, privacy dialog, Malaysian closing time, all four simulated response outcomes |
| Connected boundary | PASS: connected banner + unavailable state; roles disabled; fixture data appears only after explicit Open sample demo |
| Responsive layout | PASS: desktop 1,140 × 900 and phone 390 × 844; phone content width equals viewport content width, no horizontal overflow |

Evidence: [desktop](screenshots/phase1-desktop.jpg), [phone](screenshots/phase1-mobile.jpg).

The API test client emits a Starlette deprecation notice about its HTTPX transport; it does not affect the five passing contract checks. Review that test transport when expanding API tests in Phase 2.

### Remaining work and boundaries

- Remaining Phase 1 work: **none**. No external configuration is required for this local foundation.
- Later phases: connected discovery/authentication and durable data start in Phase 2; map/PWA offline behavior, listing writes, safety rules, voice extraction and partner workflows follow their planned phases.
- Hawker, Saved and Admin screens currently show intentional information states. They do not claim functional listing, saved-record or privileged workflows.
- Current visuals use CSS/emoji illustrations. The 100 generated assets and provenance manifest belong to Phase 11.
- Privacy controls store choices only; they do not request device permissions. Speech read-back depends on browser/OS voice availability; real STT is Phase 6.
- Neither Vercel/Railway/Supabase hosting nor a live food-safety system has been deployed.
- Next: **Phase 2 — data, authentication, permissions and initial seeds**.

## Template for the next phase

- Phase/status/date:
- Completed checklist count / remaining items:
- Deliverables and changed modules:
- Phase-end commands and pass/fail totals:
- Failure fixes and focused reruns, if any:
- Blockers and known limitations:
- Checkpoint and next step:
