---
name: PasarMalam
description: Good food. Good neighbours. Less waste.
version: 4.0.0
theme: canonical dark night-market (warm charcoal, lantern orange, restrained market photography)
colors:
  page-bg: "#0f0c07"
  card-bg: "rgba(25,17,5,0.85)"
  card-border: "rgba(255,255,255,0.08)"
  text: "#f5f0e8"
  muted-text: "rgba(255,255,255,0.5)"
  accent: "#c83c08"
  accent-on-dark: "#ff8a4c"
  raised-surface: "#3a2b17"
  value-surface: "#1d2f22"
  success: "#8fd98a"
  warning: "#f6c99a"
  error: "#ff8b7e"
typography:
  family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  display: "clamp(2.4rem, 5vw, 4.2rem), weight 900, line-height 1.05"
  heading: "clamp(1.4rem, 2.5vw, 2rem), weight 800–900"
  title: "1rem–1.2rem, weight 700–800"
  body: "1rem, line-height 1.5–1.65"
  supporting: "0.875rem, line-height 1.45–1.55"
  caption: "0.75rem minimum; use only for secondary metadata"
shape:
  card-radius: "12–16px"
  pill-radius: "999px"
  page-gutter: "clamp(16px, 4vw, 48px)"
  content-max-width: "1260px"
  touch-target-min: "44px; prefer 48px for primary/mobile actions"
motion:
  fast: "120ms ease-out"
  normal: "220ms cubic-bezier(0.2, 0.8, 0.2, 1)"
  page-transition: "500ms ease-out, slide upward"
  hero-auto-dismiss: "2200ms maximum, with an immediate skip action"
---

# PasarMalam — The Lantern-Lit Night Market

## Product and visual intent

PasarMalam helps Malaysian shoppers discover local food and helps hawkers record batches, review stock, and offer surplus before closing. Organizers and partners use scoped, aggregated views. The visual identity is a **warm, dark pasar malam at dusk**: intimate, legible, grounded in local food and people, with lantern orange as the action accent. The established dark theme is canonical across customer and hawker pages; utility/report pages remain dark but should be calmer and more information-first than discovery surfaces.

**Personality:** welcoming, practical, transparent.
**Brand line:** “Good food. Good neighbours. Less waste.”
**Audience modes:** shoppers discover and reserve; hawkers operate while serving customers; organizers review evidence and aggregate outcomes.

## Canonical tokens

| Token | Value | Use |
|---|---|---|
| `--page-bg` | `#0f0c07` | Warm near-black fallback behind the night-market atmosphere. |
| `--card-bg` | `rgba(25, 17, 5, 0.85)` | Primary dark panel and card surface. |
| `--card-border` | `rgba(255, 255, 255, 0.08)` | Quiet panel separation; do not outline every nested element. |
| `--text` | `#f5f0e8` | Main text on dark surfaces. |
| `--muted-text` | `rgba(255, 255, 255, 0.5)` | Secondary metadata only; do not use for essential instructions or disclaimers. |
| `--accent` | `#c83c08` | Primary action fills, selected states, and high-salience marks. |
| `--accent-on-dark` | `#ff8a4c` | Small orange text and icons where the darker action orange would not meet contrast. |
| `--raised-surface` | `#3a2b17` | Inputs, secondary controls, and inset surfaces. |
| `--value-surface` | `#1d2f22` | Subtle trust/value callouts, not a competing action color. |

Use success, warning, error, and neutral states consistently. Status is conveyed by text and icon as well as color; predicted, confirmed, expired, and unrecorded must never share ambiguous styling.

## Atmosphere and surfaces

- The night-market photograph is atmosphere, not content. Keep a strong dark scrim behind text, and do not reuse a prominent photo card behind every operational block.
- Use the charcoal/umber panel with a restrained hairline border. A little blur may separate a panel from the photo; avoid glass-on-glass nesting and decorative blur.
- Discovery may be more photographic. Hawker work, settings, planning, accounting, moderation, and organizer reports should stay dark but quiet enough for dense information and sustained use.
- Prefer spacing and alignment over wrapping every element in another card. Reserve a filled orange surface for the single primary action in a section.
- Food imagery must be described honestly: fixture artwork is illustrative; only an actual user-supplied batch photo may be called a recorded batch photo. Never imply that a placeholder is a photograph of the exact prepared batch.

