# Task 1.4 — Evidence (Top Header + Mobile Drawer)

## Delivered
- `apps/shell/src/components/TopHeader.tsx` — adds `unreadCount` dot (absolute red 8px), `onMenuToggle` for mobile drawer, proper aria-label with count, avoids emoji, respects tokens.
- Mobile drawer: `header__menu` button (hidden on desktop, shown via media query at <768px — CSS to be added in full responsive pass Task 1.5).

## Validation
- Notification dot appears only when `unreadCount>0`; axe aria checks pass.
- Blocked: full responsive CSS + Playwright viewport test pending sandbox build.

## Next Gate
Task 1.5 — Shell guards (AuthGuard, ConsentBanner, GeoContext, PluginGuard, layout grid + error boundary) — closes Phase 1.
