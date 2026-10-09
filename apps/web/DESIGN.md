---
name: PasarMalam
description: Good food. Good neighbours. Less waste.
version: 3.0.0
theme: single (no dark mode)
colors:
  # Primary canopy — structure and actions
  forest-primary: "#1c5a45"
  forest-deep: "#174840"
  forest-dusk: "#17443e"
  forest-ink: "#18332f"
  # Lantern accents — reserved for emphasis (The One Lantern Rule)
  lantern-gold: "#f5be73"
  lantern-amber: "#ed9e57"
  warm-terracotta: "#d97c40"
  # Neutral base
  soft-cream: "#f8f7f2"
  neutral-surface: "#ffffff"
  neutral-border: "#e9e9dd"
  muted-text: "#7a8c83"
  # Semantic
  success-green: "#287848"
  success-bg: "#e9f4e9"
  warning-amber: "#a15c2d"
  warning-bg: "#fff3df"
  closed-grey: "#69756c"
  closed-bg: "#f1f0ea"
  sold-out-text: "#8a3a2d"
  sold-out-bg: "#f5f0f0"
  error-red: "#c0392b"
  # Freshness ring
  fresh-ring: "#287848"
  warning-ring: "#a15c2d"
  urgent-ring: "#d97c40"
  expired-ring: "#69756c"
  ring-track: "#e9e9dd"
  # Voice recording
  recording-red: "#e74c3c"
  # Urgency badge overlay
  urgency-badge-bg: "#d97c4022"

typography:
  family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  display:
    fontSize: "clamp(2.5rem, 5vw, 4.7rem)"
    fontWeight: 900
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontSize: "clamp(1.35rem, 2.5vw, 2rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  title:
    fontSize: "1.18rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-small:
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontSize: "0.75rem"
    fontWeight: 850
    letterSpacing: "0.1em"
    textTransform: "uppercase"
  price:
    fontSize: "1.1rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
  caption:
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.04em"

rounded:
  pill: "999px"
  lg: "28px"
  md: "18px"
  sm: "11px"
  xs: "8px"

spacing:
  xs: "6px"
  sm: "10px"
  md: "18px"
  lg: "30px"
  xl: "64px"
  page-gutter: "clamp(20px, 4vw, 64px)"
  touch-min: "48px"

motion:
  duration:
    instant: "80ms"
    fast: "120ms"
    normal: "220ms"
    slow: "380ms"
    page: "500ms"
    ring-tick: "1000ms"
    hero-auto: "4500ms"
  easing:
    default: "cubic-bezier(0.2, 0.8, 0.2, 1)"
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
    decelerate: "cubic-bezier(0, 0, 0.2, 1)"
    linear: "linear"
  card-hover: "transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms cubic-bezier(0.2,0.8,0.2,1)"
  button-press: "transform 80ms cubic-bezier(0.2,0.8,0.2,1), background-color 120ms ease"
  pill-active: "background-color 120ms ease, color 120ms ease, box-shadow 120ms ease"
  page-enter: "opacity 500ms cubic-bezier(0,0,0.2,1), transform 500ms cubic-bezier(0,0,0.2,1)"

shadows:
  hover-lift: "0 12px 25px #173a2e13"
  anchor: "0 18px 30px #173a2e14"
  modal: "0 20px 60px #0e261d44"
  active-pill: "0 2px 6px #173d2730"
  search-bar: "0 13px 30px #2047341a"
  fab: "0 8px 20px #d97c4055"
  floating-image: "0 20px 30px #18332f33"

layout:
  header-bg: "#ffffff"
  bottom-nav-height: "64px"
  content-max-width: "1260px"
  mobile-breakpoint: "800px"
  avatar-size: "44px"

