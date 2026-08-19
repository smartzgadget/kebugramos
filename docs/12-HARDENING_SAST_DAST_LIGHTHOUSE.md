# Hardening — SAST/DAST/Lighthouse + SLO Gates

- **SAST:** Semgrep `p/auto + r/typescript|java|go|python`, ESLint `no-secrets`, `govulncheck`, `pip-audit`. Blocks PR on high.
- **DAST:** OWASP ZAP baseline `http://localhost:3000` after `pnpm build` (manifest, SW, offline, ledger p2p 409/400, HMAC).
- **Lighthouse CI:** `lighthouserc.json` — perf ≥0.85, a11y ≥0.92, best-practices ≥0.92, PWA ≥0.8, doc/script ≤180kb. Routes `/` + `/offline`. Runs on PR + weekly `0 3 * * 1`.
- **Canary SLO gate:** `CanaryService p95<120ms error<1%` else `412` promote blocked; rollback `percent 0 + 30s drain = <60s` end-to-end (manifest source of truth).
- **Supply chain:** `pnpm --frozen-lockfile`, `govulncheck`, `pip-audit`, `size-limit` budgets shell <180kb mfe <90kb.
- **Verification gate:** `.github/workflows/hardening.yml` — see SAST/DAST/Lighthouse jobs; real HTTP required, file-exists not accepted.
