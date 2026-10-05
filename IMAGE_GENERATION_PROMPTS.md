# PasarMalam — Individual Image Generation Prompts

Version: 1.0 · Asset brief for the full-feature demo

Related documents: [PRD](PRD.md) · [Implementation plan](IMPLEMENTATION_PLAN.md).

## How to use

- **One prompt = one image.** Copy one complete prompt block into your chosen image generator and request one output. Every prompt is self-contained; do not combine multiple prompts into a collage or a single batch image.
- These are prompts, not already-generated image files. This document contains **100 unique image briefs**. User instruction: do not generate these now. Keep described placeholders; the user will provide images later.
- Save the full-resolution result as the specified PNG filename. Create a matching optimised WebP for the app later. Suggested destination: `apps/web/public/demo/images/`.
- Use an available free generation allowance or local generation route; no paid provider is assumed. If none is available, create a separate procedural illustration for each brief and record that production method.
- Use one consistent editorial illustration style. Do not add text inside the artwork: the app supplies stall names, prices, ads, fake reference numbers, timestamps, dietary information and **Generated demo image** labels as accessible HTML.
- All people, stalls, advertisers, partners, locations and incident scenes are fictional. Do not generate real company logos, government seals, halal marks, permits, official IDs or realistic certification documents.
- Aspect ratios are targets; crop/resize a supported generator output without distorting its subject. Backgrounds are opaque. Do not generate multiple views or variations within a single output.
- Record prompt ID, original filename, optimised filename, associated entities, alt text, generation method, generation date, and usage/license information in `docs/asset-manifest.json`.
- STALL-01 through STALL-30 correspond respectively to FOOD-01 through FOOD-30. The 30 food images may illustrate the relevant 90 menu entries; label reuse as representative demo imagery, never a photograph of a specific newly cooked batch.
- Twelve portrait images can serve as reusable fictional persona artwork; other seeded users may use generated initials. Reuse does not imply the same real identity.
- Evidence/training images are private demo attachments and must retain a visible synthetic-evidence label in the UI and exports. They must never be attributed to a real vendor.

## Asset inventory

| Group | IDs | Count | Main use |
| --- | --- | --- | --- |
| Hero | HERO-01–02 | 2 | Customer landing, hawker onboarding |
| Markets | MARKET-01–10 | 10 | Market covers |
| Stalls | STALL-01–30 | 30 | Fictional vendor profiles |
| Food | FOOD-01–30 | 30 | Menu and batch illustrative images |
| Personas | PERSONA-01–12 | 12 | Fictional account portraits |
| Partners | PARTNER-01–06 | 6 | Company/agency/collection workspaces |
| Ads | AD-01–06 | 6 | Sponsored campaigns and company ads |
| Training | EVIDENCE-01–04 | 4 | Synthetic complaint/handling scenarios |
| **Total** | | **100** | **100 separate image outputs** |

## Hero images

### HERO-01 — Customer landing hero

**Save as:** `hero-01-customer-market-hero.png`

```text
Generate a single wide 16:9 landscape image, target 1536 x 864 pixels. A lively fictional Malaysian night market at blue hour, warmly lit food canopies curving into the distance, several diverse fictional adult visitors walking between stalls, a steaming wok and food counter in the right foreground. Keep the left third quiet and dark enough for a later headline overlay. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Show considerate, plausible food handling and clean utensils without suggesting official approval. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### HERO-02 — Hawker onboarding hero

**Save as:** `hero-02-hawker-community-hero.png`

```text
Generate a single wide 16:9 landscape image, target 1536 x 864 pixels. A fictional adult Malaysian hawker in a plain teal apron carefully setting down a covered food tray inside a welcoming market stall, another adult customer waiting outside, amber hanging bulbs and soft twilight. Main subject on the right, generous uncluttered space on the left for app copy. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Show considerate, plausible food handling and clean utensils without suggesting official approval. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

## Market cover images

### MARKET-01 — Seri Pelita — night market

**Save as:** `market-01-pasar-seri-pelita.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian night market with a broad pedestrian lane, plum and amber canopies, decorative string lights and a small satay grill in the foreground. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-02 — Lorong Buluh — night market

**Save as:** `market-02-pasar-lorong-buluh.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian night market with a leafy residential lane, green canvas canopies, bamboo serving baskets and warm pendant bulbs. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-03 — Taman Senja — night market

