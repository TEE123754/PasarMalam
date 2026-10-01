# PasarMalam — Product Requirements Document

Version: 4.0 · Date: 1 October 2026 · Status: full-feature demo, agent and pilot specification

Source: [original concept](PasarMalam.md). Execution guide: [implementation plan](IMPLEMENTATION_PLAN.md). Asset brief: [100 individual image prompts](IMAGE_GENERATION_PROMPTS.md).

## 1. Product definition

PasarMalam is a mobile-first community web app for discovering Malaysian night and day markets, helping hawkers manage food batches, and making surplus offers visible to nearby customers.

The app has two main interfaces: **Customer** and **Hawker/Vendor**. Restricted **Admin**, **Advertiser**, **Media Partner**, **Authority/Council**, and **Delivery/Collection** workspaces demonstrate supporting operations. Ship one installable progressive web app (PWA) with role-specific navigation and interactive Android/iOS screen previews; real native binaries are a later activation step.

The first release demonstrates the **entire product vision**, including features previously described as future implementation. Seeded business records, users, reviews, images, partners, cases, advertisements, transactions and presentation metrics are fictional. Core application logic works. Companies, authorities, payments, delivery and SMS/email remain simulated. The connected technical demo additionally supports live weather, real transcript-to-JSON LLM extraction, realtime database updates and actual Web Push to explicitly opted-in test devices. Label measured evaluation results and live weather separately from synthetic data. No money is charged, real agency case submitted or partnership implied.

The primary commerce journey is **reserve clearance food, then pay at the stall**. Retain mock online-payment/refund screens as a separate future-capability showcase; do not build a payment gateway for the demo or four-week pilot.

Every feature must have a usable screen, seeded scenario, user action, state change, and visible outcome. A “Coming soon” card, disabled button, or screenshot alone does not fulfil a demo requirement. Future work means replacing a simulated service with a real integration, not postponing the demo feature.

### Product outcomes

1. Customers can find a relevant market and stall by location, schedule, food category, dietary information, reviews, and available offers.
2. Hawkers can publish a stall, add food photos, and record each newly prepared batch without losing the history of older batches.
3. Hawkers receive handling-time reminders and can publish eligible surplus promotions before a listing deadline.
4. Bahasa Melayu, English, and common mixed-language updates work through editable text and assisted audio intake.
5. Customers can review stalls and report hygiene concerns confidentially.
6. Demonstrate complete sponsored-ad, advertiser, subscription, checkout, refund, and analytics journeys with fake money.
7. Demonstrate company/media partnerships, health-authority referrals, council permits/inspections, delivery, and surplus/waste collection through fictional partner portals.
8. Demonstrate advanced notifications, temperature monitoring, assisted AI and mobile-app experiences, with live technical adapters clearly separated from synthetic partner/sensor/native previews.

## 2. Decisions that supersede the original document

| Original proposal | Decision for this version | Reason |
| --- | --- | --- |
| Vercel or Cloudflare; Render backend | Vercel frontend, Railway backend, Supabase database/Auth/Storage | Matches the requested providers. |
| A guaranteed 100% free production service | Zero-spend demo within provider eligibility and quotas; no uptime guarantee | Free hosting has limits and commercial restrictions. |
| Weather-adjusted biological decay formula and ingredient multipliers | Deterministic, versioned advisory rules using confirmed ingredient risk, cooking time and temperature/humidity; synthetic rule caps in demo, expert-reviewed rules before pilot | Weather is a contextual proxy, not measured food temperature; no LLM or unvalidated formula may certify a safe consumption period. |
| Food photos identify hazards and establish freshness | Photos document a batch; hawkers explicitly confirm preparation time and handling information | A photo cannot establish microbiological safety, ingredients, or actual food temperature. |
| Certified safe countdown / verified freshness badge | Seller-reported preparation time and a clearly described listing deadline | The app must not certify safety or imply official endorsement. |
| Automatic high-risk score and authority escalation | Private moderation, redacted referral preview, consent, simulated authority acknowledgement and resolution | The full workflow is demonstrable without submitting a real complaint or publishing unverified accusations. |
| AdMob, SMS, real sponsorship payments in MVP | Full mock ad network, campaign checkout, subscription billing, SMS/push inbox and receipts | No real ad SDK, financial account, or messaging gateway is contacted. |
| All languages and fully automatic voice publishing | STT → LLM JSON extraction → confidence/validation → one-tap confirm or fix; chips fallback | The hawker confirms every listing; LLM output cannot determine deadlines. |

## 3. Users and permissions

| User | Main jobs | Permissions |
| --- | --- | --- |
| Visitor | Browse markets, stalls, menus, reviews, offers | Read published public information; use location optionally. |
| Customer | Find food, save stalls, leave a review, submit a complaint | Manage own profile, favourites, review, and private complaints. |
| Hawker/vendor | Maintain stall information, food items, batches, offers | Edit only owned stalls and related records; view own alerts and reported stock outcomes. |
| Admin | Maintain market schedules, moderate content, triage complaints | Restricted access with audit history; no public role-switch shortcut. |
| Market organiser | Onboard stalls, review early reports, track market outcomes | Assigned-market redacted reports, reply coordination and aggregate subscription dashboards. |
| Media/company partner | Create food trails, feature stalls, manage collaboration requests | Fictional organisation workspace; only assigned content and aggregate metrics. |
| Advertiser | Submit creatives, choose targeting/budget, inspect campaign results | Own fictional campaigns, simulated balance and receipts. |
| Authority/council officer | Review referred cases, inspect stalls, process permits | Only assigned redacted demo cases; no direct access to all customer complaints. |
| Delivery/collection partner | Accept deliveries or surplus/waste pickup jobs | Assigned fictional jobs and minimum necessary contact/location fields. |

A hawker can also use Customer mode. Switching interfaces does not grant permissions. Public browsing needs no account; writes require authentication. Hygiene reports require a **verified account** (confirmed email or organiser-assisted verification, not government-ID collection) and are anonymous to the public/vendor, with restricted moderator access. Remove the earlier guest-report path. Fictional fixture personas model verified/unverified states; connected sessions enforce them. Add a market-organiser role scoped to assigned markets, with access to early redacted reports and a reply workflow.

## 4. Scope and release boundaries

### Required in the full-feature demo

- Day and night markets, map pins, list view, recurring schedules, and closure exceptions.
- Separate customer and hawker experiences with BM/English interface translations.
- Stall profiles, food categories, dietary declarations, photos, menus, and batch history.
- Handling-time reminders, in-app alerts, batch-specific promotions, and automatic visibility cutoffs.
- Nearest, popularity, best-rated, promotion, category, and dietary filters.
- Voice → STT → LLM structured JSON with field confidence, one-tap confirmation/correction and quick-entry chips.
- Deterministic ingredient/time/weather advisory engine, closing-time agent and live map with realtime updates.
- Reviews with moderation; confidential complaints with private synthetic image/video evidence and simulated location metadata.
- Admin and partner workspaces, complete simulated advertisements/sponsorships/subscriptions, and advanced inventory/waste/campaign analytics.
- A seeded connected demo and a self-contained fixture demo that remains usable when free services are unavailable.

### Previously future features — now required as working simulations

- Sponsorship purchasing, ad network placement, advertiser portal, freemium upgrades, invoices, orders, reservations, mock payments, delivery, cancellations, and refunds.
- Push/SMS/email preferences, nearby offer targeting, notification inboxes, delivery-failure/retry scenarios, and native Android/iOS screen previews within the PWA.
- Hot/cold holding logs, simulated sensors and repeatable weather fixtures alongside the live weather adapter; isolated research previews cannot authorise food sales.
- Additional language/photo-AI scripted examples alongside real transcript-to-JSON extraction, editable drafts and low-confidence/error scenarios.
- Foodie-style media collaboration, influencer food trails, authority case handoff, municipal dashboard, permit verification, inspection follow-up, surplus donation, composting, and BSF collector workflows.

Section 16 is the feature coverage contract. All its rows are mandatory for the demo. Only actual commercial operation, real-world scientific validation, physical integrations, live third-party traffic, and native app distribution remain future implementation work.

The demo does not promise guaranteed background alerts, certified food safety, verified purchases, or live market attendance. Market hours are schedules; an operating stall is a separate hawker-reported status.

## 5. Customer experience requirements

### DISC-01 — Market discovery

