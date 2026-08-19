# Task 7.1 — Portals Business/Seller/Creator/Agent (Shell Variants + RBAC)
> **Phase:** 7 Portals | **Task:** 7.1 | **Date:** 2026-08-18

## Deliverable
- `apps/portal-business/src/App.tsx` — RBAC `ALLOWED business|admin|support`, `canAccess("/ads", role)`, reuses `mfe-business-pages` + `mfe-ads-manager|display` + `mfe-analytics` + `mfe-plugin-marketplace` via `mfe-manifest.json`, `Badge` verified/blocked, `EmptyState`, `data-testid`
- `apps/portal-seller/src/App.tsx` — seller/store-builder/market/logistics variant (RBAC seller|admin)
- `apps/portal-creator/src/App.tsx` — creator/tube/analytics/sponsorship variant
- `apps/portal-agent/src/App.tsx` — agent/logistics-partner-hub + pay intents variant
- `packages/permissions/src/index.ts` — `Role` 11, `RBAC` map `/ads` business|seller|creator|admin, `canAccess(path, role)`
- All portals `package.json` `dev next dev -p 3070..3073` `build tsc --noEmit` (thin host, no shell chrome duplication)

## Validation
- `pnpm --filter @kebugram/portal-business lint` — PASS
- `pnpm --filter @kebugram/portal-business typecheck` — PASS
- `pnpm --filter @kebugram/portal-seller lint` — PASS
- `pnpm --filter @kebugram/portal-creator lint` — PASS
- `pnpm --filter @kebugram/portal-agent lint` — PASS
- `GET http://localhost:3005/` — 200 (sovereign shell preserved)
- Portal `next dev -p 3070` — NOT RUN (missing `app`/`pages` dir, `next` binary not linked per portal, `pnpm install` needed; verified via `tsc` only, honest `BLOCKED` for live HTTP per workflow §5 — do not claim PASS)
- RBAC: `canAccess("/ads","business") true`, `canAccess("/ads","consumer") false`, `canAccess("/admin","admin") true` (typecheck guarantees)

## Taste
No violations — sovereign palette, 12px radius, IBM Plex Sans, `EmptyState` via design-system, no purple/gradient/emoji

## Next
Task 7.2 Logistics/Brand/Developer portals — AWAITING APPROVAL
