# Demo privacy and data map

Updated: 1 October 2026. Phase 2 introduces connected identity and protected records. All seeded identities, reviews, organisations and reports are fictional. Real personal-data processing/pilot use requires a documented Malaysia PDPA review, provider and cross-border assessment, operational rights handling and approved retention decisions. This document is an engineering plan, not a legal compliance claim.

Official reference: [Malaysia Personal Data Protection Commissioner](https://www.pdp.gov.my/). Review the applicable current Act, amendments and guidance with the pilot owner before collecting real records.

## Notices shown to demo testers

**English:** “This is a fictional PasarMalam demo. Use only your provided test account and synthetic content. Location and microphone access are optional. Your account and permitted records are held in the configured Supabase demo project. Voice recording is not active. Optional location is processed on this device for up to two hours; geographic queries send only an approximate area and do not save shopper location. Contact the demo organiser to access, correct or remove test records.”

**Bahasa Melayu:** “Ini ialah demo PasarMalam rekaan. Gunakan akaun ujian yang disediakan dan kandungan rekaan sahaja. Akses lokasi dan mikrofon ialah pilihan. Akaun dan rekod yang dibenarkan disimpan dalam projek demo Supabase yang dikonfigurasi. Rakaman suara belum aktif. Lokasi pilihan diproses pada peranti sehingga dua jam; pertanyaan geografi hanya menghantar kawasan anggaran dan tidak menyimpan lokasi pembeli. Hubungi penganjur demo untuk mengakses, membetulkan atau memadam rekod ujian.”

## Data boundaries and intended retention

| Data | Current behavior / access | Retention and later work |
| --- | --- | --- |
| Auth email, password, refresh token | Supabase Auth; five `.invalid` seeded accounts; public registration disabled locally. Password only sent to Auth, never to PasarMalam API/logs. | Operator-managed test accounts. Frontend sessions are memory-only, auto-refresh and clear on successful sign-out; reload requires sign-in. API rejects expired access JWTs. Provider revocation/TTL must be reviewed for the pilot. |
| Profile and trusted role | Owner/admin read. Clients cannot change verified status, roles or memberships. Account metadata is not a role source. | Retained for the disposable demo lifetime. Seed reuse preserves the Auth binding. Real account erasure requires review of retained audit obligations. |
| Public market/stall/menu/review | Explicit public projections omit owner/reporter/private evidence. Reviews submitted by clients are pending. | Synthetic records until demo reset/retirement. Later moderation defines publication, correction and removal workflows. |
| Microphone choice | Phase 1 local preference only; no device permission request or audio upload. | Consent at recording time in Phase 6; refusal keeps chips/manual entry available. |
| Raw voice | No voice table or audio bucket; current app never records voice. | Phase 6: browser transcription, delete raw buffers immediately on finish/cancel/failure, no raw audio sent to API or Storage. Verify deletion in the Phase 6 gate. |
| Transcript/extraction fields | Schema supports owner-only transcript/extraction rows; direct writes are unavailable. | Phase 6 target: retain confirmed transcript and extraction provenance for 30 days, with a verified deletion job and documented exceptions. Synthetic/redacted inputs only for any external LLM. |
| Shopper location | Phase 3: explicit location button requests GPS; exact position stays only in memory. API receives a two-decimal-degree coarse query origin and persists no shopper coordinates. | Device position automatically clears after two hours; no server location record needs deletion. Manual market selection always works. Location never enters public payloads. |
| Complaint and evidence | Verified reporter/admin only; three reports/hour RPC cap. Organiser inbox exposes a generic report summary, excluding original body/identity/evidence. Private evidence and certificate buckets; no public-read policy. | Phase 7 retention target: review deletion 90 days after closure. No automated deletion job is claimed yet. Evidence immutable to browser clients; rights/moderated deletion must use operator processes. |
| Certificate | Uploader/admin read in private bucket; hawker declaration distinct from certification metadata. | Later verification/expiry/retention workflow; no religion or ethnicity inference. |
| Partner, agency, payment, ledger | Organisation/owner/stall-scoped read-only foundations; all records `is_demo=true`. No arbitrary outbound callback URL or external messaging adapter. | Simulated journeys in Phases 8–10. Authority case has redacted summary fields, never the original reporter/evidence by public projection. |
| Push subscription | Owner/admin-only table; no subscription capture or dispatch in Phase 2. | Phase 10 opt-in test devices, unsubscribe/revocation/expiry handling; endpoints must never enter public realtime events. |
| Operator keys / DB URL | Ignored `apps/api/.env` only; no request handler uses a secret/service key. | Operator local handling; never commit, send to browser, print, or include in seed outputs. |

## Rights and real-pilot readiness

Demo testers contact the organiser through the pilot's agreed channel; no real contact directory is invented here. An operator verifies the account, exports only its permitted records, corrects requested profile fields, and handles deletion through a reviewed scoped procedure. The current guarded reset refuses existing batches/reports and preserves Auth accounts and audit history. It is not a user-erasure endpoint.

Before a real pilot, approve notices in BM/English, controller/processor responsibilities, provider location/terms, cross-border transfers, security/incident procedures, access/correction/withdrawal/deletion requests, and actual retention jobs. Optional location/voice consent must not block basic discovery or manual listings. No documents, complaints or voice samples from real people should be placed into fixtures or public screenshots.
