# Stall batch photos — completed local update

9 October 2026. The sample market now shows candid phone-camera batch photographs, with complete images throughout the prefilled experience.

## Completed checklist

- [x] Generate 48 food/produce batch photographs: three independent camera views for each of 16 subjects.
- [x] Generate one community collection photograph and two fictional profile portraits.
- [x] Preserve the original 12 user-supplied images; save all 51 new originals under `IMAGE/generated-batches/`.
- [x] Ship 960px and 480px WebP versions under `apps/web/public/demo/images/`, each below 250 KB, with metadata removed.
- [x] Assign stable photo views by dish, serving size and batch number. Different preparations of the same food advance to another camera view.
- [x] Give sample records stable framing; historical batches use closer crops so the five records at a stall remain visually distinguishable with a compact three-view pool.
- [x] Use batch photos in hawker reminders, alerts, batch history, customer preparation cards, offers, product batch details and public batch passports.
- [x] Fill missing menu subjects: roti john, fried rice, apam jagung, teh bunga, ubi bakar, crispy tofu, curry puffs and seasonal vegetables.
- [x] Fill sample advertising, collaboration, review/report attachment and all 100 image-library slots using matching food, market, portrait or community context imagery.
- [x] Upgrade existing sample media without resetting actions, preparation/upload times, deadlines, quantities or statuses; preserve uploaded user photos.
- [x] Keep generated photos in the sample experience. Do not fabricate images for real listings without uploaded photos or change database records.

## Image generation prompts and provenance

The **built-in imagegen tool** generated the images. Every call generated one standalone image. The actual prompts and filenames are saved in [generated-batch-image-prompts.json](generated-batch-image-prompts.json). [generated-batch-image-provenance.json](generated-batch-image-provenance.json) records original hashes and responsive output sizes.

Example prompt: “Candid smartphone snapshot a hawker took on the spot at a Malaysian pasar malam stall: a stainless steel tray crowded with freshly grilled chicken satay skewers and peanut sauce. Left diagonal 45-degree overhead view, ordinary warm stall LED light, clean practical worktop, blurred canopy and market activity, realistic phone grain. No studio photography, graphic overlays, timestamps, logos or certification symbols.”

The three views are left diagonal, front-right and nearly overhead, with different tray arrangements. The pool is reused across matching stalls and historical examples; these sample photos are not 151 independently photographed real-world batches. The entry clarification continues to explain the fictional sample world. Unknown new dishes without uploaded photos retain a descriptive fallback instead of showing the wrong dish.

## Verification

- All 51 generated originals visually inspected.
- 49 focused tests passed, including seeded menu coverage, distinct generated views, asset availability/size limits and preservation of original batch times and uploaded photos.
- Lint and TypeScript/production build passed after correcting two integration errors.
- Local browser checks covered discovery, stall details, offers, hawker dashboard/history/alerts, batch passport and advertising, plus all eight image-library groups. No broken images, empty image placeholders or page errors in those populated views.
- Final conditional-view checks confirmed the collaboration workspace and curry-puff photo recognition image. A browser upload test confirmed that the uploaded original took priority and preparation time/deadline stayed unchanged.
- The 390px batch-history layout has no horizontal overflow.
- Local evidence: `.local-acceptance/batch-photo-browser-report.json`, `batch-history-desktop.png`, `batch-history-mobile.png`, `batch-alerts-desktop.png` and three visual photo proof sheets.

Deployment remains on hold. Real authority/certification evidence, real device/human acceptance and any external approvals remain the separate open items in the completion plan.