**Save as:** `market-03-pasar-taman-senja.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian night market with a spacious suburban square, coral canopies, soft mauve dusk and families of fictional adults shopping. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-04 — Sungai Bintang — night market

**Save as:** `market-04-pasar-sungai-bintang.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian night market with a riverside promenade with teal railings, warm market lights reflected in water and orderly food stalls. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-05 — Bukit Rasa — night market

**Save as:** `market-05-pasar-bukit-rasa.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian night market with a gently sloping neighbourhood street, distant low hills, ochre canopies and food-stall steam. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-06 — Laman Jingga — night market

**Save as:** `market-06-pasar-laman-jingga.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian night market with an open courtyard surrounded by modest shophouses, burnt-orange canopies and hanging amber lanterns. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-07 — Pagi Embun — day market

**Save as:** `market-07-pasar-pagi-embun.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian morning market with morning mist lifting over an open-air produce lane, fresh leafy vegetables and pale teal market umbrellas. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-08 — Tani Ceria — day market

**Save as:** `market-08-pasar-tani-ceria.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian morning market with a farmers market with woven baskets of local vegetables, cream canvas shade and soft early sunlight. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-09 — Pagi Harmoni — day market

**Save as:** `market-09-pasar-pagi-harmoni.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian morning market with a neat breakfast market courtyard with banana-leaf food parcels, hot drink stalls and gentle sunbeams. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### MARKET-10 — Kebun Murni — day market

**Save as:** `market-10-pasar-kebun-murni.png`

```text
Generate one 4:3 landscape market-cover image, target 1536 x 1152 pixels. Depict a completely fictional Malaysian morning market with a garden-edge market with tropical greenery, orderly fruit tables and mint-green shade cloth. Use an inviting eye-level composition with a clear central walking path and fictional adult shoppers in the background. Do not depict a recognisable real venue or landmark. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

## Stall cover images

### STALL-01 — Nasi Lemak Ayam

**Save as:** `stall-01-nasi-lemak-ayam.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Nasi Lemak Ayam. Include a terracotta canopy, banana-leaf parcels, rice pot and covered side-dish trays. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-02 — Chicken Satay

**Save as:** `stall-02-satay-ayam.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Chicken Satay. Include a amber canopy, narrow charcoal grill, neat bamboo skewers and a small serving counter. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-03 — Seafood Char Kway Teow

**Save as:** `stall-03-char-kway-teow.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Seafood Char Kway Teow. Include a deep teal canopy, black wok, stainless preparation bench and separated ingredient bowls. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-04 — Roti Canai

**Save as:** `stall-04-roti-canai.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Roti Canai. Include a cream canopy, flat griddle, stacked plain plates and a compact dough station. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-05 — Beef Murtabak

**Save as:** `stall-05-murtabak-daging.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Beef Murtabak. Include a maroon canopy, broad griddle, spatulas and a covered cooked-food tray. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-06 — Apam Balik

**Save as:** `stall-06-apam-balik.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Apam Balik. Include a mustard canopy, round shallow pans and a wooden display of folded pancakes. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-07 — Pisang Goreng

**Save as:** `stall-07-pisang-goreng.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Pisang Goreng. Include a rust-orange canopy, covered fryer station and a draining rack of golden fritters. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-08 — Karipap

**Save as:** `stall-08-karipap.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Karipap. Include a sage canopy, glass pastry case and orderly trays of crescent pastries. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-09 — Cendol

**Save as:** `stall-09-cendol.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Cendol. Include a mint canopy, shaved-ice station, clear ingredient tubs and simple bowls. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-10 — Ais Kacang

**Save as:** `stall-10-ais-kacang.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Ais Kacang. Include a sky-blue canopy, ice-shaving machine and colourful neatly closed ingredient containers. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-11 — Teh Tarik

**Save as:** `stall-11-teh-tarik.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Teh Tarik. Include a caramel canopy, metal tea jugs, stacked plain mugs and warm steam. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-12 — Sugarcane Juice

**Save as:** `stall-12-air-tebu.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Sugarcane Juice. Include a lime canopy, clean sugarcane press and trimmed stalks stacked neatly. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-13 — Asam Laksa

**Save as:** `stall-13-asam-laksa.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Asam Laksa. Include a plum canopy, covered soup pot and colourful garnishes in separate bowls. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-14 — Curry Laksa

**Save as:** `stall-14-curry-laksa.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Curry Laksa. Include a brick-red canopy, deep covered broth pot and organised noodle baskets. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-15 — Nasi Kerabu

