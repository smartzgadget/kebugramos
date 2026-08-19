# KebuGram — Testing & QA Strategy
> **Location:** `kebugramos/docs/06-TESTING_QA_STRATEGY.md`

## 1. Pyramid (Enforced Per Task)
```
E2E (Playwright) — 5–10% — shell + critical path per MFE
Integration (RTL + MSW) — 20% — MFE with api-client + Query
Unit (Vitest) — 70% — pure logic, Zod, SDKs, Zustand
```
- Coverage gates: 85% lines / 80% branches on **changed files** (not repo-wide average).
- Every Task ships all 3 layers; missing layer = Task not done.

## 2. Tooling
- **Unit:** Vitest + `jsdom` + `msw` (node). Utilities in `@kebugram/test-utils` (`renderWithProviders` wrapping QueryClient + Router + i18n).
- **Component:** RTL + `user-event` + `axe-core` (`jest-axe`).
- **E2E:** Playwright (chromium) — MSW in CI, real `staging` nightly. Trace/video on failure.
- **Visual:** Chromatic for `design-system`, `shell`, and each MFE's showcase story.
- **Mobile:** Detox (iOS/Android) for auth, chat send, pay flows.
- **Contract:** `zod-to-openapi` + `msw` handlers generated from Zod; Pact-style: CI fails if handler schema diverges from OpenAPI.

## 3. MSW Discipline
- One `handlers.ts` per MFE, re-exported to root `mocks/handlers.ts`.
- Handlers return **one showcase record** only for design (flagged `isShowcase`), otherwise empty states.
- Tests never mock `fetch` directly — they use MSW.

## 4. A11y & i18n
- `axe` in unit + E2E (0 violations). Keyboard-only smoke per route.
- `i18n` — `eslint-plugin-i18n` blocks raw strings; `pnpm i18n:check` fails on missing keys.

## 5. Performance Budgets (CI Enforced)
- Host JS < 180kB gz, Remote < 120kB gz, `largest-contentful-paint` < 2.5s on Moto G4 throttling.
- Bundle report via `next-bundle-analyzer` + `size-limit` in CI comment.

## 6. Evidence Per Task Demo
- Link: coverage HTML, Playwright trace, Chromatic build, axe report, bundle report.
