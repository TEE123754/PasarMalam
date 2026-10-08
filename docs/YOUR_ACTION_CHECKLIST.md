# PasarMalam — your actions and 12 image prompts

**CP7 update (8 October 2026):** use the [expanded recording and measurement guide](CP7_MEASUREMENT_GUIDE.md) and [24-case pack](../contracts/cp7-recording-pack.json) for the final holdout. Original satay scripts remain development/practice material. Local preparation passed; actual participant/device results remain unmeasured. [Evidence](CP7_ACCEPTANCE.md).


Updated 8 October 2026. This checklist covers local acceptance, images and preparation for a future pilot. It contains no deployment tasks. Supabase, Morpheus, VAPID and local operator settings are already configured privately; you do not need to send more keys for the current local app.

## 1. Check notifications on this computer

- [ ] Start the local services if stopped, following [local operations](local-operations.md). Open `http://127.0.0.1:5174/sandbox/profile` in Chrome, Edge or Firefox.
- [ ] Sign in with an existing fictional shopper account. Enable coarse nearby-market consent in Profile, open `/sandbox/advanced`, and choose test notification enrolment. Allow this site's notifications when the browser asks. Your earlier approval already covers this test.
- [ ] With a fictional hawker account in a separate browser profile, confirm an eligible clearance offer in the shopper's chosen market during an open market window. Keep the local worker running. Observe the actual notification and its link; a database record alone is not receipt. Never change a preparation time or extend an expiry to force delivery.
- [ ] Send me the browser/version, whether the notification appeared, and any visible error. A screenshot of fictional test content is useful; exclude account tokens or keys.

The in-app browser did not resolve notification permission, and desktop browser-control approval timed out. You can perform the browser test directly or make that browser available for a supervised acceptance run. No SMS/email provider is needed.

## 2. Check actual offline behaviour

- [ ] Open the production preview's `/demo/discover` in a supported browser while online. Apply any offered update after saving current work. Wait for **Fictional demo ready offline**. If readiness remains unconfirmed, record the message and keep the preview reachable; do not count this as a pass.
- [ ] Once ready, disconnect this browser's network temporarily, reload a demo route, and visit a demo page you have not opened in this session. Check that its layout renders and any unavailable artwork falls back to a described placeholder. Restore the connection afterwards.
- [ ] Record the result and browser/version. Connected account actions must remain unavailable offline; map tiles and the initial speech-model download are not part of the offline demo guarantee.

The cache repair passed automated checks, and the 8 October UI refresh observed **Fictional demo ready offline** after updating. A successful real offline reload has not been observed. This is still an acceptance task.

## 3. Supply human voice samples and timing participants

Follow the [complete voice-recording guide](VOICE_RECORDING_GUIDE.md) for consent wording, speaker allocation, all 24 scripts, file formats/names, live timing, reference-date handling and handoff.

- [ ] Recruit at least **five consenting speakers**. Use fictional details only and collect **24 recordings: 10 Bahasa Melayu, 10 Manglish and four English**. Scripts and expected fields are in [voice-evaluation.json](../contracts/voice-evaluation.json).
- [ ] Label files with clip IDs such as `bm-01.wav`, `manglish-01.wav` and `en-01.wav`; use the exact IDs from that contract. Keep consent records private and identify speakers with anonymous IDs. Provide the recordings' local folder path when ready, rather than publishing them or adding them to Git.
- [ ] Have participants perform matching voice and typing tasks in `/demo/evaluation`. Alternate task order and include corrections before confirmation. Record device/browser, network, cold model download and warm timing separately. Use live microphone tasks for timing; playing a supplied recording is not a valid live timing task.
- [ ] Return the exported evaluation records. I can calculate actual transcript error, structured-field accuracy and voice-versus-typing time from the measured inputs. Do not enter guessed scores or reuse synthetic pilot numbers.

The existing scripts are narrow satay examples; results from them must not be described as proof for every Malaysian dish. See [Phase 6 participant instructions](phase6-user-actions.md).

