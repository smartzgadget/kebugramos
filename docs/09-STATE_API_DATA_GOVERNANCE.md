# KebuGram — State, API & Data Governance
> **Location:** `kebugramos/docs/09-STATE_API_DATA_GOVERNANCE.md`

## 1. Contract-First
- Zod is canonical: `packages/contracts/src/<domain>.ts` exports schemas + inferred types. OpenAPI generated via `zod-to-openapi`.
- Breaking field removal/rename = major version. Additive nullable fields = minor. CI diffs OpenAPI and fails on silent breaking change.

## 2. API Client Rules
- All FE calls go through `@kebugram/api-client` → typed `client.get('/chats', { query: ChatListQuerySchema })`.
- No raw `fetch`/`axios` outside `api-client`. Interceptors: auth injection, idempotency header, retry, Otel.
- Pagination: cursor only (`{ cursor, limit } → { data, nextCursor }`). No offset.

## 3. Server State (TanStack Query)
- Per-MFE `QueryClient` with `staleTime: 30s`, `gcTime: 5m`, `retry: (failureCount, err) => err.code !== 'VALIDATION'`.
- Keys: `['kebuchat', 'threads', { cursor }]` — factory per domain, no ad-hoc strings.
- Mutations: `onMutate` optimistic only where idempotency key exists; otherwise pessimistic + invalidations.

## 4. Client State (Zustand)
- One slice per MFE (`useKebuChatStore`), never cross-MFE. Cross-cutting (auth, geo, consent) in shell providers.
- Persist via `persist` middleware only for non-PII (e.g., sidebar collapsed, last filter chip). No tokens in persist.

## 5. Realtime
- `realtime-sdk` owns WS lifecycle; MFEs subscribe `realtime.subscribe('chat:thread:123', handler)`.
- Presence + typing via same SDK; heartbeat 25s, reconnect exponential 1s→30s with jitter.

## 6. Mobile Offline
- `mobile` uses `MMKV` + `persistQueryClient`; chat queue drains on reconnect with idempotency keys.

## 7. Validation
- Contract test per endpoint: Zod parse of MSW response + OpenAPI snapshot.