**Save as:** `stall-15-nasi-kerabu.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Nasi Kerabu. Include a turquoise canopy, blue rice display and fresh herb bowls behind a screen. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-16 — Nasi Dagang

**Save as:** `stall-16-nasi-dagang.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Nasi Dagang. Include a soft coral canopy, covered rice pot and separate fish-curry serving trays. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-17 — Ayam Percik

**Save as:** `stall-17-ayam-percik.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Ayam Percik. Include a burnt-sienna canopy, shallow grill and a basting station with separate utensils. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-18 — Ikan Bakar

**Save as:** `stall-18-ikan-bakar.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Ikan Bakar. Include a navy canopy, covered grill, banana leaves and plain stainless fish platters. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-19 — Otak-Otak

**Save as:** `stall-19-otak-otak.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Otak-Otak. Include a olive canopy, compact grill and neatly stacked leaf parcels. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-20 — Rojak Buah

**Save as:** `stall-20-rojak-buah.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Rojak Buah. Include a bright peach canopy, protected fruit display and plain stainless mixing bowls. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-21 — Kuih Seri Muka

**Save as:** `stall-21-kuih-seri-muka.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Kuih Seri Muka. Include a pistachio canopy, covered trays of green-and-white kuih and simple serving tongs. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-22 — Onde-Onde

**Save as:** `stall-22-onde-onde.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Onde-Onde. Include a pale yellow canopy, coconut-dusted kuih trays and a covered display case. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-23 — Kuih Lapis

**Save as:** `stall-23-kuih-lapis.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Kuih Lapis. Include a rose canopy, transparent pastry case and neatly aligned colourful layered cakes. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-24 — Putu Piring

**Save as:** `stall-24-putu-piring.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Putu Piring. Include a ivory canopy, traditional round steaming moulds and small banana-leaf squares. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-25 — Vegetable Popiah

**Save as:** `stall-25-popiah-sayur.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Vegetable Popiah. Include a leaf-green canopy, clean rolling station and covered bowls of vegetable fillings. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-26 — Fish Yong Tau Foo

**Save as:** `stall-26-yong-tau-foo.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Fish Yong Tau Foo. Include a powder-blue canopy, divided covered simmering pans and neatly arranged stuffed tofu. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-27 — Steamed Chicken Rice

**Save as:** `stall-27-chicken-rice.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Steamed Chicken Rice. Include a sand-coloured canopy, covered chicken display, rice cooker and ceramic serving plates. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-28 — Night Market Chicken Burger

**Save as:** `stall-28-market-chicken-burger.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Night Market Chicken Burger. Include a crimson canopy, flat-top griddle, plain buns and unbranded wrappers. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-29 — Char Siu Pork Rice — non-halal item

**Save as:** `stall-29-char-siu-rice.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Char Siu Pork Rice — non-halal item. Include a aubergine canopy, enclosed glazed-pork display and a clean rice-serving counter. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### STALL-30 — Vegetarian Nasi Campur

**Save as:** `stall-30-vegetarian-nasi-campur.png`

```text
Generate one 4:3 landscape cover image, target 1536 x 1152 pixels, of a single fictional Malaysian market stall specialising in Vegetarian Nasi Campur. Include a forest-green canopy, separate colourful vegetable trays and a plain menu board. Compose the entire front counter and canopy as one coherent scene. Place a small readable-in-shape serving of the specialty at the front; signage must remain blank. If a vendor is visible, depict a fictional adult wearing a plain apron and handling utensils plausibly. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

## Food item images

### FOOD-01 — Nasi Lemak Ayam

**Save as:** `food-01-nasi-lemak-ayam.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing coconut rice on a banana leaf, one fried chicken piece, sambal in a small side portion, cucumber slices, peanuts, anchovies and half a boiled egg. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-02 — Chicken Satay

**Save as:** `food-02-satay-ayam.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing neatly arranged chicken satay skewers with light grill marks, a separate peanut sauce bowl, ketupat cubes and cucumber. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-03 — Seafood Char Kway Teow

**Save as:** `food-03-char-kway-teow.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing wok-fried flat rice noodles with prawns, bean sprouts, chives and egg, with no pork in this depicted version. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-04 — Roti Canai

**Save as:** `food-04-roti-canai.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing two flaky folded roti canai with small dhal and vegetable-curry bowls on a simple metal plate. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-05 — Beef Murtabak