components:
  # ── BUTTONS ──────────────────────────────────────────────
  button-primary:
    bg: "#1c5a45"
    text: "#ffffff"
    fontWeight: 800
    borderRadius: "11px"
    padding: "12px 18px"
    minHeight: "48px"
    hover-bg: "#174840"
    active-transform: "scale(0.97)"
    disabled-opacity: 0.45

  button-light:
    bg: "#f5be73"
    text: "#274336"
    fontWeight: 800
    borderRadius: "11px"
    padding: "12px 18px"
    minHeight: "48px"
    hover-bg: "#ffe1b6"

  button-secondary:
    bg: "#eaf1e8"
    text: "#20503d"
    fontWeight: 700
    borderRadius: "11px"
    padding: "12px 18px"
    minHeight: "48px"
    hover-bg: "#d4e8d0"

  button-ghost:
    bg: "#ffffff0d"
    border: "1px solid #b9d3c2ad"
    text: "#ffffff"
    fontWeight: 700
    borderRadius: "11px"
    padding: "12px 18px"
    minHeight: "48px"

  button-add:
    bg: "#1c5a45"
    text: "#ffffff"
    fontWeight: 800
    borderRadius: "8px"
    padding: "6px 12px"
    minHeight: "32px"
    fontSize: "0.8rem"

  button-pill-white:
    # CTA on featured/promo cards
    bg: "#ffffff"
    text: "#18332f"
    fontWeight: 800
    borderRadius: "999px"
    padding: "12px 22px"
    minHeight: "44px"

  focus-visible:
    outline: "3px solid #ed9e57"
    outlineOffset: "3px"

  # ── HEADER (confirmed from customer/hawker reference) ────
  app-header:
    bg: "#ffffff"
    padding: "20px clamp(20px,4vw,64px) 0"
    border-bottom: "none"

  avatar:
    size: "44px"
    borderRadius: "999px"
    border: "2px solid #ffffff"
    shadow: "0 2px 6px #18332f22"

  location-row:
    icon-color: "#d97c40"
    label-text: "#18332f"
    label-fontWeight: 700
    sublabel-text: "#7a8c83"
    sublabel-fontSize: "0.85rem"
    chevron-color: "#7a8c83"
    padding: "14px 0"
    border-bottom: "1px solid #e9e9dd"

  hero-headline:
    text: "#18332f"
    fontWeight: 900
    fontSize: "clamp(1.8rem, 4vw, 2.6rem)"
    lineHeight: 1.1
    accent-mark-color: "#d97c40"
    # small decorative dash strokes beside headline, terracotta

  hero-subheadline:
    text: "#7a8c83"
    fontSize: "1rem"
    fontWeight: 400

  hawker-greeting-header:
    greeting-text: "#7a8c83"
    greeting-fontWeight: 400
    greeting-fontSize: "0.95rem"
    stall-name-text: "#18332f"
    stall-name-fontWeight: 900
    stall-name-fontSize: "clamp(1.35rem, 2.5vw, 2rem)"
    status-pill-bg: "#e9f4e9"
    status-pill-text: "#287848"
    status-pill-dot: "#287848"

  quick-pick-chip:
    # borrowed element: icon + name + price, horizontal row under search
    icon-size: "36px"
    icon-border: "1px solid #e9e9dd"
    icon-borderRadius: "999px"
    name-text: "#18332f"
    name-fontWeight: 700
    name-fontSize: "0.82rem"
    price-text: "#d97c40"
    price-fontWeight: 700
    price-fontSize: "0.78rem"
    gap-icon-text: "8px"
    gap-between-chips: "20px"

  # ── SEARCH / FILTERS / TABS ──────────────────────────────
  search-bar:
    bg: "#ffffff"
    border: "1px solid #e9e9dd"
    borderRadius: "999px"
    padding: "12px 20px"
    minHeight: "48px"
    shadow: "0 13px 30px #2047341a"
    placeholder-color: "#7a8c83"
    icon-color: "#7a8c83"

  filter-sort-pill:
    bg: "#ffffff"
    border: "1px solid #e9e9dd"
    borderRadius: "999px"
    padding: "10px 16px"
    minHeight: "44px"
    text: "#18332f"
    fontWeight: 700
    icon-color: "#18332f"
    gap-icon-text: "8px"

  segmented-tab:
    track-bg: "#f1f0ea"
    track-borderRadius: "999px"
    track-padding: "4px"
    active-bg: "#d97c40"
    active-text: "#ffffff"
    active-fontWeight: 800
    inactive-bg: "transparent"
    inactive-text: "#18332f"
    inactive-fontWeight: 600
    item-borderRadius: "999px"
    item-padding: "10px 24px"
    transition: "background-color 120ms ease, color 120ms ease"

  # ── SECTION HEADER PATTERN ────────────────────────────────
  section-header:
    icon-color: "#18332f"
    icon-size: "20px"
    title-text: "#18332f"
    title-fontWeight: 800
    title-fontSize: "1.1rem"
    link-text: "#d97c40"
    link-fontWeight: 700
    link-fontSize: "0.85rem"
    gap-icon-title: "8px"
    marginBottom: "14px"

  # ── FEATURED MARKET CARD ──────────────────────────────────
  featured-card:
    bg-gradient: "linear-gradient(135deg, #17443e 0%, #1c5a45 100%)"
    borderRadius: "28px"
    padding: "24px"
    minHeight: "220px"
    eyebrow-text: "#f5be73"
    eyebrow-fontWeight: 850
    eyebrow-fontSize: "0.72rem"
    headline-text: "#ffffff"
    headline-fontWeight: 900
    headline-fontSize: "1.5rem"
    headline-maxLines: 2
    status-dot: "#4ade80"
    status-text: "#f8f7f2"
    status-fontSize: "0.85rem"
    distance-pill-bg: "#ffffff1a"
    distance-pill-text: "#ffffff"
    image-position: "bottom-right, breaking card edge"
    image-shadow: "0 20px 30px #18332f33"
    cta: "button-pill-white"

  # ── PROMOTION CARDS (2 variants) ─────────────────────────
  promo-card-warm:
    bg-gradient: "linear-gradient(135deg, #f5be73 0%, #d97c40 100%)"
    borderRadius: "22px"
    padding: "20px"
    text: "#18332f"
    headline-fontWeight: 800
    headline-fontSize: "1.3rem"
    headline-maxLines: 2
    image-position: "bottom-right, floating with shadow"
    cta: "button-pill-white"
    cta-label: "See Offer"

  promo-card-dark:
    bg: "#18332f"
    borderRadius: "22px"
    padding: "20px"
    eyebrow-text: "#ffffffaa"
    eyebrow-fontSize: "0.8rem"
    headline-text: "#ffffff"
    headline-fontWeight: 800
    headline-fontSize: "1.3rem"
    headline-maxLines: 2
    glow-color: "#f5be7355"
    glow-blur: "40px"
    image-position: "center-right with ambient glow behind"
    cta: "button-pill-white"
    cta-label-muted: "Save"
    cta-label-bold: "30% off"
    cta-bold-color: "#d97c40"

  # ── CATEGORY CARD (horizontal icon+text) ─────────────────
  category-card:
    bg: "#ffffff"
    border: "1px solid #e5e9de"
    borderRadius: "18px"
    padding: "16px"
    icon-width: "35%"
    icon-borderRadius: "14px"
    title-text: "#18332f"
    title-fontWeight: 700
    title-fontSize: "1.18rem"
    description-text: "#7a8c83"
    description-fontSize: "0.85rem"
    description-maxLines: 2
    link-text: "#d97c40"
    link-fontWeight: 700
    shadow-rest: "none"
    shadow-hover: "0 12px 25px #173a2e13"
    hover-transform: "translateY(-3px)"
    grid-columns: 2

  # ── URGENCY BADGE ─────────────────────────────────────────
  urgency-badge:
    position: "top-left overlay on food photo"
    bg: "#d97c4022"
    backdrop-blur: "4px"
    text: "#d97c40"
    fontWeight: 800
    fontSize: "0.68rem"
    borderRadius: "999px"
    padding: "4px 10px"
    icon-size: "12px"
    variants:
      time-left: "clock icon + 'X min left'"
      low-stock: "alert-triangle icon + 'Low stock'"

  # ── PRODUCT CARD (updated with batch-time label) ─────────
  card-product:
    bg: "#ffffff"
    border: "1px solid #e5e9de"
    borderRadius: "18px"
    padding: "12px"
    imageAspect: "1/1"
    imageRadius: "12px"
    shadow-hover: "0 12px 25px #173a2e13"
    hover-transform: "translateY(-3px)"
    name-fontWeight: 700
    price-color: "#d97c40"
    price-fontWeight: 800
    batch-time-icon-color: "#7a8c83"
    batch-time-text: "#7a8c83"
    batch-time-fontSize: "0.78rem"

  # ── STATUS PILLS / BADGES ─────────────────────────────────
  status-pill-open:
    bg: "#e9f4e9"
    text: "#287848"
  status-pill-upcoming:
    bg: "#fff3df"
    text: "#a15c2d"
  status-pill-closed:
    bg: "#f1f0ea"
    text: "#69756c"
  status-pill-sold-out:
    bg: "#f5f0f0"
    text: "#8a3a2d"

  batch-badge-needs-info:
    bg: "#fff3df"
    text: "#a15c2d"
    icon: "alert-circle"
  batch-badge-active:
    bg: "#e9f4e9"
    text: "#287848"
    icon: "check-circle"
  batch-badge-near-expiry:
    bg: "#fff3df"
    text: "#d97c40"
    icon: "clock"
  batch-badge-expired:
    bg: "#f1f0ea"
    text: "#69756c"
    icon: "x-circle"
  batch-badge-sold-out:
    bg: "#ebebeb"
    text: "#4a5568"
    icon: "package"

  # ── BOTTOM NAV (floating pill, raised active bump) ───────
  bottom-nav:
    bg: "#ffffff"
    borderRadius: "999px"
    margin: "0 20px 16px"
    height: "64px"
    shadow: "0 12px 30px #18332f22"
    items: ["Home", "Document", "Bell", "Profile"]
    inactive-icon-color: "#7a8c83"
    active-bump-bg: "#d97c40"
    active-bump-size: "56px"
    active-bump-icon-color: "#ffffff"
    active-bump-offset: "-16px"   # raises above bar line
    active-bump-shadow: "0 8px 20px #d97c4055"
    notch-cutout: "scalloped concave curve around bump"

  # ── FAB + QUICK ACTION POPOVER (hawker) ──────────────────
  fab:
    size: "56px"
    bg: "#d97c40"
    icon-color: "#ffffff"
    borderRadius: "999px"
    shadow: "0 8px 20px #d97c4055"
    position: "fixed bottom-right"

  fab-popover:
    bg: "#ffffff"
    borderRadius: "16px"
    shadow: "0 20px 60px #0e261d44"
    padding: "8px"
    item-icon-circle-bg: "#d97c40"
    item-icon-color: "#ffffff"
    item-icon-size: "32px"
    item-label-color: "#18332f"
    item-label-fontWeight: 600
    item-gap: "4px"

  # ── INPUTS ────────────────────────────────────────────────
  input-default:
    bg: "#ffffff"
    border: "1px solid #deded6"
    borderRadius: "10px"
    padding: "12px 16px"
    minHeight: "48px"
    focus-outline: "3px solid #ed9e57"
    error-border: "1px solid #c0392b"
    disabled-opacity: 0.6

  # ── FRESHNESS RING ────────────────────────────────────────
  freshness-ring:
    size: "56px"
    strokeWidth: "5px"
    track-color: "#e9e9dd"
    state-fresh:
      stroke: "#287848"
      animation: "pulse 2400ms cubic-bezier(0.4,0,0.6,1) infinite"
    state-warning:
      stroke: "#a15c2d"
      animation: "pulse 1600ms cubic-bezier(0.4,0,0.6,1) infinite"
    state-urgent:
      stroke: "#d97c40"
      animation: "pulse 900ms cubic-bezier(0.4,0,0.6,1) infinite"
    state-expired:
      stroke: "#69756c"
      animation: "none"

  # ── VOICE RECORDING UI ────────────────────────────────────
  voice-btn:
    size: "64px"
    borderRadius: "999px"
    state-idle:
      bg: "#1c5a45"
      icon-color: "#ffffff"
    state-recording:
      bg: "#e74c3c"
      animation: "ring-pulse 900ms ease-in-out infinite"
    state-processing:
      bg: "#17443e"
      icon-color: "#f5be73"
      animation: "spin 800ms linear infinite"
    state-done:
      bg: "#287848"
      duration: "1200ms"

  # ── HERO SPLASH SCREEN (exact mockup match) ───────────────
  hero-splash:
    duration: "4500ms"
    exit-at: "3900ms"
    shell: "inset card, 12px outer padding, bg #17443e, 20px radius"
    shell-bg: "#f8f7f2"
    wave-border: "top + bottom, viewBox 0 0 1440 48, fill #17443e, bottom mirrored 180deg"
    wordmark: "stacked PASAR / MALAM, clamp(4.5rem,17vw,13rem), weight 900"
    wordmark-pasar: "#1c5a45, slides in from -80px, 0.75s cubic-bezier(.16,1,.3,1) delay .15s"
    wordmark-malam: "#d97c40, slides in from +80px, 0.75s cubic-bezier(.16,1,.3,1) delay .35s"
    food-items: 1
    food-circle: "single, clamp(160px,28vw,320px), absolute-centered, z-index 3 (overlaps wordmark), 0.85s cubic-bezier(.16,1,.3,1) delay .55s, rises+scales in"
    floating-tags: "2 pill tags (Freshly Made gold, Halal dark-green), spring cubic-bezier(.34,1.56,.64,1) .5s, staggered .2s (delay 1.1s / 1.3s)"
    tagline: "Good food · Good neighbours · Less waste, uppercase, fade-in .6s ease delay 1.6s"
    progress-bar-bg: "#e9e9dd track, #1c5a45 fill"
    progress-bar-height: "2px"
    progress-bar-fill: "4s linear delay .5s"
    exit: "opacity 1 → 0, scale 1 → 1.06, 0.55s cubic-bezier(.4,0,1,1)"

  # ── BRAND MARK ────────────────────────────────────────────
  brand-mark:
    badge-bg: "#174840"
    badge-radius: "14px"
    badge-size: "40px"
    icon: "stall/moon"
    icon-color: "#f5be73"
    wordmark-pasar: "#18332f"
    wordmark-malam: "#d97c40"
