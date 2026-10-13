# PasarMalam - evidence supporting a controlled-prototype TRL 4 assessment

Local evidence review: 9 October 2026. This completes **C15-10: document evidence supporting TRL 4 or above**. It documents an engineering assessment of the core prototype; it is not an organiser decision or a food-safety certification. Eligibility, previous-version history and the student video remain separate incomplete requirements.

## Assessment basis and scope

The supplied AI EXPO guidelines require a working MVP at TRL 4 or above and list prototype demonstrations, technical/model tests, experiments and comparisons as supporting evidence. They do not define TRL or specify an assessment body. [Verified rules](COMPETITION_RULES_VERIFIED.md).

For a stated reference, [NASA ESTO's published software TRL table](https://esto.nasa.gov/trl/) describes level 4 as critical software components integrated and functionally validated in a laboratory setting, with documented test performance and the relevant environment defined. That is a reference framework used for this engineering inference, not a claim that AI EXPO adopted NASA's scale.

**Conclusion:** the core PasarMalam prototype has documented evidence supporting TRL 4 in a controlled software test environment. The evidence does not establish operation in a real Malaysian market, approved food thresholds, phone performance or production deployment. No higher level is claimed. The participating student/supervisor should confirm this bounded claim against any later organiser clarification before including it in their entry.

The assessed system is the local React PWA and FastAPI API, a guarded disposable Supabase backend, on-device/desktop transcription, explicitly consented Morpheus extraction, deterministic batch/advisory logic and manually confirmed customer listings. Real billing, authority referrals, partner endorsements, native binaries and medically/scientifically approved safety judgments are outside this assessment.

## Environment and expected behaviour

**Controlled environment:** Windows desktop, loopback web/API, fictional market/food records, isolated browser demo storage or an explicitly guarded disposable database. Recorded provider calls use redacted text; recordings and detailed evaluation results stay private. Synthetic clocks/food rules are visibly labelled. Evidence reports state the applicable build, route and test scope; this document does not collapse historical gates into a claim that every test passed on one build.

**Intended future environment:** Malaysia market hawkers and customers on supported mobile browsers, variable network/noise, consented real records, reviewed holding-time policy and agreed external services. Expected functional behaviour is a draft that can be corrected, explicit confirmation before writes, independently aged batches, non-increasing deadlines, removal of ineligible offers and protected ownership/role boundaries. These are tested invariants, not predictions that all future voices or devices will work.

The predeclared voice evaluation targets are at least 80% critical-field accuracy separately for BM/Manglish and 95% valid drafts. They are project targets, not organiser rules. Desktop development measurements inform the next experiment; independent noise/device acceptance and real speed/cost targets are still unmeasured.

## Integration and evidence matrix

| Critical component/interface | Documented observation | Expected behaviour supported | Remaining limitation |
| --- | --- | --- | --- |
| Browser account -> API -> protected database | [CP1 acceptance](CP1_ACCEPTANCE.md): connected ownership/onboarding tests and browser customer admission; public-signup repair preserves database-controlled roles | A new customer cannot assign themselves vendor/admin roles through metadata or visible mode | Owner password journey and privacy acceptance remain personal inputs |
| Discovery -> menus -> customer details | [CP2 acceptance](CP2_ACCEPTANCE.md): guarded connected filtering, market schedules, categories, dietary unknowns and browser journey | Matching market/menu filters and transparent declarations propagate to the customer | Catalog is fictional; real markets require verified data |
| Speech/text -> extraction -> clarification -> confirmed update | [CP3 acceptance](CP3_ACCEPTANCE.md): owned ID resolution, stock/menu/new-batch actions, atomic retries and browser confirmation | Ambiguous/foreign targets block writes; stock edits do not reset preparation time | Human comprehension and independent market-noise acceptance remain open |
| Real supplied audio -> local speech -> Morpheus draft | [Voice improvements](VOICE_ACCURACY_IMPROVEMENTS.md): complete 24-clip lanes, original failures retained; best desktop BM 90%, Manglish 86%, English 95%, 24/24 valid drafts | Actual inference produces usable, reviewable drafts in the measured development context | Assigned scripts are not independently verified spoken references; ONNX Manglish lane is 70%; no phone/holdout claim |
| Batch identity -> handling/audit -> public passport | [CP4 acceptance](CP4_ACCEPTANCE.md): append-only observations, original-time preservation, expiry/public privacy and connected trigger checks | New batches do not renew old food timers; private handling notes do not leak through passports | Food policy is synthetic; cumulative exposure awaits qualified rules |
| Eligibility -> approved promotion -> reservation/collection -> accounting | [CP5 acceptance](CP5_ACCEPTANCE.md), [CP9 acceptance](CP9_ACCEPTANCE.md): stock/ETA gates, approval, customer offer and observed delisting | Ineligible offers cannot remain active; quantity and completed outcomes are reconciled | Synthetic business flows do not demonstrate real transactions or causal waste reduction |
| Community records -> moderation -> scoped impact/export | [CP6 acceptance](CP6_ACCEPTANCE.md): scoped replies/complaints, ledger metrics and actual filtered CSV verification | Public/private boundaries and scoped aggregate export operate together | Reports are allegations; no authority-operated service or real pilot effect |
| Recorded history -> forecast -> uncertainty/baseline output | [CP8 acceptance](CP8_ACCEPTANCE.md): chronological partitions, errors, fallback and synthetic coverage 6/8 | A sparse/unsuitable input does not produce an invented precise forecast | Real consented history and coverage/baseline acceptance remain open |

The new request measurement feature records observed request durations, retries/failures and available provider token counters, and links attempts to a distinct confirmed update. [Implementation and verification](LOCAL_FEATURE_COMPLETION.md). Unknown billing stays unknown. Software fixture tests demonstrate accounting boundaries; they are not actual provider billing or participant timings.

## Reproduction and claim boundaries

Use [local operations](local-operations.md) and the existing phase acceptance commands for the relevant component. Use [the showcase guide](CP9_SHOWCASE_GUIDE.md) to demonstrate batches, clarification, approval and expiry on fictional data. Use the fresh [CP7 guide](CP7_MEASUREMENT_GUIDE.md) and [CP8 guide](CP8_FORECAST_GUIDE.md) for the next real observations. No fresh participant test is invented to complete this document.

Suggested statement for student adaptation: "Our integrated prototype has been tested in a controlled environment. We provide component tests, connected browser workflows and measured development AI results as evidence supporting TRL 4. Market, phone and independent user validation are the next stage."

The student remains responsible for their submitted declaration. This evidence is reviewable locally; no entry, maturity certificate, partnership or authority endorsement has been issued.