## 4. Make a target phone available

- [ ] Tell me the phone model, Android/iOS version and browser. Start with the actual low-cost Android phone your intended users would use.
- [ ] Use it to check microphone allow/deny, model download and memory, voice confirmation/fallback chips, installation, offline/update behaviour, slow-network reconnect, map/list, BM/English, big-button usability and the main shopper/hawker journeys.
- [ ] Record errors, crashes and timings with fictional accounts. A trusted local HTTPS setup is needed for phone microphone/push checks; plain LAN HTTP is insufficient. Phone `127.0.0.1` points to the phone, not this PC. Ask me to prepare the local device-test setup when the phone is available.

## 5. Supplied images — local integration complete

- [x] Supply all 12 PNG originals with the listed filenames in `IMAGE/`. No more images are requested; the prompts below remain optional references.
- [x] Validate and optimise the originals, strip output metadata and integrate 24 responsive WebP files with matching subjects and demo labels. Original PNGs are preserved. See [refresh evidence](UI_UX_REFRESH.md) and [provenance](supplied-image-provenance.json).
- [ ] Record the generator/model, generation date and confirm your public-use rights before a future public release. These details are not inferred from the files. No extra portraits, logos, ads or evidence images are needed.

**New image budget: 12 originals, down from 100 (88% fewer).** The old 100-slot catalogue is optional reference material, not a request to generate 100 files. Its existing IDs remain intact so dataset associations do not break. Use the subject-based mapping below; some legacy filenames do not match the current seeded dish, so do not blindly use them as upload instructions.

| Image | File | Intended use / existing slot |
| --- | --- | --- |
| PM-01 | `pm-01-night-market.png` | Night-market representative cover; MARKET-01; optional landing crop |
| PM-02 | `pm-02-day-market.png` | Day-market representative cover; MARKET-07 |
| PM-03 | `pm-03-satay-stall.png` | Bara Senja fictional stall; STALL-01; optional hawker illustration |
| PM-04 | `pm-04-nasi-lemak-stall.png` | Dapur Embun fictional stall; STALL-02 |
| PM-05 | `pm-05-chicken-satay.png` | Chicken satay; FOOD-01 |
| PM-06 | `pm-06-nasi-lemak.png` | Nasi lemak ayam; FOOD-02 |
| PM-07 | `pm-07-cendol.png` | Cendol; FOOD-03 |
| PM-08 | `pm-08-pork-noodles.png` | Pork noodles, non-halal demo item; FOOD-04 |
| PM-09 | `pm-09-lime-drink.png` | Fresh lime drink; FOOD-06 |
| PM-10 | `pm-10-kuih-talam.png` | Kuih talam; FOOD-07 |
| PM-11 | `pm-11-vegetable-popia.png` | Popia sayur; FOOD-09/15/21/27 where the dish matches |
| PM-12 | `pm-12-pisang-goreng.png` | Pisang goreng; FOOD-13/19/25 where the dish matches |

Reuse cover art only with a visible **Representative demo illustration** description. Food art may illustrate matching dishes and menu variants, never a newly cooked batch or a different dish. Keep unmatched food/stall slots as described placeholders. Users can use initials; partner workspaces and ads can use existing icons/text; synthetic evidence can remain text/described placeholders. No extra portraits, company logos, advertisements or complaint images need generation. No feature is removed by reducing artwork.

### PM-01 — night market

Save as `pm-01-night-market.png`.

```text
Create exactly one wide 16:9 image of a completely fictional Malaysian night market at blue hour. Orderly food canopies, warm amber string lights, a broad walking lane and a few diverse fictional adult shoppers in the distance. Put the main stalls on the right and keep the left third uncluttered for a later app headline. Polished editorial illustration with soft painted textures, natural proportions, warm amber and restrained teal colours. Opaque background, clear composition for a small phone screen. This is representative demo artwork, not a real market photograph. No text, numbers, logos, watermarks, halal symbols, certification seals, official documents or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1536 by 864 pixels or the nearest supported 16:9 size.
```