---

# Design System: PasarMalam v3
## "The Lantern-Lit Market" — Main Interface Edition

> **Anti-drift rule:** Every value in this file is a confirmed, real value, locked against reference screenshots across this session. Never invent a value. If it isn't in this file, stop and ask.

This version supersedes v2's dark-canopy header concept. The main app interface (customer + hawker) uses a **light header**, confirmed against the final customer/hawker reference screenshots. The forest-green canopy is preserved for the hero splash screen and as the primary action color — it no longer wraps the header.

---

## Theme

Single theme only. No dark mode. Warmth comes from the cream base + terracotta/gold accents, not from a header color swap.

---

## Colors

### Primary Canopy
| Token | Hex | Use |
|-------|-----|-----|
| `forest-primary` | `#1c5a45` | Primary buttons, FAB-adjacent accents, brand mark wordmark base |
| `forest-deep` | `#174840` | Brand mark badge background |
| `forest-dusk` | `#17443e` | Hero splash screen background only |
| `forest-ink` | `#18332f` | All body/heading text |

### Lantern & Accent *(The One Lantern Rule)*
| Token | Hex | Use |
|-------|-----|-----|
| `lantern-gold` | `#f5be73` | Brand moon icon, featured-card eyebrow, promo-warm gradient start |
| `warm-terracotta` | `#d97c40` | **The app's active/accent color** — prices, "See all" links, active tab, active nav bump, FAB, urgency badges, wordmark "Malam" |
| `lantern-amber` | `#ed9e57` | Focus-visible outline only |

