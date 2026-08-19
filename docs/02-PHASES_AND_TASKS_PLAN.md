# KebuGram — Phases & Tasks Execution Plan
> **Location:** `kebugramos/docs/02-PHASES_AND_TASKS_PLAN.md` | **Build Mode:** Production | **Execution:** Approval-gated, one Task at a time

## How This Plan Is Used
- Each **Phase** requires your `APPROVED` before start.
- Each **Task** requires your `APPROVED` before start and again before next Task.
- Tasks are vertical production slices: contract + UI + SDK + tests + telemetry + docs.
- Mark progress in the Approval Log (§9). No task is skipped, no task is merged unapproved.

## Phase 0 — Foundation & Governance (2–3 weeks)
**Goal:** Monorepo, host skeleton, shared packages, CI/CD, observability — all MFEs can build against it.

| Task | Deliverable | Validation |
|---|---|---|
| 0.1 | Monorepo: Turborepo + pnpm + Changesets + tooling configs (eslint, tsconfig, prettier) + `.github/workflows/ci.yml` | `pnpm lint && pnpm typecheck && ci green` |
| 0.2 | Shell skeleton: Next.js 14 host, MF host config, sovereign sidebar/top header (Figma-exact, tokens only), routing, `mfe-manifest.json` runtime loader | Playwright: shell loads with manifest fetch mocked, axe 0 violations |
| 0.3 | Shared packages: `@kebugram/tokens`, `design-system` (tokens, primitives), `api-client` (Zod fetch wrapper), `i18n`, `auth-sdk` stub, `realtime-sdk` stub | Unit coverage ≥85%, bundle budget met |
| 0.4 | DevOps: env injection (`__KEBUGRAM_CONFIG__`), CDN/edge config, Sentry + Otel FE wiring, canary manifest pinning | Staging deploy succeeds, Sentry receives test event |
| 0.5 | Docs: ADRs, API contract template, MFE generator (`pnpm gen:mfe`) | Generator creates type-clean MFE in <60s |

**Exit criteria:** `pnpm build` across apps+packages green, host serves at `/`, manifest loader verified, CI blocks on gate failures.

---

## Phase 1 — Design System & Sovereign App Shell (3 weeks)
**Goal:** Pixel-perfect shell + design system that all MFEs consume — no MFE recreates chrome.

| Task | Deliverable | Validation |
|---|---|---|
| 1.1 | Tokens → code: sovereign green palette, typography, spacing, shadows; Tailwind config mapped to Figma; dark/light ready | Chromatic diff vs Figma within 1 token |
| 1.2 | Design-system components: Button, Input, SearchField, Badge (business/verified), Avatar, Counter, Chip, Skeleton, EmptyState | RTL + a11y + visual tests |
| 1.3 | Shell sidebar: logo, global search, ecosystem nav (KebuChat, KebuTube, KebuMarket, KebuCommunity, KebuPay, KebuBook, Profile, Ad Manager, Blogs, Help), active states, collapsed mode | Playwright nav smoke |
| 1.4 | Shell top header: search, notification bell (unread dot), settings, profile/avatar, mobile drawer | Responsive + keyboard nav |
| 1.5 | Shell guards: AuthGuard, ConsentBanner, GeoContext provider, PluginGuard, layout grid + MFE slot + error boundary | MSW auth/consent flows |

---

## Phase 2 — Identity, Auth, Profile, Settings, Consent (3–4 weeks)
**Goal:** Sovereign identity — the gate every other MFE depends on.

| Task | Deliverable | Validation |
|---|---|---|
| 2.1 | `mfe-auth`: JWT access+refresh, httpOnly rotation, biometric fallback (mobile), Zod contracts for login/register/OTP/recovery | Contract tests + Detox auth flow |
| 2.2 | `mfe-profile` + `mfe-settings`: editable profile, avatar upload (presigned), privacy toggles, notification prefs | Playwright profile edit round-trip |
| 2.3 | `mfe-consent` + `geo-context-sdk`: GDPR-grade consent, geo routing, partner locale adapter | Consent blocks tracking until granted |
| 2.4 | RBAC matrix + shell permission sync (roles: consumer, business, seller, creator, agent, logistics, admin) | Shell blocks unauthorized MFE route |

---

## Phase 3 — KebuChat + AI Chat (4–5 weeks)
**Goal:** Real-time sovereign messenger — Go gateway, offline, business badges.

| Task | Deliverable | Validation |
|---|---|---|
| 3.1 | `realtime-sdk`: WS client (reconnect, heartbeat, fanout, presence), TanStack Query + persist | WS chaos test (drop/reconnect) |
| 3.2 | `mfe-kebuchat`: chat list panel, search chats, filter chips, chat rows (business/verified/unread), bottom KebuChat nav, right content panel + empty state | Playwright: send/receive (<300ms p95) + offline queue |
| 3.3 | Message composer: attachments, voice, read receipts, typing indicator | E2E: attachment via presigned upload |
| 3.4 | `mfe-ai-chat`: streaming UI, Python AI proxy, guardrails, history | Streaming SSE test |

