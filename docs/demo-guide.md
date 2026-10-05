# Demo guide and provenance

Use `/demo/presentation` (Profile → Full demo studio & pilot). The visible demo banner is mandatory. All business identities, prices, reviews, complaints, histories, forecasts and pilot numbers are generated fiction. Root real-app routes never load this dataset; connected `/sandbox` permissions and device acceptance remain separate.

## Rebuild and reset

`npm run phase11:catalog` deterministically regenerates `contracts/demo-catalog.json` and the 100-slot manifest from the original discovery seed and individual prompt file. Seed 1101, stable IDs, frozen reference 2 October 2026, 20:30 Malaysia time. `npm run phase11:media` renders two eight-second synthetic text/diagram MP4s and three draft QR posters locally. `uv run --project apps/api python scripts/render_demo_media.py --origin https://YOUR_APPROVED_PREVIEW_ORIGIN` replaces the localhost QR destination when a deployed preview exists; nothing is distributed.

Enter the studio and choose Reset complete local demo before a presentation, especially when older browser state exists. That reset removes only named local demo/fixture keys and freezes the clock; it does not alter connected records/accounts. Individual scenarios replace the vendor/commerce/partner fixture workspace and show what to open next. Timing-sensitive writes retain their existing live checks; advancing time does not reopen expiry. Data regeneration does not silently overwrite an existing browser session.

## Five-minute core script

1. Studio → Reset complete local demo → Customer discovery. Choose Seri Pelita, a category and dietary filter; compare generated reviews. Certified labels are fictional reviewed evidence, while declared halal stays declared. Open Bara Senja and inspect its menu and separate preparation/upload/advisory times.
2. Return to studio → fresh → Hawker batch audit. Select Bara Senja. Inspect two independent batches; open Voice and chips. Use a labelled sample/manual entry for the scripted presentation. Only actual microphone/local-model runs may be called live extraction. Confirm a new draft manually; use a placeholder description until a user image is supplied.
3. Studio → reminder → Advisory and clearance. Find a current reminder and the original deadline. Show an already-confirmed eligible seeded clearance or publish a new eligible batch offer through the hawker confirmation form. A failed eligibility check is a useful safeguard, not a reason to extend the deadline.
4. Customer Offers shows labelled promotions. Studio → ending, then advance beyond expiry in existing scenario controls; refresh Offers to show delisting. Missing/stale handling/weather cannot reopen stock.
5. Community: choose a verified fictional reporter, submit a private synthetic report, then switch moderator and hawker personas. Demonstrate distinct redacted projections, independence/reply gates and no early public accusation. Switch Commerce to advertiser/admin and show labelled sponsored placement separate from organic ranking. Open hawker outcome reporting for synthetic sales/discard records.

## Full-vision script (approximately 15 additional minutes)

1. Reset the studio to start at the frozen time. Commerce → advertiser: onboard/create a campaign with a described creative; admin approves; advertiser inspects budget/impressions/clicks. Show rejected/paused/budget-exhausted seeded examples. Sponsored placement must obey category/dietary/market filters and expiry.
2. Commerce → shopper: choose an eligible seeded offer and reserve within stock/fulfilment time. Vendor accepts/readies; shopper pays at stall conceptually and both confirm the displayed code. A separate future pretend-payment scenario supports failure, retry and refund. Historical completed/refunded records are generated examples, never evidence of money exchanged.
3. Partners → hawker requests collaboration; assigned editor approves/publishes; show editorial features and a two-stop trail. Foreign editor cannot publish another organisation's request.
4. Community moderation creates a consented reviewed redacted referral only after independence/reply gates. Partners → assigned officer acknowledges, inspects, records corrective/follow-up steps and closes the fake case. Seeded historical cases contain synthetic summaries only; no original reporter/evidence is shared.
5. Partners → council: inspect market-scoped permits/expiry/renewal/capacity and coarse suppressed aggregates. They are not official permissions or guilt scores.
6. Partners → hawker/collector: schedule eligible fresh surplus donation, then separately an expired-food compost/BSF route. Consume stock only through a valid confirmed pickup. Estimated and synthetic weighed receipts remain distinct; non-consumption routes do not count as food eaten.
7. Advanced → notifications: inspect 30 fake histories, choose recipient/channel, queue, script failure, retry with the same event ID, then opt out before the next dispatch. No SMS/email provider is contacted. Real test Web Push requires separately configured sandbox and a consenting device.
8. Advanced → sensors/research/AI: three 48-reading timelines, missing/excursion states, weather conditions, editable scripted BM/Tamil/Mandarin/photo examples and failure/quota chips. These cannot mutate operational deadlines or publish drafts. Native frames show allowed/denied states and actual demo deep links.
9. Studio → pilot: compare weeks 1–4, show the weekly stall-night denominator, net RM formula and separate human/compost/BSF weights. Advanced forecasting shows minimum sample counts, censored stockouts, bounded rain reduction and chronological MAE. Synthetic results do not validate a pilot or model.
10. Studio → image library: 100 individual prompt/filename/entity slots. Show the two synthetic training videos and community draft posters. Do not distribute anything until organiser review and an approved destination.

## Dataset and media provenance

- Catalog: original deterministic fictional text/IDs/numbers; no scraped reviews, people, account passwords, government documents, official logos or real complaint evidence. Public discovery projects generated reviews and fresh eligible inventory; histories are labelled synthetic.
- Raster images: none created or supplied. `docs/asset-manifest.json` / `presentation/assets.json` reserve 100 unique IDs, descriptions, filenames, entity associations and one-image prompts. User images need content/provenance/licence validation and optimisation later. Reusing one food slot across a stall's three menu variants is representative imagery, not a photo of each preparation.
- Training clips: original diagrams/text with visible SYNTHETIC, fictional place/time and “not food safety evidence” captions. `docs/video-provenance.json` records renderer/timing/files. Pillow, qrcode and imageio-ffmpeg are local development tools; keep their packaged notices. The bundled FFmpeg/libx264 build's licence/distribution notice must be retained if redistributing that binary; the frontend ships the authored MP4 outputs, not the rendering binary.
- Whisper/Qwen/llama.cpp: pinned IDs, sizes and licence notes in `contracts/speech-model.json` and `contracts/local-llm-runtime.json` (MIT upstream Whisper/llama.cpp; Apache-2.0 Qwen). ONNX repository lacks a separate licence field in the recorded review; preserve upstream attribution and recheck before deployment.
- Speech evidence: 24 labelled sample scripts exist in `contracts/voice-evaluation.json`; consented human recordings/approximately-20 BM/Manglish measurements remain pending. Do not fill audio fields or measured scores using synthetic pilot data, generated clips or typed transcripts.
- DOSM source was rechecked on 2 October 2026: [Food and Beverage Services Census](https://www.dosm.gov.my/portal-main/release-content/economic-census-2023-food-and-beverage-services-sector), 136,453 establishments in reference year 2022. Broad context only, not a hawker TAM.

## Acceptance still required

The full fixture is available locally. Full connected dataset provisioning/reset-to-today and fixture/SQL scenario parity remain unchecked, alongside actual consented speech clips, opted-in device push, actual downloaded export verification, complete desktop/phone guided runs and target-device accessibility/performance. See implementation checklist and USER_ACTIONS.md. No hosting, remote reset or public operator endpoint exists.
