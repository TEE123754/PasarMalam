# Phase 3 discovery acceptance

Stack: React + TypeScript, Leaflet 1.9.4 (lazy-loaded), TanStack Query, Vitest, FastAPI/Pydantic/HTTPX, PostGIS and Supabase Auth/RLS/Realtime. Both data modes pass through the same discovery schema and client filtering/schedule/dietary rules. No test watcher is configured.

The fixture has three geographic markets, eight stalls, menu/review examples, a declared stall, a fictional certified stall, non-halal and conflicting declarations, two separately timestamped batch examples and one time-limited promotion. Session-anchored batch/promotion times never slide forward on polling. The fixture clock can be changed on Profile. Fictional photos remain emoji illustrations; generated images are Phase 11 and uploads are Phase 4.

## Local phase gate

After completing the implementation, run `npm run phase3:check`. The focused Vitest suite covers Malaysian opening/closing/midnight/cancellation/override boundaries, BM/English search, combined filters, radius/bounds, stable ties/pages, certification evidence/expiry/conflicts, expired offers, denied location and event ordering. pytest parses migration 005 alongside the earlier migrations and retains auth boundary regressions. Parsing does not execute PostgreSQL functions or RLS.

For a browser gate with no requests to public tiles, start an additional Vite preview:

```powershell
$env:VITE_MAP_TILE_URL = 'disabled'
npm run dev -w @pasarmalam/web -- --port 5175 --strictPort
```

Check browse → map/list agreement → combined dietary/category/promotion filters → no-result search → stall menu/preparation/upload details → save → Saved → remove. Check market visit duplication and BM labels. Map controls are optional; cards remain keyboard-accessible if tiles fail. Geolocation rejection is injected in the unit gate; do not grant device permissions just to test that fallback.

## Live acceptance still required

Phase 2 real-session/RLS/Storage acceptance must pass first. Configure the disposable stack as in `phase2-setup.md`, then apply **migration 005** using the guarded migration helper. Do not regenerate any previously applied migration. Phase 3 adds only `discovery_versions` to the Realtime publication; inspect your project to ensure private complaints, profiles, evidence and push subscriptions have not separately been published.

```powershell
uv run --project apps/api python scripts/demo_db.py
$env:RUN_LIVE_PHASE3 = '1'
npm run phase3:live
```

The three live groups check PostGIS radius/bounds, customer-only idempotent favourites and isolation from other customers/hawkers, daily visit duplication, direct-write denial, and the public event column whitelist. They require real synthetic sessions. They do **not** measure WebSocket delivery latency. Account sign-in/logout/expiry remains part of the Phase 2 browser gate.

For the two-client gate, open connected discovery in two browser sessions on the same market. Observe the WebSocket event stream and record the monotonic `version`, UTC mutation time and time the second client displays the canonical result. In a guarded disposable DB transaction, toggle the seeded stall's `open` field or create/expire an eligible batch/promotion using the later policy-aware workflow. The second client's update target is **five seconds**. Disable/re-enable one client's network and verify reconnect re-fetches canonical data. Replay an older event in an isolated test harness: it must not decrement the accepted version or resurrect an offer whose timestamp has expired. Confirm event fields are only `market_id`, `version`, `updated_at`; no private record contents. Record actual median/max latency and failures in `phase-status.md`; until measured, the target is unverified.

## Geographic and privacy boundaries

- Exact GPS lives only in React memory, expires after two hours, is not written to localStorage or database, and is requested only by the location button. Manual market selection requires no permission.
- Browser distances are computed locally. The geographic API receives a two-decimal-degree coarse/manual origin, not exact GPS; it persists no shopper location. Map bounds are query-only. No location is written by favourites/check-ins.
- `nearby_markets` uses PostGIS metre distances and a spatial index; client filters apply the same chosen radius and visible map rectangle to its fetched snapshot. Server distance from a coarse cell can differ from exact device distance; the UI uses the device computation.
- Reviews/popularity are distinct: rating uses published reviews; popularity is market visit counts over 30 Malaysian calendar days. No account names or review authors are public.
- Certification requires reviewed evidence and a future expiry; conflicting item/stall claims and incomplete/expired certification fail the certified filter. Religion/ethnicity are never inferred.
- Public events only invalidate cache; clients fetch canonical eligible rows on changes/reconnect and poll every 60 seconds while visible. Timestamps independently hide expired offers. Polling/channel subscriptions pause when hidden.
- OSM tiles use ordinary browser HTTP caching. No prefetch/offline tile download/service-worker tile cache. Configure a different source via `VITE_MAP_TILE_URL` plus its required `VITE_MAP_ATTRIBUTION`; default is the attributed OSM standard tile endpoint.

Sources: [Leaflet API](https://leafletjs.com/reference.html), [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/), [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes).
