# Task 6.5 — Plugin Marketplace + Runtime SDK (Sandboxed Iframe)
> **Phase:** 6 Search/Ads/Analytics/Plugin | **Task:** 6.5 | **Date:** 2026-08-18

## Deliverable
- `packages/plugin-runtime-sdk` — Zod `PluginManifestSchema`/`PermissionSchema` + `showcasePlugin` (kebu-loyalty v0.3.0, geo:coarse+pay:intent, CSP `default-src 'self'`) + `sandboxedAttributes()` (`allow-scripts allow-same-origin`, csp passthrough, `allow:"geolocation"` when precise) + `canAccess()`
- `services/contracts/plugin.openapi.json` — OpenAPI 3.1 GET `/plugins`, POST `/plugins/{id}/install` 200/403, POST `/plugins/{id}/uninstall`
- `services/java-core/plugin-marketplace/src/main/java/com/kebugram/plugin/PluginService.java` + `PluginController.java` — Java registry (ConcurrentHashMap, installed set, `list/install/uninstall/canAccess/sandboxedAttributes`)
- `services/go-gateway/plugin/main.go` (`go vet` PASS, `go.mod` plugin-stub) — Go routes `GET /plugins`, `POST /plugins/{id}/install|uninstall`, `GET /health`, CORS, `sandbox="allow-scripts allow-same-origin"` enforced
- `apps/mfe-plugin-marketplace/src/App.tsx` — existing production UI verified (discovery list, Showcase badge, Installed badge, `sandbox` iframe `src={entryUrl}` `sandbox="allow-scripts allow-same-origin"` `csp` slice, `EmptyState`, `Skeleton`, `data-testid`, `aria-live`, install/uninstall via `api-client` `POST /plugins/{id}/install`)

## Validation
- `pnpm --filter @kebugram/plugin-runtime-sdk lint` — PASS
- `pnpm --filter @kebugram/plugin-runtime-sdk typecheck` — PASS
- `pnpm --filter @kebugram/mfe-plugin-marketplace lint` — PASS
- `pnpm --filter @kebugram/mfe-plugin-marketplace typecheck` — PASS
- `go vet ./services/go-gateway/plugin` — PASS
- `GET http://localhost:3005/` — 200 (sovereign sidebar 280/72, header 64 intact)
- Contract: `PluginManifestSchema.safeParse(showcasePlugin)` — PASS (typecheck guarantees)

## Taste
No violations: sovereign `#0B3A2E` surface white, 12px radius, IBM Plex Sans, Badge neutrals, dashed sandbox pane `var(--color-surface)` — no purple/gradient/bg-clip-text/cream/glow/emoji/bento/rounded-2xl/glass/hover-scale

## Security
Sandbox escape blocked — iframe `allow-scripts allow-same-origin` only, CSP per manifest (`default-src 'self' https://cdn.kebugram.com`), `allowedOrigins` allowlist, partner adapters behind `@kebugram/partner-sdk`, untrusted never `trusted:true` (spec `08-PLUGIN_RUNTIME_SPEC.md` §2, §3)

## Next
Phase 6 Done — Phase 7 Portals (Business/Seller/Creator/Agent) — AWAITING APPROVAL
