# PasarMalam — Consolidated Features Checklist

**Current product scope — prototype, 9 October 2026:** the owner requested visibly fictional future integration/certification examples. Use [the prototype checklist](PROTOTYPE_FEATURES_CHECKLIST.md) and [demo walkthrough](PROTOTYPE_DEMO_GUIDE.md). Real authority/creator access, authentic certificates, participant studies and real business data below are future rollout requirements; they do not block this prototype. Existing real-evidence counts are preserved rather than treating simulated proof as genuine.

Reviewed **9 October 2026** against the current source and recorded local/connected acceptance. Original checklist wording, priorities, examples and competition mapping are preserved from your pasted document.

**Status: 126/151 items checked in the local scope; 25 remain unchecked.** Checked items include explicitly labelled simulations and implemented features with outstanding device/human acceptance. This is not 126 production-ready features or competition certification.

**Latest update:** instant public signup is enabled and accepted on the controlled sandbox; connected display-name/language editing and a small sign-in clock-tolerance repair are complete. Automatic AI request measurements/private exports and verified competition-rule/TRL evidence are delivered. Fresh human/device/billing/partner acceptance remains open. [Completion report](LOCAL_FEATURE_COMPLETION.md).

| Latest voice development run | Malay | Manglish | English | Valid drafts |
| --- | ---: | ---: | ---: | ---: |
| Local desktop turbo + Morpheus, 24 supplied clips | 90% | 86% | 95% | 24/24 |
| Browser-compatible ONNX turbo on desktop CPU, same clips | 86% | 70% | 90% | 22/24 |

Percentages measure critical-field accuracy against assigned scripts. Spoken references have not been independently verified, and this corpus was used for development. Desktop CPU results do not establish browser/phone performance. Fresh independent voice testing remains open. [Complete comparisons and evidence](VOICE_ACCURACY_IMPROVEMENTS.md).

CP6 closed seven community/impact requirements. [CP6 acceptance](CP6_ACCEPTANCE.md) records the connected phase gate and filtered organiser CSV evidence; CP7 human/device evidence stays pending. CP8 closed three photo/fallback requirements; four real-history requirements remain.

All 25 open requirements are listed with stable IDs in [partial/pending jobs](PARTIAL_AND_PENDING_JOBS.md) and mapped to [completion phases CP1–CP11](COMPLETION_IMPLEMENTATION_PLAN.md). CP12 remains final deployment, on hold. CP1 closed three listing requirements; CP2 closed seven discovery requirements; CP3 closed three voice-workflow requirements; CP4 closed three passport/recording requirements; CP5 closed four clearance/accounting requirements. Registration is accepted in the local scope; owner password/recovery/privacy acceptance remains separate. See [CP1 evidence](CP1_ACCEPTANCE.md) and [CP2 evidence](CP2_ACCEPTANCE.md). [CP3 evidence](CP3_ACCEPTANCE.md) separates implementation from pending human expression results.

- `[x]` means implemented in the current local scope. Any **Demo only**, **Demo policy**, or **Unbenchmarked** qualification limits that tick; it does not establish real partnerships, payments, scientifically approved food rules or measured human performance.
- `[ ]` means partial, missing, an external agreement/data source, a human deliverable or unverified acceptance. Each unchecked item states what remains.
- Compound requirements stay unchecked when a required part is absent. Existing application implementation is extensive, but this newly consolidated competition checklist adds requirements beyond the earlier PRD/demo.

Evidence: [feature coverage](feature-coverage.md), [connected/local acceptance](local-readiness-acceptance.md), [UI refresh and images](UI_UX_REFRESH.md), [voice evaluation](evaluation-report.md), [forecast evidence](phase10-acceptance.md), and [remaining human/device actions](YOUR_ACTION_CHECKLIST.md). All 12 supplied images are integrated locally; public-use metadata/rights remain separate. Deployment stays on hold and is not included in the completion count.

Competition rules were checked against all four pages of the supplied PDF; see [verified rules](COMPETITION_RULES_VERIFIED.md). Student eligibility/history remain unconfirmed. [TRL supporting evidence](TRL4_EVIDENCE.md) is an engineering inference, not organiser certification.

**Purpose:** Help customers discover Malaysian markets and food stalls while helping hawkers manage food batches, monitor holding times, sell surplus food, and reduce waste through multilingual AI.

**Recommended competition track:** AI for Sustainability & Smart Living.

**Priority guide**

- **P0 — Competition core:** Implement, demonstrate, and validate first.
- **P1 — Enhancement:** Add once the core works reliably.
- **P2 — Future roadmap:** Commercial expansion and external integrations.

Priorities are recommendations, not mandatory competition features.

## 1. User Accounts & App Modes

