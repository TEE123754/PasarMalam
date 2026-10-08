# CP10 — private partner and expansion review pack

8 October 2026. Local preparation only. No real agreement, endorsement, permit, referral or collection is established by this pack. Deployment remains held.

## Tools and local commands

Uses existing Python/Pydantic validation and JSON files. No new service, key, paid call, database migration or network transport. The existing React/FastAPI/Supabase partner workflows remain explicitly simulated.

From the repository root:

```powershell
$env:UV_CACHE_DIR='.uv-cache'
uv run --project apps/api python scripts/cp10_prepare.py
uv run --project apps/api python scripts/cp10_prepare.py --review
```

Six private templates live in `.local-evaluation/cp10/`, excluded from Git. Repeated preparation preserves existing files. Review prints missing field names, never agreement contents or validation inputs. Store documents privately; JSON should contain short document references, not credentials, complainant identities or original complaint evidence. JSON dates require an explicit timezone, for example `2026-10-08T14:00:00+08:00`.

## Owner handoff, phase by phase

1. **Identify and agree.** Select a real organisation and responsible owner. Obtain its confirmed identity, written permitted scope, reviewer, agreement/source references, review date and expiry. Leave `fictional: true` until the references represent real evidence; this flag is a declaration, not independent verification. Withdrawn permission sets `revoked: true`.
2. **Review the channel-specific brief below.** Tick only genuinely approved checks. Agree sample payloads and privacy scope before implementing any provider-specific adapter. Do not invent an API URL from a company or agency name.
3. **Validate offline.** Run `--review`. Fix invalid files and missing references. `references_ready_for_human_review` means the declared checklist is filled; it never means approved, certified or externally active. The tool does not open referenced files or authenticate documents.
4. **Human acceptance.** Inspect original agreements, source authenticity, sample data and adapter test results. Record decisions and disagreement handling privately. Review PDPA/privacy requirements with the responsible reviewer before collecting real participant data.
5. **Separately authorise a real integration test.** Specify target, permitted data, credentials, recipient, action and expected receipt. Keep the current simulator until a supported channel and approved implementation exist. Real complaint transmission, outreach and publication require their own explicit action. Do not send anything merely because the checklist is filled.

## Six review briefs

| File / requirement | Material to obtain | Review checks and limits |
|---|---|---|
| `media.json` / C11-01 | Food creator/media contact, agreement, approved editorial content and image/publication rights | `editorial_scope`, `publication_rights`. Draft proposal: market discovery and verified stall stories; owner supplies coverage scope, correction process, deliverables and approved dates. No implied Foodie affiliation. |
| `badge.json` / C11-02 | Approved identity and exact badge wording, evidence, validity and withdrawal contact | `approved_wording`, `revocation_procedure`, `commercial_disclosure`. Editorial recognition is separate from paid sponsorship. Expiry/revocation must remove a real badge; buying placement cannot create an endorsement. |
| `authority.json` / C11-03 | Confirmed intake destination/procedure, authorised reviewer, redaction and consent process | `intake_procedure`, `redaction_review`, `consent_procedure`. Start with a reviewed draft/export when no sanctioned API exists. Only explicitly approved fields from `case_reference`, `market_reference`, `stall_reference`, `reviewed_summary` are supported. No reporter identity, original evidence or private source linkage. Moderator review must remove identifiers from free text; a field allowlist cannot guarantee anonymisation. |
| `permit.json` / C11-05 | Council source or agreed manual verification, licence scope/reference, current status, source date and validity | `authoritative_source`, `manual_verification`, `dispute_procedure`. Record contradictory claims for review; do not silently replace official evidence. Demo references are never licences or halal certificates. |
| `collection.json` / C11-06 | Named collector, accepted material, pickup conditions, custody/receipt protocol, quantity and weight provenance | `chain_of_custody`, `receipt_procedure`, `non_consumption_separation`. Donation retains deterministic eligibility and fulfilment buffer; expired material goes only through labelled non-consumption routes. A receipt needs a stable external ID, route, batch, units, collection time, destination and measured-weight source. Duplicate receipt IDs must consume stock/count weight once. |
| `expansion.json` / C11-07 | Verified market location/schedule, organiser permission, stall onboarding and reviewed pilot | `verified_schedule`, `organiser_approval`, `stall_onboarding`, `pilot_review`. Handoff proposal: one market, 10 consenting stalls, four weeks; measure actual stall-night RM and weighed diversion with provenance. Verify facts before adding real locations. Fictional pins do not prove rollout. |

For every channel, obtain an approved sample reference and the corresponding adapter-test evidence reference. Generic template completion cannot substitute for a provider-specific contract test.

## Adapter acceptance before real activation

- Reject extra fields, identifiers outside approved scope, unverified sources, expired/revoked permissions and unsupported routes. Restrict credentials to the agreed provider and permissions; never expose them in browser files.
- Confirm supported timeout/error semantics. Ambiguous results retain the same idempotency key; reconcile before retrying. Do not automatically resend a real complaint or publish content.
- Check stable acknowledgement and receipt IDs, duplicate/out-of-order callbacks, foreign-organisation denial, stock holds, measured versus estimated weight, and safety-cutoff changes.
- Confirm exact public wording and source provenance. Keep pending/unverified statuses visible. Test withdrawal, correction, source disagreement and data-retention rules.
- Existing simulated tests prove local behaviour only. Test real responses only with separately approved provider scope; no production outreach is part of CP10 preparation.

The offline `authority_draft` helper enforces reviewed content, explicit consent and exact approved field names, returning `DRAFT ONLY; NOT SENT`. It does not detect every identifier in prose, verify consent evidence, or file a complaint. There is deliberately no network sender or activation toggle in this phase.
