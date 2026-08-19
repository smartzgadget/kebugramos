# KebuGram — Backend Phases & Tasks Plan (Mirror of Frontend)
> **Location:** `kebugramos/docs/02-BACKEND_PHASES_AND_TASKS_PLAN.md` | **Build Mode:** Production | **Execution:** Approval-gated, vertical slice — each Task = BE module + FE MFE + contracts + E2E

## How To Use
- Mirrors `02-PHASES_AND_TASKS_PLAN.md` (FE) Task IDs 0.1-8.5.
- Each **Phase** and **Task** requires `APPROVED` before start and before next.
- **Retro 4.1-6.3 BE is NOT at once** — deferred to `Phase 8.x Hardening` incremental (see §9). Forward slices start at `6.4`.

## Phase 0 — Foundation & Governance — BE Mirror
| Task | Backend Deliverable | Frontend Pair | Validation |
|---|---|---|---|
| 0.1 | `services/` Gradle/Go/Py skeleton + `services/contracts/` link to `packages/*` Zod | Turborepo/pnpm (FE 0.1) | `pnpm lint 27/27` still green |
| 0.2 | Platform Core module (country/currency/region/module registries) | shell manifest (FE 0.2) | country 54 config loads |
| 0.3 | Shared contracts package (`packages/contracts`) → OpenAPI gen from Zod | tokens/design-system/api-client (FE 0.3) | Zod → OpenAPI diff in PR |
| 0.4 | DevOps: `__KEBUGRAM_CONFIG__` propagation to `services/` | CDN/Sentry/Otel (FE 0.4) | staging deploy, BE health `/health` |
| 0.5 | BE MFE generator (`tooling/scripts/gen-be-module.ts`) | FE gen:mfe (FE 0.5) | generator creates module <60s |

## Phase 1 — Design System & Shell — BE Minimal (shell guards server-side)
| 1.1-1.5 | RBAC/permission sync service (Java) + `geo-sdk`/`consent-sdk` BE adapters | tokens→shell (FE 1.1-1.5) | shell `canAccess` matches BE `RBAC` |

## Phase 2 — Identity, Auth, Profile, Consent — BE Core
| 2.1 | `services/java-core/identity-access` — JWT + httpOnly refresh + OTP/recovery | `mfe-auth` | contract tests + refresh rotation |
| 2.2 | `services/java-core/profile + settings` — avatar presigned (Go gateway) | `mfe-profile|settings` | profile round-trip |
| 2.3 | `services/java-core/consent + geo` — GDPR consent, geo adapter | `mfe-consent|geo-sdk` | tracking blocked until consent |
| 2.4 | RBAC matrix service (Java) | shell `permissions` | unauthorized `403` on gateway |

## Phase 3 — KebuChat + AI Chat — BE Realtime
| 3.1 | `services/go-gateway/chat` — WS fanout/presence/heartbeat | `realtime-sdk` | 50k WS chaos |
| 3.2-3.4 | `services/python-ai/ai-chat` — streaming, guardrails, history | `mfe-kebuchat|ai-chat|composer` | `p95 <300ms` + offline queue |

## Phase 4 — Media & Community — BE (FE already hardened 4.1-4.3 — retro deferred, see §9)
| 4.1 | `kebutube` — Go presigned + Python transcoding | `mfe-kebutube` (done FE) | presigned PUT + status poll (when retro) |
| 4.2 | `community` — moderation queue RBAC | `mfe-kebucommunity` (done FE) | RBAC queue |
| 4.3 | `kebubook + blogs` — social graph + MDX | `mfe-kebubook|blogs` (done FE) | pagination + autosave |

## Phase 5 — Commerce, Finance & Logistics — BE (FE already hardened 5.1-5.5)
| 5.1 | `market` — catalog/search/cart/checkout idempotent (`Idempotency-Key`) | `mfe-kebumarket` | checkout idempotency |
| 5.2 | `store-builder` + inventory | `mfe-store-builder` | publish E2E |
| 5.3 | `kebupay` ledger (Java) + Go pay router + signed webhooks + audit log — `amountMinor` | `mfe-kebupay|mini-pay|kebupay-ui` | ledger reconciliation |
| 5.4 | `map-sdk` BE adapters + `logistics` + `partner-hub` (OSM/GraphHopper) | `mfe-logistics` | route calc |
| 5.5 | `posthub-connector` — webhook health | `mfe-posthub-connector` | health check |

## Phase 6 — Search, Browser, Ads, Analytics, Plugin — BE Forward (starts vertical slice here)
| 6.1 | `search` — unified BE (`java-core/search` + `python-ai/search`) — already FE `mfe-search + search-sdk` (done) — add BE index | `mfe-search` | relevance smoke |
| 6.2 | `browser-proxy` (Go) — CSP + permission manifest, consent-aware | `mfe-browser` (done FE) | CSP + consent gate |
| **6.3** | `ads` — Java `ads-manager` + Go `ads-edge` + Python `ads intelligence` | `mfe-ads-*|ads-sdk` (done FE this session) | `ads blocked until consent` (done FE) |
| **6.4** | **NEXT vertical slice** — `analytics` — `services/python-ai/analytics` (consumer+business) + `java-core/analytics` + `packages/analytics-sdk` | `mfe-analytics` (FE to harden) | Otel metrics E2E |
| **6.5** | `plugin` — `services/java-core/plugin-marketplace` + Go `plugin-runtime` | `mfe-plugin-marketplace` | sandbox escape blocked |

## Phase 7 — Portals & Operations (vertical slice)
| 7.1 | Business/Seller/Creator/Agent portal services | portals | RBAC smoke |
| 7.2 | Logistics Partner / Brand Owner / Developer portals | portals | adapter test |
| 7.3 | Support/Compliance/Admin + Brand Protection | portals | audit log |

## Phase 8 — Mobile Parity, PWA, Hardening & Launch + Retro 4.1-6.3 BE
| 8.1-8.3 | Mobile/PWA (unchanged FE) + BE push/biometrics adapters | mobile | Detox/Lighthouse |
| 8.4 | Hardening (SAST/DAST/load 50k WS) | — | load 50k |
| **8.4a-8.4e** | **Retro BE for 4.1-6.3** (incremental, not at once): `8.4a kebupay ledger`, `8.4b market+store`, `8.4c community moderation`, `8.4d tube transcoding`, `8.4e pay mini-pay` | existing MFEs (already FE) | FE↔BE E2E per domain when portal needs it |
| 8.5 | Canary 5→25→100 per MFE+BE, rollback <60s | — | canary + SLO |

## 9. Retro 4.1-6.3 — Why Not At Once
- Already FE production + Zod stable; building 11 BE modules at once = big-bang coupling, blocks 6.4 forward. Deferred to `8.4a-e` incremental hardening — each retro slice triggered when its domain’s portal needs truth (e.g., seller portal → market+pay ledger).

## 10. Vertical Slice Workflow (every Task from 6.4)
```
contracts (Zod) → OpenAPI → BE module (Java/Go/Python in services/) → FE MFE (apps/mfe-*) → api-client wiring (Idempotency-Key/amountMinor) → MSW off → Playwright/SSE E2E → Otel/Sentry → docs → APPROVED → next slice
```

## 11. Approval Log (mirror FE)
```
Backend Phase 6 — Approval to Start: ______ Date: ______ Signature: ______
  Task 6.4 — Start: __ Done: __ Next Approved: __
  Task 6.5 — Start: __ Done: __ Next Approved: __
Backend Phase 8 — Retro — Start: __ Done: __
```