**Save as:** `food-05-murtabak-daging.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a golden square beef murtabak cut open to reveal the cooked filling, accompanied by pink pickled onions. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-06 — Apam Balik

**Save as:** `food-06-apam-balik.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a thick folded peanut apam balik with a crisp golden edge, cut to reveal its airy interior and crushed-peanut filling. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-07 — Pisang Goreng

**Save as:** `food-07-pisang-goreng.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a small pile of crisp golden battered banana fritters in a plain paper-lined basket. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-08 — Karipap

**Save as:** `food-08-karipap.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing three crimp-edged curry puffs on a ceramic plate, one cut open with a clearly cooked potato filling. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-09 — Cendol

**Save as:** `food-09-cendol.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one clear bowl of shaved ice with pandan jelly, red beans, coconut milk and dark palm-sugar syrup. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-10 — Ais Kacang

**Save as:** `food-10-ais-kacang.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one colourful mound of shaved ice with red beans, sweetcorn, jelly and modest rose-syrup and milk drizzles. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-11 — Teh Tarik

**Save as:** `food-11-teh-tarik.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one clear glass mug of warm pulled milk tea with a fine frothy top, on a plain saucer. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-12 — Sugarcane Juice

**Save as:** `food-12-air-tebu.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one clear cup of pale green sugarcane juice with ice and a reusable straw beside a short sugarcane segment. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-13 — Asam Laksa

**Save as:** `food-13-asam-laksa.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one bowl of thick rice noodles in tangy fish broth with cucumber slivers, onion, mint and a small calamansi. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-14 — Curry Laksa

**Save as:** `food-14-curry-laksa.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one bowl of curry noodles with cooked chicken, tofu puffs, bean sprouts and aromatic orange broth. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-15 — Nasi Kerabu

**Save as:** `food-15-nasi-kerabu.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing blue rice with finely sliced herbs, coconut garnish, cooked grilled chicken and a small sambal portion. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-16 — Nasi Dagang

**Save as:** `food-16-nasi-dagang.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a banana-leaf-lined plate of rice with cooked fish curry, cucumber pickle and a small side of sauce. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-17 — Ayam Percik

**Save as:** `food-17-ayam-percik.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one cooked grilled chicken quarter coated in a creamy reddish percik sauce, with cucumber garnish. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-18 — Ikan Bakar

**Save as:** `food-18-ikan-bakar.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one cooked grilled fish opened on a banana leaf, with sambal and lime served separately. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-19 — Otak-Otak

**Save as:** `food-19-otak-otak.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a small arrangement of grilled leaf-wrapped fish cakes, one wrapper opened to reveal the cooked orange fish paste. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-20 — Rojak Buah

**Save as:** `food-20-rojak-buah.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a bowl of cut pineapple, cucumber, jicama and green mango lightly coated in dark rojak dressing with crushed peanuts. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-21 — Kuih Seri Muka

**Save as:** `food-21-kuih-seri-muka.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing three neat squares of two-layer kuih with white sticky rice below smooth green pandan custard. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-22 — Onde-Onde

**Save as:** `food-22-onde-onde.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing several small green pandan rice balls rolled in white coconut, one split to reveal palm-sugar filling. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-23 — Kuih Lapis

**Save as:** `food-23-kuih-lapis.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing several tidy slices of pink-and-white layered steamed kuih showing distinct soft layers. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-24 — Putu Piring

**Save as:** `food-24-putu-piring.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing three small white steamed rice cakes dusted with grated coconut, one opened to show brown palm sugar. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-25 — Vegetable Popiah

**Save as:** `food-25-popiah-sayur.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing two fresh vegetable spring rolls cut diagonally to reveal jicama, carrot, lettuce and tofu, with no meat. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-26 — Fish Yong Tau Foo

**Save as:** `food-26-yong-tau-foo.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a bowl of tofu and vegetables filled with cooked fish paste in clear broth, with chilli sauce separately. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-27 — Steamed Chicken Rice

**Save as:** `food-27-chicken-rice.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing sliced cooked chicken with fragrant rice, cucumber and three small sauce dishes on a plain plate. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-28 — Night Market Chicken Burger

**Save as:** `food-28-market-chicken-burger.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing one cooked chicken-patty burger with egg, lettuce and modest sauces in a plain paper wrapper. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-29 — Char Siu Pork Rice — non-halal item

