# KebuGram — Backend Technical Development Plan
> **Location:** `kebugramos/docs/00-BACKEND_TECHNICAL_DEVELOPMENT_PLAN.md` | **Stack:** Polyglot Modular Monolith (Java/Go/Python) | **Build Mode:** Production | **Doctrine:** `KebuGram Joined Technical + Vertical Slice` — every module gets contracts + BE + FE together, extractable to microservices later

## 1. Executive Doctrine — Same as Joined Plan §1-2
KebuGram is **one sovereign ecosystem** with one identity core, one KebuPay ledger, one security command center, one settings system, one compliance engine, one plugin system, one partner adapter system, one brand protection system, one ads intelligence system, one data/analytics system, one geo-routing system, one search engine, one logistics orchestration layer — and many domain modules. No MVP, no `pay later`, no FE disconnected from BE.

Frontend `00-TECHNICAL_DEVELOPMENT_PLAN.md` shell (`dark-green sovereign sidebar + top header + KebuChat workspace`) + `mfe-*` remotes maps 1:1 to backend modules below.

## 2. Polyglot Ownership (Joined §3)
| Language | Owns |
|----------|------|
| **Java** (business truth) | Platform Core, Identity/Access, Unified Profile, Settings, Consent, Geo-Routing rules, Business Pages, KebuPay orchestration/ledger/wallet/escrow/orders, Marketplace commerce, Product Listing, Store Builder, Ads Manager, Plugin Marketplace, Partner Adapter registry, Brand Protection workflows, Sanctions/Suspension, Compliance Routing, Admin Operations, Developer Portal, Portal Provisioning, Subscription/Billing, Audit/Evidence |
| **Go** (speed/realtime) | API Gateway, WebSocket/Chat Gateway, Notification fanout, Live signaling, MiniPay/QR/Pay routers, Ads delivery edge, Anti-scraping/Bot, Rate limiting, Logistics event router, Routing API gateway, Lightweight Browser proxy, Plugin execution gateway |
| **Python** (intelligence) | AI Agent (DeepSeek/Qwen/Kimi), Fraud/Risk/AML, Ads targeting, Consumer Interest, Content Reco/Ranking, Search/Brand/Product/Store-AI/Copy/Content Moderation, Logistics Optimization, Geo Intelligence, Analytics (creator/seller/community/risk) |

Rule: Go may **route**, Java **decides** (wallet/ledger/compliance). Python **scores**, Java **records**.

## 3. Top-Level Backend Map (Joined §2 — 50 modules)
```
kebugram-backend
├── platform-core (country/currency/language/region/module/feature/tenant/entity/portal/plugin/adapter/policy/legal/workflow/audit/notification/data-boundary/permissions)
├── identity-access, unified-profile, settings-preferences, consent-privacy, geo-routing, business-pages
├── kebuchat, mini-pay, kebutube, kebumarket, store-builder, product-listing, kebucommunity
├── kebupay (ledger/wallet/agent/escrow/card/settlement), kebubook, kebublogs, search-engine, lightweight-browser
├── ads-manager, ads-display, consumer-interest, sponsorship, content-protection, brand-protection, sanctions
├── app-store/plugin-marketplace, plugin-runtime, partner-adapter-orchestrator, business-submission/compliance-adapter
├── kebu-logistics, logistics-partner-hub, osm-geo-platform, graphhopper-routing, post-hub-connector
├── partner-portals, developer-portal, ai-agent-platform, data-platform, analytics-platform
└── security-command-center, anti-scraping, fraud-risk, compliance-regulatory, quantum-readiness, notifications, audit-evidence, observability, admin-operations
```

## 4. Continental Platform Core (Joined §4)
Country registry × 54 (Cameroon first) — each with ISO, currency, payment rails, tax/KYC/KYB, consumer/marketplace/logistics/ads/data-protection rules, addressing, language, support routing, compliance/partner adapters. AU Data Framework aligned — adaptable per-country governance.