- [x] **P0:** Hawker/vendor mode for managing stalls, food listings, batches, and promotions.
- [x] **P0:** Customer mode for discovering markets, browsing food, and viewing offers.
- [x] **P0:** Registration, login, profile management, and switching between modes. — **Accepted locally:** instant public signup, automatic customer profile, sign-in/out, editable display name/language and protected mode/role boundaries verified. Metadata/mode cannot grant privileges. Owner personal password, recovery-email delivery and real-data privacy acceptance remain additional release actions. [Evidence](LOCAL_FEATURE_COMPLETION.md).
- [x] **P0:** Mobile-friendly PWA. — **Implemented:** responsive PWA shell/update/cache acknowledgement; physical-phone installation and successful disconnected reload acceptance remain open.
- [x] **P0:** Simple interface with large buttons, readable contrast, and minimal typing. — **Implemented:** refreshed controls, focus/contrast and responsive layouts, plus the current hero introduction and bottom navigation; low-literacy user and target-phone validation remain open.
- [x] **P1:** Customer access to reviews and complaint submission.
- [ ] **P2:** Dedicated Android and iOS apps. — **Partial — CP11 source preparation complete:** Capacitor Android/iOS projects, isolated fictional native bundle, lifecycle/permission controls and the recorded 57-case software gate are delivered. APK/iOS compilation, physical-device acceptance and connected native setup remain pending; device testing was skipped at the owner's request. [Evidence](CP11_ACCEPTANCE.md).

## 2. Market Discovery & Maps

- [x] **P0:** Support pasar malam, pasar pagi, and pasar tani. — **Implemented in CP2:** independent general/farmers classification plus day/night timing, fictional pasar tani schedules, list/filter/detail and labelled map pin in demo and connected data.
- [x] **P0:** Show market locations using map pins.
- [x] **P0:** Display operating days, hours, and schedules.
- [x] **P0:** Show active and closed market status.
- [x] **P0:** Display stalls within each market, including locations and lot numbers.
- [x] **P0:** Browse markets and stalls through map and list views.
- [x] **P0:** Provide directions to markets and stalls. — **Implemented in CP2:** validated destination-only Google Maps directions and coordinate copy for markets/stalls; market-entrance fallback labelled when a stall pin is absent. No automatic origin/GPS sharing.
- [x] **P1:** Show opening-soon and closing-soon status. — **Implemented in CP2:** two-hour opening-soon and final-30-minute closing-soon states, Malaysia-time overnight/cancellation/overlap handling; separate from hawker open status.
- [x] **P1:** Display the last stall update and flag stale availability information. — **Implemented in CP2:** explicit hawker-confirmed availability time and recent/stale/unknown labels; default 30-minute age, configurable engine argument. Generic edits/realtime do not reconfirm; open-status changes invalidate confirmation.

## 3. Search, Categories & Filters

- [x] **P0:** Search by market, stall name, food item, or location.
- [x] **P0:** Filter and sort by distance. — **Implemented:** opt-in coarse origin, radius and nearest sort; no automatic precise-location collection.
- [x] **P0:** Filter by day market or night market.
- [x] **P0:** Filter by active promotions.
- [x] **P0:** Food categories covering rice/noodles, BBQ/skewers, kuih/pastries, drinks, fried food, and fresh produce. — **Implemented in CP2:** six stable category IDs, legacy aliases and retained menu associations; category controls in discovery and hawker forms, with fictional fresh-produce data.
- [x] **P0:** Halal and non-halal filters. — **Implemented:** declared, certified, non-halal, expired/conflicting and not-declared statuses remain distinct.
- [x] **P0:** Distinguish halal certification from declarations such as Muslim-owned, pork-free, or alcohol-free. — **Implemented in CP1:** explicit voluntary yes/no/unknown statements and recording times, independent of reviewed certification/evidence/expiry. Never infer identity; human privacy approval remains pending before real collection.
- [x] **P1:** Vegetarian and vegan filters. — **Implemented in CP2:** explicit vendor vegetarian/vegan declarations, unknown/conflict exclusion, ingredient-change invalidation and manual reconfirmation. Independent from halal/allergens; voice does not infer declarations.
- [x] **P1:** Sort by best reviews and popularity using clearly defined signals. — **Implemented:** review rating and market popularity defined as 30-day visits; deterministic tie ordering.
- [x] **P1:** Budget filters, such as meals under RM5 or RM10. — **Implemented in CP2:** RM5/RM10/custom inclusive maximum menu-item prices. Category/diet/budget match one item; clearance/bundle prices do not change the unit-price basis or bypass filters.
- [x] **P1:** “Food rescue nearby” filter combining clearance availability and distance. — **Implemented by combining controls:** active-promotion filter with coarse radius/nearest sort, rather than a separate named preset.

## 4. Hawker Stall & Food Listings

- [x] **P0:** Create and edit stall profiles with name, description, market, lot number, and operating hours. — **Implemented in CP1:** dedicated description is editable and persisted in both adapters and customer detail; specialty, lot, market and hours are preserved.
- [x] **P0:** Upload stall photos.
- [x] **P0:** Add food items with photos, prices, declared ingredients, and available quantities. — **Implemented:** food name/photo/price/ingredients plus quantities on independent batches; quantity is not a single timeless menu field.
- [x] **P0:** Upload food photos when a batch is prepared.
- [x] **P0:** Mark food as available, sold out, or unavailable.
- [x] **P0:** Customers can view menus, current availability, batches, and promotions.
- [x] **P1:** Update stall opening and closing status.
- [x] **P1:** Display stall ratings and reviews.
- [x] **P1:** Vendor-confirmed allergen information, with “unknown” shown when unconfirmed. — **Implemented in CP1:** explicit confirmation, selected allergens, cross-contact, source/time audit and customer unknown labels. Ingredient/voice changes clear confirmation; no allergen-free guarantee.

## 5. Malaysian Multilingual AI & Audio Updates

