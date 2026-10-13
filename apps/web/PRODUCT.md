# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three primary audiences, served by separate interfaces in the same app:
- **Shoppers** who want to discover day/night markets, find stalls and promotions, and check halal/freshness information before buying.
- **Hawkers** running informal stalls without a POS system, who need a fast way (voice or chips/manual entry) to record batches, manage stock, and clear surplus before closing without competing with serving customers.
- **Market organisers/partners** who need scoped dashboards, permit/referral visibility, and surplus-collection coordination (donation/compost/BSF).

## Product Purpose

PasarMalam is a community market app for Malaysia's hawkers, shoppers and market organisers. It helps reduce food waste and recover value from unsold stock by giving hawkers a fast, voice-assisted way to log batches and offer surplus before a deterministic freshness window closes, while giving shoppers clear discovery and trust signals. Success is measured (in a future real pilot) as net RM recovered per participating stall-night and kg of food diverted to human consumption — not yet measured in production.

## Positioning

A deterministic, rules-based advisory engine (not an LLM) governs food-safety eligibility — ingredient/weather/uncertainty caps anchored to the original preparation time, where corrections can shorten but never extend a deadline. AI (local Whisper + optional Morpheus/Qwen extraction) only drafts listings from speech in Bahasa Melayu, English and Manglish; it always produces an editable, evidence-backed draft a human must confirm, and cannot publish or override eligibility itself. This separation of deterministic safety rules from human-controlled AI drafting is the core differentiator from a generic AI-listing or POS tool.

## Operating Context

- Core workflow: **prepare → record → review → monitor → offer → collect**.
- Hawkers work stall-side, often verbally, entering listings while actively serving customers (chips/voice/manual text as fallbacks for each other).
- A fictional `/demo/*` area (browser-local fixtures, no Supabase writes) demonstrates the full business vision — sponsored listings, ads, reservations, organiser dashboards, partner/authority collaboration, surplus collection — without contacting real companies, agencies, couriers or payment services.
- A separate `/sandbox/*` area exercises connected (Supabase-backed) acceptance against a guarded disposable project.
- Current status (as of 5 October 2026): locally built prototype, deployment on hold (planned Vercel/Railway hosting not live); Supabase connection, human speech evaluation and full device acceptance remain unfinished.

## Capabilities and Constraints

- Frontend: React 19, TypeScript, Vite, React Router, Tailwind CSS 4, Radix Dialog, Lucide, React Hook Form, Zod, i18next, TanStack Query, Leaflet/OSM. PWA with offline public-shell caching.
- Backend: Python/FastAPI, Pydantic, Supabase PostgreSQL/PostGIS/RLS/Auth/Storage/Realtime, Open-Meteo weather, SQL outbox/cron jobs, Web Push.
- Speech/AI: on-device Whisper-tiny ONNX transcription (audio never leaves device); optional consented cloud extraction via Morpheus `qwen35-9b` or an authenticated local llama.cpp model; bounded calls (timeout, max 800 completion tokens, 2 concurrent requests), no auto-retry across paid providers; confidence is an uncalibrated heuristic, not a safety score.
- Freshness/eligibility logic is deterministic and versioned, explicitly outside LLM control; the product carries no food-safety certification — it is a synthetic advisory, not scientific certification.
- Halal status is tracked as declared vs. certified-evidence vs. undeclared, kept distinct; the product must never infer religion/ethnicity from stall names.
- Community reports are private/confidential by default, with verified-account and rate-limit controls, independence checks, moderation, and a hawker reply opportunity before any public flag.
- No real payment, courier, ad-network, or official government submission integration exists yet; these are internal simulations in the demo.
- Photo assets: all current photo slots are placeholder white boxes with centred descriptions; real user-supplied images are pending (100 reserved slots).

## Brand Commitments

- Name: **PasarMalam**. Tagline: "Good food. Good neighbours. Less waste."
- Voice/positioning emphasizes transparency (labelled sponsorship, distinct halal statuses), human-controlled AI, and community trust over hype.

## Evidence on Hand

- Fixture catalog (fictional, browser-local, not Supabase-provisioned): 10 markets, 30 stalls/owners, 50 shoppers, 90 foods, 150 batches, 150 reviews, plus generated business histories.
- No real food photography yet — all image slots are described placeholders.
- No measured real-world results yet: time savings, waste reduction, WER/accuracy, and pilot outcomes are explicitly unmeasured. Do not fabricate testimonials, benchmarks, pricing, or deployment claims beyond what is documented.
- Verification snapshot: local regression suite passing (186 frontend, 149 API, 33 DB-dependent skips); ESLint/TypeScript/build/Ruff clean; no hosted deployment yet.

## Product Principles

- Human control over AI: extraction only ever produces a correctable draft with evidence; it never auto-publishes and never decides eligibility.
- Safety rules stay deterministic and outside the LLM: freshness/eligibility windows are versioned, rule-based, and can only shrink, never extend, on correction.
- Transparency by default: sponsorship, halal status, and advisory-vs-certification distinctions must always be clearly and separately labelled, never blurred for growth.
- Fictional vs. connected data must stay clearly separated (`/demo/*` vs `/sandbox/*` vs root app) so no demo persona or fixture can be mistaken for a real account, payment, or official submission.
- Don't claim what hasn't been measured: unmeasured outcomes (time saved, waste reduced, accuracy, pilot results) are stated as unmeasured, not implied as proven.

## Accessibility & Inclusion

No specific accessibility standard or requirement has been established yet (confirmed via interview). Record as an open decision for future work rather than inventing a target.
