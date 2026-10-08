# CP7 preparation gate — human acceptance pending

8 October 2026. The user selected **prepare the recording and measurement pack first**. Local collection/scoring preparation is complete. CP7 itself is **not complete**: its seven requirements need actual recordings, participants, devices and cost/usage evidence. Overall feature counts stay **121 checked / 30 open**. Deployment remains held.

## Prepared

- Expanded independent collection contract: 24 cases, 10 BM / 10 Manglish / four English, five planned anonymous speakers, bundle prices, dish/batch references, explicit unknowns and five planned market-noise cases. Planned speakers/noise are not actual participant evidence.
- Private ignored `.local-evaluation/cp7` manifest and empty measurement files; receipt/audio/hash/annotation checks and a frozen manifest lock before inference. The template cannot freeze without actual complete inputs.
- Offline Python scorer for transcript WER, annotated critical fields, finite JSON-object validity, correction/clarification rates, failures and unsupported cases. Full-set field denominators prevent omitted failed clips inflating accuracy; transcript WER denominators remain separately visible.
- Paired warm live voice/typing validation by speaker, task, device, network and observed order; excludes supplied-file voice, cold downloads, incomplete/mismatched lanes and unconfirmed results. Observer timing is used for expanded IDs; legacy automatic timers still use their original contract.
- Request latency, retry/failure, token and billing-evidence records; all-attempt cost per distinct confirmed update stays unknown when any cost is unknown. No paid provider call or fabricated zero cost.
- Interview, trial and device templates, predeclared evaluation targets and [complete measurement guide](CP7_MEASUREMENT_GUIDE.md). The Evaluation page provides an actual CP7 pack download while retaining its **Not measured** status.

## Phase-end software gate

| Check | Evidence |
| --- | --- |
| Scorer tests | 15 distinct passed; synthetic unit fixtures only |
| Existing frontend timing guards | Six passed |
| Frontend | Lint/types/production build passed |
| Python | Ruff passed |
| Credentials | Built-client and upload-candidate scans passed |
| Browser | CP7 panel, unmeasured status and download verified; downloaded contract matches repository content |

Two file-integrity cases initially could not use Windows' default pytest temporary directory. Only those two were rerun in a fresh ignored workspace directory and passed. This was a local temporary-directory limitation, not a participant or model result. Counts do not add repeated runs. No database migration, reseed or deployment occurred.

Reproduce the scorer gate with `uv run --project apps/api python -m pytest apps/api/tests/test_cp7_measure.py -q --basetemp .local-acceptance/cp7-fresh-test-dir`; choose a **new nonexistent directory** each run because pytest owns its temporary directory. Frontend: `npm run test --workspace apps/web -- src/voice/timing.test.ts`. [Browser screenshot](screenshots/cp7-recording-pack.png).

## Still required

- Actual consenting hawker/customer interviews and documented user trial findings.
- At least five consenting speakers and 24 independently recorded/verified holdout clips, including actual labelled accents/noise; freeze before model tuning/inference.
- Actual transcription/extraction and unsupported/failure results, paired live tasks with correction/confirmation, request timing/usage and dated billing/free-allowance evidence.
- A target phone model/OS/browser and supervised user-granted microphone/push permissions; actual notification appearance/click, disconnected reload/unvisited route, install/update and low-cost phone journeys.
- An anonymised evidence report reviewed against the predeclared targets and provenance. Software checks alone do not close C14-01/02/03/04/05/08 or C15-06.

Next user action: follow the recording/measurement guide and provide the private local folder path when ready, plus the target phone details. No additional image or API key is needed for this preparation. Original CP1/CP3/CP4 and later partner/native human/external requirements remain open.
