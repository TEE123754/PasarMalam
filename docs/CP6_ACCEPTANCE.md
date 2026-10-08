# CP6 acceptance — community and impact

Completed locally on 8 October 2026. Deployment remains held. Requirements closed: C09-03, C09-05, C09-12, C10-01, C13-03, C13-05 and C13-06.

## Delivered

- Review-specific hawker replies enforce ownership and published parents, retain edit/moderation history, require moderator publication and support confidential abuse reports. Editing returns a reply to pending; a hidden parent removes it from the public projection.
- Dedicated spoiled-food, pests, cross-contamination and unhygienic-handling categories preserve legacy categories and existing verified-account, rate-limit and triage guards. Full request fingerprints prevent a changed category from bypassing retry conflict checks.
- Authorised moderators/assigned organisers can generate, edit and retain private complaint drafts. Explicit provider consent shares only enumerated category, status and count; raw report text, identities, evidence, coordinates and source IDs never enter the prompt. A template works without consent or on provider failure. Saving a reviewed draft does not publish, flag or refer a complaint.
- Opt-in stall views and offer engagement deduplicate by account, browser session, target and server 15-minute bucket. Active users mean distinct consenting accounts per market/day/event type. Confirmed batch declarations produce a separate deduplicated posting event; owner/admin reports expose first server confirmation and upload-to-confirmation delay. This measures ingestion, not actual human listing speed. Fictional events remain labelled separately.
- Impact reports use closed, reconciled stall sessions by Malaysia preparation date. Leftovers per 100 use known positive prepared quantities and final closing leftovers; missing/incomplete sessions stay excluded. Baseline/trial comparison requires the same market and equal-length non-overlapping periods with usable denominators.
- Food-specific weighed portion samples support quantity-based estimates only within 30 days before a movement. Actually weighed completed routes require matching food, route, portions and source; each source is counted once. Method, sample date/count and declared uncertainty accompany results. Human-consumption and waste routes remain separate.
- Browser/API/SQL scope follows owned stalls and assigned markets. Organiser outputs contain market/date cohorts, not individual stall or source records. Cohorts below five qualifying stalls, engagement below five accounts and concerns below five reporters are suppressed before RPC output. Weight groups need five stalls independently. Report counts remain unverified allegations.

## Phase-end evidence

| Gate | Result |
|---|---|
| Selected frontend tests | 47 distinct passed: CP6 impact/community/accounting |
| Backend tests | 25 distinct passed: nine CP6 units, three mocked provider cases, eight existing community cases and five connected CP6 journeys |
| Connected journeys | Reply ownership/history/public-parent rules; confidential drafts/category retries; consent/dedup/private permissions; measured versus estimated weights; five-stall organiser aggregates |
| Static build | Frontend lint/type/build and backend Ruff passed; built-client credential scan passed |
| Database | Three additive CP6 migrations, 34 total; private RLS/table/function permissions checked; fixture cleanup retained 33 stalls / 96 foods |
| Contracts | FastAPI OpenAPI/browser contract refreshed |

The five-stall connected fixture produced 100 prepared portions, 50 closing leftovers and 50 leftovers per 100. Fifty donated portions estimated from food-specific samples totalled 10 kg. These are disposable test figures, not measured community impact. A separate completed-route case distinguished a 2 kg estimate from 1.9 kg actually entered as weighed.

The first connected reply-moderation check exposed an ambiguous SQL actor reference. It was repaired in a second additive migration and that journey rerun successfully. Aggregate privacy/weights were strengthened in a third additive migration; affected cases alone were rerun. The weight journey also verifies that unconfirmed declarations do not create a posting event and repeated confirmed declarations create exactly one. Applied migrations were not rewritten, and repeated runs are not added to the counts above.

Browser evidence covers fictional reply → moderator publication, editable private summary → reviewed private save, date/market reports and filtered organiser CSV suppression. [Community screenshot](screenshots/cp6-community-tools.png), [organiser report](screenshots/cp6-impact.png), [downloaded organiser sessions](cp6-impact-sessions.csv).

## Reproduce and boundaries

Use the guarded disposable configuration in `apps/api/.env`, with the running local API. Run `uv run --project apps/api python scripts/cp6_gate.py` once at the phase gate, and `npm run test --workspace apps/web -- src/impact/model.test.ts src/community/model.test.ts src/accounting/model.test.ts` for the selected frontend set. The database marker and matching demo project are mandatory; fixtures clean up their own records.

The provider privacy/failure adapter was tested with mocked HTTP, not a paid live inference or a human quality benchmark. The existing Morpheus key/model route is reused; no new key is required. Samples and uncertainty are hawker-entered measurements, not independent instrument calibration or proof of diversion. There is no actual pilot/baseline effect, causal improvement or verified hygiene judgement. Broad Supabase advisor access is unavailable in this session; targeted SQL permissions and connected role-rejection checks provide the recorded local evidence, not a full platform audit.

**CP6 local jobs left: zero. Next: CP7 human/device evaluation.** Existing CP1 privacy review, CP3 recorded speech evaluation, CP4 expert food rules/cumulative exposure and later partner/native jobs retain their unchecked status. Deployment stays last and on hold.