- [x] **P0:** Support Bahasa Melayu and English.
- [x] **P0:** Understand mixed Malay-English speech, including Manglish. — **Implemented; development measurements available:** explicit language selection, optional turbo speech models and transcript-grounded extraction. Best local desktop Manglish critical-field accuracy was 86%; ONNX desktop CPU was 70%. Independent accent/noise and browser/phone acceptance remain open. [Evidence](VOICE_ACCURACY_IMPROVEMENTS.md).
- [x] **P0:** Allow hawkers to create and update listings using audio.
- [x] **P0:** Extract stall names, food names, prices, quantities, preparation times, and batch updates. — **Implemented in CP3:** extracted stall/dish/batch suggestions resolve to exact owned IDs; distinct confirmed menu/new-batch/stock actions, atomic writes and idempotent retries. Stock changes preserve original preparation time and deadline.
- [ ] **P0:** Understand local expressions such as “kuali kedua,” “tinggal sepuluh bungkus,” and “dua seringgit.” — **Partial; independent expression acceptance pending:** remaining-stock, bundle-price and batch-reference guards are implemented; ambiguous kuali kedua is blocked instead of resetting a timer. Development recordings and text regressions have been measured, but fresh verified holdout recordings covering these expressions remain required. [Guide](CP7_MEASUREMENT_GUIDE.md).
- [x] **P0:** Let hawkers confirm or correct extracted information before publishing.
- [x] **P0:** Ask short clarification questions when critical information is missing or ambiguous. — **Implemented in CP3:** short field-specific clarification questions for target IDs, stock, units, unit/bundle price, ingredients and Malaysia date/AM/PM; unresolved critical fields block saving. Original evidence and bounded correction history are retained.
- [x] **P0:** Flag uncertain information rather than silently guessing prices, ingredients, or times.
- [x] **P0:** Read back a short summary in the hawker’s selected language. — **Implemented in CP3:** user-triggered English/BM listing-summary readback using a matching browser voice, with visible summary and truthful unavailable/failure fallback. Browser readback start was observed; no human comprehension claim.
- [x] **P0:** Quick actions for “New batch prepared,” “Sold out,” and “Start promotion.” — **Implemented:** manual batch, stock-status and promotion actions; voice does not autonomously execute sold-out or promotion commands.
- [x] **P1:** Use photos to suggest food details and ingredient categories for confirmation. — CP8 implemented: consented metadata-stripped Morpheus apparent dish/visible category suggestions; ingredients unverified. One supplied-illustration smoke passed; confidence uncalibrated. [Evidence](CP8_ACCEPTANCE.md).
- [x] **P1:** Combine speech and photo information to flag conflicting details. — CP8 implemented: paste the speech draft dish, review disagreement, choose and confirm a source; export a reviewed dish draft for the existing save workflow. No automatic publishing/deadline change. [Evidence](CP8_ACCEPTANCE.md).

**Example workflow:**
“Batch kedua nasi lemak siap pukul enam, tinggal dua puluh bungkus, RM5.”

The app extracts the details, clarifies missing information, and creates the batch after the hawker confirms.

## 6. SantanSafe Batch Tracking

- [x] **P0:** Assign a unique batch number to newly prepared food.
- [x] **P0:** Record preparation date and time separately from photo upload time.
- [x] **P0:** Attach photos, quantities, and status to the corresponding batch.
- [x] **P0:** Track multiple batches of the same dish simultaneously.
- [x] **P0:** Give each batch its own holding-time countdown. — **Implemented:** advisory countdown, not a safety guarantee; missing handling can block calculation/listing.
- [x] **P0:** Preserve older batches’ original timers when a new batch is added.
- [x] **P0:** Track remaining quantity and batch status.
- [x] **P0:** Show customers the batch number, recorded preparation time, and holding-time status.
- [x] **P1:** Keep batch history for hawker review and reporting.
- [x] **P1:** QR “batch passport” linking to the stall and current batch information. — **Implemented in CP4:** public batch-specific passports and locally generated QR URLs show current published context, immutable timestamps, earlier corrections and closed/expired states. No scan restores listings or reveals private handling notes/actors; phone-origin acceptance remains a device input.
- [x] **P1:** Maintain an edit history for preparation times and storage conditions. — **Implemented in CP4:** append-only storage-transition observations and referenced corrections retain effective/server-recorded times, manual source and private actor/reason. Original preparation time remains unchanged; earlier-only preparation correction stays available. Any transition blocks clearance pending reviewed rules.

## 7. Food Holding-Time Monitoring & Alerts

