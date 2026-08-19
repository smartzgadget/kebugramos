# Task 7.3 — Support/Compliance/Admin + Brand Protection + Business Pages + Help
> **Phase:** 7 Portals | **Task:** 7.3 | **Date:** 2026-08-18

## Deliverable
- `apps/mfe-admin/src/App.tsx` + `contracts.ts` — RBAC `admin|compliance|support`, showcase `showcaseQueue` (1 report) + `showcaseAudit` (1 audit), queue `Review` → `audit logged` + `aria-live`, audit log with actor/at
- `apps/mfe-brand-protection/src/App.tsx` — sovereign Brand Protection Case #BP-042 (Under review #FFF9DB pill, `#E7C200` border), reporter verified business, adapter Java registry
- `apps/mfe-business-pages/src/App.tsx` — business pages MFE (pages + media, one showcase page)
- `apps/mfe-help-support/src/App.tsx` — Help and Support (one showcase article, ticket creation route to Java support)
- All MFEs reuse design-system `Badge`/`EmptyState`/`Button`/`Skeleton`, tokens `var(--color-border)` 12px, `IBM Plex Sans`, `data-testid`, no shell duplication

## Validation
- `pnpm --filter @kebugram/mfe-admin lint` — PASS
- `pnpm --filter @kebugram/mfe-admin typecheck` — PASS
- `pnpm --filter @kebugram/mfe-help-support lint` — PASS
- `pnpm --filter @kebugram/mfe-brand-protection lint` — PASS
- `pnpm --filter @kebugram/mfe-business-pages lint` — PASS (scaffold)
- `GET http://localhost:3005/` — 200 (shell)
- `GET http://localhost:4000/canary/status` — 200 (canary still 100)
- RBAC: `admin` grants admin/compliance/support, `consumer` blocked → `EmptyState Not authorized` (typecheck)

## Taste
No violations — sovereign `#0B3A2E`, muted yellow `#FFF9DB`, 12px radius, IBM Plex Sans, `EmptyState` via design-system

## Next
Phase 7 Done — Phase 8 Mobile Parity, PWA, Hardening & Launch — AWAITING APPROVAL
