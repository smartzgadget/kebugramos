# KebuGram Micro-Frontend — Technical Development Plan
> **Location:** `kebugramos/docs/00-TECHNICAL_DEVELOPMENT_PLAN.md` | **Status:** Governance Draft v1.0 | **Build Mode:** Production Only

## 1. Goal
Build KebuGram as a **production sovereign super-app** with a single App Shell hosting independently deployable micro-frontends for web, mobile, desktop, and PWA. No prototypes, no MVPs, no template filler — every function ships production-grade, with exactly one showcase record per module for design verification.

## 2. Non-Negotiables
- **Production build only:** typed, tested, secured, observable, accessible, i18n-ready.
- **One showcase record per function:** one chat, one product, one video, one post — used only to prove layout, not as demo data.
- **Backend-aligned:** every backend domain (Java core, Go gateways, Python AI/risk, KebuPay, OSM/GraphHopper, logistics, Post Hub) has a 1:1 frontend MFE or portal surface.
- **Approval-gated:** Phase and Task both require explicit owner approval before start and before next.

## 3. Architecture Overview

```
KebuGram Frontend Platform
├── Sovereign App Shell (Next.js Host)
│   ├── Dark-green sovereign sidebar + top header (from Figma)
│   ├── Global search + notification/settings/avatar
│   └── MFE Router + Auth Guard + Geo + Consent + Plugin Guard
├── Remotes (Module Federation)
│   ├── mfe-auth, mfe-profile, mfe-settings, mfe-consent
│   ├── mfe-kebuchat, mfe-ai-chat
│   ├── mfe-kebutube, mfe-kebucommunity, mfe-kebublogs, mfe-ke bubook
│   ├── mfe-kebumarket, mfe-store-builder, mfe-kebupay, mfe-mini-pay
│   ├── mfe-search, mfe-browser, mfe-ads-manager, mfe-ads-display, mfe-analytics, mfe-sponsorship
│   ├── mfe-plugin-marketplace, mfe-plugin-runtime
│   ├── mfe-business-pages, mfe-brand-protection, mfe-logistics, mfe-logistics-partner-hub
│   ├── mfe-posthub-connector, mfe-help-support
│   └── portals: business, seller, creator, agent, partner, developer, brand-owner, support, compliance, admin
├── Shared Packages (@kebugram/*)
│   ├── @kebugram/design-system, @kebugram/tokens
│   ├── @kebugram/api-client, @kebugram/auth-sdk, @kebugram/geo-sdk, @kebugram/consent-sdk
│   ├── @kebugram/kebupay-ui, @kebugram/mini-pay-ui, @kebugram/plugin-runtime-sdk
│   ├── @kebugram/realtime-sdk (Go gateway WS), @kebugram/ai-sdk (Python inference)
│   ├── @kebugram/map-sdk (OSM/GraphHopper), @kebugram/logistics-sdk
│   ├── @kebugram/security-sdk, @kebugram/analytics-sdk, @kebugram/i18n
│   └── @kebugram/test-utils, @kebugram/e2e
└── Mobile (React Native + Expo)
    └── Shared logic via shared packages; native shells for biometrics, push, camera/QR, secure storage, deep link, offline cache
```

## 4. Technology Stack (Locked)

### Web
- TypeScript 5.x strict, React 18, Next.js 14 (App Router, Host only)
- Webpack Module Federation (via `@module-federation/nextjs-mf`) — MF is the **only** MFE runtime
- TanStack Query v5 (server state), Zustand (client state), React Hook Form + Zod
- WebSocket client for Go real-time gateways (auto-reconnect, heartbeat, fanout)
- PWA via `next-pwa` (offline shell, installable, background sync for chat)
- Design tokens → Tailwind + CSS variables (sovereign green, Figma-exact)

### Mobile
- React Native 0.74+ with Expo (managed → bare eject only if native module requires)
- TypeScript strict, Expo SecureStore, expo-local-authentication, expo-notifications, expo-camera, expo-barcode-scanner
- Offline: MMKV + TanStack Query persist; deep linking via Expo Linking

