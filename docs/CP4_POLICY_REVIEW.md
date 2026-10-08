# CP4 — food-policy review package

Version CP4_REVIEW_PACKAGE_V1 · 8 October 2026 · **Pending qualified human review**.

This is a reviewable engineering package, not food-handling advice or approval. The existing [DEMO_ADVISORY_V2](../contracts/advisory-policy.json) remains synthetic demo policy. No reviewer or approved thresholds are invented. [Machine-readable review state](../contracts/cp4-policy-review.json).

## Current behaviour and provenance

The existing demonstration rules take recorded preparation time, hawker-confirmed ingredients/ambient handling and weather snapshots. Their numeric caps are product demonstration values, not validated food-consumption limits. Unknown ingredients/weather shorten the demonstration window. No safe badge is shown.

Manual measured temperatures are stored with original unit/value, method, effective time, server recording time, source, actor and optional correction reference. °F converts to °C for display only; weather remains a separate ambient input. Input bounds (-100 to 300 °C equivalent) reject implausible software inputs; they are not food-safety thresholds or proof an instrument was calibrated.

Each storage transition is append-only. Any transition, including unknown storage or a return to ambient, sets CP4_REVIEW_REQUIRED and blocks clearance. Preparation time and any existing deadline remain unchanged or shorten under the original demo engine. Recording or correcting a measurement never grants clearance or extends a timer. Existing active offers are withdrawn, and normal downstream notification/reservation checks continue to apply.

Public passports expose published batch/stall context, immutable preparation/upload timestamps, earlier correction, current server status, advisory deadline, quantity and counts. They do not expose notes, recorder IDs, methods, individual temperature readings or complaints. Closed/expired passports remain readable without recreating a listing. Unknown/unpublished context returns unavailable. Reads have no inventory/promotion writes.

## Required review inputs

A qualified food-safety reviewer should supply their name/qualification, review date, source documents, exact supported foods/handling modes and limitations. Obtain permission before retaining reviewer details. Engineering cannot approve the policy by setting a browser flag.

Review and specify:

1. Food/ingredient risk classes and handling measurements required for each class, with authoritative provenance.
2. Whether and how cumulative exposure applies to ambient, chilled, hot-held and unknown transitions; define the interval accounting and uncertainty treatment.
3. Missing observations, instrument uncertainty, inconsistent measurements, unknown transition history and backdated reports. Distinguish effective time from recorded time.
4. Earlier preparation corrections, merges, reheating and newly claimed batches. No change to an existing batch may erase earlier exposure or extend its established deadline.
5. Market closing/collection buffers, expired batches, promotion withdrawal and reservation rechecks.
6. Privacy/public presentation and wording that communicates an advisory rather than certification.

## Acceptance vectors to complete with the reviewer

| Case | Current engineering behaviour | Reviewed expected value |
| --- | --- | --- |
| Confirmed ambient demo, complete inputs | Existing synthetic decision | Pending |
| Ambient → chilled → ambient | Blocked; cumulative value unavailable | Pending |
| Ambient → hot-held / reheated | Blocked; no timer reset | Pending |
| Unknown initial/middle history | Blocked; missing data remains unknown | Pending |
| Conflicting measurement at same time | Both originals retained; no eligibility gain | Pending |
| Late record with earlier effective time | Retained if within preparation–now; no extension | Pending |
| Invalid / future / pre-preparation input | Rejected atomically | Required rejection |
| Earlier-time correction / merged stock | Preserve original audit and earliest deadline | Pending policy detail |
| Expired / discarded / recalled batch | Closed passport; no reactivation by scan | Required closure |

When reviewed rules arrive, add a versioned additive migration and shared deterministic vectors, implement reviewed interval accounting in SQL and TypeScript, and compare both outputs. Persist reviewer-approved rule version, intervals, excluded data, uncertainty, prior deadline and final decision in the audit. Until then `cumulative_exposure` stays null and the combined `C07-01` / `C07-13` requirements remain unchecked.

## Local QR use

The QR uses the currently approved frontend origin and only a public route/batch ID. `127.0.0.1` on a phone points to that phone. Same-computer testing is supported now. A phone requires an explicitly approved trusted local origin reachable from it; no LAN exposure, certificate bypass or public publishing is enabled by this phase. Deployment remains held.
