# KebuGram — Rules & Governance
> **Location:** `kebugramos/docs/01-RULES_AND_GOVERNANCE.md` | **Status:** Enforced | **Applies to:** All apps, MFEs, packages, portals, AI/plugin surfaces

## 1. Governance Model
- **Owner = You (Product Owner).** No Phase starts without `Phase Approval: YES`. No Task starts without `Task Approval: YES`. Completion of a Task requires `Task Demo + Approval to Proceed`.
- **Single-threaded execution:** One Task active at a time. No parallel task execution unless explicitly approved.
- **Production-only doctrine:** No mocks, no MVPs, no templates, no lorem-ipsum data. One showcase record per function is allowed only to validate layout.
- **Governance file is law.** If code contradicts this doc, code is wrong.

## 2. Branching & Commit Rules
- **Trunk-based:** `main` is always deployable (protected). `develop` integrates MFEs. Feature branches: `feat/<mfe>-<slug>`, `fix/<scope>-<slug>`, `chore/<scope>-<slug>`.
- **Conventional commits enforced** via commitlint: `feat(shell): add sovereign sidebar token` | `fix(kebuchat): deduplicate WS reconnect`.
- **Changesets** for versioning: every feature PR includes a `.changeset/*.md`.
- **No direct pushes to main/develop.** PR requires: 1 owner approval + CI green + DCO sign-off.
- **PR size:** max 400 LOC (excluding generated). Larger = split.

## 3. Code Quality Gates (CI Blocks Merge If Failed)
1. `pnpm lint` — ESLint + Prettier + Stylelint + import sort
2. `pnpm typecheck` — `tsc --noEmit` strict
3. `pnpm test` — Vitest unit + RTL (coverage thresholds: 85% lines, 80% branches for touched files)
4. `pnpm test:e2e` — Playwright smoke for shell + changed MFE
5. `pnpm audit` — no high/critical CVEs; `pnpm knip` for dead code
6. Bundle budget: host < 180kB gz, each remote < 120kB gz, shared chunks deduplicated via MF
7. A11y: axe-core 0 violations on changed routes
8. i18n: no hardcoded strings outside `@kebugram/i18n` (eslint `no-restricted-syntax`)

## 4. Design & Product Rules
- **Figma is source of truth for layout topology** but not for tokens — tokens live in `@kebugram/tokens` and must match Figma within 1px/1 token.
- **Sovereign invariants (never broken by MFEs):**
  - Dark-green sidebar (`--color-sovereign-900`), KebuGram header, global search in sidebar, top header with search/notif/settings/avatar.
  - Shell owns routing, auth guard, consent banner, geo selector, plugin guard, layout grid.
  - MFEs render *inside* shell content slots — they never recreate shell chrome.
- **Empty states:** every MFE ships designed empty, loading (skeleton), error, and offline states.
- **No demo content:** one showcase record per domain (e.g., 1 chat thread, 1 tube video, 1 market product) flagged `isShowcase: true` and excluded from analytics/ads.

## 5. Module Federation Rules
- Host registers remotes from `mfe-manifest.json` fetched at runtime; build-time coupling forbidden.
- Shared singletons `react`, `react-dom`, `zustand`, `@tanstack/react-query`, `zod` — `singleton: true, eager: false, requiredVersion`.
- Each MFE exports `remoteEntry.js` + `./App` + `./Widget`; host imports dynamically via `loadRemote()`.
- CSS isolation: CSS Modules or scoped Tailwind prefix per MFE; no global leaks.
- Contract breaking = major version bump + host flag migration.

## 6. Security & Privacy Rules
- **Secrets:** never in bundle. Only `NEXT_PUBLIC_*` + runtime `__KEBUGRAM_CONFIG__`. Rotate via vault.
- **KebuPay/MiniPay:** idempotency keys on every mutation, ledger-grade audit logs, signed webhooks verified server-side only.
- **Auth:** JWT access (15m) + httpOnly refresh rotation + biometric fallback on mobile; RBAC enforced in shell guard + gateway.
- **Plugin sandbox:** third-party plugins run in sandboxed iframe + CSP + permission manifest; no direct DOM access to host/MFEs.
- **Geo & Consent:** geo context from adapter layer; consent required before any tracking/ads; PII encrypted at rest (AES-256) and in transit (TLS 1.3).
- **OWASP top 10:** SAST (CodeQL), dependency scan, and threat model per Phase.

## 7. Data & API Rules
- **Contract-first:** Zod schema is canonical; OpenAPI generated from Zod. Breaking change = new version, never silent field removal.
- **Idempotency & pagination:** all writes idempotent; all lists cursor-paginated.
- **Realtime:** Go gateways own WS; MFEs use `@kebugram/realtime-sdk` only (no raw `new WebSocket`).
- **Maps & Logistics:** OSM/GraphHopper via `@kebugram/map-sdk`; no direct third-party map SDK in MFEs.

## 8. Testing Rules
- Every Task delivers: unit (Vitest) + component (RTL) + contract (Zod/MSW) + E2E (Playwright) + visual (Chromatic) + a11y.
- MSW handlers for every endpoint; Playwright runs against MSW in CI, staging, and prod smoke.
- Mobile: Detox for critical flows (auth, chat send, pay).

## 9. Release & Rollback Rules
- **Canary:** 5% → 25% → 100% per MFE, gated by error budget (SLO: 99.9% success, p95 < 300ms).
- **Rollback:** one-click per MFE via manifest version pin; host can pin previous remote in < 60s.
- **Feature flags:** flag must exist before code ships; kill switch for every MFE.
- **PWA/native:** staged rollout via Expo EAS + Play Store internal track.

## 10. Approval Protocol (You Hold the Gate)
**For each Phase:**
```
Phase N — Request Approval to Start
  └→ Owner replies: APPROVED / CHANGES: <text> / HOLD
```
**For each Task within Phase:**
```
Task N.M — Request Approval to Start
  └→ Build Task (production code + tests + docs)
  └→ Demo + Evidence (lint, typecheck, coverage, Playwright video, bundle report)
  └→ Request Approval to Proceed to Next Task
```
No Task advances without explicit `APPROVED` for the next. This is logged in `02-PHASES_AND_TASKS_PLAN.md` → Approval Log.

## 11. Definition of Violation
Any of: direct MFE-to-MFE import, host build-time coupling, duplicate shell chrome, raw WS fetch, hardcoded secret, mock data shipped to prod, skipped task approval, or missing test gate — triggers immediate revert and Phase pause.

---
*This doc is versioned. Amend only via PR with owner approval. Next: `02-PHASES_AND_TASKS_PLAN.md` for ordered execution.*