- [ ] **P0:** Use documented, reviewed food-safety rules for holding-time actions. — **Human review required:** CP4 provides a versioned review package and provenance; current rules remain synthetic-demo-only. Qualified approval is still absent.
- [x] **P0:** Consider confirmed food type and relevant ingredients, including santan, poultry, seafood, eggs, rice, and noodles. — **Demo policy:** confirmed ingredient risk mapping, most restrictive caps and conservative unknowns; no claim of scientific threshold validation.
- [x] **P0:** Record ambient display, hot holding, or refrigeration conditions. — **Implemented recording:** ambient/chilled/hot-held/unknown are captured; the operational demo advisory only supports confirmed ambient handling and fails closed for other modes.
- [x] **P0:** Identify missing or uncertain preparation and storage information.
- [x] **P0:** Alert hawkers before a batch reaches its configured holding limit.
- [x] **P0:** Show within-window, approaching-limit, and past-limit states.
- [x] **P0:** Remove ineligible batches from active listings and promotions. — **Implemented:** ineligible batch/offer visibility and clearance are blocked; menu descriptions and audit history remain available.
- [x] **P0:** Explain alerts using recorded inputs and the applicable rule.
- [x] **P0:** Keep the PRD’s proposed decay formula experimental until validated.
- [x] **P1:** Audible alerts and push notifications. — **Implementation verified:** opt-in reminder sound and Web Push adapter/SQL boundaries exist; actual displayed device notification is still unobserved.
- [x] **P1:** Use local weather as supporting context. — **Verified connected adapter:** actual Open-Meteo observation persistence and cache reuse passed; weather is not measured food temperature.
- [x] **P1:** Record measured food temperatures and changes in storage conditions. — **Implemented in CP4:** operational manual food-temperature records retain °C/°F value, measurement method/time, source and actor; separate storage-transition records and missing-data indicators. Weather/synthetic sensors remain separate and measurements never extend deadlines.
- [ ] **P1:** Track cumulative exposure where required by the reviewed policy. — **Review-dependent implementation pending:** CP4 blocks transitions/restore/merge, preserves timers and exposes cumulative exposure as unavailable. Actual interval accounting and SQL/browser policy vectors await approved rules.
- [x] **P1:** Prevent casual timer resets through editing, batch replacement, or reheating. — **Implemented within current model:** non-increasing deadlines, earlier-only corrections and conservative source-closing merges; no reheating-reset action.

**Safety design requirements**

- AI extracts information and assists users; documented policy determines holding-time actions.
- Photos, upload timestamps, and countdowns do not certify food safety.
- Missing information must remain visible.
- Customer observations are not official safety inspections.
- Avoid approval or certification claims without the relevant verification.

## 8. Promotions & Food Waste Reduction

- [x] **P0:** Suggest promotions before a batch reaches its configured holding limit.
- [x] **P0:** Let hawkers create promotions manually.
- [x] **P0:** Hawkers approve suggested prices and promotions.
- [x] **P0:** Support percentage discounts, fixed-price clearance, and buy-one-get-one offers.
- [x] **P0:** Link each promotion to a specific food item and batch.
- [x] **P0:** Display original price, offer price, remaining quantity, and promotion end time.
- [x] **P0:** End offers automatically when sold out or no longer eligible.
- [x] **P1:** Notify nearby customers, with notification preferences. — **Implementation verified:** coarse opt-in/radius/quiet-hour/expiry controls and push adapter exist; actual device receipt remains pending. Fixture delivery is labelled simulated.
- [x] **P1:** Dedicated clearance or food-rescue section.
- [x] **P1:** Surplus giveaways while batches remain eligible. — **Implemented:** RM0 clearance giveaways remain subject to the same stock and advisory guards.
- [x] **P1:** Explain promotion suggestions using remaining stock, recent sales, and time remaining. — **Implemented in CP5:** deterministic recommendations explain reconciled unheld stock, at least three completed-sale records spanning five minutes in the last 30 minutes, and remaining collection time. Sparse, disputed/refunded or unreconciled histories suppress numeric discounts; approval remains manual.
- [x] **P1:** Consider estimated collection time when recommending short-lived offers. — **Implemented in CP5:** shopper-entered ETA and explicit unknown source, two-minute uncertainty and existing 15-minute fulfilment buffer determine feasible recommendations. Unknown/excessive ETA suppresses recommendations; no live traffic provider is claimed.
- [x] **P1:** Reserve-for-pickup with quantity locking, reservation expiry, and collection confirmation.
- [x] **P1:** Recheck batch eligibility at reservation and collection.
- [x] **P0:** Record clearance sales, leftovers, and estimated waste avoided. — **Demo/reporting implementation:** ledger/outcome and synthetic pilot views exist; real waste diversion requires baseline and measured evidence.

## 9. Reviews, Complaints & Community Trust

- [x] **P1:** Star ratings, written reviews, and customer photos. — **Implemented:** review rating/body/optional photo and moderation. Unmatched seeded photo slots remain placeholders.
- [x] **P1:** Feedback on taste, value, service, and observed hygiene. — **Implemented:** free-text feedback with a single overall star rating, not separate taste/value/service/hygiene subscores.
- [x] **P1:** Hawker responses to reviews. — **Implemented in CP6:** Review-specific owner replies retain history, require moderation and follow parent visibility; confidential abuse reporting is available. [Evidence](CP6_ACCEPTANCE.md).
- [x] **P1:** Anonymous complaint submission. — **Implemented privacy boundary:** verified-account confidential reporting, anonymous to vendors/public; authorised moderators can identify the reporter. Guest anonymous reports are intentionally disallowed.
- [x] **P1:** Categories covering suspected spoiled food, pests, cross-contamination, and unhygienic handling. — **Implemented in CP6:** Dedicated spoiled-food, pests, cross-contamination and unhygienic-handling categories retain legacy aliases and existing verification/triage limits. [Evidence](CP6_ACCEPTANCE.md).
- [x] **P1:** Photo/video evidence linked to the relevant market or stall. — **Verified:** private image/short-video validation, scoped signed evidence access and connected permission gates; use fictional/consented evidence.
- [x] **P1:** Protect complainant identity from vendors and public display.
- [x] **P1:** Moderation, abuse reporting, and complaint-status tracking.
- [x] **P1:** Human review of repeated complaints before action.
- [x] **P1:** Vendor response and appeal process.
- [x] **P1:** Clearly distinguish customer reports from verified findings and official inspections.
- [x] **P2:** AI-assisted complaint summaries for human moderators. — **Implemented in CP6:** Private editable summary drafts minimise category/status/count before consented provider calls; human-reviewed saves never publish or refer. [Evidence](CP6_ACCEPTANCE.md).

