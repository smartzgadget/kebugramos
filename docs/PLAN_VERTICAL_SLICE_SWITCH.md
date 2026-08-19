# Plan — Vertical Slice Switch vs. Retro Backend for Already-Built FE (Phases 4.1-6.3)

## Goal
Decide whether to build backend modules for the already-built frontend slices (4.1 kebutube, 4.2 kebucommunity, 4.3 kebubook/blogs, 5.1 market, 5.2 store-builder, 5.3 kebupay/mini-pay, 5.4 map/logistics, 5.5 posthub, 6.1 search, 6.2 browser, 6.3 ads) **at once before proceeding**, vs. **proceeding forward vertical-slice** and deferring retro backend.

User question: “Are we going to build backend components for what we have already built for frontend before proceeding at once?”

## Success Criteria
- No contract drift (`Zod` in `packages/*` + `apps/mfe-*/src/contracts.ts` = BE OpenAPI).
- No big-bang integration: each slice FE↔BE proven via `api-client` + `amountMinor`/`Idempotency-Key`/webhook where required.
- `pnpm lint 27/27` + `pnpm build 28/28` stays green (currently 25/28 before fixes, `ZodTypeAny` patch held for local verification).
- Docs (`00-TECHNICAL_DEVELOPMENT_PLAN.md`, `02-PHASES_AND_TASKS_PLAN.md`, `10-SESSION_FOLLOWUP_LOG.md`) stay approval-gated.

## Context And Current Facts
- **FE built to 6.3** (file-verified, `muse.bash proc/self/exe BLOCKED`): `apps/mfe-kebutube|kebucommunity|kebubook|kebublogs|kebumarket|store-builder|kebupay|mini-pay|logistics|posthub|search|browser|ads-*` + `packages/map-sdk|search-sdk|ads-sdk|kebupay-ui|api-client ZodTypeAny fix` + `EmptyState` lint fix held for your local `pnpm` tails. All slices use `Zod` contracts + `createClient(__KEBUGRAM_CONFIG__.apiBase)` + `isShowcase` + MSW fallback — ready for BE swap config-only.
- **Joined Technical + Vertical Slice Plan** [kebugramos/docs/KebuGram Joined Technical Development Document and Embedded Vertical Slice Development Plan.md](kebugramos/docs/KebuGram%20Joined%20Technical%20Development%20Document%20and%20Embedded%20Vertical%20Slice%20Development%20Plan.md) §1-3: production-wide doctrine, polyglot Java (truth) / Go (gateway) / Python (intelligence), no FE disconnected from BE, no AI guesses contracts.
- **Backend plans copied but not yet authored:** `KEBUGRAM v3 BACKEND PLAN (1/1-2)`, `FRONTEND PLAN`, `MFE ARCHITECTURE`, `KEBUPAY FUNCTION`, `17-MVP_SCREENSHOTS.md` (213 base64 PNGs) + `PDF` (binary) — all digested, not yet reflected in `docs/00` / `02`.

## Constraints And Non-goals
- **Constraints:** approval-gated one Task at a time (`01-RULES_AND_GOVERNANCE.md` §10), production-only/one showcase, `sovereign #0B3A2E` tokens, `amountMinor` int + `Idempotency-Key` on pay/market, sandbox `muse.bash` blocked → verification is local `pnpm` tails you paste, `10-SESSION_FOLLOWUP_LOG.md` not updated until `27/27+28/28`.
- **Non-goals this decision:** no full BE rebuild of 11 slices at once, no FE rewrite of 4.1-6.3, no `purple/gradient/emoji/rounded-2xl` rework, no mobile/PWA yet.

## Key Decisions
1. **Do NOT build all retro BE at once (big-bang) — rejected.** Would require 11 BE modules (Java market/store/pay/ledger, Go gateways, Python tube transcoding/ads/community moderation) in parallel, high coupling risk, blocks forward progress, violates vertical-slice doctrine. Rejected.
2. **Do NOT defer all BE to after Phase 8 (FE-only to end) — rejected.** Defers banking-grade truth (ledger/escrow/audit) and creates contract drift; Joined Plan §1 says `No FE disconnected from BE`. Rejected.
3. **Recommended: Forward vertical slice from 6.4 onward; retro BE for 4.1-6.3 deferred to hardening phase (incremental, not at once).** Keeps sunk FE (already demo-able) stable, proves FE↔BE on next high-risk slices (analytics, plugin, portals). Retro BE added slice-by-slice when its domain is needed (e.g., `kebupay` ledger before `portal-seller` settlement). Low risk, preserves 1:1 plan alignment.