- Default to a selected Klang Valley area; request location only when the customer chooses “Near me”.
- Allow a manual area or market selection if location is declined or unavailable.
- Display both map and accessible list views, with market name, day/night type, next opening, schedule status, and active stall count.
- Store recurring weekday/time schedules and date-specific overrides, including cancelled sessions and sessions crossing midnight.
- Use `Asia/Kuala_Lumpur` for schedule interpretation; store event timestamps in UTC.
- Market pins expand into stall directories. Approximate stall coordinates must be labelled; do not imply indoor navigation accuracy.
- Admins curate coordinates and schedules; demo locations and hours are prominently labelled illustrative, even when set in real neighbourhoods.

**Acceptance:** A user without location permission can discover both market types, open a stall, and see the correct scheduled status at opening, closing, and an overnight boundary.

### DISC-02 — Search, filters, and ranking

- Search stall names, menu items, and curated BM/English aliases such as `ayam/chicken` and `gerai/stall`.
- Support category, market type, open-now, active promotion, dietary status, and distance filters (500 m, 2 km, 5 km).
- Nearest uses straight-line distance with an explicit label; the delivery/route simulator can show fictional walking and arrival estimates marked “Simulated route”.
- Best rated sorts published review averages with review count visible; unrated stalls appear last. Break ties by count, then stable stall ID.
- Popularity uses distinct signed-in daily check-ins over the last seven days; one per customer/stall/day. It is an activity signal, not a verified visit count.
- Promotions filter only currently eligible batch offers. Sort choices remain available with filters.
- Sponsored stalls occupy at most two clearly labelled slots above organic results, must satisfy every active filter, and never displace the normal organic ranking silently.

**Acceptance:** Results update consistently between map and list; a sponsored non-halal stall cannot appear in a halal-certified filter; an expired offer cannot qualify a stall for promotion results.

### DISC-03 — Stall and food details

- Show stall images, market/lot, vendor opening status, description, categories, menu prices in MYR, reviews, active batches, and current offers.
- Each food photo shows batch number, hawker-declared preparation time, and server upload time as separate facts.
- Show “Prepared at 6:00 PM — reported by vendor”; do not label a batch “guaranteed fresh” or “safe to eat”.
- New batches receive their own cards. A “latest batch” highlight must not conceal older stock or overwrite earlier photos.
- Support favourites, manual check-ins and a pay-at-stall reservation flow with fictional collections. Fake online payment/delivery remain separate future-capability demonstrations; no real purchase is created by the demo.

### DIET-01 — Halal and other dietary information

- Distinguish `halal_certified`, `vendor_declared_halal`, `non_halal`, and `not_declared`.
- Certified claims require issuer/reference, validity dates, and admin-reviewed evidence before being displayed as reviewed. An expired or unreviewed claim cannot match the certified filter.
- Demo certificates are marked simulated and use no official seal or invented official certification number.
- Muslim-owned, pork-free, vegetarian, and alcohol-free are separate vendor declarations. They are not substitutes for halal certification.
- Food-level non-halal declarations cannot inherit a halal label from stall defaults. Display mixed/conflicting declarations clearly.
- Never infer halal status, religion or ethnicity from stall names, names of people, photos, language or location. Only explicit declarations and reviewed certification evidence set these fields.

## 6. Hawker experience requirements

### HAWK-01 — Stall and menu management

- Create/edit a stall, select its market, set lot and approximate map point, upload stall photos, and set opening/closed status.
- Manage foods with name, category, description, price, dietary declarations, and optional ingredient/allergen notes supplied by the hawker.
- Require confirmation of preparation and handling information rather than deriving it from image metadata or appearance.
- Support camera capture and file selection. Compress images, validate file contents, remove location metadata, and limit uploads to 5 MB input and approximately 500 KB stored output.
- Allow quantity to be unknown; never fabricate remaining stock.

### BATCH-01 — Independent batch records

- “New batch prepared” creates a new immutable batch identity under a food item, with sequential display number, preparation time, upload time, original quantity, remaining quantity, and handling declaration.
- Previous batches keep their own stock, deadline, photos, offers, and event history.
- Generate numbers atomically. Retried submissions with the same idempotency key must not create duplicate batches.
- Do not reset an old batch's clock by uploading another photo, editing a price, reheating, or renaming it.
- A vendor can correct a draft before publication. Published timing corrections require an audited action; later corrections cannot extend the existing listing deadline in the MVP.
- If old and new food are physically mixed, apply the earliest contributing deadline; the MVP UI instructs vendors to keep batches separate and supports an audited merge/withdraw action.
- Support `available`, `sold_out`, `withdrawn`, and `discarded` inventory states independently of time eligibility.

**Acceptance:** Batch 2 can be available while Batch 1 is withdrawn by its deadline; adding Batch 2 never changes Batch 1's time or offer eligibility.

## 7. Food handling reminders and promotion rules

### SAFE-01 — Deterministic freshness advisory engine

The engine is deterministic code, not an LLM decision. Inputs are hawker-confirmed ingredients, a versioned ingredient-risk mapping, cook time, handling declaration and market-area temperature/humidity from Open-Meteo. The source's thermal coefficients are not scientifically validated; do not reuse them as established safety rules. Ambient weather is not tray/core temperature, and relative humidity alone does not establish a food's water activity or microbiological state.

