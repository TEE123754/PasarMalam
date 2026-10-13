# PasarMalam - Human Actions to Complete App Features

**Current product scope — prototype, 9 October 2026:** the owner requested visibly fictional future integration/certification examples. Use [the prototype checklist](PROTOTYPE_FEATURES_CHECKLIST.md) and [demo walkthrough](PROTOTYPE_DEMO_GUIDE.md). Real authority/creator access, authentic certificates, participant studies and real business data below are future rollout requirements; they do not block this prototype. Existing real-evidence counts are preserved rather than treating simulated proof as genuine.

Prepared: **9 October 2026**.

Follow this one guide for hands-on work and the data/access you need to provide. It covers account setup, real speech and usability measurements, phone tests, forecasting data, real partnerships and native apps. Review-only jobs and competition administration/presentation jobs are outside this guide.

Creating this guide does not change feature completion statuses. Some features still require implementation after you supply the inputs. Existing food-policy approval and other review-dependent items remain tracked in the [main checklist](CONSOLIDATED_FEATURES_CHECKLIST.md).

## Start here

1. Complete Steps 1-6 for the core app.
2. Complete Step 7 if real sales history is available.
3. Complete Steps 8-10 for live partnerships and business services.
4. Complete Step 11 when you want installed Android/iOS acceptance; this was previously deferred.

Use fictional batches for app testing. Record real participant observations honestly. Keep recordings, consent receipts, account details and business documents private. Do not place passwords or API keys in this document or commit them to GitHub.

## Step 1 - Use your instant-signup account

**Feature:** accounts and profiles, now accepted in the controlled local scope.

- [x] Owner selected instant public signup; Supabase signup is ON and confirmation email is OFF.
- [x] Developer verified actual public signup, customer-only admission, sign-in/out, profile editing/persistence and protected role denial with a generated fictional account, subsequently removed.
- [ ] Enter your own password and sign in using your existing account, or create a new account with an unused email. No signup confirmation email is needed.
- [ ] Edit display name/language, save, sign out and sign in again yourself.
- [ ] For connected stall management, use a separately assigned hawker account. A customer cannot grant themselves privileges through the mode selector.
- [ ] If you need password recovery, complete the reset yourself. Reliable reset delivery to arbitrary public users still needs a configured sender.

**Do next:** [instant signup/account instructions](STEP1_PUBLIC_SIGNUP_SETUP.md). Your personal password must be entered by you. These are owner/release actions; C01-03 is now complete locally. Record any failure with credentials removed. Privacy/food-policy review jobs remain tracked separately, outside this hands-on guide.

## Step 2 - Recruit speakers, hawkers and customers

**Features:** real voice understanding, usable hawker/customer workflows and user evidence.

- [ ] Find at least **five adult speakers** willing to record Bahasa Melayu, English or mixed-language examples.
- [ ] Include actual hawkers and customers in interviews and hands-on tasks; record the achieved number in each role.
- [ ] Obtain permission for recording and task participation. Obtain separate consent before sending their redacted transcript to an external AI provider.
- [ ] Assign anonymous IDs such as S01-S05.
- [ ] Ask how they currently update menus, track batches, deal with leftovers and discover stalls.
- [ ] Let them try the app and record actual difficulties, failed tasks and changes they request.

**Provide:** anonymous participant IDs/roles, consent references and interview/task notes. The five-speaker target comes from the prepared project evaluation pack, not a competition rule.

**Use:** [interview template](cp7-interviews.csv), [trial template](cp7-trial.csv) and [measurement guide](CP7_MEASUREMENT_GUIDE.md).

## Step 3 - Record the 24 voice examples

**Features:** BM/English/Manglish recognition, local expressions and extraction accuracy.

- [ ] Download/use the **fresh holdout v2** pack: **10 BM, 10 Manglish and four English cases**. The 24 supplied clips and original scripts were used for development; they cannot be reused as independent acceptance.
- [ ] Record one separate file for each case using the fictional interpretation clock and test facts in the pack.
- [ ] Include prices, quantities, preparation times and batch references, including ambiguous examples.
- [ ] Record the planned noise cases without capturing non-consenting bystanders; note whether the background noise is controlled or natural.
- [ ] Note speaker ID, language, phone/computer, audio format and recording condition.
- [ ] Listen and write what was actually spoken, plus the intended food, price, quantity, preparation time and batch reference. Leave deliberately uncertain answers unknown.
- [ ] Preserve the recordings and expected answers before model testing. Keep practice/development examples separate.
- [ ] Provide the private folder path so the developer can validate/freeze the collection and run the prepared scorer.

**Provide:** 24 audio files, consent references, actual transcripts, expected fields and recording conditions in the private CP7 collection.

**Use:** [fresh 24-case holdout v2](../contracts/cp7-holdout-v2.json) and [collection instructions](CP7_MEASUREMENT_GUIDE.md). The developer can help with file hashes and manifest formatting; you need to supply the real recordings and facts.

## Step 4 - Run actual voice and typing tasks

**Features:** extraction accuracy, clarification, update speed and reliable saves.