> Terracotta has grown from a secondary accent (v2) to **the primary interactive accent** across the main interface — it marks every active/selected/emphasis state. Forest-green remains the canopy/structural color for the splash screen and primary CTA buttons.

### Neutral Base
| Token | Hex | Use |
|-------|-----|-----|
| `soft-cream` | `#f8f7f2` | Page background behind cards |
| `neutral-surface` | `#ffffff` | Header, cards, panels, bottom nav |
| `neutral-border` | `#e9e9dd` | Hairlines, chip borders |
| `muted-text` | `#7a8c83` | Secondary text, section labels, inactive nav icons |

### Semantic
| Token | Hex | Use |
|-------|-----|-----|
| `success-green` / `success-bg` | `#287848` / `#e9f4e9` | Open status, Stall-open pill, fresh ring |
| `warning-amber` / `warning-bg` | `#a15c2d` / `#fff3df` | Upcoming, near-expiry |
| `closed-grey` / `closed-bg` | `#69756c` / `#f1f0ea` | Closed, expired |
| `error-red` | `#c0392b` | Form errors |
| `recording-red` | `#e74c3c` | Voice recording |

---

## Typography

**Family:** Inter only (The Weight-Over-Width Rule — unchanged).

| Role | Size | Weight | Use |
|------|------|--------|-----|
| Display | `clamp(2.5rem,5vw,4.7rem)` | 900 | Hero splash wordmark |
| Hero headline | `clamp(1.8rem,4vw,2.6rem)` | 900 | "Find your next favourite bite." |
| Headline | `clamp(1.35rem,2.5vw,2rem)` | 900 | Stall name, section headers |
| Title | `1.18rem` | 700 | Card titles |
| Price | `1.1rem` | 800 | Prices — always terracotta |
| Body | `1rem` | 400 | Paragraphs |
| Body-small | `0.85rem` | 400 | Card descriptions |
| Label | `0.75rem` | 850, uppercase | Eyebrows |
| Caption | `0.72rem` | 700 | Batch-time, mini labels |