### Shared / Cross-Cutting
- Monorepo: **Turborepo** + pnpm workspaces + Changesets
- Lint: ESLint flat + Prettier + Stylelint + Commitlint (conventional commits)
- Validation: Zod schemas shared BE/FE via `@kebugram/contracts`
- Testing: Vitest + RTL + Playwright + MSW + Detox (mobile)
- Observability: OpenTelemetry FE → Grafana stack; Sentry FE

## 5. Monorepo Layout (Canonical)
```
kebugramos/
├── apps/
│   ├── shell/                 # Next.js host — sovereign sidebar/header
│   ├── mfe-kebuchat/
│   ├── mfe-kebutube/
│   ├── mfe-kebumarket/
│   ├── mfe-kebupay/
│   ├── mfe-*/                 # one folder per remote in §3
│   └── mobile/                # React Native Expo app
├── packages/
│   ├── design-system/
│   ├── tokens/
│   ├── api-client/
│   ├── auth-sdk/
│   ├── realtime-sdk/
│   ├── map-sdk/
│   ├── plugin-runtime-sdk/
│   └── ...
├── docs/
├── tooling/
│   ├── eslint-config/
│   ├── tsconfig/
│   └── scripts/
├── .github/workflows/
└── infrastructure/            # CDN, edge, env
```

## 6. Module Federation Contract
- Host exposes: `shell/router`, `shell/auth-guard`, `shell/layout`. **Host never imports remotes at build time.**
- Each remote exposes `./App` (routed) and `./Widget` (embeddable) and registers in `mfe-manifest.json`.
- Versioning: semver via `mfe-manifest.json` fetched at runtime; host validates `peerDependencies` (react, react-dom, zustand pinned).
- Shared singletons: `react`, `react-dom`, `zustand`, `@tanstack/react-query`, `zod` — `eager: false, singleton: true, requiredVersion`.
- Isolation: each MFE has its own Zustand slice, QueryClient scope, and Zod boundary; CSS isolation via CSS Modules + tokens.

## 7. Backend Integration Map
| Frontend MFE | Backend Owner | Protocol |
|---|---|---|
| mfe-kebuchat, realtime-sdk | Go real-time gateway | WS + REST (Java core) |
| mfe-kebutube | Java core + Go upload gateway + Python transcoding | REST + presigned S3 |
| mfe-kebupay/mini-pay | KebuPay internal ledger | REST + signed webhooks |
| mfe-kebumarket/store-builder | Java core | REST |
| map-sdk, logistics | OSM/GraphHopper + logistics service | REST |
| posthub-connector | Post Hub connector | REST + webhook |
| AI Chat, Ads intelligence, risk | Python AI/data/risk | REST + streaming |
| Plugin runtime/marketplace | Plugin registry (Java) + partner adapters | REST + sandboxed iframe |

## 8. Environments
- `local` (MSW mocks) → `dev` (gateway dev) → `staging` (prod-like) → `prod` (geo-routed, CDN edge)
- Env injection only via `NEXT_PUBLIC_*` + runtime `__KEBUGRAM_CONFIG__` (no secrets in bundle).
- Feature flags via shared flag service (read by host, propagated to MFEs).

## 9. Delivery Principles
1. Vertical slices — one task = API contract + MFE + shared SDK touch + tests + telemetry + docs.
2. Contract-first — Zod schema + OpenAPI diff is the first PR in every task.
3. No drift from Figma topology — sovereign sidebar, top header, chat layout are shell invariants; MFEs never recreate them.
4. Offline-first for chat/notifications; optimistic UI only where idempotency keys exist (KebuPay, orders).

## 10. Done Definition (Per Task)
Typed + lint-clean + unit + integration + a11y + i18n keys + MSW mock + Playwright smoke + Sentry/Otel wired + docs updated + Changeset + approval recorded.

---
*Next: `01-RULES_AND_GOVERNANCE.md` for enforcement, then `02-PHASES_AND_TASKS_PLAN.md` for execution order.*