- [ ] Run the frozen recordings through actual transcription and extraction. Keep the original transcript/draft before correcting it.
- [ ] For batch-reference tasks, create the named test dish and two independent batches first.
- [ ] Record every failed/unsupported case, clarification and correction; do not omit unsuccessful attempts.
- [ ] Confirm that an ambiguous instruction asks for clarification and that stock updates preserve the original batch time.
- [ ] Aim for **12 completed paired tasks** comparing manual typing with live microphone entry.
- [ ] Use the same participant, task facts, device and network for each pair. Alternate typing-first and voice-first.
- [ ] Time from task presentation to successful confirmation, including all corrections. Separate cold model downloads from warm runs.
- [ ] Record what happened if a task was cancelled, failed or required manual fallback.

**Provide:** raw AI outputs, actual task durations, order, correction/failure notes and successful-save observations.

**After your action:** the developer can score field accuracy, compare typing/voice timing and repair failed workflows. File-based audio inference must not be described as live-microphone speed evidence.

## Step 5 - Capture response times and actual usage/cost

**Feature:** measured latency, failures and AI cost per successful update.

- [ ] Record the duration and outcome of each extraction request, including retries and failures.
- [ ] Associate requests with their eventual confirmed update; retries for one update must not create extra successful-update counts.
- [ ] Obtain actual usage/token records and available billing/pricing evidence from the provider account.
- [ ] Keep credentials and private billing records outside the public results.
- [ ] Supply missing values as unknown rather than guessing zero cost.

**Provide:** dated request/usage records, failure/retry links, confirmed-update IDs and billing references.

**After your action:** the developer can calculate supported latency/failure/cost metrics. Developer assistance can capture technical timing; you supply account access or exported usage records through a secure channel.

## Step 6 - Test the web app on a physical phone

Automatic request time, failures/retries and available tokens now appear in Evaluation. Download the private measurements from the same tab after tasks; add actual billing/free-allowance evidence separately. [Automatic measurement instructions](AI_REQUEST_MEASUREMENT_GUIDE.md). Request timing does not replace complete participant task timing.

**Features:** microphone, PWA installation/offline use, notifications and practical mobile usability.

- [ ] Provide the phone model, OS/browser versions and the consenting tester.
- [ ] Have the developer prepare a supported secure connection if necessary. Your phone's localhost is not your computer.
- [ ] Test microphone grant and denial, transcription, model loading and manual fallback.
- [ ] Complete one customer journey: discover market -> open stall -> find offer -> reserve -> confirm pickup where supported.
- [ ] Complete one hawker journey: audio/typing -> correction -> confirmed batch -> promotion -> customer visibility.
- [ ] Check small-screen controls, keyboard, BM/English, image selection and navigation.
- [ ] Try slow-network/reconnect and interrupted recording; record errors and recovery.
- [ ] Install the PWA, reopen it and test the update flow.
- [ ] After cache-ready acknowledgement, disconnect the browser network, reload and visit an unvisited route. Record what works and what needs internet.
- [ ] Opt in to a test notification, observe the actual displayed notification and tap it to check the destination.
- [ ] Check that older/new batches keep separate timers and expired offers remain unavailable after resume/reconnect.

**Provide:** dated pass/fail observations and the actual device/browser details. Screenshots or a short screen recording may supplement the observations.

**Use:** [device results template](cp7-devices.csv).

**After your action:** fixes and feature-status updates can follow the observed results. Existing desktop and mocked notification tests do not substitute for these phone observations.

## Step 7 - Obtain real forecasting and impact records

**Features:** demand/leftover forecasts, uncertainty, baseline comparison and real impact reporting.

- [ ] Find one consenting stall with existing historical records, or begin ongoing collection.
- [ ] For forecasting, supply at least **30 usable sessions for that same stall and weekday**.
- [ ] For every session record the actual preparation date, prepared portions, normal sales, completed clearance, closing leftovers and whether the ledger is complete/reconciled.
- [ ] Record missing dates, disruptions and stockouts separately. Do not replace unknown values with zero or create fictional sessions.
- [ ] Retain actual clearance sale prices, completed collections and refund records for revenue/customer-savings calculations.
- [ ] For weight reporting, weigh portions or completed routes and record the measurement method, date, quantity and source.
- [ ] For a waste-reduction claim, collect comparable baseline and app-use sessions; a clearance sale alone is insufficient evidence.
- [ ] Provide the private history folder so the developer can freeze the dataset, run the forecasting comparison and calculate report outputs.

**Provide:** consented history, source records, measured weights where available and comparable baseline/app-use dates.

**Use:** [forecast data instructions](CP8_FORECAST_GUIDE.md) and [pilot measurement plan](pilot-plan.md).

**If history is unavailable:** keep forecasting experimental/manual and continue collection. Four weekly sessions cannot meet the current 30-session requirement. Real forecasting status remains incomplete until sufficient evidence exists.

## Step 8 - Supply real media, badge and licensing inputs

**Features:** Foodie/creator collaboration, verified partner badges and authoritative permit information.