General public-health guidance advises against leaving cooked food at room temperature for longer than two hours. This informs a **conservative demonstration listing policy**, not a universal determination that food is safe before that time. Actual handling, contamination, cooling, food type, and temperature can make food unsafe earlier. Sources: [Malaysia MOH food-safety guidance](https://hq.moh.gov.my/fsq/amr-antimicrobial-resistance-dan-keselamatan-makanan), [WHO food-safety advice](https://www.who.int/europe/news-room/fact-sheets/item/public-health-advice-on-food-safety-during-summer).

For versioned policy `DEMO_ADVISORY_V2` (synthetic demonstration rules, not approved for real-food decisions):

1. Scope: seller-declared, newly prepared, ready-to-eat cooked food held at ambient conditions. Other food remains browsable as a menu item but does not receive a calculated safety window.
2. Require a valid preparation timestamp and explicit handling declaration. Unknown preparation/handling means `needs_information`, no countdown, and no time-based surplus promotion.
3. Derive a risk class from confirmed ingredients, taking the most restrictive applicable class. Compute `candidate_window = min(base_cap, risk_cap, temperature_band_cap, humidity_band_cap, uncertainty_cap)` from versioned numeric policy tables. For backwards-compatible demo fixtures, `base_cap` is at most 120 minutes; other synthetic caps can only shorten it. Compute `candidate_deadline = prepared_at + candidate_window`, then `effective_deadline = min(previous_deadline_if_any, candidate_deadline)`. Remaining minutes are `max(0, floor((effective_deadline - server_now) / 60 seconds))`. No arbitrary LLM-provided value enters this calculation.
4. Display an advance reminder at 30 minutes remaining and an urgent reminder at 15 minutes remaining. If created late, show the current most urgent state immediately.
5. At the deadline, stop public availability and end linked promotions. Preserve the record in vendor/admin history and ask the vendor to record the stock outcome.
6. Riskier ingredients, worsening weather or greater uncertainty may shorten an existing deadline; improved conditions never extend it. Reheating, cold/hot-holding claims and the research lab cannot extend or reset it.
7. Future-dated preparation times are rejected. Batches already beyond the cutoff may be saved to history but cannot be published as available.
8. Each decision stores policy version, confirmed ingredient/risk inputs, weather snapshot ID/time/source, caps used, reason codes and prior/new deadline in an append-only audit trail. Unknown ingredients use the strictest configured demo cap; missing cook time blocks eligibility. If no applicable approved policy exists in a real pilot, block timed clearance instead of inventing a window.

Weather adapter: retrieve `temperature_2m` and `relative_humidity_2m` for market coordinates, cache by market for 15 minutes, and mark snapshots older than 30 minutes stale. These are engineering cache choices, not scientific safety limits. Invalid/stale/missing weather triggers a configured shorter uncertainty cap and a visible warning; no silent ideal-weather default. Fetches and adverse changes re-evaluate active batches and their offers. Cache one market response for all its stalls. Source: [Open-Meteo variables](https://open-meteo.com/en/docs).

Before a real-food pilot, a qualified local food-safety reviewer must approve the ingredient/time/weather decision table and its applicability. If a scientifically supportable temperature/humidity adjustment is unavailable, keep those fields informational and disable the predictive timed-clearance mode for real foods. The demo can still exercise synthetic tables transparently. This boundary cannot be replaced with an LLM's opinion.

The UI says “Advisory window — vendor-reported batch time”, never “Safe” or “Certified fresh”. An optional LLM explanation receives only the computed facts/reason codes; a template fallback explains “90 min left” as a calculation, not a safety assurance. Any explanation that changes numbers or implies certification is rejected.

| Time/eligibility state | Condition | Public and vendor behaviour |
| --- | --- | --- |
| Needs information | Missing/unsupported handling data | Menu remains visible; no timed available-batch claim or promotion. |
| Within listing window | More than 30 minutes remain | Show preparation time and qualified availability. |
| Reminder | More than 15 and at most 30 minutes remain | Vendor reminder; eligible promotion may be suggested. |
| Closing window | More than 0 and at most 15 minutes remain | Urgent vendor reminder; new promotions disabled. |
| Deadline reached | Remaining time is zero or negative | Hide available batch and terminate all linked offers. |

These states never override `sold_out`, `withdrawn`, `discarded`, moderation blocks, or vendor closure. Consumer details can still show the food's menu entry without presenting unavailable stock as purchasable.

### ALERT-01 — Alerts and freshness of information

- Required channel: persistent in-app alert centre and visible banner, with optional sound after a user gesture.
- While the app is open and connected, target alert display within 60 seconds of a threshold. When reopened, reconcile missed thresholds immediately.
- A database scheduler creates deduplicated alerts; API queries independently enforce deadlines even if the scheduler is delayed.
- Background delivery with a closed browser is not guaranteed in this version. Explain this in the vendor setup flow.
- If connectivity is lost, show the last sync time and disable publication. Never show a cached offer as confirmed current availability.

### AGENT-01 — Closing-time agent

- Observe active batches, current advisory deadlines, stock and market/stall closing times through scheduled database jobs. Prioritise the earlier relevant cutoff.
- Persist a deduplicated nudge and a clearance **draft** with eligible batch, quantity, price proposal and end time; the hawker taps Confirm or Fix. No automatic publication without this approval.
- After confirmation, revalidate in one transaction, publish the offer, insert notification-outbox rows for opted-in nearby shoppers, and broadcast a public-safe realtime update. Do not notify before commit or after expiration.
- Actual connected-demo side effects are database writes, persisted audit/events and optional Web Push to enrolled test devices. SMS/email, agency and company messages remain simulated. Fixture mode produces labelled local events.
- Use idempotency keys, a leased outbox, retry/backoff, expiry checks and cancellation of obsolete drafts/jobs. At-least-once transport can duplicate push attempts; use stable notification tags and client event IDs to suppress repeat displays. Never claim exact-once external delivery.
- Deadline removal always happens through read/write eligibility enforcement even if the agent, network or push provider fails. The agent is a bounded workflow, not an unrestricted tool-using LLM.

### REALTIME-01 — Live map and PWA

- Use Supabase Realtime events for published stall status, offers and stock availability; invalidate/refetch canonical API results instead of broadcasting private table rows.
- Target visible updates within five seconds while connected; measure actual latency. On reconnect fetch a full snapshot before replaying new events, handling duplicates/out-of-order versions.
- Keep subscriptions limited to the visible market; pause hidden-screen work and use a 60-second polling fallback with a stale-state label.
- The PWA runs directly in a browser on low-cost phones without installation. Request location only on user action, use coarse area cells on the server, and offer manual market selection. Optional precise position for local distance calculation remains on-device.

### PROMO-01 — Surplus promotions

- Vendor chooses the batch, discount, quantity if known, and end time; the app suggests but never publishes automatically.
- Demo presets: 20%, 30%, 50%, 70%, fixed MYR price, buy-one-get-one, and eligible RM0 surplus offers. Bundles reserve/decrement every included unit; all batch deadlines still apply.
- Require more than 15 minutes until the batch deadline to create a promotion. This is a product buffer for the demo, not a scientifically validated consumption allowance.
- Set `promotion_end_at <= listing_deadline_at - 15 minutes`; optionally end earlier at market closing time. Existing offers end when this limit is reached.
- Never promote deadline-reached, unknown-handling, sold-out, recalled, or withdrawn batches; never offer them for donation as a workaround.
- Server checks current time, ownership, quantity, and price again when saving. Consumer responses apply the same rules.
- Record vendor-reported outcomes separately from simulated checkout sales and simulated weighed waste. None represents a real verified transaction or measured environmental benefit.

## 8. Language and audio requirements

### LANG-01 — Interface and search

- Complete BM and English translations for primary screens, form errors, alerts, and accessibility labels.
- Preserve users' original mixed-language text; do not silently translate names or rewrite claims.
- Search uses a small maintained synonym list. Arbitrary semantic understanding is not promised.

### VOICE-01 — Assisted updates

- Record or select a short audio clip (target 5–15 seconds, maximum 30 seconds).
- Use browser speech-to-text, then a separate LLM extraction call producing schema-constrained JSON. Deterministic parsing/chips are fallback paths, not a replacement for the primary LLM extraction requirement.
- Support creating a batch, updating price/quantity, changing stall status, and drafting a promotion.
- Extract `dish`, `quantity`, `unit`, `price_sen`, `ingredients`, `cook_time`, `timezone`, `action`, per-field `confidence` and `evidence_text`. Missing fields are null, never guessed. Validate with Pydantic/Zod; resolve dish identity and explicit date/time against selected market context.
- Show overall and per-field confidence as an **uncalibrated extraction score**, not a safety probability. Include schema validity, transcript evidence and ambiguity flags; do not trust LLM self-confidence alone. All users confirm; unresolved price/cook-time/ingredient ambiguities require Fix before publication.
- One prominent Confirm button saves a valid draft; tap a field to Fix. Quick chips cover known dishes, quantities, prices, ingredient checklist and “cooked now / choose time”, with no preselected unknown cook time.
- Ambiguous phrases such as “pukul lima”, multiple prices, or an unmatched dish require user correction; never invent a preparation time or food match.
- Delete raw voice blobs/temporary buffers immediately after transcription, or on cancellation/failure; stop microphone tracks and revoke blob URLs. Keep only the transcript plus confirmed structured listing fields, not voice recordings. Evaluation clips are a separate consented/synthetic test corpus, never harvested from user voice notes. Show model-download progress and chips on slow/unsupported devices.
- Provide labelled prerecorded examples with expected transcripts for demonstrations. A prerecorded example must not be represented as successful live recognition.

**Acceptance:** BM, English, and mixed-language examples each reach an editable draft. A live recording path works on a documented supported device; incorrect recognition cannot publish without review.

## 9. Community trust and moderation

### TRUST-01 — Reviews

- Signed-in customers submit 1–5 stars, text, and optional photo; one editable review per customer/stall in the MVP.
- Vendor owners cannot rate their own stalls. Demo content is labelled fictional.
- Published reviews determine ratings; pending/hidden/deleted reviews do not. Show average and count together.
- Admins can hide abusive content with a reason; users can report a review. The app must not call reviews “verified purchases”.

### TRUST-02 — Confidential complaints

- Categories: suspected spoiled food, pests, cross-contamination, handling hygiene, misleading information, and other.
- Collect stall, approximate incident time, description, and optional synthetic image or short video. Include a generated location-stamp example labelled simulated; it is not evidence of a real visit. Do not require exact customer GPS or medical information.
- Explain before submission: “Your identity is hidden from the vendor and public. Authorised moderators can access your report.”
- Store evidence privately. Restrict access to the reporter and authorised admins using short-lived URLs; vendors receive only a redacted summary if moderation requires their response.
- Workflow: verified submission → private organiser/moderator triage → hawker reply → needs information / resolved / dismissed. Early reports go privately to assigned organisers as redacted summaries; identity/evidence remain restricted unless separately authorised.
- Public flag eligibility requires at least three independent, reviewed reports from distinct verified accounts in a rolling 14-day window, a recorded moderator decision and a hawker reply opportunity (demo target: 48 hours). The threshold is a product rule, not proof of wrongdoing. Review collusion/duplicate incidents without collecting invasive identity/location data. Use “Reports under review”, show count/date and the approved hawker reply, and support correction/appeal/removal. Never automatically label a stall unsafe or alter its star rating.
- Apply limits of three new reports per account/day and one open report per account/stall/incident; an account updates its existing report rather than multiplying it. Verification is an anti-abuse measure, not proof of a physical visit. No guest submission path. Never automatically contact authorities.

### ADMIN-01 — Operations

- Maintain markets, schedules, categories, public content, dietary evidence review, reports, and simulated campaigns.
- Restrict admin assignment to a trusted administrative process. All privileged mutations receive audit events.
- For demo data, reset only the designated demo environment. For a future pilot, define approved retention and deletion rules before collecting real complaints; no claim of complete legal compliance is made here.

## 10. Monetisation and metrics

### MON-01 — Revenue demonstration

- Include sponsored search cards/map pins, native feed ads, banners, and optional non-blocking interstitial previews; every placement says “Sponsored — demo” or “Advertisement — demo”.
- Hawkers/advertisers create a campaign, select geographic/category targeting, upload generated artwork, choose dates and a pretend budget, complete mock checkout, and submit for moderation.
- Simulate approval/rejection, scheduling, active/paused/ended/exhausted states, impression/click events, budget consumption, and an explicitly synthetic performance report. At most two sponsored slots satisfy the same filters as organic results.
- Include freemium/free and mock paid vendor tiers with feature comparison, subscription activation/cancellation, renewal/failure scenarios, and downloadable watermarked demo receipts. No real payment fields or ad SDK.
- Any RM5/day or RM25/month figure from the concept is a pricing hypothesis, not an agreed business model.
- Before accepting payment or displaying commercial ads, reassess hosting eligibility, commercial terms, payments, refunds, advertising policy, and user consent.

### METRIC-01 — Product measures

| Measure | Demo/pilot target or definition |
| --- | --- |
| Discovery task | A first-time tester finds a relevant stall within 60 seconds. |
| Batch entry | Returning vendor completes the manual flow within 30 seconds, excluding image upload. |
| Voice draft quality | At least 80% of critical fields correct across a documented 24-clip BM/English/mixed-language evaluation set; all drafts still require confirmation. |
| Voice-versus-typing | Paired time-to-published-listing measurements including correction, with median/p90 and cold/warm inference times; no claimed speedup before measurement. |
| Reminder latency | Within 60 seconds while connected and open; immediate reconciliation on return. |
| Boundary integrity | No publicly eligible timed batch/offer after its applicable deadline in phase acceptance tests. |
| Waste-related reporting | Vendor-reported units sold through offers and units discarded, separately; estimated kg only when an explicit unit weight exists. |
| User activity | Aggregate market views, stall opens, favourites, and offer opens; no precise location history. |

Synthetic numbers demonstrate UI behaviour, not adoption, real food rescued, or proof of food safety.

## 11. Technical architecture

| Layer | Selected technology/tool | Purpose |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | One PWA with customer, hawker, admin and scoped partner workspaces. |
| UI | Tailwind CSS, accessible Radix primitives, Lucide icons | Shared components and mobile forms. |
| Client data/forms | React Router, TanStack Query, React Hook Form, Zod | Navigation, cached server reads, form validation. |
| Localisation | i18next + react-i18next | BM/English interface and formatting. |
| Map | Leaflet + React Leaflet; OSM raster tiles for modest interactive demo use | Simple pins and bounds; list view remains usable without tiles. |
| API | Python, FastAPI, Pydantic, Uvicorn, HTTPX | Authorisation, validation, and a versioned REST API on Railway. |
| Data | Supabase PostgreSQL + PostGIS | Relational records, geographic filtering, transactions and constraints. |
| Identity/media | Supabase Auth + Storage | Sessions and public/private media access policies. |
| Background work | Supabase Cron / pg_cron, pg_net, database outbox, FastAPI job endpoint | Closing-time agent, conditional wakeup/dispatch and retries without a separate always-on worker. |
| Audio | Transformers.js + pinned multilingual Whisper-tiny ONNX model, Web Worker | Browser-side transcription without a paid inference API. |
| Structured extraction | Gemini structured-output adapter behind FastAPI; optional local Qwen/llama.cpp developer adapter | Actual transcript → JSON extraction for synthetic demo inputs, schema validation and editable confidence. Free quota/availability checked at setup. |
| Weather | Open-Meteo HTTP API + market-level cache | Current modelled temperature/humidity, source time, conservative stale-data handling. |
| Realtime/push | Supabase Realtime; service worker + pywebpush/VAPID | Live map invalidation and real push only to opted-in demo testers; simulation otherwise. |
| Demo assets | Individual image prompts + committed generated assets; procedural SVG fallback and Sharp optimisation | 100 separately specified images; no paid runtime generation dependency. |
| Integration simulation | Typed TypeScript fixture adapters and FastAPI demo-provider adapters | Mock payment/ad/media/authority/delivery/notification/sensor services; deterministic events, fake references and controllable failures. |
| Tooling | Git, npm, uv, Supabase CLI, Ruff, ESLint, Prettier | Reproducible development and migrations. |
| Verification | Vitest + Testing Library, pytest, Playwright, axe-core | Focused phase-end unit/integration/browser/accessibility checks. |
| Hosting | Vercel frontend + Railway API + Supabase services | Required deployment targets. |

Use mutually compatible stable versions, pin them in Phase 1, and commit lockfiles. The plan intentionally does not prescribe potentially stale version numbers.

Normal path: **PWA → Railway FastAPI → Supabase Data API / transactional SQL RPCs**. Browser authentication uses Supabase Auth; constrained media uploads use Storage. User requests carry the user's JWT to Supabase so Row Level Security (RLS) remains active. The API verifies JWT issuer, audience, expiry, signature and ownership; it must not replace every user's token with a service key.

Critical state transitions live in transactional database functions so direct API access cannot bypass batch/deadline rules. FastAPI is the public application contract; raw table writes to protected records are revoked. A narrowly scoped administrative client is reserved for seeding/administration, never exposed to browsers.

Company/agency/payment/delivery/SMS/email adapters remain `integration_mode=simulated` in both application modes. Separate explicit flags allow live weather, real LLM extraction of synthetic transcripts and Web Push to consenting test subscriptions in connected mode. Server endpoint allowlists and private keys constrain those exceptions. No invented KKM/Foodie APIs. Scenario controls retain pending/rejection/timeout/replay paths. All fake business exports/receipts/reference numbers carry `DEMO-` labels; actual evaluation measurements must never be labelled or fabricated as synthetic success.

## 12. Data model and invariants

| Entity | Main information / relationship |
| --- | --- |
| profiles, user_roles | Auth user link, display name, locale; trusted role assignment. |
| markets, market_schedules, market_exceptions | Type, coordinates, timezone, recurring and exceptional operating sessions. |
| stalls, stall_memberships | Market, location, opening declaration, owner/member permissions. One owner per demo stall. |
| food_items, categories, dietary_claims | Menu, MYR price in integer sen, declarations, reviewed evidence metadata. |
| batches, batch_events, handling_policies | Item, sequence, preparation/upload times, stock state, immutable policy version and non-increasing advisory deadline; append-only decision history. |
| media_assets | Storage key, entity association, uploader, access scope, generated/demo flag. |
| promotions | Batch, price/discount, quantity limit, start/end, status. |
| alerts | Owner, batch, threshold, read state, deduplication key. |
| favourites, check_ins, reviews, review_reports | Customer interactions, uniqueness and moderation state. |
| complaints, complaint_events | Private report, reporter, evidence links and moderation history. |
| campaigns, ad_creatives | Simulated sponsored placement and ad content. |
| inventory_outcomes, analytics_daily | Vendor-reported stock outcomes and aggregate activity metrics. |
| organisations, organisation_members, collaboration_requests, media_features, food_trails | Fictional partners, scoped memberships, media approval and promoted trails. |
| referral_consents, authority_cases, case_events, inspection_visits, permits | Redacted demo referrals, assigned officers, inspections, simulated permit validity. |
| orders, order_lines, reservations, payments, refunds, subscriptions, invoices | Fake commerce ledger, stock reservations and idempotent financial state transitions. |
| ad_events, campaign_budgets | Synthetic impressions/clicks and budget accounting in integer sen. |
| delivery_jobs, collection_jobs, collection_events | Delivery, surplus donation and non-consumption waste destinations. |
| notification_preferences, notification_outbox, simulated_deliveries | Opt-in geofence/bulk messaging, rate caps and fake delivery receipts. |
| sensor_readings, weather_snapshots, research_scenarios, ai_drafts | Synthetic advanced handling and AI records; isolated from authoritative listing eligibility. |
| demo_scenarios, integration_events, asset_manifest | Stable scenario seed, mock-provider events, image prompt provenance. |
| extraction_runs, field_confidences, rule_decisions, agent_runs, clearance_drafts | Transcript-based extraction, confirmation, deterministic audit and idempotent agent actions; no raw voice storage. |
| organiser_memberships, report_replies, public_report_flags, commission_entries | Market-scoped triage/replies, moderated public flags and pay-at-stall commission ledger. |
| forecast_runs, pilot_sessions, pilot_measurements, push_subscriptions | Synthetic forecasts; separate measured pilot/evaluation evidence; protected push endpoints/coarse location cells. |

Required invariants: unique `(food_item_id, batch_number)`; no negative stock or prices; atomic stock changes; one active offer per batch for the demo; promo deadline cannot exceed its batch limit; deduplicated reminder events; spatial indexes for locations; UTC timestamps; no floating-point money; private evidence never enters public API projections.

Further invariants: partner organisation isolation; recorded consent before simulated external referral; no arbitrary outbound webhook URL; reservation expiry never extends a batch deadline; paid/refunded totals never exceed the fake ledger; callback replay never duplicates stock/money effects; simulated telemetry never overrides food availability. All business seed rows have `is_demo=true` and refer to fictional identities only.

## 13. Demo specification

### Two explicit modes

1. **Fixture demo:** Static Vercel build with bundled JSON and per-browser local state. Role selector uses fictional personas only. All writes are simulated and resettable. It has no production authentication or server secrets. A visible banner states “Demo: changes stay in this browser”.
2. **Connected demo:** Same screens use FastAPI, Supabase Auth, database, and Storage, with generated business content and simulated external providers. Invite-only test accounts use real role checks; demo identities remain fictional. Pre-created accounts avoid outgoing email. No publicly shared administrator credentials or partner credentials.

Choose mode explicitly; never silently switch a failing connected write into a simulated success. A backend outage provides a labelled “Open sample demo” action.

### Required seed content

| Content | Minimum seed target |
| --- | --- |
| Markets | 10 fictional listings around KL/Selangor: 6 night, 4 day; include closed, upcoming, open, and cancelled sessions. |
| Stalls/vendors | 30 fictional stalls / 30 owner personas across all dietary states and major food categories. |
| Customer/admin personas | 50 fictional customers and 1 private administrator; fixture personas need no real email. |
| Food items and batches | 90 menu items; 150 batches covering all time and inventory states, including multiple batches of one dish. |
| Reviews and complaints | 150 fictional reviews, 8 fictional private complaints with moderation states. |
| Promotions/campaigns | 12 offers covering percentages, bundles and RM0 eligible surplus; 8 campaigns across approval/budget states; 6 distinct generated ad creatives. |
| Generated media | 100 unique images: 2 hero, 10 markets, 30 stalls, 30 foods, 12 persona portraits, 6 partner scenes, 6 ads, 4 synthetic evidence/training scenes. Every image has its own prompt in IMAGE_GENERATION_PROMPTS.md. |
| Voice examples | 24 evaluation clips: 10 BM + 10 Manglish (the primary approximately-20-sample evaluation) + 4 English controls; human-labelled fields, ambiguity and noise cases. |
| Evidence video | 2 short synthetic training clips with simulated time/location captions, derived from the training artwork or a simple animated scene; neither is presented as a real incident. |
| Partner accounts | 12 fictional organisations and 18 scoped partner personas covering media, advertisers, authorities/councils, delivery, charity and waste collectors. |
| Partner content | 6 media features, 3 food trails, 6 collaboration requests; accepted, rejected and pending examples. |
| Agencies/authorities | 6 referrals from the 8 complaints, 4 inspections, 10 mock permits; consent, failed handoff and closed-case scenarios. |
| Commerce | 24 orders, 8 reservations, 24 payment attempts, 6 refunds, 8 subscriptions, 12 delivery jobs; include retry/cancel/fail scenarios. |
| Circular economy | 8 collection jobs split across eligible surplus donation, composting and BSF destinations; fake weights and receipts. |
| Notifications/advanced | 30 fake notifications; 3 sensor profiles with 48 readings each; 3 weather scenarios; 6 experimental/AI drafts, plus Tamil/Mandarin language examples clearly marked scripted. |

Use the individual prompts to generate and save each asset separately through an available no-cost generation route; never assume a paid subscription/API is free. When no such route is available, produce an original procedural illustration for that individual brief and identify its provenance. The image requirement remains in scope; only the production technique changes. Never substitute a collage/contact sheet for the 100 individual assets. Add “Generated demo image” as application text, and record prompt ID, filename, subject, alt text, generation method and license in the asset manifest. No image depicts a real vendor, actual complaint, official document or confirmed partnership. All people and organisations represented are fictional.

Seed from stable IDs and a fixed random seed. Provide a frozen demo clock for repeatable scenarios and an explicit reset-to-today seed command for the connected demo. Demo time travel cannot affect a production environment.

### Guided demonstrations

**Core journey (about five minutes):**

1. Enter Customer mode, select a market, filter for a food category and dietary status, and compare reviews.
2. Open a stall and view separate timestamps for Batch 1 and Batch 2.
3. Enter a fictional Hawker persona, upload a food image, and confirm a new batch from a voice draft.
4. Advance the fixture clock to a reminder threshold and publish an eligible offer.
5. Return as a customer and discover the offer; advance time again and show automatic offer removal.
6. Submit a private complaint; show restricted admin triage and the vendor's inability to see reporter identity.
7. Show labelled sponsored placement and vendor-reported stock outcomes.

**Full-vision journey (about fifteen additional minutes):**

1. As an advertiser, create an ad, simulate budget payment, approve it as admin, and inspect placement and synthetic results.
2. As a customer, reserve eligible stock, simulate payment failure/retry, switch to pickup/delivery, and complete or refund the order.
3. As a vendor, request a media feature; as the media partner, approve it and publish a food trail with a simulated partner badge.
4. Submit a confidential complaint, redact and consent to referral, receive a simulated authority case reference, and complete an inspection/follow-up in the officer portal.
5. Open the council dashboard, process a mock permit renewal, and inspect fictional occupancy/waste statistics.
6. Schedule an eligible donation and a separate compost/BSF collection; show collection receipts and synthetic weights.
7. Preview nearby push/SMS/email in simulated recipient inboxes, then exercise opt-out, timeout and retry.
8. Show sensor/weather scenarios and the isolated research/AI lab, plus Android/iOS screen previews; demonstrate that simulated safety outputs cannot reopen expired stock.

## 14. Free-service constraints and fallbacks

Provider facts checked on 1 October 2026; verify again before deployment.

| Service | Current constraint | Product decision |
| --- | --- | --- |
| Vercel Hobby | Free plan is for personal, non-commercial use | Use only for an eligible non-commercial demonstration. A revenue-generating launch needs a compliant hosting plan; it cannot be promised free on this stack. [Source](https://vercel.com/docs/plans/hobby) |
| Railway Free | Advertises a $5 trial for 30 days, then $1 monthly credit | Keep one small, request-driven API. Credits may not cover continuous use; fixture mode preserves the presentation. Do not upgrade or attach paid services automatically. [Source](https://railway.com/pricing) |
| Supabase Free | 500 MB database, 1 GB file storage, 50,000 MAU; projects can pause after a week of inactivity | Keep demo media below 100 MB and database below 50 MB; restore service before a presentation and keep reproducible seeds. [Source](https://supabase.com/pricing) |
| OSM public raster tiles | Community service with attribution, cache and usage requirements; bulk download/offline map caching prohibited | Interactive low-volume use only; exclude tiles from PWA offline cache; retain list fallback and configurable tile URL. [Source](https://operations.osmfoundation.org/policies/tiles/) |
| Browser speech inference | No paid inference API; download, memory, performance and recognition quality still matter | Lazy-load model with consent, pin artifact/license, keep text and labelled samples available. [Source](https://huggingface.co/docs/transformers.js/en/index) |

No paid LLM, SMS, maps key, image-generation subscription, weather subscription, custom domain, Redis, or commercial analytics is required for the non-commercial demo. Open-Meteo's free hosted service is non-commercial; reassess commercial use before the pilot earns commissions. A Gemini free-tier adapter is quota-dependent and must process only synthetic/redacted demo text under reviewed provider terms; no silent paid upgrade. Local Qwen inference is an optional developer-machine alternative, not something to host in Railway's small free container. Chips and labelled fixtures keep the demo usable during quota failures, but do not count as live extraction success. Sources: [Open-Meteo](https://github.com/open-meteo/open-meteo), [Gemini pricing and data-use table](https://ai.google.dev/gemini-api/docs/pricing).

## 15. Quality, privacy, and release acceptance

- Mobile layouts from 360 px; keyboard operation, labelled controls, 48 px primary buttons, and WCAG AA contrast. Keep basic discovery, listing, batch reminders, reporting and chips free. Use icons plus short BM/English labels, optional read-back, and a voice-first route for low-literacy users. Preserve manual/chips access on inexpensive devices.
- Target main-screen LCP at most 2.5 seconds in the agreed mobile test profile, excluding first speech-model download; record actual results rather than promising all networks.
- Paginate lists, lazy-load maps and voice assets, and keep the initial JavaScript target below 300 KB gzip excluding lazy chunks.
- Restrict CORS to configured frontend origins, validate uploads, rate-limit writes, redact logs, and keep service keys out of all frontend bundles.
- No offline write queue for timing-sensitive batches or promotions. Cache the app shell and reference content only; stale availability is clearly unavailable for action.
- Separate demo records and configuration from any future real-user project. Real customer complaints must never enter public fixture files.
- Target Chrome Android and desktop Chromium first; document Safari/iOS recording/model limitations and ensure the full text workflow still works.
- A real-vendor pilot requires review of food-handling policy, market facts, dietary claim verification, moderation operations, privacy/retention, and provider commercial eligibility.

The demo is complete when **every feature in Section 16 and the additions in Sections 17–18** has a working journey, all 100 image assets have provenance, and the final phase gate passes. Business content/exports remain synthetic and labelled; weather and measured evaluation results are identified accurately. Connected acceptance requires actual LLM extraction, realtime updates, agent database writes and opted-in test-device push; fixtures cannot be passed off as those successes. No paid service, real business payment or agency/company action is required. A feature may use its explicitly specified simulator but may not be left as “Coming soon”.

Testing is batched at phase completion as specified in the implementation plan. This PRD does not authorise an implementation run or claim that an application has already been built.

## 16. Full-feature demo coverage contract

The existing DISC, DIET, HAWK, BATCH, SAFE, ALERT, PROMO, LANG, VOICE, TRUST, ADMIN, MON and METRIC requirements remain mandatory. The following requirements add all previously future functionality. A simulator must execute a state transition and save its result in the selected application mode; decorative cards are insufficient.

| Requirement | Required screens/actions and fictional outcome | Build phase |
| --- | --- | --- |
| COM-01 Orders and reservations | Cart, pickup/delivery selection, stock reservation timer, checkout, order history, vendor accept/reject, collection code, cancel/refund | 8 |
| PAY-01 Payments and billing | Fake wallet/provider selection; success, failure, timeout/retry, receipt, refund, subscription upgrade/cancel/renewal | 8 |
| ADS-01 Ads and sponsorship | Advertiser portal, creative upload, moderation, targeting, pretend budget, placements, pause/resume, spend/report | 8 |
| DEL-01 Delivery partner | Dispatch board, assigned courier, simulated route/ETA, accept/pickup/arrival/failure/cancel events | 8 |
| PART-01 Food media and companies | Partner directory, collaboration request, editorial approval, featured stall, influencer trail, fake engagement report | 9 |
| GOV-01 Health authority | Referral redaction/consent, case routing, fake acknowledgement/reference, officer assignment, inspection and resolution | 9 |
| COUNCIL-01 Municipal operations | Permit application/verification/renewal, market capacity/occupancy, complaints map, aggregate waste dashboard | 9 |
| WASTE-01 Donation and organic collection | Eligible surplus matching, accept/schedule/collect, compost or BSF routing, fake weight/receipt | 9 |
| NOTIFY-01 Push, SMS, email | Opt-in preferences, nearby targeting, bulk campaign preview, simulated inboxes, sent/failed/retried/opt-out states | 10 |
| LAB-01 Advanced food handling | Fake thermometer feed, hot/cold logs, missing reading/excursion alerts, weather slider, isolated experimental projection | 10 |
| AI-01 Expanded assistance | Photo/extra-language scripted previews, distinct from real VOICE-01 transcript extraction; confidence/ambiguity/error states | 10 |
| APP-01 Native mobile preview | Android/iOS styled screen frames, onboarding, permission and notification demos, functional deep links into existing PWA flows | 10 |
| DATA-01 Analytics and premium tools | Multi-stall inventory, fake revenue/sales history, ad funnel, council/waste aggregates, date filters and demo CSV exports | 8–10 |
| IMAGE-01 Generated image library | 100 individual assets, prompt-to-file manifest, alt text, generated labels and correct entity associations | 11 |
| AGENT-01 Closing-time actions | Scheduled observation → persisted draft/nudge → hawker confirmation → committed offer/outbox → opted-in notification | 5, 10 |
| REALTIME-01 Live map | Realtime public-safe events, canonical refetch, reconnect snapshot and polling fallback | 3 |
| PRIV-01 / INCL-01 | Voice deletion, coarse opt-in location, PDPA notice/rights, free basic tier and accessible chips | 1, 2, 6, 7 |
| BIZ-01 / FORECAST-01 / PILOT-01 | Pay-at-stall commission, organiser subscription, forecast preview and one-market/10-stall/four-week pilot dashboard | 8–11 |

### COM-01 / PAY-01 / DEL-01 — Transaction simulation

**Primary path:** reserve → vendor accepts → customer presents collection code → pays vendor at stall → both confirm collection → commission ledger entry. No online payment is required. Commission applies only to completed eligible clearance collections, not bookings/no-shows; retain disputes and reversal history. The fake wallet/payment lifecycle below remains a separate future-capability demo and is not the pilot's checkout requirement.

- Inventory reservation is atomic and short-lived: `reservation_expires_at = min(now + 5 minutes, offer end, batch deadline minus the demo fulfilment buffer)`. Reject a reservation when no valid interval remains.
- Reserving stock decreases available-to-reserve quantity. Completion consumes it; cancellation/timeout releases it exactly once unless the batch is already unavailable. Availability filters still enforce deadlines after release.
- Demonstrate `pending_payment → paid → accepted → ready → collected` and a separate delivery path; also declined, cancelled and refunded branches. Do not mark all payment attempts successful.
- Mock checkout accepts a pretend balance or explicit scenario buttons, never real bank/card credentials. Use `DEMO-PAY-*` and `DEMO-ORDER-*` references.
- Simulate payment-webhook replay/late arrival. A late payment cannot resurrect an expired reservation; produce a synthetic reversal/refund instead.
- Capture vendor rejection, out-of-stock, courier unavailable, customer cancellation, delivery failure and full/partial refund cases. Partial refunds cannot exceed paid amount.
- Demonstrate a delivery only when the configured synthetic travel time and buffer fit the current batch/offer constraints. A displayed ETA is not a food-safety assurance.
- A review linked to a simulated order may display “Demo purchase”; it must never claim a real verified purchase.

**Acceptance:** A customer completes a fake order, another fails and retries without duplicate charges/stock deductions, a late callback creates no invalid sale, and a refund updates the fake ledger once.

### ADS-01 / DATA-01 — Ads, sponsored listings and premium tooling

- Advertiser portal supports generated brand profiles, six image creatives, campaign dates, market/radius/category targeting, daily/total fake budget, moderation and placement preview.
- Sponsorship applies to search and map placement; display ads use banners/native cards. An interstitial is demonstrated in an optional preview without blocking emergency or complaint flows.
- Include a fake ad-network dashboard with simulated request/fill/no-fill events, impressions, clicks, CTR and revenue; all metric labels indicate demo values.
- Calculate spend from deterministic synthetic events and a stated pretend pricing rule, not a real network promise. End/pause campaigns on budget exhaustion.
- Paid-tier preview unlocks multi-stall analytics, bulk notification drafts and exports. Include renewal failure, downgrade and cancellation without deleting vendor records.
- CSV/receipt exports carry demo headings and fictional values. Use generated reference numbers, no official invoice/tax claim.

**Acceptance:** Simulated payment activates an approved eligible campaign; it appears with the correct label and targeting, then disappears on budget exhaustion. Subscription cancellation changes the demo tier and preserves data.

### PART-01 — Food media, influencers and company integration

- Represent Foodie-style collaboration using fictional organisations such as **RasaTrail Media Demo** and **Jelajah Rasa Creators Demo**. A planning label may say “Foodie collaboration concept — simulated”; no real company account, logo or endorsement is implied.
- Show partner directory → vendor application → review/request changes → approve/reject → published feature. A featured badge reads “Featured by demo media partner”.
- Partner users assemble three food trails from eligible stalls, schedule a simulated campaign and view generated engagement metrics. Paid sponsored coverage remains labelled separately from editorial features.
- Seed fictional supplier/brand collaboration requests as well as food-media requests, with scoped partner permissions.

**Acceptance:** A vendor applies, the assigned fictional media editor approves, and customer discovery shows the feature and trail; another partner cannot edit that organisation's content.

### GOV-01 / COUNCIL-01 — Agencies and authorities

- Model **KKM/BKKM-style health referrals** and **Majlis Bandaraya-style council workflows** with fictional portal names such as **Demo Health Response Office** and **Majlis Bandaraya Seri Rasa Demo**. Any mention of KKM, DBKL or MBPJ is labelled “proposed integration concept — no affiliation”. Do not fabricate a real API, official seal, licence, or acceptance letter.
- Referral steps: select report → redact preview → explain destination/fields → record simulated consent → submit to local simulator → receive a fake acknowledgement → assigned officer investigates → request information → simulated resolution/closure.
- Only approved redacted evidence/fields enter the authority case. Officer/partner users cannot retrieve the original complaint or reporter identity by following an internal ID.
- Three independent reviewed reports within fourteen days trigger review under TRUST-02: private organiser triage, hawker reply opportunity and a moderator decision before any neutral public flag. This never triggers automatic external contact or a health diagnosis.
- Inspector portal includes visit scheduling, observation checklist, sample corrective actions and follow-up. Findings are explicitly synthetic; any public stall restriction is an auditable demo moderation action.
- Council portal supports permit apply/review/approve/reject/expire/renew, synthetic market capacity and allocation, complaint summaries and waste reports. Permit references start `DEMO-PERMIT-` and convey no legal permission.
- Also simulate dietary evidence verification; use `DEMO-CLAIM-*` references and application text instead of generated official certificates or halal logos.

**Acceptance:** No case is created before consent; a consented referral produces only a local `DEMO-CASE-*` record, timeout/retry is idempotent, the assigned officer sees only redacted content, and a permit expiry updates the demo status correctly.

### WASTE-01 — Surplus and circular-economy partners

- Use a fictional charity, compost collector, and BSF operator. Human-consumption surplus uses the same eligibility and pickup-buffer checks as offers; reaching the cutoff cancels the donation option.
- Keep human-consumption surplus separate from organic waste. Deadline-reached stock can appear only in non-consumption collection jobs; no claim that it is suitable for a real waste-processing method is made.
- Build request → partner accept/reject → pickup scheduled → collected/missed → synthetic receipt/weight, with separate source batch links and destinations.
- Record fake weighed kilograms and vendor-estimated kilograms separately. Dashboards label both as synthetic; exclude duplicate jobs from totals.

**Acceptance:** An eligible donation can be collected, an expired donation is blocked, and a separate compost/BSF job reaches collected status with a demo receipt.

### NOTIFY-01 — Notification integration simulator

- Show push/SMS/email opt-in preferences, radius (default 1.5 km), channel availability and quiet hours; customers can change or withdraw consent.
- Vendor bulk messaging previews recipients and fake cost before confirmation. Use only fictional recipient aliases; do not ask for real phone numbers.
- Create simulated deliveries in recipient preview inboxes with `queued/sent/failed/retried/suppressed` states. Changing channel state or opting out affects subsequent sends.
- Fixture mode demonstrates closed-app delivery in a labelled preview. Connected mode can deliver genuine Web Push to explicitly opted-in test devices, with recorded attempts and optional browser acknowledgement; SMS/email remain fake. Browser/OS support varies and receipt is not guaranteed. Never present provider acceptance as proof the user read an alert.

**Acceptance:** Only fictional opted-in recipients in the selected radius receive simulated events; opt-out and quiet hours suppress them, and retries do not duplicate delivery.

### LAB-01 / AI-01 / APP-01 — Advanced feature previews

- Sensor lab: synthetic probe readings, holding logs, missing data, excursion alerts, and warm/cold/ambient scenarios; every chart says “Simulated readings”.
- Research lab: fictional weather/ingredient controls and a clearly non-operational illustrative output representing the source's predictive-model idea. Do not describe it as validated, regulatory-compliant or a safe-consumption time. It never modifies operational batch deadlines or offers.
- AI preview: fixture-based audio/photo-to-JSON examples, detected-dish suggestions, tentative ingredient tags, confidence warnings, correction and approval. Photos never certify halal status or safety. Include request failure, quota exhaustion and low confidence.
- Keep actual BM/English/mixed STT + LLM extraction separate from scripted Tamil/Mandarin/photo-extraction examples and label each mode. All parsed fields still need explicit user confirmation.
- Android/iOS preview: interactive in-app device frames with customer/hawker onboarding, permission examples and notification/deep-link previews; buttons open real demo routes. These are not native binaries or app-store listings.
- Premium analytics includes multi-stall sales/inventory and council/waste timelines with synthetic values, date filters, drill-downs, and exports. Optional ingredient/allergen suggestions remain unverified drafts.

**Acceptance:** Each preview has a working scenario and visible result; experimental safety/AI output cannot change stock eligibility, and platform previews clearly identify simulated platform behaviour.

### Complete-demo definition

Maintain a requirement-to-screen-to-scenario-to-phase-check matrix in `docs/feature-coverage.md`. Every requirement above and every earlier feature needs at least one happy path plus its material error/permission boundary. Mark each as **working application logic**, **simulated external integration**, or **scripted capability preview**. Do not use “deferred” for a demo feature; reserve it for real-world activation steps after the demo.

## 17. Privacy, inclusion and evaluation additions

### PRIV-01 — Malaysia PDPA and data minimisation

Design for Malaysia's **Personal Data Protection Act 2010 (Act 709), as amended**, and review applicable notices, security, retention, access/correction, cross-border transfers, breach response and DPO requirements before collecting real pilot data. This specification is not a claim of legal compliance. Official reference: [Malaysia Personal Data Protection Commissioner — Act and current guidance](https://www.pdp.gov.my/ppdpv1/en/akta/pdp-act-2010-en/).

- Explain processing purposes in BM/English before microphone/location access. Separate listing, notification, partner-referral and optional research consent; allow withdrawal without losing basic browsing.
- Voice audio exists only in transient browser memory during transcription and is deleted immediately on result, failure or cancellation. Do not put audio in Storage, logs, analytics, service-worker caches or the LLM request. Retain the transcript and confirmed fields only. Use an explicit save/discard choice for drafts; proposed draft retention is 24 hours and published transcript retention 90 days, subject to pilot policy review.
- Location is opt-in. Offer market/area selection first; store at most an approximately 1 km area cell for notifications, with 24-hour expiry unless refreshed by consent. No movement history. Coarse-cell radius matching is approximate and must be labelled; precise device position may be used transiently on-device for distance sorting but is not sent to analytics or partners.
- Push endpoints are credentials: private storage, owner-scoped access, deletion on unsubscribe/account deletion and expiry cleanup. Log event IDs/status, never endpoint secrets or full report text.
- Provide account data access/correction/deletion requests, transcript deletion, notification opt-out and moderation appeals. Preserve only documented necessary audit fields, with a stated retention reason.
- Review hosted LLM data use before any real transcripts leave the device/server. Free-tier provider training/retention terms may make it unsuitable for personal pilot data. Synthetic evaluation fixtures and consented research recordings remain separate from user voice notes.

### INCL-01 — Access and language roadmap

Keep the basic tier free; premium features cannot block reminders, food eligibility, complaint handling or halal transparency. Prefer large controls, short audio/text prompts, selected-dish images and quick chips. Phase 6 covers BM, Manglish and English; Phase 10 includes clearly scripted Tamil/Mandarin previews. The real-language rollout follows representative recording evaluation and community translation review, not an unsupported claim of universal language understanding.

### EVAL-01 — Measured extraction and time-to-list

- Evaluate once at the completed Phase 6 gate on **20 recorded BM/Manglish examples** (10 each), plus four English controls. Use at least five consenting speakers speaking fictional listing details, include market noise, and freeze reference annotations before evaluation. No real customer names/addresses.
- Score dish normalisation, quantity/unit, exact price in sen, ingredient precision/recall and cook-time/date correctness. Count null/missed/unsupported values appropriately; do not count an omitted field as a correct extraction. Report per-field and all-required-fields-correct rates, BM/Manglish breakdown, JSON validity, correction rate and sample denominators.
- Record transcript WER separately from extraction quality, and raw-draft quality separately from hawker-corrected results. Target at least 80% critical-field accuracy as an initial engineering gate; this is not a food-safety validation threshold.
- Measure paired voice versus typing completion for the same listing tasks, counterbalance order, include confirmation/correction time, and report median/p90, device, network and cold/warm model state. Show measured results in the demo Evaluation screen; use “Not measured” until actually run.
- Write `docs/evaluation-report.md` with model/prompt/rule versions, sample manifest, scoring method, error examples and timing results. Do not repeatedly re-run the entire corpus after small edits; rerun affected failures only, then one final release regression.

## 18. Business model, positioning and four-week pilot

### BIZ-01 — Revenue beyond ads

1. **Clearance commission:** initial hypothesis of 3% of collected clearance value, configurable and explicitly unvalidated. Charge only after a pay-at-stall reservation is confirmed collected; cancelled/no-show/disputed collections create no final fee. A fictional RM5 sale produces a RM0.15 demo commission. Use a monthly statement and manual reconciliation in the pilot; no gateway or auto-debit. Demonstrate fees with fake money, and decide any actual pilot fee transparently with stall owners.
2. **Council/organiser subscription:** a scoped dashboard for food diverted, market activity hotspots, aggregate hygiene-report trends, response times and permit operations. Suppress small groups (initial product rule: fewer than five reports/contributors in an aggregate cell) and expose no complainant identity. Pricing is a pilot hypothesis, not evidence of willingness to pay.
3. **Premium demand forecast:** suggest preparation quantities from completed sales, stockouts, unsold quantities, market sessions, weekday and rain history. Example: “Consider cooking 20% less on rainy Tuesdays” is a synthetic demo scenario, never an asserted measured finding. Display sample size, baseline, uncertainty and an override; show “Insufficient data” when unsupported.
4. **Ads/sponsorships:** remain clearly labelled, capped at two sponsored result slots, and subject to every advisory-window, availability, halal and user filter. Ads cannot fund exceptions to these rules.

### FORECAST-01 — Forecast method

Begin with an explainable same-stall/same-weekday historical median and a bounded weather adjustment, not an LLM invention. Avoid interpreting sell-outs as full observed demand; mark stockout sessions as censored. At least eight comparable sessions is an initial engineering threshold, not proof of accuracy. Backtest using time-ordered holdout against the weekday-median baseline and report MAE plus unsold-unit change. The four-week pilot may be too short for reliable forecasts, especially for weekly markets; keep the premium preview synthetic until enough observations exist. LLMs may explain measured inputs but do not choose the forecast number.

### Positioning and one sourced market-size anchor

**Positioning:** a voice-first surplus and batch-management tool for informal Malaysian stalls with no POS or structured inventory, designed around night/day market schedules and mixed-language updates. Too Good To Go markets surplus tools to restaurants, bakeries, cafés and food stores; this supports a differentiation hypothesis but does not establish that competitors require a POS or exclude hawkers. Source: [Too Good To Go business product](https://www.toogoodtogo.com/en-us/b2b/software-for-restaurants-bakeries).

**Market-size anchor:** DOSM's Economic Census 2023 reports **136,453 food-and-beverage service establishments in Malaysia for reference year 2022** (release dated 5 August 2024). This is a broad sector figure, not a count of hawkers, market stalls, app users or PasarMalam's serviceable market. Do not convert it into revenue/TAM using guessed adoption. Estimate the reachable hawker segment later from verified organiser/vendor rosters. Source: [DOSM Economic Census — Food and Beverage Services](https://www.dosm.gov.my/portal-main/release-content/economic-census-2023-food-and-beverage-services-sector).

### Cold-start plan

- Recruit the supply side first through one consenting market organiser: onboard 10 stalls, populate actual schedules and menus with their permission, and practice batch/chips/voice updates before shopper acquisition.
- Once dependable offers exist, prepare BM/English QR posters and shareable offer cards for WhatsApp, Facebook and TikTok community groups. Let authorised organisers/group admins distribute them; do not scrape groups, harvest phone numbers, spam or auto-post.
- Seed the demo with fictional versions of these materials and referral-source metrics. Measure completed collections, not just clicks, and offer in-person setup support for hawkers without a POS.

### PILOT-01 — One market, 10 stalls, four weeks

The demo includes a **synthetic pilot dashboard**; this plan does not authorise contacting stalls or starting a real pilot. Real-food operation requires the rule-policy review, provider/commercial eligibility, privacy notice and organiser agreement described above.

| Week | Work | Evidence collected |
| --- | --- | --- |
| 1 | Onboard 10 stalls at one market; observe usual closing stock/discard practices; rehearse voice/chips and batch logs | Baseline per actual operating night: portions, weights, normal/clearance prices, operating time and entry time |
| 2 | Enable pay-at-stall reservations and approved advisory workflow; organiser-led community acquisition | Confirmed collections, no-shows, RM recovered, weighed diverted food and correction logs |
| 3 | Improve signage/onboarding; keep core measurement/rules fixed; review replies/reports privately | Adoption, closure-alert timing, dispute rate, low-literacy usability and matched baseline comparisons |
| 4 | Review stall-level economics and food outcomes; interview hawkers/organiser; decide continue/revise/stop | Median/spread per stall-night, missing-data rate, fees/willingness to pay and incident review |

**Primary KPIs:**

- **RM saved/recovered per stall per operating night:** collected clearance revenue minus actual commission, incremental packaging and refunds. This is a revenue-recovery proxy, not proven profit or ingredient-cost savings. Show each stall's numerator and actual number of participating nights; separate baseline net-revenue comparison when available. A weekly market yields only four sessions in four weeks, not 28 nights.
- **Kilograms of food diverted from disposal to human consumption:** weighed eligible food actually collected through clearance/donation, deduplicated by batch/collection ID. Mark food that would otherwise have been discarded using baseline/vendor declaration; disclose that attribution is uncertain. Keep compost/BSF kilograms and uncollected reservations separate. If weights are estimated from portions, label estimated totals distinctly.
- Secondary measures: active stalls/session, median time-to-list, extraction corrections, reservation-to-collection rate, alert delivery attempts, no-shows and complaints resolved. Synthetic demo numbers must not be used as pilot outcomes.

Provisional continuation thresholds (hypotheses to agree before launch): at least 8/10 stalls use the tool in their last scheduled session; at least 90% of stall-session KPI rows are complete; median net clearance recovery is positive; no unresolved critical permission/expiry defect. Record kg outcomes against baseline rather than invent a guaranteed reduction target. A safety incident or failed hard-stop enforcement pauses the affected flow for review.

## 19. Relevant repositories and model candidates

See [TECH_REFERENCES.md](TECH_REFERENCES.md) for verified GitHub/Hugging Face links, intended role, licenses/hosting caveats and selection gates. Initial candidates: Transformers.js + ONNX Whisper for STT; Malaya-Speech as a Malaysian-language comparator; Gemini structured output or developer-local Qwen + llama.cpp for extraction; Open-Meteo for weather; Supabase Realtime for map events; pywebpush for test-device push. None is a ready-made or validated food-safety engine, and none supplies project evaluation results without running the specified phase gate.

## Demo and real-app separation — Phase 4 amendment (1 October 2026)

The real app uses root routes and a dedicated production data environment. The standalone demo uses `/demo/*`, prefilled fictional personas, markets, menu, batches and reviews, and its own browser storage. A “Try demo” modal explains the playground and opens it explicitly; “Exit demo” returns to the real app. Demo code cannot authenticate or write to real services. All future feature demonstrations, including partners, authorities, ads and sponsorships, remain in demo scope and are built in their assigned phases. Generated images remain Phase 11 with one prompt per image. Production activation is pending its dedicated project, reviewed schema, privacy and food-policy acceptance; current Supabase migrations are deliberately disposable-demo-only.
