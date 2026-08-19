# KebuGram — Architecture Blueprint (Supplement)
> **Location:** `kebugramos/docs/03-ARCHITECTURE_BLUEPRINT.md`

## 1. Monorepo & Build Graph
- **Turborepo** pipeline: `build` depends on `^build`; `lint/typecheck/test` run in parallel per package.
- **pnpm** isolated installs; `pnpm-workspace.yaml` defines `apps/*`, `packages/*`.
- **Module Federation** only via Webpack (Next.js host). No Vite for host (MF compatibility). MFEs use `nextjs-mf` plugin.

## 2. Host ↔ Remote Contract (Hard Rules)
```ts
// apps/shell/next.config.js (excerpt)
const NextFederation = require('@module-federation/nextjs-mf');
new NextFederation({
  name: 'shell',
  remotes: {}, // empty at build—resolved at runtime via manifest
  shared: {
    react: { singleton: true, requiredVersion: false, eager: false },
    'react-dom': { singleton: true, eager: false },
    zustand: { singleton: true, eager: false },
    '@tanstack/react-query': { singleton: true, eager: false },
    zod: { singleton: true, eager: false },
  }
});
```
- Runtime loader: `fetch('/mfe-manifest.json') → loadRemote('mfeKebuchat/App')`. Host validates `semver` + `peerDeps`.
- Isolation: per-MFE `QueryClient`, `Zustand` slice, `ErrorBoundary`, `Suspense`.

## 3. State Ownership
| Layer | Owner | Lib | Scope |
|---|---|---|---|
| Server state | TanStack Query | `@tanstack/react-query` | per-MFE client |
| Client state | Zustand | `zustand` | per-MFE slice (`useKebuChatStore`) |
| Cross-MFE (auth, geo, consent) | Shell providers | React Context + Zustand | shell only |
| Realtime | `realtime-sdk` | Zustand + WS | singleton + per-MFE subscriptions |

## 4. API Client
- `@kebugram/api-client`: `fetch` wrapper → Zod parse → typed error (`ApiError {code, message, details}`) → retry (idempotent GET only) → Otel span.
- Auth injection via `auth-sdk.getAccessToken()`; refresh on 401 with single-flight lock.
- MSW handlers colocated: `packages/api-client/mocks/handlers.ts` auto-registered in `local` and tests.

## 5. Mobile Bridge
- Expo host hosts same MFEs via `react-native-web` + dynamic import map (JS bundle split per feature).
- Native modules only via `@kebugram/mobile-bridge` (biometrics, push, secure store, camera).

## 6. Env & Config
```ts
// runtime config (injected before React mounts)
window.__KEBUGRAM_CONFIG__ = {
  apiBase: 'https://api.kebugram.com',
  wsBase: 'wss://rt.kebugram.com',
  mapTileUrl: 'https://tiles.kebugram.com/{z}/{x}/{y}.png',
  graphhopperUrl: 'https://route.kebugram.com',
  env: 'prod', flags: { newCheckout: true }
}
```
No `process.env` secrets in client bundle except `NEXT_PUBLIC_*` allowlist.

---
*Companion docs: `00-TECHNICAL_DEVELOPMENT_PLAN.md`, `05-SECURITY_GOVERNANCE.md`.*