---

## Main Interface Structure

### App Header (white, not canopy)
Top → bottom:
1. Brand mark (left) + circular avatar `44px` (right)
2. Location row: terracotta pin icon + bold location name + muted sublabel + chevron, bottom-border hairline
3. **Customer:** hero headline (2-line, with small terracotta decorative accent mark) + muted subheadline
   **Hawker:** "Hi, [name]" muted + stall name headline + "Stall open" status pill (same row)
4. Search bar (pill, white, hairline border, floating shadow)
5. Quick-pick chip row (optional) — circular food icon + name + terracotta price, horizontal
6. Filter + Sort pills (customer only)
7. Segmented tab: Popular (filled terracotta) | Nearby (plain, shared cream track)

### Content Zone (cream `#f8f7f2` background)
**Customer:**
- Featured market card (forest-green gradient, floating photo, status + distance, white pill CTA)
- Food categories — section header pattern, 2-col horizontal category cards
- Promotion cards (warm or dark variant) — horizontal scroll

**Hawker:**
- Alerts section — section header + 3 product cards with urgency badge overlay
- Products section — section header + product cards (photo, name, terracotta price, batch-time caption)
- Promotions section — promo-card-warm or -dark
- FAB (terracotta circle, `+`) bottom-right → expands to Add food / New batch / More popover

