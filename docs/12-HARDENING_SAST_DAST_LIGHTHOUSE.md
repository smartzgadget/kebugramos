# Hardening — SAST/DAST/Lighthouse + SLO Gates

- **SAST:** Semgrep `p/auto + r/typescript|java|go|python`, ESLint `no-secrets`, `govulncheck`, `pip-audit`. Blocks PR on high.
- **DAST:** OWASP ZAP baseline `http://localhost:3000` (local `3005` when 3000 occupied by Gitea) after `pnpm build` (manifest, SW, offline, ledger p2p 409/400, HMAC).
- **Lighthouse CI:** `lighthouserc.json` — perf ≥0.85, a11y ≥0.92, best-practices ≥0.92, PWA ≥0.8, doc/script ≤180kb. Routes `/` + `/offline`. Runs on PR + weekly `0 3 * * 1`.
- **Canary SLO gate:** `CanaryService p95<120ms error<1%` else `412` promote blocked; rollback `percent 0 + 30s drain = <60s` end-to-end (manifest source of truth).
- **Supply chain:** `pnpm --frozen-lockfile`, `govulncheck`, `pip-audit`, `size-limit` budgets shell <180kb mfe <90kb.
- **Verification gate:** `.github/workflows/hardening.yml` — see SAST/DAST/Lighthouse jobs; real HTTP required, file-exists not accepted.

## Live Verification 2026-08-18 HW-2 (local, port 3005 — 3000 occupied by Gitea)
- **Shell prod:** `pnpm --filter @kebugram/shell build` green (43/43), `next start -p 3005` → `GET /` 200, `GET /offline` 200, `GET /manifest.webmanifest` 200, `GET /sw.js` 200 (after clean `.next` rebuild — prior vendor-chunk miss fixed).
- **Pay gateway:** `go run services/go-gateway/pay` on `:4100` → `GET /health` 200, `GET /pay/ledger` 200 `balanceMinor 1_250_000`, `POST /pay/p2p` 200 then 409 on `Idempotency-Key` replay, `X-Webhook-Signature` header present, 400 on missing/invalid key.
- **Canary:** `go run services/go-gateway/canary` on `:4000` → `GET /canary/status` 200, `POST /canary/rollback` 200 `percent 0` + 30s drain `503`, `POST /canary/promote 5→25→100` 200 each (verified after drain; 400 on downgrade, 412 on SLO breach path).
- **SAST:** `pnpm lint 43/43`, `pnpm typecheck 49/49`, `go vet` clean, `govulncheck` shows 28 stdlib vulns on `go1.22.2` (fixed in `go1.22.11+`, no direct code vulns), `pip-audit` 19 vulns in `pip` cache env (not project deps), `semgrep`/`zap`/`lhci chrome` not installed locally — CI will run via `hardening.yml` (documented gap).