## 10. Revenue & Hawker Analytics

- [x] **P1:** Stall views and promotion engagement. — **Implemented in CP6:** Opt-in deduplicated views/offer engagement and confirmed batch posting are scoped; active-user windows and fictional sources are explicit. [Evidence](CP6_ACCEPTANCE.md).
- [x] **P1:** Inventory, batch-history, and basic sales analytics. — **Demo analytics:** actual workflow ledger/batch history with generated historical dashboard data; no measured hawker business impact claim.
- [x] **P2:** In-app advertisements. — **Demo only:** internal ad placements; no ad-network service.
- [x] **P2:** Paid sponsored search positions and highlighted map pins. — **Demo only:** labelled capped sponsored search/pins with pretend budgets; no money charged.
- [x] **P2:** Clearly label sponsored placements.
- [x] **P2:** Promotion purchasing and campaign management. — **Demo only:** campaign onboarding/approval/budgets/mock purchasing; no live billing.
- [x] **P2:** Premium analytics and vendor tooling. — **Demo only:** tier/dashboard/forecast previews with fictional subscriptions.
- [x] **P0:** Apply holding-time restrictions equally to sponsored and ordinary listings.

## 11. Partnerships & Future Integrations

- [ ] **P2:** Collaborate with Foodie platforms and local food creators. — **External action pending:** fictional media/supplier collaboration workflow exists; no agreement or integration with a real Foodie platform/creator.
- [ ] **P2:** Verified partner features and “Featured on Foodie” badges. — **External verification pending:** fictional approved editorial badges/trails exist; no genuine Foodie endorsement or verified real partner.
- [ ] **P2:** Complaint referral to KKM/BKKM and municipal authorities through agreed processes. — **External action pending:** consent/redaction/referral/officer-resolution simulation exists; no agreed KKM/BKKM/municipal submission adapter or real referral.
- [x] **P2:** Authority dashboards for complaint trends, market information, and waste statistics. — **Demo dashboard implemented:** fictional assigned-market trends, permits and suppressed waste/hygiene aggregates; no authority-operated deployment.
- [ ] **P2:** Stall permit/licensing information where authoritative data is available. — **External data pending:** fictional permits/renewals/dietary evidence exist; no authoritative licensing feed.
- [ ] **P2:** Organic waste collection and composting partnerships. — **External agreement pending:** donation/compost/BSF pickup and stock/weight/receipt simulations exist; no collection partnership activated.
- [ ] **P2:** Expand from initial KL/Selangor markets to more Malaysian locations. — **Roadmap:** editable market coordinates and fictional catalog, not evidence of actual geographical rollout.

## 12. AI Demand & Leftover Forecasting

- [ ] **P1:** Predict demand and likely unsold quantities using recorded batch and sales history. — CP8 code complete; real acceptance pending: owned reconciled history, censoring and unsold estimate exist; actual consented history/validation still needed. [Evidence](CP8_ACCEPTANCE.md).
- [x] **P1:** Recommend smaller next batches to prevent overproduction. — **Demo recommendation:** bounded rain-adjusted cooking quantity; not a measured real-demand or LLM result.
- [x] **P1:** Explain the main factors influencing recommendations. — **Demo explanation:** weekday/history sample counts, stockout exclusion and bounded rain adjustment are visible.
- [ ] **P1:** Show prediction uncertainty. — CP8 code complete; real coverage pending: separate calibration residual interval and holdout coverage implemented. Synthetic coverage 6/8; no real calibration claim. [Evidence](CP8_ACCEPTANCE.md).
- [ ] **P1:** Compare forecasting performance against a historical-average baseline. — CP8 code complete; real comparison pending: chronological mean/median/trend errors and baseline fallback implemented; actual consented holdout still needed. [Evidence](CP8_ACCEPTANCE.md).
- [x] **P1:** Use clearly labelled basic recommendations when data is insufficient. — CP8 implemented: latest reconciled observation when available, manual small-first-batch guidance and no invented precise quantities. [Evidence](CP8_ACCEPTANCE.md).

**Competition value:** A second measurable AI capability beyond voice extraction. Include it only when sufficient data and evaluation are available.

## 13. Impact Dashboard & Measurement

