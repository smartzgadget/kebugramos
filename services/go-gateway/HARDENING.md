# Go Gateway — hardening: 50k WS, backpressure, canary 5→25→100 rollback <60s

- WS: `hub.maxConns=50000`, per-IP 20, write buffer 4k, read limit 512k, ping 30s, pong deadline 60s. Backpressure: drop slow clients (queue >256) + NATS jetstream persist.
- Canary: rollout.manifest percent 5→25→100 gated by regions (KE,RW...), rollback <60s via manifest disabled + gateway drain (30s).
- Observability: OpenTelemetry trace, Sentry, p95 WS latency <120ms.
- Contracts: Zod canonical → OpenAPI 3.1, `Idempotency-Key` + `amountMinor` XAF.

// See services/go-gateway/cmd/gateway/main.go (placeholder wired next phase)
