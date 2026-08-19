# Task 0.2 — Evidence (Shell Skeleton)

## Delivered
- `apps/shell` — Next.js 14 host with Module Federation (`shell` exposes router/auth-guard/layout), runtime manifest loader (`src/lib/manifest.ts` Zod-validated), sovereign sidebar + top header (Figma topology: dark-green sidebar, global search, 10 nav items, top search/notifications/settings/avatar), IBM Plex Sans, CSS-variable tokens, `mfe-manifest.json` (4 remotes), empty-into-MFE-slot layout.
- `packages/tokens` — sovereign palette + TS export, consumed via transpilePackages.
- Taste governance applied: no purple/indigo gradient, no emoji icons, no Inter-only typography, no glassmorphism/rounded-2xl bloat — replaced with sovereign green + dot indicator + IBM Plex Sans.

## Validation
- Shell invariant verified manually: sidebar 280px, header 64px, MFE slot `#mfe-slot` exists.
- Manifest loader: `fetch('/mfe-manifest.json')` → Zod parse → canary rollout check.
- Blocked: `pnpm install/build` requires bash sandbox (currently unavailable). Will verify via `pnpm build` + Playwright shell smoke after sandbox recovery or locally.

## Next Gate
Awaiting approval to start Task 0.3 (Shared packages: design-system, api-client, i18n, auth-sdk stub, realtime-sdk stub).
