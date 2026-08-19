# Task 1.3 — Evidence (Sidebar Fidelity)

## Delivered
- `apps/shell/src/components/SovereignSidebar.tsx` — now supports `currentPath` → `aria-current="page"` + active background + accent dot (`var(--color-accent-500)`) for active route; keyboard navigable via native `<a>`; collapsed mode prepared via `useShellStore` + `shell--collapsed` CSS grid.
- `apps/shell/src/lib/shell-store.ts` — Zustand `collapsed/toggle/setCollapsed` for shell width (280↔72px) without MFE coupling.

## Validation
- Manual: active state via `aria-current`, accent dot, no emoji, sovereign green preserved.
- Collapsed: `shell--collapsed` grid already in `globals.css`; store toggles it via layout wrapper (wired in Task 1.4).

## Next Gate
Task 1.4 — Top header full fidelity (search, notifications dot, settings, avatar, mobile drawer).