---

## Phase 4 — Media & Community (KebuTube, KebuCommunity, KebuBook, Blogs) (4 weeks)

| Task | Deliverable | Validation |
|---|---|---|
| 4.1 | `mfe-kebutube`: feed, player, upload (Go gateway presigned), transcoding status (Python), comments | Upload → transcode → play E2E |
| 4.2 | `mfe-kebucommunity`: groups, feed, moderation queue | RBAC moderation |
| 4.3 | `mfe-kebubook` + `mfe-kebublogs`: social graph, posts, blog editor (MDX) | Feed pagination + editor autosave |

---

## Phase 5 — Commerce, Finance & Logistics (5–6 weeks)
**Goal:** KebuMarket, Store Builder, KebuPay/MiniPay (banking-grade), logistics, Post Hub.

| Task | Deliverable | Validation |
|---|---|---|
| 5.1 | `mfe-kebumarket`: catalog, search, cart, checkout (idempotent) | Checkout idempotency test |
| 5.2 | `mfe-store-builder`: seller storefront builder, inventory | Store publish E2E |
| 5.3 | `mfe-kebupay` + `mfe-mini-pay` + `@kebugram/kebupay-ui`: ledger, QR, P2P, wallet — signed webhooks, audit log | Ledger reconciliation test |
| 5.4 | `map-sdk` + `mfe-logistics` + `mfe-logistics-partner-hub`: OSM/GraphHopper, routing, tracking | Route calc + tracking map |
| 5.5 | `mfe-posthub-connector`: Post Hub UI, webhook status | Connector health check |

---

## Phase 6 — Search, Browser, Ads, Analytics, Plugin Platform (4–5 weeks)

| Task | Deliverable | Validation |
|---|---|---|
| 6.1 | `mfe-search` + `@kebugram/search-sdk`: unified search (chat, tube, market, community) | Search relevance smoke |
| 6.2 | `mfe-browser`: lightweight in-app browser with consent-aware tracking | CSP + permission manifest |
| 6.3 | `mfe-ads-manager` + `mfe-ads-display` + `mfe-sponsorship` + `ads-sdk`: campaign manager, display controls, consumer sponsorship, Python ads intelligence | Ads serve blocked until consent |
| 6.4 | `mfe-analytics`: dashboards (consumer + business) | Otel metrics E2E |
| 6.5 | `mfe-plugin-marketplace` + `plugin-runtime-sdk` + iframe sandbox: discovery, install, permissions, CSP, partner adapters | Third-party plugin E2E (sandbox escape blocked) |

---

## Phase 7 — Portals & Operations (4 weeks)
**Goal:** Every portal as a distinct surface reusing MFEs via host.

| Task | Deliverable | Validation |
|---|---|---|
| 7.1 | Business/Seller/Creator/Agent portals (portal shell variants, RBAC) | Portal RBAC smoke |
| 7.2 | Logistics Partner / Brand Owner / Developer / Plugin Dev portals | Partner adapter test |
| 7.3 | Support/Compliance/Admin + Brand Protection + Business Pages + Help | Admin action audit log |

---

## Phase 8 — Mobile Parity, PWA, Hardening & Launch (4 weeks)

| Task | Deliverable | Validation |
|---|---|---|
| 8.1 | Mobile shell: React Native Expo host, deep linking, secure storage, biometrics, push, camera/QR | Detox critical path |
| 8.2 | MFE feature parity: chat, tube, market, pay dynamic loading on mobile | Mobile Playwright/Detox parity |
| 8.3 | PWA: offline shell, installable, background sync (chat), update prompt | Lighthouse PWA 100 |
| 8.4 | Hardening: SAST, DAST, pen test, load test (Go gateway WS fanout), geo-routing, CDN | Load: 50k concurrent WS |
| 8.5 | Production cutover: canary 5→25→100 per MFE, rollback drill, SLO dashboards | Canary + rollback <60s verified |

---

## 9. Approval Log (You Update)
```
Phase 0 — Approval to Start: ______ Date: ______ Signature: ______
  Task 0.1 — Start: __ Done: __ Next Approved: __
  Task 0.2 — Start: __ Done: __ Next Approved: __
  ...
Phase 1 — Approval to Start: ______ Date: ______ Signature: ______
  ...
```

## 10. Task Done Checklist (Every Task)
- [ ] Zod contract + OpenAPI diff merged
- [ ] Production UI (no mock) with loading/empty/error/offline states
- [ ] Unit + RTL + Playwright + a11y + i18n
- [ ] MSW handlers updated
- [ ] Bundle budget + perf (p95) measured
- [ ] Sentry/Otel wired
- [ ] Docs + Changeset + demo video
- [ ] Owner demo → `APPROVED` to proceed

---
*Do not start Phase 0 Task 0.1 until Phase 0 approval is explicitly granted. Same gate for every subsequent Phase/Task.*
