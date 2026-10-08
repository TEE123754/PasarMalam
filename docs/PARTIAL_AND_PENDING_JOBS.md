# PasarMalam — all partial and pending requirements

Reviewed **9 October 2026** against the consolidated checklist and recorded acceptance. This inventory lists every one of the **27 unchecked items** from the [consolidated checklist](CONSOLIDATED_FEATURES_CHECKLIST.md), preserving its wording and status explanation. The current **124 checked items** include three listing requirements closed by CP1, seven discovery requirements by CP2, three voice requirements by CP3, three passport/recording requirements by CP4, four clearance/accounting requirements by CP5 and seven community/impact requirements by CP6, plus three photo/fallback requirements by CP8.

IDs count every checkbox in the original section: `C05-04` is section 5, item 4. Every open requirement has exactly one primary completion phase in the [phase-by-phase plan](COMPLETION_IMPLEMENTATION_PLAN.md). Dependencies and acceptance conditions are in that plan. CP1 code and its focused gate are complete; registration-policy and human acceptance remain pending. CP3 code and gate are complete; see [CP3 evidence](CP3_ACCEPTANCE.md). See [CP1 evidence](CP1_ACCEPTANCE.md) and [CP2 evidence](CP2_ACCEPTANCE.md).

**Partial** means another required feature part remains. **Missing/demo preview** means coding or an actual adapter is needed. **Unverified/human/external/roadmap** means evidence, people, hardware, agreements or real activation is still required. More code cannot substitute for those inputs.

## Completion phases and counts

| Phase | Work | Open items now |
| --- | --- | ---: |
| CP1 | Registration acceptance; listing code complete | 1 |
| CP2 | Complete locally — see CP2 acceptance | 0 |
| CP3 | Code complete; held-out expression acceptance pending | 1 |
| CP4 | Recording/passports complete; reviewed policy/accounting pending | 2 |
| CP5 | Complete locally — clearance decisions and accounting | 0 |
| CP6 | Complete locally — community and impact | 0 |
| CP7 | Collection/scoring pack ready; human/device evidence pending | 7 |
| CP8 | Local photo/planning complete; real acceptance pending | 4 |
| CP9 | Preparation complete; actual student/rules/video pending | 5 |
| CP10 | Real partner/data agreements and expansion readiness | 6 |
| CP11 | Dedicated Android/iOS local builds | 1 |
| **Total** | | **27** |
| CP12 | Deployment: final phase, on hold | Separate |

## 1. User Accounts & App Modes

- [ ] **C01-03 · CP1** — **P0:** Registration, login, profile management, and switching between modes. — **CP1 acceptance pending:** invitation/confirmation handling and customer-only admission are coded and tested; public signup is disabled pending owner policy, actual email/password journey and human privacy review.
- [ ] **C01-07 · CP11** — **P2:** Dedicated Android and iOS apps. — **Partial — CP11 source preparation complete:** Capacitor Android/iOS projects and isolated fictional bundle are delivered; recorded software checks passed. APK/iOS compilation, physical-device acceptance and connected native setup remain pending; device testing was skipped at the owner's request. [Evidence](CP11_ACCEPTANCE.md).

## 2. Market Discovery & Maps

All seven CP2 gaps are closed locally; see [acceptance](CP2_ACCEPTANCE.md).


## 3. Search, Categories & Filters


## 4. Hawker Stall & Food Listings

No open section 4 requirements. CP1 closed dedicated description (`C04-01`) and allergen statements (`C04-09`).


## 5. Malaysian Multilingual AI & Audio Updates

- [ ] **C05-05 · CP3** — **CP3 code complete; human acceptance pending:** deterministic remaining-stock phrases and explicit bundle clarification are implemented; ambiguous kuali kedua is blocked instead of resetting a timer. Held-out consenting BM/Manglish recordings and expression accuracy remain unmeasured for CP7.



## 6. SantanSafe Batch Tracking

No open section 6 requirements. CP4 added passports and append-only handling history.


## 7. Food Holding-Time Monitoring & Alerts

- [ ] **C07-01 · CP4** — **P0:** Use documented, reviewed food-safety rules for holding-time actions. — **Human review required:** the CP4 review package documents provenance, cases and gates; current rules remain synthetic-demo-only, without qualified approval.
- [ ] **C07-13 · CP4** — **P1:** Track cumulative exposure where required by the reviewed policy. — **Review-dependent implementation pending:** transitions, restore and merge are blocked; cumulative exposure stays unavailable until approved rules and parity vectors are supplied.