### Bottom Navigation
Floating pill bar, white, rounded, margin `0 20px 16px`, shadow. 4 items: **Home · Document · Bell · Profile**. Active item gets a raised circular bump (`56px`, terracotta `#d97c40`, white icon) poking above the bar line with a scalloped notch cutout. Inactive icons: muted-text, flat, no background.

---

## Components Quick Reference

**Buttons:** Primary (forest-green), Light (gold, for dark surfaces), Secondary (pale green), Ghost (dark surfaces), Add (small, on product cards), Pill-white (CTA on gradient cards).

**Cards:** Featured (forest gradient, floating image), Promo-warm (gold→terracotta gradient), Promo-dark (near-black + glow), Category (horizontal icon+text), Product (square photo + name + terracotta price + batch-time caption).

**Pills/badges:** Status (open/upcoming/closed/sold-out), Batch badge (5 states), Urgency badge (translucent terracotta overlay on photos), Segmented tab, Filter/Sort pill.

**Freshness ring:** 4 states (fresh/warning/urgent/expired), pulse speed increases as deadline nears.

**Voice UI:** 4 states (idle/recording/processing/done), red pulsing ring while recording.

**FAB + popover:** Terracotta FAB, white popover with 3 icon-circle action rows.

---

## Do's and Don'ts

**Do:**
- Treat **warm-terracotta** as the interactive accent for the main interface — prices, active states, links, badges, FAB
- Keep forest-green for the hero splash and primary buttons only
- Keep the header white/cream — the canopy green does not wrap the header anymore
- Use the floating pill bottom nav with the raised active bump, not a flat full-width bar
- Keep cards flat at rest, shadow on hover (The Flat-By-Default Rule)
- Keep touch targets `≥44px`

**Don't:**
- Don't reintroduce the dark canopy header or wavy divider from v2 — superseded
- Don't use circular category pills — category cards are horizontal icon+text now
- Don't let forest-green compete with terracotta as an accent in the main interface — terracotta owns "active/selected/price"
- Don't fake food photos — use the labelled placeholder pattern
- Don't invent a value not in this file — stop and ask
