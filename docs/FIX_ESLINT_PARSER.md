# Fix Applied — ESLint Parser for MFEs (per APPROVE A)

## Change
- `kebugramos/package.json:27-36` — added `@typescript-eslint/parser ^7.18.0`, `@typescript-eslint/eslint-plugin ^7.18.0`, `eslint ^8.57.0` to `devDependencies` (workspace root, `-w`).
- `kebugramos/.eslintrc.json` — root config with `parser: @typescript-eslint/parser`, `plugin:@typescript-eslint/recommended` already present.
- All `apps/mfe-*` `lint` scripts already switched to `eslint src --ext .ts,.tsx` (26 packages).

## Verification (local terminal, `~/kebugramos`)
- `pnpm --version` 9.4.0 ✓
- `pnpm install` ✓ (after `pnpm install` without frozen lockfile)
- `pnpm lint` — previously failed at `next lint` (`findPagesDir` no app), then at `mfe-kebubook` missing parser — now parser deps added, awaiting re-run.

## Next Gate
- Run in `~/kebugramos`: `pnpm install` then `pnpm lint` → if green, `pnpm typecheck` → `pnpm build`.
- `muse.bash` sandbox still `proc/self/exe` blocked here — verification must be via your local `pnpm` until host `proc` restored.