### PM-02 — day market

Save as `pm-02-day-market.png`.

```text
Create exactly one wide 16:9 image of a completely fictional Malaysian morning market. Soft morning sunlight, pale teal canopies, produce baskets and food counters along a wide clean walking lane, with a few fictional adult shoppers in the background. No recognisable landmark. Polished editorial illustration with soft painted textures, natural proportions, warm amber and restrained teal colours. Opaque background, clear composition for a small phone screen. Representative demo artwork, not a photograph of a real venue. No text, numbers, logos, watermarks, halal symbols, certification seals, official documents or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1536 by 864 pixels or the nearest supported 16:9 size.
```

### PM-03 — fictional satay stall

Save as `pm-03-satay-stall.png`.

```text
Create exactly one 4:3 image of a fictional Malaysian chicken-satay stall at dusk. A small grill with chicken skewers, a clean serving counter with separate utensils, covered ingredient containers and a plain teal canopy. One fictional adult hawker in a plain apron stands behind the counter. Eye-level view, stall centred, enough space for a phone-card crop. Polished editorial illustration with soft painted textures, natural proportions, warm amber and restrained teal colours. Opaque background. Representative demo artwork, not evidence of a real business or its hygiene. No readable signage, text, numbers, logos, watermarks, halal symbols, certification seals or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1536 by 1152 pixels or the nearest supported 4:3 size.
```

### PM-04 — fictional nasi lemak stall

Save as `pm-04-nasi-lemak-stall.png`.

```text
Create exactly one 4:3 image of a fictional Malaysian nasi-lemak stall in gentle morning light. A plain canopy, tidy counter with covered rice and chicken trays, banana-leaf serving plates, cucumber and sambal containers. One fictional adult hawker in a plain apron uses serving utensils. Eye-level view, stall centred, enough space for a phone-card crop. Polished editorial illustration with soft painted textures, natural proportions, warm amber and restrained teal colours. Opaque background. Representative demo artwork, not evidence of a real business or its hygiene. No readable signage, text, numbers, logos, watermarks, halal symbols, certification seals or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1536 by 1152 pixels or the nearest supported 4:3 size.
```

### PM-05 — chicken satay

Save as `pm-05-chicken-satay.png`.

```text
Create exactly one square food illustration of Malaysian chicken satay: golden grilled chicken pieces on bamboo skewers, a small bowl of peanut sauce, cucumber and compressed rice cubes on a simple plate. Three-quarter close-up, dish centred with crop space, neutral tabletop. Polished editorial illustration with soft painted realistic textures, appetising natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Fictional representative food artwork, not a photograph of a freshly cooked batch. No text, numbers, people, logos, watermarks, halal symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

### PM-06 — nasi lemak ayam

Save as `pm-06-nasi-lemak.png`.

```text
Create exactly one square food illustration of Malaysian nasi lemak ayam: coconut rice, one fried chicken portion, red sambal, cucumber slices, roasted peanuts, anchovies and half a boiled egg on a banana-leaf-lined plate. Three-quarter close-up, dish centred with crop space, neutral tabletop. Polished editorial illustration with soft painted realistic textures, appetising natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Fictional representative food artwork, not a photograph of a freshly cooked batch. No text, numbers, people, logos, watermarks, halal symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

### PM-07 — cendol

Save as `pm-07-cendol.png`.

```text
Create exactly one square food illustration of Malaysian cendol in a simple bowl: shaved ice, green pandan jelly strands, coconut milk, dark palm-sugar syrup and a few red beans, with a plain spoon. Three-quarter close-up, bowl centred with crop space, neutral tabletop. Polished editorial illustration with soft painted realistic textures, appetising natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Fictional representative food artwork, not evidence of freshness or a specific batch. No text, numbers, people, logos, watermarks, halal symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

### PM-08 — pork noodles

Save as `pm-08-pork-noodles.png`.

```text
Create exactly one square food illustration of a Malaysian-style pork-noodle soup: thin rice noodles, clearly depicted sliced pork, minced pork, leafy greens and spring onions in a plain ceramic bowl of clear broth. This fictional dish is for a non-halal demo menu; leave all dietary labels to the app. Three-quarter close-up, bowl centred with crop space, neutral tabletop. Polished editorial illustration with soft painted realistic textures, appetising natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Representative artwork, not a freshly cooked batch photograph. No text, numbers, people, logos, watermarks, religious symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