- [x] **P0:** Record portions prepared, sold normally, sold through clearance, and left unsold. — **Implemented in CP5:** owned preparation-date session reports reconcile prepared portions, reported normal sales, confirmed/reported clearance, giveaways, donation, discard, compost/BSF and final closing leftovers. Unknown counts and unexplained legacy changes stay explicit; holds are not sales.
- [x] **P0:** Calculate clearance revenue and customer savings from completed sales. — **Implemented in CP5:** immutable sale-time unit/bundle price snapshots produce completed-clearance revenue and retained customer savings, with refunds, free/BOGO, disputes and missing-price exclusions. Deduplicated source ledger and session CSVs match; fictional totals are not real impact evidence.
- [x] **P0:** Compare leftovers per 100 portions across comparable baseline and trial sessions. — **Implemented in CP6:** Closed reconciled Malaysia preparation-date sessions show denominator, exclusions and leftovers per 100; comparable baseline/trial filters do not claim causal improvement. [Evidence](CP6_ACCEPTANCE.md).
- [x] **P0:** Separate measured results from estimates and projections. — **Implemented:** estimated/reported/synthetic weighed totals and unmeasured human results are explicitly distinguished.
- [x] **P0:** Track batch posting time, active users, and reported safety concerns. — **Implemented in CP6:** Opt-in, deduplicated events report confirmed batch posting/ingestion delay and distinct consenting accounts per market/day/event type. Scoped concern aggregates suppress small groups and label reports as unverified; ingestion delay is not measured human task time. [Evidence](CP6_ACCEPTANCE.md).
- [x] **P1:** Estimate food weight using measured portion weights. — **Implemented in CP6:** Food-specific weighed portion samples support labelled quantity-based estimates; actually weighed completed routes stay separate. Method, sample date/count, uncertainty and source deduplication accompany the result. Samples are entered data, not independent instrument verification. [Evidence](CP6_ACCEPTANCE.md).
- [x] **P1:** Export anonymised pilot and impact reports. — **Implemented:** scoped CSV/print exports with fictional pilot rows and small-group suppression; actual filtered Week 2 CSV was verified. Real pilot data collection remains pending.

**Measurement requirements**

- A clearance sale alone does not establish that waste was prevented.
- Use baseline comparisons to support waste-reduction claims.
- Absence of complaints does not establish food safety.

## 14. AI Validation & Technical Evidence

- [ ] **P0:** Interview hawkers and customers to validate the problem and workflow. — **Human action pending:** no interview evidence supplied.
- [ ] **P0:** Conduct a documented user trial and report participant numbers and limitations. — **Human action pending:** no documented real user trial or participant results supplied.
- [ ] **P0:** Create a held-out voice test set covering Malay, English, mixed speech, accents, and market noise. — **Partial:** 24 consented supplied recordings from five speaker folders are now development material. Fresh holdout v2 scripts exist, but independent recordings, verified spoken annotations and labelled accent/market-noise evidence remain missing. [Guide](CP7_MEASUREMENT_GUIDE.md).
- [ ] **P0:** Measure extraction accuracy for prices, quantities, preparation times, and batch references. — **Partial; development measured:** complete supplied-recording and text-only results are recorded separately, including failures. Best desktop audio critical-field scores are 90% BM / 86% Manglish / 95% English, with 24/24 valid drafts. Independent verified holdout acceptance remains open; these are not phone or market-noise results. [Evidence](VOICE_ACCURACY_IMPROVEMENTS.md).
- [ ] **P0:** Compare manual entry against voice-assisted entry for speed, errors, and corrections. — **Unmeasured:** paired live timing/corrections tooling exists; no consenting participant measurements.
- [x] **P0:** Test ambiguous times, missing information, incorrect batch references, and AI failures. — **Verified current schema:** ambiguous/conflicting clocks, missing evidence, invalid/foreign food/batch identifiers, unsupported commands and provider failure guards are covered. CP3 adds exact owned existing-batch resolution and stock updates; ambiguous second-pan/timer-change instructions remain blocked. [Evidence](CP3_ACCEPTANCE.md).
- [x] **P0:** Verify batch separation, promotion shutdown, and persistence after app reloads.
- [ ] **P0:** Measure response time, failed requests, and AI cost per successful update. — **Partial:** automatic request timings/failures/retries, available provider tokens and confirmed-save links are implemented and observed. Dated billing/free-allowance and complete evaluation evidence are still required for cost per success. [Guide](AI_REQUEST_MEASUREMENT_GUIDE.md).
- [x] **P0:** Document models, inputs, outputs, policy logic, and human confirmation steps. — **Documented:** pinned tiny/small/turbo speech options, optional local desktop helper, historical local Qwen and current Morpheus qwen35-9b, contracts, transcript evidence, deterministic policy and manual confirmation. [Latest model/results record](VOICE_ACCURACY_IMPROVEMENTS.md).
- [x] **P0:** Use consented data and anonymise public demonstration records. — **Implemented in current scope:** fictional public records, owner-confirmed consent for 24 supplied recordings, private audio/transcript storage and anonymised aggregate reports. Only explicitly approved redacted recognized text is sent to Morpheus; fresh holdout participant evidence remains pending. [Evidence](SUPPLIED_VOICE_ACCEPTANCE.md).
- [ ] **P1:** Benchmark forecasting performance if the forecasting module is included. — CP8 synthetic benchmark complete; real benchmark pending. Frozen partitions, all errors, exclusions and actual coverage exported; no consented real benchmark. [Evidence](CP8_ACCEPTANCE.md).

**Suggested starting point:** 20–30 held-out voice examples plus a small hawker/customer trial. These are evaluation targets, not achieved results.

## 15. Competition Demonstration & Readiness

