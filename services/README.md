# KebuGram Services — Polyglot Modular Monolith Skeleton
> **Location:** `kebugramos/services/` | **Languages:** Java (Gradle), Go, Python (FastAPI) | **Contracts:** symlink to `../packages/*` Zod → OpenAPI

## Layout
```
services/
├── java-core/          # Java enterprise core — bounded modules per domain
│   ├── identity-access/
│   ├── kebupay/        # ledger, wallet, escrow, audit (amountMinor + Idempotency-Key)
│   ├── kebumarket/     # catalog, cart, checkout idempotent
│   ├── kebucommunity/  # moderation queue RBAC
│   ├── kebutube/       # upload + transcoding orchestration
│   ├── kebubook/       # social graph
│   ├── kebublogs/      # MDX
│   ├── search/         # unified search
│   ├── ads/            # ads-manager
│   ├── plugin-marketplace/
│   ├── analytics/      # consumer + business
│   └── platform-core/  # 54 countries, registries
├── go-gateway/         # Go high-speed runtime
│   ├── gateway/        # API gateway
│   ├── chat/           # WS fanout
│   ├── pay/            # MiniPay/QR routing
│   ├── logistics/      # event router
│   ├── ads-edge/       # delivery edge
│   └── browser-proxy/  # CSP + permission manifest
├── python-ai/          # Python intelligence
│   ├── ai-chat/        # streaming, guardrails
│   ├── tube-transcoding/
│   ├── ads-intelligence/
│   ├── search-intelligence/
│   ├── analytics/      # consumer+business dashboards
│   └── fraud-risk/
├── contracts/          # → ../packages/* (Zod is canonical; OpenAPI generated)
└── README.md           # this file
```

## Boundaries
- **Java owns truth** — wallet/ledger/compliance. Go may route, Java decides. Python scores.
- **No cross-domain imports** except via `services/contracts/` (Zod) + `packages/tokens` — enforced by `archunit`/`jdepend` later.
- **Vertical slice from 6.4 onward:** each `02-BACKEND_PHASES_AND_TASKS_PLAN.md` Task = BE module in `services/<lang>/<domain>` + FE `apps/mfe-*` + `packages/contracts` + `api-client` wiring + E2E.

## Current Status
- **Skeleton only** — no business logic yet (P1-P2 of `PLAN_VERTICAL_SLICE_SWITCH.md`). `pnpm lint 27/27` + `pnpm build 28/28` unaffected (services not in turbo pipeline yet).
- **Retro 4.1-6.3 BE** deferred to `Phase 8.4a-e` (incremental), not at once.

## Next
- `Phase 6.4 mfe-analytics` — first vertical slice: `services/python-ai/analytics` + `services/java-core/analytics` + `packages/analytics-sdk` + `apps/mfe-analytics` + Otel.