- [ ] Contact the chosen real media company/creator yourself and agree what collaboration will actually happen.
- [ ] Obtain written scope, content/assets and permission to use its name or badge.
- [ ] Obtain exact badge wording, supporting endorsement, validity dates and a withdrawal contact.
- [ ] Obtain the council's authoritative licensing source or an agreed manual-verification route.
- [ ] Record licence/stall references, status, source date and correction contact.
- [ ] Supply the relevant samples and technical contact/documentation if an integration is intended.

**Provide:** genuine collaboration/badge permission, approved assets, source references and sample licensing data.

**After your action:** provider-specific displays/adapters can be implemented and tested. Fictional badges and permits remain demos until real evidence and activation exist.

## Step 9 - Arrange authority referral, waste collection and real rollout

**Features:** official complaint referral, collection partnerships and market expansion.

- [ ] Obtain the relevant authority's actual accepted intake destination/procedure and permitted case fields. Supply published documentation or a responsible contact.
- [ ] Obtain permission for any real test referral and specify the recipient, data and expected acknowledgement. Do not invent an agency API URL.
- [ ] Find a real collector and agree accepted materials, pickup conditions, destination and custody/receipt records.
- [ ] For each actual collection retain batch/quantity, time, destination and measured-weight/source evidence. Keep donation and compost/non-consumption routes separate.
- [ ] Obtain the target market organiser's permission and verify its coordinates, days/hours and stall onboarding arrangements.
- [ ] Onboard consenting stalls and record actual use at the new market; fictional map pins are not rollout evidence.
- [ ] Supply these inputs before asking the developer to build and test the real channel-specific adapters.

**Provide:** confirmed intake information, authorised test scope, collection agreement/receipts and verified market/onboarding data.

**Use for Steps 8-9:** [partner input guide](CP10_PARTNER_GUIDE.md). You conduct the outreach; the developer can prepare drafts or integrations when requested.

## Step 10 - Choose live hosting and commercial services

**Features:** hosted access, actual advertisements, paid sponsorship and subscription/billing activation.

- [ ] Decide whether you now want deployment; it remains on hold until requested.
- [ ] Identify the owner accounts for frontend hosting, backend hosting and the database.
- [ ] Specify the intended audience/domain, account mode and available service allowances/budget.
- [ ] If activating real ads or payments, choose the actual providers and create/use the required owner accounts.
- [ ] Supply required service configuration/access securely; do not place private keys in browser settings or this file.
- [ ] Request the specific deployment/integration work, then complete an actual hosted account/journey test and authorised provider sandbox tests.
- [ ] Verify an actual ad delivery or billing transaction/receipt before treating the simulated commercial flows as active.

**Provide:** owner account/project details, intended activation scope and secure provider configuration.

**After your action:** deployment and real ad/billing adapters remain developer jobs. Demo campaigns, pretend budgets and fictional subscriptions are already implemented but are not live commercial services.

## Step 11 - Resume installed Android/iOS testing when wanted

**Feature:** dedicated Android and iOS application acceptance.

- [ ] Tell the developer to resume native builds/device testing; you previously requested skipping them.
- [ ] Provide an Android test device and access to compatible Android Studio/SDK tools.
- [ ] Provide a Mac with Xcode for iOS build/simulator testing. Physical iPhone testing additionally needs signing/device setup.
- [ ] Build/install the actual debug application with developer assistance and retain build/artifact records.
- [ ] Test launch/restart, back/modal behaviour, permitted deep links, keyboard/safe areas, microphone/image permissions and local notification receipt.
- [ ] Test offline fallbacks, batch timers and expired offers after background/resume.
- [ ] If you also want real connected accounts/extraction in native apps, request that configuration separately; the prepared native bundle is fictional and isolated.

**Provide:** toolchain/device access, actual installed/simulator test results and build evidence.

**Use:** [native build/device guide](CP11_NATIVE_GUIDE.md). Windows-generated iOS sources alone are not a compiled iOS app. App-store publication is a later distribution choice.

## What to send next

Start with these practical inputs:

1. Invitation-only or public-registration choice.
2. Phone model, OS/browser and intended tester.
3. Private folder path once participant recordings and task observations are collected.
4. Exported provider usage records if you want measured operating costs.
5. Actual sales-history availability and any partner/provider details you want activated.
6. Whether to keep native testing and deployment deferred or resume them.

The developer can then complete scoring, configuration, missing adapters, fixes and evidence-based checklist updates. Supplying an input is progress; it is not automatically proof that the entire associated feature is complete.

## Reference documents

- [Current feature statuses](CONSOLIDATED_FEATURES_CHECKLIST.md)
- [Incomplete requirements and dependencies](PARTIAL_AND_PENDING_JOBS.md)
- [Human recording and measurement instructions](CP7_MEASUREMENT_GUIDE.md)
- [Real forecasting data instructions](CP8_FORECAST_GUIDE.md)
- [Partner input instructions](CP10_PARTNER_GUIDE.md)
- [Native build/device instructions](CP11_NATIVE_GUIDE.md)