- [x] **P0:** Demonstrate an actual working MVP with persistent data. — **Verified local MVP:** browser-local persistence plus guarded connected Supabase provisioning/permissions/runtime; no deployment claimed.
- [x] **P0:** Show speech → extraction → clarification → confirmed batch → customer listing. — **Technical smoke/demo:** actual synthetic English speech inference, corrected draft/extraction/confirmation and customer data flow were exercised; CP3 adds field-specific clarification and exact owned targets; held-out human BM/Manglish performance remains unmeasured. [Evidence](CP3_ACCEPTANCE.md).
- [x] **P0:** Create Batch 2 and show that Batch 1 retains its original timer.
- [x] **P0:** Trigger a holding-time warning, approve a promotion, and show the customer offer. — **Verified fictional scenario:** deterministic warning, hawker approval and customer clearance flow; not a real-food safety demonstration.
- [x] **P0:** Demonstrate automatic offer removal and uncertain-input handling.
- [ ] **P0:** Present measured AI performance, user feedback, and operating costs. — **Partial:** development audio/text accuracy is now measured and documented. Independent voice acceptance, real participant feedback and a complete operating-cost report remain missing.
- [x] **P0:** Label simulated time, sample data, and experimental features clearly.
- [ ] **P0:** Prepare an English video narrated or presented by a participating student. — CP9 preparation complete: English storyboard/captions and recording guide exist; actual student-narrated full video remains pending. [Evidence](CP9_ACCEPTANCE.md).
- [ ] **P0:** Declare any previous SantanSafe version and explain the implemented advancement. — CP9 conditional declarations prepared; actual prior-version/no-prior-version confirmation and reviewed advancement evidence remain pending. [Evidence](CP9_ACCEPTANCE.md).
- [x] **P0:** Document evidence supporting the required TRL 4 or above. — **Documentation complete:** integrated components and controlled lab validation mapped to supporting TRL 4 software evidence. Engineering inference only; the supplied rules define no assessment method. No organiser-certified level or market/food-safety validation claimed. [Evidence](TRL4_EVIDENCE.md).
- [ ] **P0:** Confirm team eligibility and academic supervision. — CP9 private review template prepared; actual student/team/supervisor evidence remains pending. [Evidence](CP9_ACCEPTANCE.md).
- [ ] **P1:** Prepare a live showcase with a resettable demonstration and backup recording. — CP9 reset controls and desktop technical rehearsal passed; actual student intended-device rehearsal and full reviewed backup recording remain pending. [Evidence](CP9_ACCEPTANCE.md).

**Video note:** The guidelines’ heading says five minutes, while the explicit rules state a maximum of eight minutes. A five-minute video fits both.

## Competition Criteria Mapping

| Criterion | Weight | Evidence to present |
|---|---:|---|
| Problem significance & evidence | 10% | Interviews and observed leftover records |
| Innovation & originality | 15% | Malaysian voice-to-batch-to-rescue workflow |
| Meaningful AI integration | 25% | Extraction, clarification, correction, and evaluated outputs |
| MVP maturity & implementation | 20% | Working, persistent hawker-to-customer workflow |
| Validation & evidence | 10% | Held-out tests, user trials, and technical checks |
| Value proposition | 10% | Faster updates, transparent batch information, accessible offers |
| Impact & scalability | 10% | Measured outcomes, operating costs, and expansion plan |

## Recommended Competition Build Order

1. **Complete the core:** accounts, market discovery, listings, multilingual voice input, batch tracking, reviewed holding-time logic, and promotions.
2. **Validate it:** measure AI accuracy, posting time, user experience, and technical reliability.
3. **Add one distinctive enhancement:** QR batch passports or evaluated leftover forecasting.
4. **Prepare the demonstration:** show the complete workflow, uncertainty handling, measured results, and limitations.
5. **Expand later:** reviews, complaints, reservations, advertising, partnerships, and authority integrations.

**Central competition story:** PasarMalam turns Malaysian hawker speech into traceable food batches and timely rescue offers, then measures whether the workflow saves time and reduces leftovers.

[CP4 evidence](CP4_ACCEPTANCE.md) and [food-policy review package](CP4_POLICY_REVIEW.md) separate delivered recording features from the two review-dependent requirements.

[CP5 accounting and recommendation evidence](CP5_ACCEPTANCE.md).

## Current-version audit — 9 October 2026

Reconciled all 151 requirements after the completed engineering batch. C01-03 closes locally with instant signup/profile acceptance; C15-10 closes with documented TRL supporting evidence. AI request telemetry is implemented and observed, but independent participant/device/cost acceptance remains open. Current totals: **126 checked / 25 open**. [Changes, checks and limits](LOCAL_FEATURE_COMPLETION.md).

| Priority | Checked locally | Open | Total |
| --- | ---: | ---: | ---: |
| P0 | 75 | 12 | 87 |
| P1 | 44 | 6 | 50 |
| P2 | 7 | 7 | 14 |
| **Total** | **126** | **25** | **151** |

**Implemented groups:** discovery/maps/filters, stall/menu/photo management, independent batches and QR passports, confirmed voice updates and clarification, advisory alerts/clearance/reservations, reviews/moderation, accounting/impact reports and local business simulations.

**Open groups:** held-out expressions (1); approved food rules/exposure (2); real partners/data/rollout (6); real forecasting acceptance (3); human measurement/forecast benchmark (7); student declaration/eligibility/video/showcase (5); native binary/device acceptance (1).

### What remains incomplete and the next action

