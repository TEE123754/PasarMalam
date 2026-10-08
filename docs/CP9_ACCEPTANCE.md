# CP9 — showcase preparation gate

8 October 2026. **Local preparation complete; CP9 human/competition acceptance pending.** None of the five combined requirements is closed by a storyboard or technical rehearsal alone. Overall counts remain **124 checked / 27 open**. Deployment and submission remain on hold.

## Prepared locally

- [English recording/rehearsal guide](CP9_SHOWCASE_GUIDE.md): seven scenes covering 300 provisional seconds, narration/captions, precise clicks, honest fallbacks, recording/review and privacy boundaries. The official duration/format is unverified.
- [Claim-to-evidence and declaration pack](CP9_EVIDENCE_PACK.md): linked technical evidence, provisional TRL reviewer matrix, two conditional previous-version drafts, official-rule/team/supervisor review fields and missing evidence. No student, prior version or TRL level is invented.
- [Downloadable storyboard contract](../contracts/cp9-showcase-pack.json) exposed in the local demo studio. Actual downloaded JSON matches the repository contract.
- Private ignored `.local-evaluation/cp9/` entry details, rehearsal and video-review templates. Unverified fields remain null/empty, CSVs contain no participant/student observations. Preparation never overwrites existing evidence.
- Added **clearance** at 30 minutes and **expired** at 61 minutes to the fictional scenario controls. The old **reminder** at 45 minutes reaches the 15-minute new-offer cutoff and cannot be used to approve new offers. A fresh pending draft must also have no existing active offer.

## Focused gate

Built the preparation work first, then ran the phase-end checks. A clearance selection initially encountered a seeded active offer; the directly affected test was corrected to select an eligible unoffered batch. Download parity also caught lost caption punctuation; portable JSON escapes now preserve it and the affected round-trip case passed. Its regex initially failed ESLint and was repaired with an equivalent permitted range. These contract/scenario repairs justified affected test/build reruns; successful unrelated backend suites were not repeated.

| Check | Actual result |
| --- | --- |
| Frontend | Nine distinct cases passed: five existing fixture invariants plus four CP9 storyboard/approval/expiry/download-encoding cases |
| Private preparation | One Python case passed: unmeasured templates and preservation of operator evidence |
| Static/build | Web ESLint, TypeScript/production build and Python Ruff passed; existing bundle warnings remain |
| Privacy | Repository/frontend credential scans passed; private entry details confirmed Git-ignored |
| Browser/download | CP9 studio panel and actual JSON download verified; download equals contract |
| Database/provider | No migrations, database reseed, AI request, billing change or external communication |

Commands: `npm run test --workspace apps/web -- src/presentation/showcase.test.ts src/presentation/model.test.ts`; `uv run --project apps/api pytest apps/api/tests/test_cp9_prepare.py -q --basetemp .local-acceptance/cp9-tests-20261008-a`; focused affected tests only after repairs; web lint/build, Ruff and credential scans. Choose a new nonexistent pytest temporary path for another run because pytest owns its directory.

## Observed desktop technical rehearsal

Codex in-app browser, local production preview on this Windows computer; no real participant/phone/student recording. The existing `127.0.0.1` shared demo state interfered with the first scenario inspection. The check used **`localhost:5174` in one temporary tab**, a separate browser-storage origin, without closing the user's tabs. Tab-scoped scenario clocks and shared local demo storage mean presenters must avoid other tabs polling the same origin. No disconnected-browser test is claimed; offline readiness messages varied during navigation.

1. Downloaded the showcase pack and inspected its pending-evidence wording.
2. **clearance**: selected `DEMO-batch-30-1`, fictional Ubi bakar. Observed 30 advisory minutes remaining, pending agent draft, deadline 9:30 pm and manual approval enabled. Confirmed 25% off for two units; customer Offers displayed **Ubi bakar clearance**, RM3.75 versus RM5, ending 9:15 pm.
3. Advanced **that same workspace** by 40 minutes through `/demo/admin`, without reseeding it. The offer became ended and customer Offers showed **No matching stalls**. Weather also became stale and conservatively shortened windows; this is a fail-closed demonstration, not a measurement of real food safety. Separately, the new expired scenario's engine path passed its software test.
4. **fresh** → voice scripted sample. Observed the Malaysia preparation-date/AM-PM clarification and disabled save. Reviewed menu ingredients, explicitly selected fictional cooking-now at 8:30 pm, checked date and exact-action confirmation, then saved. No microphone, speech model or LLM request was made.
5. Batch audit showed Chicken satay **Batch 3**, preparation/upload 8:30 pm, 20 portions, advisory 9:00 pm; earlier **Batch 1** remained preparation 8:25 pm/upload 8:27 pm and advisory 8:55 pm. Comparison was within the same workspace. Later scene resets deliberately replace that fixture.
6. **missing-handling** selected `satay-batch-1`: needs-information, 25 displayed advisory minutes but eligibility blocked, preparation/ambient confirmation required, publication disabled.
7. Evaluation showed **Not measured**, with no human recordings or paired results. Returned the isolated fixture to fresh and closed the temporary test tab.

[Studio screenshot](screenshots/cp9-showcase-pack.png) · [Customer offer screen](screenshots/cp9-customer-offer.png) · [Expired offers](screenshots/cp9-expired-offers.png) · [Independent batches](screenshots/cp9-independent-batches.png).

This was a technical sequence, not a timed five-minute student delivery or full recorded video. Screenshots and the existing eight-second diagram animations are not the complete backup recording.

## Remaining CP9 requirements

- [ ] **C15-08:** actual participating-student English narration/presentation video, readable captions and observed duration reviewed against official rules.
- [ ] **C15-09:** owner/student confirmation of any prior SantanSafe version and evidence-backed advancement declaration; no-prior-version is also unconfirmed.
- [ ] **C15-10:** verified competition TRL definition and reviewed evidence assessment; no level assigned from code/test counts.
- [ ] **C15-11:** actual team/student eligibility and academic-supervision evidence.
- [ ] **C15-12:** actual participating-student live rehearsal on the intended device plus a complete reviewed backup recording and observed playback.

Additional dependencies: official rules/name/link; CP7 actual user/performance/cost evidence for measured claims; CP8 consented real history if claiming forecast performance; supplied-image generator/date/public-use rights before future publication. No extra images or API keys are required for the preparation pack. The optional input question remains pending; missing answers were not treated as confirmations.