**Save as:** `food-29-char-siu-rice.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing slices of glazed char siu pork on white rice with green vegetables and cucumber; clearly recognisable as pork barbecue without any certification symbols. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### FOOD-30 — Vegetarian Nasi Campur

**Save as:** `food-30-vegetarian-nasi-campur.png`

```text
Generate one 1:1 square food image, target 1024 x 1024 pixels, showing a plate of white rice with tofu, tempeh, leafy greens, cucumber and vegetable sambal, with no meat or fish. Frame a single serving from a three-quarter tabletop angle, close enough to see the food texture, against a warm cream surface with soft teal background accents. Keep all edible elements accurate to this specific Malaysian dish; no decorative ingredients outside the description. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No hands or human faces. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

## Fictional persona portraits

### PERSONA-01 — Aina — vendor persona

**Save as:** `persona-01-vendor-aina.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian woman aged about 43, wearing a plain muted teal hijab and cream market apron, relaxed confident expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-02 — Wen — vendor persona

**Save as:** `persona-02-vendor-wen.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian Chinese man aged about 52, short greying hair, plain olive T-shirt and amber market apron, friendly expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-03 — Kumar — vendor persona

**Save as:** `persona-03-vendor-kumar.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian Indian man aged about 38, short wavy hair, neat moustache and a plain terracotta apron, calm expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-04 — Suri — vendor persona

**Save as:** `persona-04-vendor-suri.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian woman aged about 31, tied-back dark hair and a plain pale yellow chef cap and teal apron, welcoming expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-05 — Hakim — vendor persona

**Save as:** `persona-05-vendor-hakim.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian man aged about 29, short curly dark hair and a plain navy shirt with a beige apron, approachable expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-06 — Mei — vendor persona

**Save as:** `persona-06-vendor-mei.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian Chinese woman aged about 60, short silver-streaked hair, plain jade blouse and tan apron, thoughtful smile. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-07 — Farah — customer persona

**Save as:** `persona-07-customer-farah.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian woman aged about 24, plain coral hijab and casual cream shirt, cheerful expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-08 — Jun — customer persona

**Save as:** `persona-08-customer-jun.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian Chinese man aged about 27, black-framed glasses, short dark hair and a simple teal overshirt, relaxed expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-09 — Devi — customer persona

**Save as:** `persona-09-customer-devi.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian Indian woman aged about 33, shoulder-length dark hair, simple mustard blouse and small plain earrings, friendly expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-10 — Media editor persona

**Save as:** `persona-10-partner-editor.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian adult woman aged about 36, short dark bob haircut and a plain navy overshirt, attentive expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-11 — Demo council officer persona

**Save as:** `persona-11-partner-officer.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian adult man aged about 45, neatly trimmed hair and a plain light-blue collared shirt, neutral professional expression, no uniform insignia. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PERSONA-12 — Collection coordinator persona

**Save as:** `persona-12-partner-collector.png`

```text
Generate one 1:1 square illustrated head-and-shoulders avatar, target 1024 x 1024 pixels, of a fictional Malaysian adult woman aged about 40, tied-back dark hair, plain olive work shirt and a simple cream cap, confident expression. Centre one person against a softly textured warm cream background with a subtle teal circular accent. Use natural facial proportions and a respectful everyday appearance; do not resemble a celebrity, public official or real identifiable person. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. No identity card, badge, company mark or official emblem. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

## Partner workspace cover images

### PARTNER-01 — RasaTrail Media Demo — editorial workspace

**Save as:** `partner-01-media-collaboration.png`

```text
Generate one 16:9 landscape partner-workspace cover image, target 1536 x 864 pixels, depicting a fictional adult food editor with an unbranded camera speaking with an adult hawker across a tidy Malaysian market counter, a plated snack between them, collaborative documentary mood. This represents a completely fictional partner workflow, not a real company, government office, charity or scientific facility. Keep the left quarter visually quiet for a later application title. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PARTNER-02 — Demo Health Response Office — case workspace

**Save as:** `partner-02-health-referral.png`

```text
Generate one 16:9 landscape partner-workspace cover image, target 1536 x 864 pixels, depicting two fictional adult community health staff in plain clothing discussing an abstract blank case folder at a modest office desk, warm calm light, no patient data, no uniform, no authority emblem. This represents a completely fictional partner workflow, not a real company, government office, charity or scientific facility. Keep the left quarter visually quiet for a later application title. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PARTNER-03 — Seri Rasa Demo Council — municipal workspace