All 25 unchecked requirements are covered once below. IDs refer to the [complete pending inventory](PARTIAL_AND_PENDING_JOBS.md). Prepared code or templates alone do not finish an evidence-dependent requirement.

| Incomplete work | Open IDs | Action needed to complete it |
| --- | --- | --- |
| Independent voice data, expressions and accuracy | C05-05, C14-03, C14-04 | Record fresh 24-case holdout v2 with at least five consenting speakers, including labelled accents/noise. Verify actual spoken annotations and freeze before inference; then report full-set accuracy and every failure. Existing recordings are development evidence. [Measurement guide](CP7_MEASUREMENT_GUIDE.md) |
| Hawker/customer interviews and real user trial | C14-01, C14-02 | Recruit consenting hawkers/customers, conduct interviews and the trial, and retain anonymous participant counts, findings, failures and limitations. [Measurement guide](CP7_MEASUREMENT_GUIDE.md) |
| Voice-versus-typing speed and operating cost | C14-05, C14-08 | Observe paired live tasks through correction/confirmation; download automatic request durations/failures/retries/available usage, and supply dated billing/free-allowance evidence. [Request guide](AI_REQUEST_MEASUREMENT_GUIDE.md). Produce per-success metrics without treating unknown costs as zero. [Measurement guide](CP7_MEASUREMENT_GUIDE.md) |
| Competition performance/feedback/cost presentation | C15-06 | Combine independent accuracy, trial feedback, live timings and operating costs into the presentation, with development results and limitations labelled. |
| Reviewed holding-time rules and cumulative exposure | C07-01, C07-13 | Obtain qualified policy approval and expected test cases. Then implement and verify interval accounting/transitions against those rules. Current advisory rules are synthetic and transitions remain blocked. [Policy package](CP4_POLICY_REVIEW.md) |
| Real forecasting validation | C12-01, C12-04, C12-05, C14-11 | Supply at least 30 usable consented, reconciled same-weekday sessions for a stall; freeze chronological partitions and run prediction, uncertainty coverage and baseline comparisons. [Forecast guide](CP8_FORECAST_GUIDE.md) |
| Student English video and complete showcase backup | C15-08, C15-12 | A participating student records the complete English demonstration, keeps a full backup and rehearses on the intended presentation device with observed pass/fail results. [Showcase guide](CP9_SHOWCASE_GUIDE.md) |
| Previous-version declaration and eligibility | C15-09, C15-11 | Supply actual SantanSafe history (or confirm none), participating student/team details and academic supervisor evidence. Rules and TRL documentation are delivered; actual personal facts remain pending. [Evidence pack](CP9_EVIDENCE_PACK.md) |
| Real partnerships, authority/licensing data and market expansion | C11-01, C11-02, C11-03, C11-05, C11-06, C11-07 | Secure creator/partner agreements and badge permission, an agreed authority referral process, authoritative permit data, a waste-collection partner and verified new-market details. Build/configure approved real adapters and validate activation. [Partner guide](CP10_PARTNER_GUIDE.md) |
| Android/iOS binaries and native acceptance | C01-07 | When you resume deferred native work, provide Android build/device access and Mac/Xcode access for iOS; compile binaries, configure connected native auth/links and complete device acceptance. [Native guide](CP11_NATIVE_GUIDE.md) |

**Additional acceptance on checked features:** owner enters their own password; validate recovery-email delivery and privacy before real participants; test actual phone microphone/model memory and touch journeys, PWA installation/update, a network-disconnected reload and an unvisited lazy route, displayed push notification/click, and supplied-image public-use metadata/rights. Real ad-network/billing activation is also outside the checked local simulations. These do not add to the 25-item count. Deployment remains deferred.

Advertising, sponsorship purchasing, subscriptions and authority dashboards have labelled local simulations; checked boxes do not mean real billing, ad-network activation or authority deployment. Web Push code exists but actual device notification receipt remains open. PWA/physical-phone/offline acceptance and image public-use evidence remain additional release checks. Deployment remains on hold.

This update implemented and tested the available local work, changed the explicitly selected instant-signup setting, and verified actual browser/API flows. See [batch evidence](LOCAL_FEATURE_COMPLETION.md) for targeted test counts and limits. No deployment or external submission occurred.

## Reviewed totals by section

| Section | Checked locally | Unchecked |
| --- | ---: | ---: |
| 1 | 6 | 1 |
| 2 | 9 | 0 |
| 3 | 11 | 0 |
| 4 | 9 | 0 |
| 5 | 11 | 1 |
| 6 | 11 | 0 |
| 7 | 12 | 2 |
| 8 | 15 | 0 |
| 9 | 12 | 0 |
| 10 | 8 | 0 |
| 11 | 1 | 6 |
| 12 | 3 | 3 |
| 13 | 7 | 0 |
| 14 | 4 | 7 |
| 15 | 7 | 5 |
| **Total** | **126** | **25** |

CP10 update (8 October 2026): all six section 11 external requirements remain unchecked. Local evidence preparation and simulated contract/privacy regressions are complete; no genuine endorsement, authority submission, official permit, collector partnership or real rollout is claimed. [Acceptance](CP10_ACCEPTANCE.md).

CP11 update (8 October 2026): C01-07 remains unchecked/partial. Capacitor Android/iOS projects and isolated fictional bundle are prepared; binary/device evidence is skipped at owner request. [Acceptance](CP11_ACCEPTANCE.md).
