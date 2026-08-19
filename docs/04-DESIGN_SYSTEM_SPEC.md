# KebuGram — Design System & Tokens Spec
> **Location:** `kebugramos/docs/04-DESIGN_SYSTEM_SPEC.md`

## 1. Token Source
- Figma Tokens Studio → `packages/tokens/tokens.json` → Style Dictionary → `packages/tokens/dist/{css,ts}`.
- **Sovereign palette:** `--color-sovereign-900: #0B3A2E` (sidebar), `--color-sovereign-700`, `--color-accent-500`, `--color-surface`, `--color-text-*`. No hex in components — tokens only.
- Tokens are versioned; breaking token rename = major bump + codemod.

## 2. Primitives (in `@kebugram/design-system`)
- `Button`, `IconButton`, `Input`, `SearchField`, `Chip`, `Badge`, `VerifiedBadge`, `BusinessBadge`, `Avatar`, `Counter`, `Skeleton`, `EmptyState`, `Sheet`, `Dialog`, `Tabs`, `Toast`.
- Every primitive: `variant`, `size`, `disabled`, `loading`, `aria-*`, `data-testid`; 100% a11y via Radix primitives where needed.
- **Chat-specific:** `ChatRow`, `ChatList`, `ChatComposer` live in `mfe-kebuchat` but consume primitives.

## 3. Shell Invariants
- Sidebar width: 280px expanded / 72px collapsed; header height: 64px. MFEs never set these.
- Content slot: `shell__main` grid — MFE receives `maxWidth: 1440px` + padding tokens. No MFE may override shell padding/overflow.
- Empty/Loading/Error states are mandatory per route (Figma has specs).

## 4. Theming & i18n
- CSS variables enable dark sovereign theme (future) without component changes.
- i18n keys via `@kebugram/i18n` — `t('kebuchat.searchChats')`; no raw strings. RTL ready.

## 5. Visual Regression
- Chromatic on every PR touching `design-system` or `tokens` or `shell`. Diff threshold 0.5%.
