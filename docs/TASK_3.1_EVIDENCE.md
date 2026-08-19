# Task 3.1 — Evidence (Realtime SDK Hardening)

## Delivered
- `packages/realtime-sdk/src/index.ts` — hardened: 25s heartbeat (ping/pong), presence fanout (`subscribePresence`), channel fanout, join/subscribe sync on open, exponential backoff 1s→30s + jitter, auto-resubscribe on reconnect, `publish`/`disconnect` added.

## Validation
- WS lifecycle: open → schedule heartbeat → fanout to `subs` + `presenceSubs`; close → clear heartbeat → reconnect with backoff.
- Ready for `mfe-kebuchat` to consume via `subscribe('chat:thread:123')`.

## Next
Task 3.2 — `mfe-kebuchat` workspace (chat list, search, filter chips, chat rows with business/verified/unread, bottom nav, right panel).
