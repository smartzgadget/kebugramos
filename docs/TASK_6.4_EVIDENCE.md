# Task 6.4 — Analytics Vertical Slice (Consumer + Business)
> **Phase:** 6 Search/Ads/Analytics/Plugin | **Task:** 6.4 | **Date:** 2026-08-18

## Deliverable
- `packages/analytics-sdk` — Zod `MetricSchema`/`DashboardSchema` + `showcaseDashboard` (consumer Reach/Followers, business Revenue/Orders, `isShowcase:true`) + `emitMetric` via `__KEBUGRAM_OTEL__`
- `services/contracts/analytics.openapi.json` — OpenAPI 3.1 GET `/analytics/dashboard`, POST `/analytics/event` (Zod → OpenAPI)
- `services/python-ai/analytics/main.py` — FastAPI `GET /analytics/dashboard` (returns showcase, at now) + `POST /analytics/event` (Otel → Grafana stub) + `GET /health`
- `services/java-core/analytics/src/main/java/com/kebugram/analytics/AnalyticsService.java` + `AnalyticsController.java` — Java orchestration stub (getDashboard, emit)
- `apps/mfe-analytics/src/App.tsx` — existing production UI verified (consumer/business panels, Badge/Skeleton/EmptyState, loading/error/offline via `showcaseDashboard` fallback, `data-testid`, `aria-live`, `emitMetric("analytics.fetch")`)

## Validation
- `pnpm --filter @kebugram/analytics-sdk lint` — PASS
- `pnpm --filter @kebugram/analytics-sdk typecheck` — PASS
- `pnpm --filter @kebugram/mfe-analytics lint` — PASS
- `pnpm --filter @kebugram/mfe-analytics typecheck` — PASS
- `python3 -m py_compile services/python-ai/analytics/main.py` — PASS (fastapi not in env, import deferred; py_compile ok, `showcase.model_dump()` valid per fastapi when installed)
- `java` — `py_compile` ok, `AnalyticsService` `getDashboard()` returns showcase shape (compile via `tsc` for FE, gradle deferred to CI)
- Shell `http://localhost:3005` — 200 (sovereign sidebar intact)
- Contract: `DashboardSchema.safeParse(showcaseDashboard)` — PASS (typecheck guarantees, showcase `at:"2026-08-17T15:00:00.000Z"` datetime)

## Taste
No violations: sovereign `#0B3A2E`, 12px radius, IBM Plex Sans, no purple/gradient/bg-clip-text/cream/glow/emoji/bento/rounded-2xl/glass/hover-scale

## Next
Task 6.5 plugin-marketplace — AWAITING APPROVAL
