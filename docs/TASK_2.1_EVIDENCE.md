# Task 2.1 — Evidence (mfe-auth)

## Delivered
- `apps/mfe-auth` — Next.js remote stub, `src/contracts.ts` (LoginSchema, OtpSchema, AuthResponseSchema via Zod), `src/App.tsx` (LoginForm with Zod validation, Button/Input from design-system).
- Contract-first: Zod is canonical; OpenAPI will be generated from Zod in API layer.

## Validation
- Form validates `email` + `password≥8` client-side; server refresh via httpOnly cookie to be wired when Go/Java auth gateway is provisioned.
- Blocked: live JWT rotation requires backend; `pnpm build` pending sandbox.

## Next Gate
Task 2.2 — `mfe-profile` + `mfe-settings` (editable profile, avatar presigned, privacy toggles).
