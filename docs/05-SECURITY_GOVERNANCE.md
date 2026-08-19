# KebuGram — Security, Privacy & Compliance Governance
> **Location:** `kebugramos/docs/05-SECURITY_GOVERNANCE.md` | **Classification:** Internal — enforce on every Task

## 1. Threat Model (Per Phase)
- Each Phase delivers a 1-page threat model: assets, actors, entry points, mitigations. Stored `docs/threat-models/PHASE-N.md`.

## 2. Auth & Session
- Access JWT 15m in memory only; refresh httpOnly Secure SameSite=Strict cookie, rotation + reuse detection.
- Mobile: refresh in SecureStore + biometric gate (`expo-local-authentication`).
- RBAC enforced both in shell (route guard) and gateway (server). Client RBAC is UX only.

## 3. KebuPay Banking-Grade
- All mutations carry `Idempotency-Key: uuid`; server deduplicates 24h.
- Amounts as integer minor units (`amountMinor`), never float.
- Webhooks HMAC-SHA256 verified server-side; FE never verifies ledger — only displays signed receipt.
- Audit log: every pay action → immutable log (Java core) with actor, geo, device fingerprint.

## 4. Plugin Runtime Isolation
- Plugins run in `sandbox="allow-scripts allow-same-origin"` iframe with CSP: `default-src 'self'; script-src 'self' https://cdn.kebugram.com`.
- Permission manifest (`permissions: ["camera", "geo"]`) declared at install; host prompts + consent required.
- No `postMessage` without validated origin + schema (Zod).

## 5. Privacy & Consent
- Consent SDK blocks analytics/ads/map tracking until `consent.granted.analytics === true`.
- PII fields tagged `pii: true` in Zod schemas; logged only as `***`.
- Geo: coarse by default; precise only with explicit toggle + OS permission.

## 6. Supply Chain
- `pnpm audit` blocks high/critical; `dependabot` weekly; pinned `react`/`next` via host.
- SAST: CodeQL + ESLint security; secrets scan via `gitleaks` in CI.

## 7. Incident
- Sentry `beforeSend` scrubs PII; Otel traces sampled 10% prod, 100% errors.
- Kill switch per MFE via manifest flag `disabled: true` + host error boundary fallback.

## 8. OSM/GraphHopper
- Self-hosted tiles on `tiles.kebugram.com`; no third-party map exfiltration. Route requests stripped of PII before Python risk scoring.