## Recommended Approach
- **Create two exhaustive docs (no BE code yet):**
  - `docs/00-BACKEND_TECHNICAL_DEVELOPMENT_PLAN.md` — 50-module polyglot map (Platform Core→PostHub) with Java/Go/Python ownership from `KEBUGRAM v3 BACKEND PLAN`.
  - `docs/02-BACKEND_PHASES_AND_TASKS_PLAN.md` — mirror of `02-PHASES_AND_TASKS_PLAN.md` Phases 0-8, Task IDs matching FE (`5.3 kebupay` ↔ `services/java-core/kebupay + go-gateway/pay`), each Task: `contracts (Zod/OpenAPI) → BE module → FE MFE → api-client wiring → E2E`.
- **Create `services/` skeleton** (polyglot modular monolith): `services/java-core/`, `services/go-gateway/`, `services/python-ai/` with `<domain>/` placeholders + `services/contracts/` symlink to `packages/*` Zod — no business logic yet, just boundaries + `README` + `make`/`gradle` hooks.
- **From 6.4 onward, each Task = vertical slice:** `Build mfe-*` → `switch to services/<backend>/` → `build BE module for same function` → `api-client` wiring → `E2E: Zod parse + MSW off + real BE + Playwright/SSE`.
- **Retro 4.1-6.3 BE:** scheduled as `Phase 8.x Hardening` incremental slices (e.g., `8.4a kebupay ledger`, `8.4b market orders`), not at once. Triggered when a portal depends on that domain’s truth (seller portal needs `market+pay` ledger before launch).

## Work Plan
| # | Unit | Surface | Validation |
|---|------|---------|------------|
| P1 | `docs/00-BACKEND_TECHNICAL_DEVELOPMENT_PLAN.md` + `docs/02-BACKEND_PHASES_AND_TASKS_PLAN.md` | docs | `read_file` shows mirror IDs 0-8, Java/Go/Python owners cited |
| P2 | `services/` skeleton (`java-core/go-gateway/python-ai` + `contracts` link) | services | `ls services/` + `pnpm lint` still `27/27` (no BE build yet) |
| P3 | `6.4 mfe-analytics` vertical slice (Python analytics + Otel, `packages/analytics-sdk`) | apps/mfe-analytics + services/python-ai/analytics | `pnpm build 28/28` + Playwright Otel E2E |
| P4 | `6.5 plugin` + `7 portals` slices (as per Joined Plan §4.2) | apps/mfe-plugin-marketplace + services/java-core/plugin | iframe sandbox CSP check |
| P5 | Retro hardening `4.1-6.3` BE slices (incremental, not at once) | services/java-core/pay|market|community | ledger reconciliation + `Idempotency-Key` test |

## Validation Plan
- **Docs:** `read_file docs/00-BACKEND*` + `02-BACKEND*` — 1:1 Task IDs with `02-PHASES_AND_TASKS_PLAN.md`.
- **Skeleton:** `services/` exists, `pnpm lint` `27/27`, `pnpm build` `28/28` (BE not yet compiled).
- **Slice E2E (from 6.4):** `contracts safeParse(showcase)` → `client.get/post` with `Idempotency-Key`/`amountMinor` → Playwright `upload→transcode→play` / `ledger posted` / `analytics Otel` — each slice demo before next `APPROVED`.

## Risks / Rollback
- **Risk:** Building retro BE at once → contract drift + `27/27→fail`, blocks `6.4+`. Mitigation: defer, keep Zods stable.
- **Risk:** Sandbox `proc/self/exe` still blocks `muse.bash` verification → docs still file-verified only until you paste `pnpm` tails. Mitigation: keep `10-SESSION_FOLLOWUP_LOG.md` gate.
- **Rollback:** Docs are versioned; `services/` skeleton is additive; no FE code touched for 4.1-6.3 in P1-P2.

## Open Questions
- None — FE contracts already capture BE shape (`amountMinor`, `idempotencyKey`, `status` enums). BE language per module taken from `KEBUGRAM v3 BACKEND PLAN` §3 (Java vs Go vs Python) — no guess needed.
