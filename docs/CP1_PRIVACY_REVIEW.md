# CP1 privacy notice and owner review

Draft · 8 October 2026 · Fictional local/demo workflows only. This document is not legal approval or a claim of compliance with Malaysia's PDPA.

The owner must review this notice, identify the accountable operator/contact and approve provider arrangements before collecting real participant, pilot, business-owner or customer data. Public registration remains disabled in the current disposable project. Do not send invitations to real people as part of automated testing.

## Data and visibility

| Data | Purpose and visibility | Retention/removal |
| --- | --- | --- |
| Email, Auth credentials, display name, locale | Supabase Auth and protected account profile; email/password never enter public discovery | Account lifecycle; owner must define deletion/export process and applicable retention before a real pilot |
| Stall description | Hawker's public description, separate from specialty; maximum 1,000 characters | Editable/removable by authorised hawker; avoid personal contact/identity information in free text |
| Pork-free, alcohol-free, Muslim-owned statements | Explicit optional business declarations, publicly visible; unknown is the default. Muslim-owned may disclose sensitive information and must be voluntary | Set a declaration back to unknown to remove it publicly. Private audit history remains; the owner must approve purpose, access and retention before real collection |
| Allergen statement | Hawker-confirmed selected allergens, unknown or possible cross-contact, server recording time | Editable/withdrawable; ingredient changes clear confirmation automatically. Private previous statements remain audited; no numerical retention for this new audit is implemented |
| Confirmation acceptance | Private user ID, notice version and timestamp supporting onboarding | Stored with account and deleted by account cascade; a real retention policy needs review |
| Audio and transcripts | Audio stays in browser memory and is cleared after transcription/cancel/failure. Only redacted text goes to Morpheus after separate extraction consent | Existing connected confirmed-transcript retention is up to 30 days; local demo text stays on the device until reset. This does not establish the provider's own retention policy |
| Shopper location | Optional coarse location for discovery/alerts | Existing consent and revocation controls apply; no location requirement for registration |

Public allergen timestamps identify when a statement was recorded, not a laboratory result or a guaranteed absence of allergens. An empty confirmed list says “No allergens listed — this is not an allergen-free claim.” The selected list is not exhaustive and cross-contact is never inferred absent. Self-declarations cannot create reviewed halal certification.

## Review checklist before real collection

- [ ] Identify the real operator, contact, privacy inquiry/deletion channel and applicable data-controller responsibilities.
- [ ] Review PDPA obligations with a qualified reviewer, including sensitive/voluntary ownership declarations and participant consent.
- [ ] Approve Supabase and Morpheus processing, locations, retention and transfer arrangements; publish accurate provider notices.
- [ ] Define and implement bounded retention for private listing statement/audit and consent records, with a tested deletion/export process. CP1 intentionally does not invent an approved retention period.
- [ ] Review BM/English language and low-literacy consent presentation with consenting participants.
- [ ] Decide invite-based onboarding versus public self-registration on an approved isolated target; configure verified email, redirect URLs and invitation templates there.
- [ ] Approve account/vendor/organiser admission and removal procedures; keep privileged role grants server-controlled.

The UI has a short BM/English registration notice and separate AI consent. This draft alone does not close the human privacy-review acceptance item.