## 8. Promotions & Food Waste Reduction


## 9. Reviews, Complaints & Community Trust


## 10. Revenue & Hawker Analytics


## 11. Partnerships & Future Integrations

- [ ] **C11-01 · CP10** — **P2:** Collaborate with Foodie platforms and local food creators. — **External action pending:** fictional media/supplier collaboration workflow exists; no agreement or integration with a real Foodie platform/creator.
- [ ] **C11-02 · CP10** — **P2:** Verified partner features and “Featured on Foodie” badges. — **External verification pending:** fictional approved editorial badges/trails exist; no genuine Foodie endorsement or verified real partner.
- [ ] **C11-03 · CP10** — **P2:** Complaint referral to KKM/BKKM and municipal authorities through agreed processes. — **External action pending:** consent/redaction/referral/officer-resolution simulation exists; no agreed KKM/BKKM/municipal submission adapter or real referral.
- [ ] **C11-05 · CP10** — **P2:** Stall permit/licensing information where authoritative data is available. — **External data pending:** fictional permits/renewals/dietary evidence exist; no authoritative licensing feed.
- [ ] **C11-06 · CP10** — **P2:** Organic waste collection and composting partnerships. — **External agreement pending:** donation/compost/BSF pickup and stock/weight/receipt simulations exist; no collection partnership activated.
- [ ] **C11-07 · CP10** — **P2:** Expand from initial KL/Selangor markets to more Malaysian locations. — **Roadmap:** editable market coordinates and fictional catalog, not evidence of actual geographical rollout.

## 12. AI Demand & Leftover Forecasting

- [ ] **C12-01 · CP8** — **P1:** Predict demand and likely unsold quantities using recorded batch and sales history. — CP8 code complete; real acceptance pending: owned reconciled history, censoring and unsold estimate exist; actual consented history/validation still needed. [Evidence](CP8_ACCEPTANCE.md).
- [ ] **C12-04 · CP8** — **P1:** Show prediction uncertainty. — CP8 code complete; real coverage pending: separate calibration residual interval and holdout coverage implemented. Synthetic coverage 6/8; no real calibration claim. [Evidence](CP8_ACCEPTANCE.md).
- [ ] **C12-05 · CP8** — **P1:** Compare forecasting performance against a historical-average baseline. — CP8 code complete; real comparison pending: chronological mean/median/trend errors and baseline fallback implemented; actual consented holdout still needed. [Evidence](CP8_ACCEPTANCE.md).


## 13. Impact Dashboard & Measurement


## 14. AI Validation & Technical Evidence

- [ ] **C14-01 · CP7** — **P0:** Interview hawkers and customers to validate the problem and workflow. — **Human action pending:** no interview evidence supplied.
- [ ] **C14-02 · CP7** — **P0:** Conduct a documented user trial and report participant numbers and limitations. — **Human action pending:** no documented real user trial or participant results supplied.
- [ ] **C14-03 · CP7** — **P0:** Create a held-out voice test set covering Malay, English, mixed speech, accents, and market noise. — **Human data pending:** 24 labelled scripts and a recording guide exist; no held-out consented accent/noise recordings.
- [ ] **C14-04 · CP7** — **P0:** Measure extraction accuracy for prices, quantities, preparation times, and batch references. — **Unmeasured:** evaluation tooling exists; no human price/quantity/time/batch-reference accuracy results.
- [ ] **C14-05 · CP7** — **P0:** Compare manual entry against voice-assisted entry for speed, errors, and corrections. — **Unmeasured:** paired live timing/corrections tooling exists; no consenting participant measurements.
- [ ] **C14-08 · CP7** — **P0:** Measure response time, failed requests, and AI cost per successful update. — **Partial:** technical smoke duration and bounded request/failure handling exist; no complete per-success latency/failure/cost measurement report.
- [ ] **C14-11 · CP8** — **P1:** Benchmark forecasting performance if the forecasting module is included. — CP8 synthetic benchmark complete; real benchmark pending. Frozen partitions, all errors, exclusions and actual coverage exported; no consented real benchmark. [Evidence](CP8_ACCEPTANCE.md).

## 15. Competition Demonstration & Readiness

