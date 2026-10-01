# PasarMalam — Technical Repositories and Evidence

Checked: 1 October 2026. Supports [PRD v4](PRD.md) and [implementation plan v4](IMPLEMENTATION_PLAN.md).

These are existing projects and model candidates, not installed dependencies or claims of measured PasarMalam accuracy. Review a pinned revision's license, model card, resource needs and compatibility during implementation. A free/open-source project does not automatically include free hosted inference or production hosting.

## 1. Recommended starting points

| Project / model | Use in PasarMalam | Selection and limits |
| --- | --- | --- |
| [huggingface/transformers.js — GitHub](https://github.com/huggingface/transformers.js) | Browser STT runtime in a Web Worker, with quantised models and WASM fallback | Repository identifies Apache-2.0; benchmark first-download size and low-end phone memory/latency. Do not assume WebGPU support. |
| [onnx-community/whisper-tiny — Hugging Face](https://huggingface.co/onnx-community/whisper-tiny) | Initial multilingual browser STT model compatible with Transformers.js | Pin the artifact and inspect upstream/model license before redistribution. BM/Manglish performance must be measured on the 20-recording set; not a guaranteed production model. |
| [malaysia-ai/malaya-speech — GitHub](https://github.com/malaysia-ai/malaya-speech) | Malaysian-language speech toolkit and comparator for local evaluation | Repository identifies MIT and a Python/PyTorch stack. Individual model/data licenses may differ. Use it to investigate improvements if Whisper-tiny fails; do not assume its models run in a browser or fit Railway's free memory. |
| [Qwen/Qwen2.5-1.5B-Instruct — Hugging Face](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) | Optional developer-local transcript-to-JSON extraction candidate | Model card identifies Apache-2.0 and structured-output capabilities. This is an evaluation candidate, not a claim of BM/Manglish reliability. Check quantisation and RAM on the development machine. |
| [ggml-org/llama.cpp — GitHub](https://github.com/ggml-org/llama.cpp) | Optional local LLM runtime; evaluate constrained JSON generation using a compatible model artifact | Run on an existing developer machine. Do not place the LLM in the small Railway free API container or assume free remote compute. Review runtime and selected model licenses independently. |
| [open-meteo/open-meteo — GitHub](https://github.com/open-meteo/open-meteo) | Weather-provider source and documentation; call the hosted API for market-area weather | Repository identifies AGPL-3.0; hosted free access is non-commercial. Use attribution and review service/data terms separately from source-code licensing. Self-hosting its weather pipeline is out of scope. |
| [supabase/supabase — GitHub](https://github.com/supabase/supabase) | Existing chosen data platform, with Auth, PostgreSQL, Storage and realtime services | Use managed Supabase for this plan, not an additional self-hosted stack. Apply RLS and use public-safe events; quotas remain relevant. |
| [web-push-libs/pywebpush — GitHub](https://github.com/web-push-libs/pywebpush) | Python Web Push delivery from the FastAPI outbox dispatcher | Review the pinned LICENSE and dependencies during setup. Protect VAPID keys and subscription endpoints; retries do not guarantee exactly-once receipt or browser delivery. |

Do not integrate every model/tool. Start with one STT model and one LLM provider, then compare alternatives only at the completed evaluation phase if results justify it. No downloaded repository is evidence of a validated food-safety rule set.

## 2. Initial service choices

### Voice → JSON

1. Browser audio → Transformers.js / multilingual Whisper-tiny → transcript.
2. Delete raw audio immediately on transcription completion/failure/cancellation.
3. Send permitted synthetic transcript text through FastAPI to a configured Gemini text model with structured output.
4. Validate the JSON schema and domain constraints, attach evidence/ambiguity-based confidence, then ask the hawker to Confirm or Fix.
5. If speech/inference fails, use quick-entry chips. A scripted sample remains labelled scripted and is excluded from measured extraction accuracy.

Gemini supports a subset of JSON Schema and Pydantic/Zod workflows; schema validity does not establish factual correctness. Select a currently available free-tier text model during Phase 1 and record its exact ID in the evaluation report. Pricing includes model-specific free/paid availability and data-use disclosures, so use synthetic/redacted demo input and review privacy suitability before a real pilot. Sources: [Structured output documentation](https://ai.google.dev/gemini-api/docs/structured-output), [pricing and data use](https://ai.google.dev/gemini-api/docs/pricing).

A developer-local Qwen + llama.cpp adapter is an alternative when an existing machine can run it. Do not silently expose a local inference server to the internet or assume a hosted Hugging Face endpoint is free. Cloud credentials, model weights and licenses require separate setup; this task only records the plan.

### Weather and advisory rules

Request current `temperature_2m` and `relative_humidity_2m` using market coordinates, not shopper location. Retain snapshot timestamp/source, apply a shared cache, and use the PRD's explicit uncertainty policy on failure. These are modelled area conditions, not a probe reading of food. Documentation: [Open-Meteo weather API](https://open-meteo.com/en/docs).

The deterministic engine is project-owned policy code. No linked repository establishes a validated ingredient/temperature/humidity-to-safe-consumption formula. Keep synthetic demo rule tables clearly marked; reviewed applicable guidance is a prerequisite to real-food use. General handling advice is available from [WHO](https://www.who.int/europe/news-room/fact-sheets/item/public-health-advice-on-food-safety-during-summer), but it does not validate the proposed weather adjustment.

### Realtime and closing-time agent

Use [Supabase Realtime](https://supabase.com/docs/guides/realtime) for scoped event invalidation and [Supabase Cron](https://supabase.com/docs/guides/cron) for SQL observation/draft/outbox work. Trigger the existing FastAPI dispatcher only when work is due. A persistent leased outbox, idempotency keys and hawker confirmation provide the agent workflow; an extra general-purpose agent framework is unnecessary.

Web Push uses pywebpush and an app service worker only for opted-in test devices. Private notifications should contain a generic message and authenticated deep link, not complaint evidence or sensitive details. Agency, company, SMS/email, financial and delivery side effects stay simulated.

## 3. Business and privacy evidence

| Topic | Verified source | What the documents may claim |
| --- | --- | --- |
| Malaysian market-size context | [DOSM Economic Census 2023 — Food and Beverage Services](https://www.dosm.gov.my/portal-main/release-content/economic-census-2023-food-and-beverage-services-sector) | 136,453 establishments for reference year 2022, released 5 August 2024. Broad sector context only; not a hawker/stall count, revenue forecast or current addressable market. |
| Competitor positioning | [Too Good To Go — software for restaurants and bakeries](https://www.toogoodtogo.com/en-us/b2b/software-for-restaurants-bakeries) | The product addresses surplus at restaurants, bakeries, cafés and food stores. PasarMalam's informal-stall/no-POS focus is a differentiation hypothesis; no verified claim that competitors require a POS. |
| Malaysia privacy obligations | [Personal Data Protection Commissioner — Act 709 and current guidance](https://www.pdp.gov.my/ppdpv1/en/akta/pdp-act-2010-en/) | Review the PDPA as amended and applicable notice, security, retention, rights, cross-border, breach-response and DPO requirements before real-user processing. The product plan is not legal certification. |

## 4. Adoption gates — only at phase completion

- **Phase 1:** pin compatible versions, document free-provider availability and exact model IDs. A source link is not a deployment guarantee.
- **Phase 3:** measure realtime update/reconnect behaviour and confirm event privacy.
- **Phase 5:** verify rule determinism, uncertainty shortening and agent database/outbox effects. Do not use an LLM as a food-safety oracle.
- **Phase 6:** score 10 BM + 10 Manglish recorded samples, four English controls, confidence errors and paired voice-versus-typing times. Record actual results, not copied model-card benchmarks.
- **Phase 10:** verify genuine opted-in test push, forecast baseline/holdout metrics and clearly labelled simulated advanced features.
- **Phase 12:** one full release acceptance run. Real pilot launch also requires food-policy, privacy, provider-terms and organiser readiness review.

All earlier phase-only testing rules remain in effect. Do not install, download, benchmark or repeatedly test every repository merely because it appears in this shortlist.
