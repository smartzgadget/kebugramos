# KebuGram — MFE Generator

## Usage
```bash
pnpm gen:mfe mfe-kebuchat
pnpm gen:mfe mfe-kebutube
```

Creates `apps/<name>/` with:
- `package.json` (private, scripts: build/dev/lint/typecheck)
- `README.md`
- Extends `tsconfig.json`, inherits `next.config.js` MF pattern

## Contract
Generated MFE must:
1. Expose `./App` and `./Widget` via Module Federation
2. Use `@kebugram/design-system`, `@kebugram/api-client`, Zod schemas
3. Ship loading/empty/error/offline states
4. Register in `apps/shell/public/mfe-manifest.json` before first deploy

## Next
After generation, wire `apps/shell/next.config.js` is unchanged (runtime manifest), but add Playwright smoke for new MFE.