- [ ] **C15-06 · CP7** — **P0:** Present measured AI performance, user feedback, and operating costs. — **Human evidence pending:** accuracy, participant feedback and operating-cost report are incomplete.
- [ ] **C15-08 · CP9** — **P0:** Prepare an English video narrated or presented by a participating student. — CP9 preparation complete: English storyboard/captions and recording guide exist; actual student-narrated full video remains pending. [Evidence](CP9_ACCEPTANCE.md).
- [ ] **C15-09 · CP9** — **P0:** Declare any previous SantanSafe version and explain the implemented advancement. — CP9 conditional declarations prepared; actual prior-version/no-prior-version confirmation and reviewed advancement evidence remain pending. [Evidence](CP9_ACCEPTANCE.md).
- [ ] **C15-10 · CP9** — **P0:** Document evidence supporting the required TRL 4 or above. — CP9 technical evidence/reviewer matrix prepared; official definition and reviewed TRL assessment remain pending. No level assigned. [Evidence](CP9_ACCEPTANCE.md).
- [ ] **C15-11 · CP9** — **P0:** Confirm team eligibility and academic supervision. — CP9 private review template prepared; actual student/team/supervisor evidence remains pending. [Evidence](CP9_ACCEPTANCE.md).
- [ ] **C15-12 · CP9** — **P1:** Prepare a live showcase with a resettable demonstration and backup recording. — CP9 reset controls and desktop technical rehearsal passed; actual student intended-device rehearsal and full reviewed backup recording remain pending. [Evidence](CP9_ACCEPTANCE.md).

## Additional acceptance still open on implemented features

These are already-qualified checked features or release inputs, **not additional items in the 27-item open total**.

- **A01 — CP7:** actual displayed Web Push receipt/click on a consenting supported browser. SQL/transport implementation is verified; device receipt is not.
- **A02 — CP7:** successful network-disconnected reload and an unvisited lazy route. The controlling worker now acknowledges ready; that is not an actual offline reload.
- **A03 — CP7:** physical cheap-phone microphone/model-memory, installation, accessibility, BM/English, slow network and full touch journeys.
- **A04 — CP9:** generator/model/date and public-use rights for the 12 already-integrated images. No more image generation is requested.
- **A05 — CP1/CP4/CP7:** human privacy/provider/retention and real-food/pilot policy review before real participant/business activation. Reviewed food rules also appear as C07-01; do not double-count them.

## Inputs to prepare

- Consenting hawkers/customers, recordings and real task timings; follow the [voice recording guide](VOICE_RECORDING_GUIDE.md), updated corpus contract and private anonymous participant IDs.
- Target phone/browser and qualified human food/handling reviewer. Current database/AI settings are already configured privately.
- Official competition instructions, actual student/team/supervisor details, previous SantanSafe history if any, and student narration/backup recording.
- Real partner agreements, approved badge wording, official referral procedures/licensing data and verified market rollout information when external activation is wanted.
- Mac/Xcode access for actual iOS builds. Do not purchase hardware, developer memberships or a paid vision route automatically.

Deployment and publishing stay last and require a later instruction. No real business integration is activated merely because its fictional demo works. Use [existing remaining jobs](REMAINING_JOBS.md) for the prior local acceptance and deployment separation.

## Closed by CP1

`C03-07`, `C04-01` and `C04-09` are now checked with [local/connected/browser evidence](CP1_ACCEPTANCE.md). CP8 also closed C05-11, C05-12 and C12-06. The remaining 27 entries above each retain one primary phase.

CP7 local recording/scoring preparation is complete; all seven CP7 requirements above remain open for actual evidence. [Guide](CP7_MEASUREMENT_GUIDE.md) and [preparation gate](CP7_ACCEPTANCE.md).

### CP10 preparation update — 8 October 2026

All six CP10 requirements remain pending real agreements/data/activation. Offline evidence templates and contract/privacy gate are complete; [owner guide](CP10_PARTNER_GUIDE.md) and [acceptance](CP10_ACCEPTANCE.md) explain the next inputs. Counts remain 124 checked / 27 open.

### CP11 update — 8 October 2026

C01-07 remains partial: Android/iOS wrapper sources and software preparation gate delivered; actual binaries/platform acceptance skipped by owner and connected native setup pending. [Acceptance](CP11_ACCEPTANCE.md). Counts stay 124 checked / 27 open.
