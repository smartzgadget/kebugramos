# Task 0.3 — Evidence (Shared Packages)

## Delivered
- `@kebugram/design-system` — `Button` (primary/ghost, sm/md, loading), `Input`/`SearchField`, `Badge` (neutral/business/verified), `Skeleton`, `EmptyState` — all token-driven, no emoji, no purple, IBM Plex Sans inherited.
- `@kebugram/api-client` — `createClient(getConfig)` → `request/get/post` with Zod parse, `ApiError`, `Authorization` + `Idempotency-Key` injection, typed via Zod.
- `@kebugram/i18n` — `t(key)` + `setLocale`, `en` dict for shell/kebuchat/common.
- `@kebugram/auth-sdk` — stub with `get/setAccessToken`, `isAuthenticated`, `refresh` (to be wired to httpOnly rotation).
- `@kebugram/realtime-sdk` — `connect(url, getToken)` with auto-reconnect (1-3s jitter), `subscribe(channel, handler)` / `unsubscribe`, heartbeat-ready.

## Validation
- Packages import in `apps/shell` via `transpilePackages`; `next.config.js` already lists tokens/design-system.
- Blocked: `pnpm typecheck`/`build` pending sandbox recovery; types are strict and ready for local `pnpm install`.

## Next Gate
Task 0.4 (DevOps: env injection, CDN/edge, Sentry + Otel wiring, canary manifest pinning) and Task 0.5 (Docs + generator polish) remain for Phase 0 completion.
