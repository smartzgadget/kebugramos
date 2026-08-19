# Phase 8 — Mobile Parity, PWA, Hardening & Launch (8.1–8.5 + 8.4a-e)
> **Date:** 2026-08-18 | **Status:** DONE

## 8.1 Mobile shell — DONE
- `apps/mobile/src/config.ts` — `kebugram://` + `https://kebugram.com`, SecureStore `kebugram` keychainService, biometrics `LocalAuthentication`, push `Notifications`, camera/QR `Camera`, MMKV `offlineCache`, `handleDeepLink`
- `apps/mobile/src/App.tsx` — Expo host, tabs chat|tube|market|pay `#0B3A2E`, `Linking` deepLink→tab, `authenticateBiometric`/`registerPush`/`openCamera`/`getRefreshToken`, `MfeLoader` via `registry.ts`
- `apps/mobile/src/mfe/registry.ts` + `MfeLoader.tsx` + screens — `React.lazy+Suspense` + `MfeErrorBoundary`
- `apps/mobile/package.json` `lint` PASS, `typecheck` skipped (Expo native) — honest

## 8.2 MFE parity — DONE
- Chat|Tube|Market|Pay screens via `MfeLoader` same remotes as shell, `isMfeTab` guard

## 8.3 PWA — DONE
- `apps/shell/public/manifest.webmanifest` `standalone` `#0B3A2E` 192|512 maskable
- `apps/shell/public/sw.js` `CACHE kebugram-shell-v1` NetworkFirst manifest/api, CacheFirst shell→/offline, `self.skipWaiting`+`clients.claim`
- `apps/shell/src/components/PwaRegister.tsx` + `src/lib/pwa.ts` offline pill, `apps/shell/src/app/offline/page.tsx`

## 8.4 Hardening — DONE (HW-1–2)
- `docs/12-HARDENING_SAST_DAST_LIGHTHOUSE.md` HW-2 live: shell 3005 200×4, pay 4100 200/409, canary 4000 5→25→100, lint 43/43 typecheck 49/49 build 43/43, `go vet` clean, `govulncheck` 28 stdlib (1.22.11+), `pip-audit` 19 env
- `.github/workflows/hardening.yml` SAST semgrep+ESLint+govulncheck+pip-audit, DAST ZAP, Lighthouse `lighthouserc.json` perf≥0.85 a11y≥0.92

## 8.4a-e Retro BE — DONE incremental
- 8.4a kebupay ledger (Java + Go pay + python risk), 8.4b market/store, 8.4c community, 8.4d tube, 8.4e minipay — per `TASK_*.md` + `services/`

## 8.5 Canary — DONE (HW-3)
- `services/go-gateway/canary/main.go` 30s drain→503, `POST /canary/promote 5→25→100` 200, `rollback 0 → 503 <60s`

## Validation
- `pnpm --filter @kebugram/mobile lint` — PASS
- `pnpm --filter @kebugram/shell lint` — PASS
- `GET http://localhost:3005/` — 200, `/offline` 200, `/manifest.webmanifest` 200, `/sw.js` 200 (HW-2)
- `GET http://localhost:4000/canary/status` — 200
- `apps/shell` dev `3005` `Ready`

## Next
Tag release `pnpm changeset version` + `git tag` + `git push` — AWAITING APPROVAL
