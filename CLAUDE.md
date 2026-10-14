# PasarMalam — Claude Code Guidelines

> **AI-powered pasar malam platform** (AI EXPO @ ICON AI 2026, deadline Oct 15 2026)
> Solo undergraduate project by Ruben. Dual-sided: customer discovery app + hawker vendor dashboard.

---

## Project Structure

```
apps/web/src/
  app/                  — routing, layout, DemoDialog, LandingPage
  locales/              — ui() translation helper (phrases.ts)
  styles.css            — base reset, dialog primitives, button classes
  ui-refresh.css        — CSS custom properties, button variants, panels
  market-experience.css — hero, cards, hawker dashboard
  native/               — Capacitor (iOS/Android) overrides
```

Demo mode lives at `/demo/*` — fully self-contained with seed data, no backend required.
Dev server: `npm run dev` → http://127.0.0.1:5173/

---

## Design System — CSS Variables (NEVER diverge from these)

```css
--accent: #c83c08        /* warm red-orange — primary CTA, badges */
--bg-brand: #174840      /* dark green — brand header */
--paper: #f8f7f2         /* cream — page background */
--line: #e8e0d5          /* warm border colour */
--ink: #26221e           /* near-black text */
--muted: #8a7560         /* subdued text */
```

**Typography:** Inter (system fallback). Use `letter-spacing: -.04em` on display headings.

**IMPORTANT: Do NOT introduce Tailwind, shadcn/ui, or any new CSS framework.**
This project owns its design system through plain CSS variables and utility classes.
Existing utility classes: `.button.primary`, `.button.secondary`, `.panel`, `.chip`

---

## UI & Component Rules

- **Buttons:** Use `.button.primary` / `.button.secondary` from `ui-refresh.css`. Never inline styles on buttons.
- **Dialogs:** Use `@radix-ui/react-dialog`. Base dialog styles already in `styles.css`.
- **Icons:** `lucide-react` only. Keep `size={16}` to `size={20}` on UI icons.
- **Translation:** Wrap all user-facing strings in `ui('Key')` from `../locales/phrases`.
- **New CSS:** Co-locate with the component (`ComponentName.css`) — import inside the `.tsx` file.
- **openDemo():** Imported from `./config` — always use this to enter demo mode, never navigate manually.
- **JSX:** Uses automatic transform (`react-jsx`) — import React only when using `React.ReactNode` as a type.

---

## Design Skills (installed in .claude/skills/)

### Impeccable — `/impeccable`
Loaded automatically from `.claude/skills/impeccable/SKILL.md`.
- Run `/impeccable init` once to create PRODUCT.md + DESIGN.md context
- Run `/impeccable hooks on` to catch design slop live as you write UI
- Audit contrast, spacing, hierarchy before any UI is considered done

### Taste Skill — `/taste-skill`
Loaded from `.claude/skills/taste-skill/SKILL.md`. Invoke for any new UI work:
```
"Build [component] using the taste-skill. Avoid generic AI SaaS aesthetics.
Use PasarMalam CSS variables — no Tailwind."
```
Dial overrides: `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 5`, `VISUAL_DENSITY: 4`

### Image-to-Code — `/image-to-code`
Loaded from `.claude/skills/image-to-code/SKILL.md`. Use when given a Figma export:
```
"Look at @design-reference.png using the image-to-code skill.
Build a React component matching its grid, hierarchy, and interactions.
Use PasarMalam CSS variable palette — no Tailwind, no shadcn."
```

### design-for-ai (install once in Claude Code terminal)
```
/plugin marketplace add ryanthedev/rtd-claude-inn
/plugin install design-for-ai@rtd
```
Then use: `/design-for-ai:research` → `plan` → `mock` → `build`

---

## Implementing a Figma Design

1. Prompt: `"use the image-to-code skill with @your-figma-export.png"`
2. Specify: `"PasarMalam CSS variables, co-located CSS file, no Tailwind"`
3. After build: run `/impeccable` audit for contrast + polish
