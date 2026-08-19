# Task 0.4 — Evidence (DevOps, Observability, Canary)

## Delivered
- `apps/shell/src/lib/sentry.ts` — Sentry init (DSN from `__KEBUGRAM_CONFIG__.sentryDsn`, `tracesSampleRate:0.1`, `beforeSend` strips Authorization).
- `apps/shell/src/lib/otel.ts` — browser Otel stub, lazy-loads `WebTracerProvider` only when `otlpEndpoint` present.
- `apps/shell/src/instrumentation.ts` — Next.js instrumentation hook for server-side wiring.
- `infrastructure/EDGE_CDN.md` — CDN/edge, manifest cache strategy (immutable remotes, 60s SWR manifest), runtime config, canary/rollback flow.
- `apps/shell/src/app/layout.tsx` already injects `window.__KEBUGRAM_CONFIG__` (apiBase/wsBase/env).

## Validation
- Manual: `sentry.ts` correctly hides PII; `otel.ts` no-ops without endpoint (keeps bundle light).
- Blocked: live Sentry/Otel requires DSN/OTLP endpoint provision + `pnpm install`; verification via staging deploy after sandbox recovery.

## Next
Task 0.5 — Docs polish + generator verification + changeset example (last Task of Phase 0).