**Save as:** `partner-03-council-inspection.png`

```text
Generate one 16:9 landscape partner-workspace cover image, target 1536 x 864 pixels, depicting one fictional adult municipal coordinator in a plain collared shirt holding a blank clipboard beside a clean market lane, orderly stall boundaries and a vendor in the background, no official uniform or insignia. This represents a completely fictional partner workflow, not a real company, government office, charity or scientific facility. Keep the left quarter visually quiet for a later application title. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PARTNER-04 — Kongsi Rezeki Demo — donation workspace

**Save as:** `partner-04-surplus-donation.png`

```text
Generate one 16:9 landscape partner-workspace cover image, target 1536 x 864 pixels, depicting fictional adult community volunteers handing one closed unbranded food container to another adult at a clean market collection point, separate sealed containers on a table, dignified collaborative mood. This represents a completely fictional partner workflow, not a real company, government office, charity or scientific facility. Keep the left quarter visually quiet for a later application title. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PARTNER-05 — Kitar Hijau Demo — compost workspace

**Save as:** `partner-05-compost-collection.png`

```text
Generate one 16:9 landscape partner-workspace cover image, target 1536 x 864 pixels, depicting a fictional adult collection worker in gloves moving a lidded green organic-waste bin beside a market loading area, tidy surroundings, no edible-food donation imagery. This represents a completely fictional partner workflow, not a real company, government office, charity or scientific facility. Keep the left quarter visually quiet for a later application title. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### PARTNER-06 — Ladang Kitar Demo — BSF workspace

**Save as:** `partner-06-bsf-processing.png`

```text
Generate one 16:9 landscape partner-workspace cover image, target 1536 x 864 pixels, depicting a clean conceptual organic-material processing workshop with closed modular trays and a fictional adult technician in plain work clothes, modest tropical greenery outside, no exposed larvae or graphic waste. This represents a completely fictional partner workflow, not a real company, government office, charity or scientific facility. Keep the left quarter visually quiet for a later application title. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

## Advertisement creative images

### AD-01 — Bara Senja Demo — sponsored satay campaign

**Save as:** `ad-01-ad-satay-sponsor.png`

```text
Generate one wide 16:9 advertising-background image, target 1536 x 864 pixels, with a beautifully arranged chicken satay plate and separate peanut sauce bowl placed on the right side of a rich teal surface, warm lantern bokeh behind, inviting supper mood. Leave approximately the left 40 percent as uncluttered negative space for later HTML ad copy, price and the Sponsored-demo label. The product and advertiser are entirely fictional; communicate no medical, halal, official or environmental certification claim. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### AD-02 — Embun Manis Demo — sponsored dessert campaign

**Save as:** `ad-02-ad-cendol-sponsor.png`

```text
Generate one wide 16:9 advertising-background image, target 1536 x 864 pixels, with one glass bowl of cendol on the right side, visible pandan jelly and coconut milk over shaved ice, pale mint backdrop and soft tropical leaf shadows. Leave approximately the left 40 percent as uncluttered negative space for later HTML ad copy, price and the Sponsored-demo label. The product and advertiser are entirely fictional; communicate no medical, halal, official or environmental certification claim. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### AD-03 — DaunPack Demo — fictional packaging company

**Save as:** `ad-03-ad-eco-packaging.png`

```text
Generate one wide 16:9 advertising-background image, target 1536 x 864 pixels, with a small arrangement of unbranded plant-fibre takeaway boxes and wooden cutlery on the right, one closed container and one empty open container, warm cream and leaf-green palette. Leave approximately the left 40 percent as uncluttered negative space for later HTML ad copy, price and the Sponsored-demo label. The product and advertiser are entirely fictional; communicate no medical, halal, official or environmental certification claim. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### AD-04 — Limau Ceria Demo — fictional beverage company

**Save as:** `ad-04-ad-local-drink.png`

```text
Generate one wide 16:9 advertising-background image, target 1536 x 864 pixels, with one unbranded clear bottle and a glass of lime drink with ice on the right, whole limes nearby, amber sunset reflections and a subtle teal background. Leave approximately the left 40 percent as uncluttered negative space for later HTML ad copy, price and the Sponsored-demo label. The product and advertiser are entirely fictional; communicate no medical, halal, official or environmental certification claim. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### AD-05 — RasaTrail Demo — food trail promotion

