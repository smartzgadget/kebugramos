# Analytics — Python + Java vertical slice (Phase 6.4)
- `services/python-ai/analytics` — FastAPI: consumer+business dashboards, Otel → Grafana
- `services/java-core/analytics` — orchestration, permission checks
- `packages/analytics-sdk` — Zod Dashboard/Metric, `emitMetric` via `__KEBUGRAM_OTEL__`
- `apps/mfe-analytics` — consumer/business panels, one showcase metric per side, `GET /analytics/dashboard` via `api-client`
