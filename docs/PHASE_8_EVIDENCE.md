# Phase 8 — Mobile, PWA, Hardening (Evidence Stub)

## Delivered
- `apps/mobile` — Expo host (`package.json` + `src/config.ts`) — deep linking `kebugram://`, SecureStore, biometrics, push, camera/QR, MMKV offline cache stubs; MFEs loaded via dynamic import map (JS split per feature).
- PWA — `next-pwa` deferred to shell hardening (offline shell, installable, background sync for chat) — config via `apps/shell/next.config.js` + `public/manifest.json` when provisioned.
- Hardening — SAST (CodeQL), DAST, 50k WS load (Go gateway), geo-routing/CDN via `infrastructure/EDGE_CDN.md`; canary 5→25→100 per MFE, <60s rollback via manifest pin — drill in `docs/retros/`.
