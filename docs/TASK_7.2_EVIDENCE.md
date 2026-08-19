# Task 7.2 — Portals Logistics Partner / Brand Owner / Developer (Partner Adapters)
> **Phase:** 7 Portals | **Task:** 7.2 | **Date:** 2026-08-18

## Deliverable
- `apps/portal-logistics-partner/src/App.tsx` — RBAC `logistics|agent|business|admin`, reuses `mfe-logistics-partner-hub` + `mfe-logistics` OSM/GraphHopper + `map-sdk`, `Badge` verified/blocked, `EmptyState` no-auth, `data-testid`
- `apps/portal-brand-owner/src/App.tsx` — RBAC `brand_owner|business|admin|compliance`, reuses `mfe-brand-protection` (Case #BP-042) + sponsorship, `EmptyState`
- `apps/portal-developer/src/App.tsx` — RBAC `developer|admin`, reuses `mfe-developer-portal` + `mfe-plugin-marketplace` + `plugin-runtime-sdk` sandbox + partner adapters
- `apps/portal-plugin-dev/src/App.tsx` — RBAC `developer|admin`, reuses `mfe-plugin-marketplace` discovery + `plugin-runtime-sdk` `geo:coarse|pay:intent`, iframe CSP `allow-scripts allow-same-origin`
- `packages/permissions` — `Role` 11, `RBAC` verified (logistics/brand_owner/developer)
- All portals thin hosts: `package.json` `dev next dev -p 307x` `build tsc --noEmit`, no shell duplication, `mfe-manifest.json` `loadRemote`

## Validation
- `pnpm --filter @kebugram/portal-logistics-partner lint` — PASS
- `pnpm --filter @kebugram/portal-logistics-partner typecheck` — PASS
- `pnpm --filter @kebugram/portal-brand-owner lint` — PASS
- `pnpm --filter @kebugram/portal-developer lint` — PASS
- `pnpm --filter @kebugram/portal-plugin-dev lint` — PASS
- `GET http://localhost:3005/` — 200 (sovereign shell preserved)
- Portal `next dev` — BLOCKED honest (no `app`/`pages`, `next: not found` — deferred like 7.1)
- Partner adapter: `POST /logistics/partner/:id/handover`, `POST /brand/protection/report` documented, via Java orchestrator + Go execution gateway (spec `08-PLUGIN_RUNTIME_SPEC.md` §5)

## Taste
No violations — sovereign `#0B3A2E`, 12px radius, IBM Plex Sans, `Badge` `verified`/`neutral`, `EmptyState` via design-system, no purple/gradient/emoji

## Next
Task 7.3 Support/Compliance/Admin + Brand Protection + Business Pages — AWAITING APPROVAL
