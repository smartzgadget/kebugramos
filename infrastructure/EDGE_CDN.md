# KebuGram — Edge & CDN (Task 0.4)
- Host: Next.js on Vercel/CloudFront-compatible edge (or self-host via Nginx + Node).
- CDN: `cdn.kebugram.com` serves `apps/shell/.next/static` + `mfe-*/remoteEntry.js` with immutable cache (`max-age=31536000, immutable`) + `integrity` from manifest.
- `mfe-manifest.json` served from `https://cdn.kebugram.com/mfe-manifest.json` with `no-store, must-revalidate, max-age=60` (host SWR polls every 60s).
- Env: runtime `window.__KEBUGRAM_CONFIG__` injected via `<script>` before React (see `apps/shell/src/app/layout.tsx`). No `NEXT_PUBLIC_*` secrets baked except allowlisted `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_WS_BASE`.
- Canary: manifest `rollout.percent` controls per-MFE canary; rollback = pin previous version in manifest and purge CDN ( <60s ).