**Save as:** `ad-05-ad-food-trail.png`

```text
Generate one wide 16:9 advertising-background image, target 1536 x 864 pixels, with a single coherent overhead tabletop scene of three small Malaysian snack plates with satay, curry puffs and kuih, placed together on the right half of one wooden table, no panels or collage. Leave approximately the left 40 percent as uncluttered negative space for later HTML ad copy, price and the Sponsored-demo label. The product and advertiser are entirely fictional; communicate no medical, halal, official or environmental certification claim. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### AD-06 — Kongsi Rezeki Demo — surplus campaign

**Save as:** `ad-06-ad-surplus-offer.png`

```text
Generate one wide 16:9 advertising-background image, target 1536 x 864 pixels, with one neat reusable takeaway container with a freshly prepared-looking rice-and-vegetable serving on the right, friendly amber and cream background, no clock or claim of food safety. Leave approximately the left 40 percent as uncluttered negative space for later HTML ad copy, price and the Sponsored-demo label. The product and advertiser are entirely fictional; communicate no medical, halal, official or environmental certification claim. Use a polished editorial illustration style with softly painted realistic textures, natural proportions, warm amber light, restrained teal accents and appetising true-to-life colours. This is fictional artwork for the PasarMalam demo, not a photograph of a real business. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

## Synthetic complaint and training images

### EVIDENCE-01 — Synthetic training evidence — uncovered tray

**Save as:** `evidence-01-training-uncovered-tray.png`

```text
Generate one 4:3 landscape educational illustration, target 1536 x 1152 pixels, showing an uncovered tray of cooked noodles on a completely fictional unbranded food counter, serving utensils beside it and an open window in the background; no insects, people or identifiable venue. Use a neutral, observational composition rather than dramatic or accusatory imagery. This is fabricated training material for a demo, not evidence of an actual incident, real stall or real person's conduct. Use softly painted realistic textures with restrained teal and warm grey colours. The app will add a prominent Synthetic-demo-evidence label outside the image. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### EVIDENCE-02 — Synthetic training evidence — preparation separation

**Save as:** `evidence-02-training-cross-contact.png`

```text
Generate one 4:3 landscape educational illustration, target 1536 x 1152 pixels, showing a fictional kitchen counter where a raw chicken container and a separate vegetable board have been placed too close together, with no person visible; show a plausible training concern without gore. Use a neutral, observational composition rather than dramatic or accusatory imagery. This is fabricated training material for a demo, not evidence of an actual incident, real stall or real person's conduct. Use softly painted realistic textures with restrained teal and warm grey colours. The app will add a prominent Synthetic-demo-evidence label outside the image. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### EVIDENCE-03 — Synthetic training evidence — waste handling

**Save as:** `evidence-03-training-waste-bin.png`

```text
Generate one 4:3 landscape educational illustration, target 1536 x 1152 pixels, showing an overfilled open rubbish bin with plain food wrappers near a fictional unbranded market preparation area, no people, no infestation and no recognisable landmark. Use a neutral, observational composition rather than dramatic or accusatory imagery. This is fabricated training material for a demo, not evidence of an actual incident, real stall or real person's conduct. Use softly painted realistic textures with restrained teal and warm grey colours. The app will add a prominent Synthetic-demo-evidence label outside the image. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```

### EVIDENCE-04 — Synthetic training evidence — temperature log

**Save as:** `evidence-04-training-thermometer.png`

```text
Generate one 4:3 landscape educational illustration, target 1536 x 1152 pixels, showing a generic unbranded probe thermometer positioned beside a covered stainless food tray and a blank paper log, thermometer display intentionally blank so the application can overlay a clearly simulated reading. Use a neutral, observational composition rather than dramatic or accusatory imagery. This is fabricated training material for a demo, not evidence of an actual incident, real stall or real person's conduct. Use softly painted realistic textures with restrained teal and warm grey colours. The app will add a prominent Synthetic-demo-evidence label outside the image. Create exactly one standalone image, not a collage, grid, contact sheet or multiple variants. No text, lettering, numbers, logos, watermarks, certification marks or interface elements.
```