## Task and information hierarchy

### Shopper

1. Search for a market, stall, or dish.
2. Refine by location, category, diet, or budget.
3. Compare stalls and availability; open the batch passport when needed.
4. Keep confirmed offers ahead of predictions. Predictions are a distinct, secondary estimate with a nearby “not a guarantee” explanation.
5. Plan a visit only from stalls the shopper explicitly selected.

The first viewport should expose a useful search/action, not make a long brand intro, value-prop strip, repeated category gallery, or prediction feed a prerequisite. First-run motion is skippable and does not block deep links.

### Hawker

- Put batches needing a human review before totals, insights, and product browsing.
- Give each batch state one clear primary action. Place audit/history and infrequent actions in the detail view or a clearly labelled secondary menu.
- Optimize for one-handed, stall-side use: controls are at least 44px, primary actions prefer 48px, and essential copy is readable without expanding a tooltip.
- Distinguish a hawker-declared state from a system-derived estimate. AI drafts remain editable and never publish or decide eligibility without human confirmation.

### Organizer and partner

- State the market, time range, units, denominator/sample size, and source status near aggregate metrics.
- Mark synthetic demo data close to the metrics, not only in a page banner. Never imply a measured pilot outcome where none exists.
- Keep role-specific actions and confidential information inside the appropriate workspace.

## Copy and product truth

- Use direct, verb-first action labels. Make the consequence of a deadline explicit: **“Reserve by 8:55 pm”** is distinct from **“Holding-time advisory ends at 9:10 pm.”**
- A batch entry timestamp is not proof that a customer listing went live. Missing event data is “Not recorded.”
- Freshness/holding-time copy is advisory based on hawker-recorded information; it is not a food-safety certification or guarantee. Keep the established customer and hawker disclaimers intact and adjacent to the relevant timer or action.
- Predictions are not active offers. Use separate labels, visual treatment, and ordering.
- Fixture data is fictional and local; connected data is not interchangeable with it. Demo photography, outcomes, market totals, and forecasts must be labelled accordingly.
- Support English and Bahasa Melayu. Use complete translatable messages and preserve proper nouns and product terminology.

## Typography, spacing, and shape

- Keep one primary sans-serif family and a short, consistent type scale. Use weight and size for hierarchy; avoid uppercase micro-labels for important information.
- Body text is normally 14–16px or larger. Essential status, deadline, and disclaimer text must not be reduced to tiny captions or forced onto one line at mobile widths.
- Use an 8px-oriented spacing rhythm. Tighten related controls; leave clear separation between major jobs or workspaces.
- Cards use 12–16px radii; pills are reserved for compact status/filter labels, not used as the default container for every action.
- Primary buttons are at least 44px tall (48px preferred on mobile). Checkboxes include a label-sized hit area. Focus rings are visible against both photo and panel backgrounds.

## Motion and navigation

- Preserve the existing slide-up page transition for in-app navigation.
- Keep first-visit branding short and skippable; bypass it on deep links and respect reduced-motion preferences.
- Use motion only to explain a state change or sequence. Countdown updates do not cause layout shifts.
- Every interaction has keyboard focus, an accessible name, and a readable active/disabled state.

## Component guidance

- **Search:** one persistent label, descriptive placeholder, visible focus, immediate result feedback; avoid duplicate search fields for the same result set.
- **Cards and lists:** title first, then the decision-critical evidence, then one primary action. Avoid nested cards and repeated equally weighted CTA clusters.
- **Status badges:** short text, limited semantic palette, and an adjacent explanation when the state is provisional or consequential.
- **Selection lists:** explicit checkboxes, visible selected count, “select all/clear” when useful, and an action only when the minimum selection is met.
- **Empty/error states:** identify whether data is absent, filtered, unavailable, or not recorded, and provide the next useful action.
- **Tables/reports:** align labels and values; include units and time windows; charts have a direct text interpretation and source disclosure.

## Accessibility baseline

No formal accessibility-compliance target has been established for the product yet (see `PRODUCT.md`). Continue using semantic landmarks, keyboard-operable controls, visible focus, status announcements, and reduced-motion support; do not claim WCAG conformance. Record a formal target as an open product decision. Check 390px mobile, 768px tablet, and 1280px desktop layouts for wrapping, overflow, target size, and fixed-navigation clearance.
