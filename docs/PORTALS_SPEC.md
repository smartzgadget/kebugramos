# KebuGram — Portal Shell Variants (Phase 7)

Portals reuse the sovereign shell + MFEs with RBAC:

- `apps/portal-business` — business pages, ads manager, analytics
- `apps/portal-seller` — store-builder, market, logistics
- `apps/portal-creator` — tube upload, analytics, sponsorship
- `apps/portal-agent` — logistics partner hub + pay intents
- `apps/portal-developer` + `portal-plugin-dev` — plugin marketplace + partner adapters, docs
- `apps/portal-support` / `compliance` / `admin` — brand protection, moderation queue, audit log

Each portal is a thin Next.js host that imports the same remotes via `mfe-manifest.json` and enforces RBAC via `@kebugram/permissions`. No portal recreates shell chrome — only portal-specific nav filtering.

Generate with: `pnpm gen:mfe portal-business` etc., then set `PORTAL_ROLE` env and RBAC guard.