## 5. Consent & Geo-Routing (Joined §5-6)
Consent: terms/privacy/cookies/ads/analytics/location/AI/marketplace/communication, version history, withdrawal, audit logs — **tracking only after explicit `consent.ads/analytics/location`**, granular + revocable (EU-aware). Geo: `registered/verified/residence/current/travel/preferred marketplace+content/tax/currency/agent/compliance` — current vs identity separated (e.g., Cameroon verified, Nigeria current → Nigerian agents/tax/currency, Cameroon identity preserved) — privacy controls per field.

## 6. Settings (Joined §7)
User (60+ prefs: profile/country/residence/search/chat/call/community/marketplace/ads/tracking/location/seller-targeting/sponsorship/payment limits/cash/device/block/muted/lang/currency/a11y/theme/AI/data export/deletion), Business (brand/store/staff/branch/payment/tax/invoice/subscription/catalog/shipping/logistics/return/escrow/support/ads/api/plugin/brand/country), Creator (monetization/gifts/sponsorship/remix/download/watermark/AI/brand/analytics).

## 7. App Store / Plugin (Joined §8)
Internal app store — 20+ plugin types (creator/store/seller/shipping/payment/ads/analytics/community/blog/AI/theme/listing/inventory/support/kebubook/logistics/gateway), permissions via `plugin-runtime-sdk` + iframe sandbox + `CSP` + `permission manifest` (geo:coarse, pay:intent).

## 8. Module-to-Package Mapping (FE↔BE)
| FE MFE (existing) | BE Module (services/) | Primary Language |
|---|---|---|
| `mfe-auth|profile|consent` | `services/java-core/identity-access + consent` | Java |
| `mfe-kebuchat|ai-chat` | `services/go-gateway/chat + services/python-ai/chat` | Go/Python |
| `mfe-kebutube` | `services/java-core/kebutube + go-gateway/upload + python-ai/transcoding` | Java/Go/Python |
| `mfe-kebucommunity` | `services/java-core/community` | Java |
| `mfe-kebumarket|store-builder` | `services/java-core/market + store-builder + product-listing` | Java |
| `mfe-kebupay|mini-pay|kebupay-ui` | `services/java-core/kebupay (ledger) + services/go-gateway/pay` | Java/Go |
| `mfe-logistics|partner-hub|posthub|map-sdk` | `services/java-core/logistics + go-gateway/logistics + python-ai/geo` | Java/Go/Python |
| `mfe-search|search-sdk` | `services/java-core/search + python-ai/search` | Java/Python |
| `mfe-browser` | `services/go-gateway/browser-proxy` | Go |
| `mfe-ads-*|sponsorship|ads-sdk` | `services/java-core/ads + go-gateway/ads-edge + python-ai/ads` | Java/Go/Python |
| `mfe-analytics` | `services/python-ai/analytics + java-core/analytics` | Python/Java |
| `mfe-plugin-marketplace` | `services/java-core/plugin-marketplace + go-gateway/plugin` | Java/Go |

## 9. Monorepo Layout (new)
```
kebugramos/
├── services/
│   ├── java-core/         # Gradle, bounded modules per domain (see §3)
│   ├── go-gateway/        # Go modules: gateway, chat, pay, logistics, ads-edge, browser-proxy
│   ├── python-ai/         # FastAPI: fraud, ads, reco, search, brand, analytics
│   └── contracts/         # symlink to packages/* Zod — OpenAPI generated from Zod
├── apps/ (mfe-* + shell + mobile) — existing, unchanged
├── packages/ (design-system, api-client, auth-sdk, kebupay-ui, ads-sdk, map-sdk, search-sdk, analytics-sdk …) — existing, unchanged
└── docs/ (00-BACKEND* + 02-BACKEND* + PLAN_VERTICAL_SLICE_SWITCH.md) — this plan
```

## 10. Done Definition (per slice)
Zod contract + OpenAPI + BE module + FE MFE + `api-client` wiring (`Idempotency-Key`, `amountMinor`, signed webhooks server-only, consent-gated) + `Sentry`/`Otel` + `Vitest/RTL/Playwright` + `MSW off` E2E + docs + demo → `APPROVED`.

---
*Next: `02-BACKEND_PHASES_AND_TASKS_PLAN.md` for Phases 0-8 vertical slices.*
