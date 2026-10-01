# Architecture decisions

## 2026-10-01 — One responsive PWA

Use React 19, TypeScript, Vite 7 and a static Vercel build. The customer and hawker experiences share one application and visual system. The initial admin route is a restricted information screen until Phase 2 adds identity and permissions. This prevents an unprotected browser role switch from becoming a privileged interface.

## 2026-10-01 — Explicit sample and connected modes

`VITE_APP_MODE` determines the deployment's default. Fixture mode uses bundled fictional records and browser-only preferences. Connected mode has a separate data adapter and displays an error until real discovery/authentication is built in Phase 2. The user may explicitly open the sample demo. A connected request never silently appears to succeed as a local fixture write.

## 2026-10-01 — Service contracts before features

Define `DataGateway`, `ScenarioAdapter`, `DiscoverySnapshot` and `PublicConfig` before adding databases or external services. The fixture adapter supplies the foundation's sample cards. FastAPI exposes `/health` and `/api/v1/config`; further endpoints and RLS are Phase 2 work. All business scenarios remain simulated, even when later technical adapters use weather, an LLM or test-device Web Push.

## 2026-10-01 — Dates and clocks

Connected mode uses the system/server clock. Fixture mode can set a session-only scenario clock. No fixture clock is sent to a production endpoint. Phase 5 will own authoritative batch deadlines and persist their audit trail.

## 2026-10-01 — Provider boundaries

Keep Vercel static hosting, Railway FastAPI and Supabase data/Auth/Storage as the intended deployment stack. Use only no-cost eligible tools for the demo and retain explicit fixture mode for presentations. Paid services and real partner integrations require later product and provider decisions.

## 2026-10-01 — Shared business scenarios

`ScenarioAdapter` defines the four provider outcomes. The fixture implementation and Profile chips share this contract and return labelled `DEMO-` references without any network operation. Later business modules add their domain journeys behind the same boundary. These controls appear only in fixture mode.

## 2026-10-01 — Local build and touch targets

Vite uses its runner config loader because the default bundled config loader hit a filesystem access error in the Windows sandbox. Primary actions, language/scenario chips and small role controls are at least 48 px high. System fonts avoid a third-party font request. Closing scenarios use the calendar date in Asia/Kuala_Lumpur, even when the browser's system timezone differs.
