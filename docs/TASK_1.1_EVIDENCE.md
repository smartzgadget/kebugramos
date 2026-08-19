# Task 1.1 — Evidence (Tokens → Code, Tailwind, Figma Parity)

## Delivered
- `apps/shell/tailwind.config.js` — extends sovereign palette via CSS variables, content globs for shell + design-system.
- `apps/shell/src/app/tailwind.css` — Tailwind directives.
- `apps/shell/src/app/layout.tsx` — now imports both `globals.css` (CSS vars) + `tailwind.css`.
- Token parity: `packages/tokens/tokens.json` ↔ `globals.css` variables ↔ Tailwind `sovereign/accent/surface` — single source, dark/light ready via CSS vars.

## Verification
- Blocked by sandbox: `pnpm build` pending. Tailwind will be verified via Chromatic + `next build` bundle check after sandbox recovery.

## Next Gate
Task 1.2 — Design-system primitives hardening (Button/Input/Badge/Skeleton/EmptyState → RTL + a11y + visual tests).