### PM-09 — fresh lime drink

Save as `pm-09-lime-drink.png`.

```text
Create exactly one square drink illustration of a fictional Malaysian lime drink: pale green lime juice and ice in one plain transparent cup, with a fresh lime wedge beside it on a neutral tabletop. Three-quarter close-up, cup centred with crop space. Polished editorial illustration with soft painted realistic textures, refreshing natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Representative demo artwork, not evidence of freshness or a specific prepared batch. No text, numbers, people, branding, logos, watermarks, halal symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

### PM-10 — kuih talam

Save as `pm-10-kuih-talam.png`.

```text
Create exactly one square food illustration of Malaysian kuih talam: several neat pieces of two-layer steamed kuih with a green pandan base and a creamy white coconut top, arranged on a simple banana-leaf-lined plate. Three-quarter close-up, plate centred with crop space, neutral tabletop. Polished editorial illustration with soft painted realistic textures, appetising natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Fictional representative artwork, not a photograph of a freshly cooked batch. No text, numbers, people, logos, watermarks, halal symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

### PM-11 — vegetable popia

Save as `pm-11-vegetable-popia.png`.

```text
Create exactly one square food illustration of Malaysian vegetable popia: lightly golden spring rolls filled with shredded cabbage, carrot and bean sprouts, one roll cut open to show the vegetables, with a small plain dipping bowl. Three-quarter close-up, plate centred with crop space, neutral tabletop. Polished editorial illustration with soft painted realistic textures, appetising natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Fictional representative artwork; do not imply certification, undisclosed ingredient guarantees or freshness of a specific batch. No text, numbers, people, logos, watermarks, halal symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

### PM-12 — pisang goreng

Save as `pm-12-pisang-goreng.png`.

```text
Create exactly one square food illustration of Malaysian pisang goreng: a small serving of golden battered banana fritters with visibly crisp texture on a plain banana-leaf-lined plate. Three-quarter close-up, plate centred with crop space, neutral tabletop. Polished editorial illustration with soft painted realistic textures, appetising natural colours, warm amber light and restrained teal accents. Opaque background, legible at thumbnail size. Fictional representative artwork, not a photograph of a freshly cooked batch. No text, numbers, people, logos, watermarks, halal symbols, certification marks or interface elements. One standalone image only, no collage, grid or multiple variants. Target 1024 by 1024 pixels.
```

## 6. Before any real-user or real-food pilot

- [ ] Arrange qualified review of the advisory freshness policy and handling assumptions. Confirm operational expiry/clearance rules and wording; the demo is not food-safety certification.
- [ ] Review Malaysia PDPA/privacy notices, transcript-provider consent, retention/deletion, location choices and moderator access with an appropriate adviser. Decide complaint appeal and legal-hold handling.
- [ ] Nominate an organiser/moderator and approve the one-market, 10-stall, four-week pilot with consent and actual RM/food-weight measurement. Synthetic dashboard numbers are not pilot results.
- [ ] Before storing real participant/customer data, rotate credentials previously shared in chat and update the ignored environment privately; never put replacements in public files or messages. Current local testing does not require you to resend credentials.

For now, continue using fictional data. Real companies, authorities, ads, payments and messaging remain internal simulations. You do not need their accounts, agreements or API keys to complete this local demo.

## CP1 registration/privacy acceptance (no deployment)

- [ ] Decide organiser-invited versus eventual public customer registration. Current fictional sandbox remains invite-only; no new keys are needed for CP3.
- [ ] Complete one consenting invitation/confirmation email and customer-profile journey on an approved test target; enter/set the password yourself. Automated token/error and SQL admission checks passed; actual email/password acceptance is still pending.
- [ ] Review [CP1 privacy/provider/retention draft](CP1_PRIVACY_REVIEW.md), including voluntary Muslim-owned declarations and private audit retention, before any real participant/pilot data.

[CP1 implementation and actual evidence](CP1_ACCEPTANCE.md).

CP2 is complete locally with no user action required. [Evidence](CP2_ACCEPTANCE.md). Availability defaults to a 30-minute confirmation age; any policy change should be reflected in the shared discovery constant/caller configuration before its phase gate. Directions open a third-party map only when the user chooses the action.

## CP3 recordings follow-up

CP3 code and local gates are complete. No new key is required. Follow the [CP3 held-out supplement](VOICE_RECORDING_GUIDE.md) for consenting BM/Manglish recordings; human local-expression accuracy remains unmeasured until CP7. [CP3 evidence](CP3_ACCEPTANCE.md).

## CP4 policy and phone follow-up

No new key is required for local passports, QR or handling records. Obtain qualified food-policy review using the [review package](CP4_POLICY_REVIEW.md); approved cumulative accounting remains to be implemented once rules arrive. Actual phone QR acceptance needs an approved reachable trusted local origin and your device; localhost points to the scanning device. Deployment remains excluded. [CP4 evidence](CP4_ACCEPTANCE.md).

## CP8: real history after local photo/planning completion

- [x] Existing Morpheus credits authorised; current photo route verified on a supplied illustration. No new key needed.
- [ ] Provide consented actual reconciled history: at least 30 usable same-weekday sessions per stall; a four-week pilot alone is insufficient. Keep records private.
- [ ] Review frozen real mean/median/trend errors, leftover performance and interval coverage before presenting results.

Follow [the CP8 collection guide](CP8_FORECAST_GUIDE.md). Four real-history requirements remain; CP7 participant/device work is separate. Deployment excluded.

## CP9: student showcase and competition evidence

- [x] Local preparation pack and technical rehearsal completed; no new images/API keys needed.
- [ ] Give the official competition name/link or rules file; confirm student/team and supervisor eligibility.
- [ ] Confirm whether a prior SantanSafe version exists, with dated evidence if applicable; neither answer is assumed.
- [ ] Review the TRL evidence against official criteria and complete actual CP7 measurements for any accuracy/feedback/cost claim.
- [ ] A participating student records the English showcase and full backup, then rehearses and reviews playback on the intended device. Record actual durations and failures privately.
- [ ] Confirm supplied-image generator/date/public-use rights before any future public video.

Use [the complete recording/rehearsal guide](CP9_SHOWCASE_GUIDE.md) and [evidence/declaration pack](CP9_EVIDENCE_PACK.md). Run the private-template command once; it preserves existing files. All five CP9 combined requirements remain open until actual evidence arrives. Deployment and submission are excluded.

## CP10: real partnership inputs (deployment excluded)

Local preparation is complete. Use [CP10 partner guide](CP10_PARTNER_GUIDE.md) and the six private `.local-evaluation/cp10/*.json` templates. Supply real media agreement/publication rights, exact badge wording/withdrawal permission, confirmed authority intake and consent/redaction rules, licensing provenance/manual verification, collector custody/receipt rules, and verified market/organiser/onboarding pilot data. Include reviewed dates/expiry, responsible owners and approved sample/test references. Filling a template never sends anything or establishes a partnership. All six acceptance requirements remain pending.

## CP11 native testing deferred

You chose to skip device/toolchain testing. Native Android/iOS source preparation is complete; no immediate action is required for this deferred work. To resume later, follow [native build and device guide](CP11_NATIVE_GUIDE.md). Actual APK/iOS builds, intended-device permissions/keyboard/offline checks and native remote push remain pending. Deployment actions are excluded.
