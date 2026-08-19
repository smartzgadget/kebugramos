# KebuGram — Coding Accuracy Rule & Workflow
> **Location:** `kebugramos/docs/11-CODING_ACCURACY_WORKFLOW.md` | **Authority:** Senior Frontend Architect / Designer / Tech Lead — 27 Years Enterprise (Telecom, Banking, Super-Apps, Geo/Logistics) | **Constraint:** Zero third-party GitHub code — all code is authored for KebuGram, reviewed against its own codebase. | **Enforcement:** Mandatory before every Task. CI blocks on violation.

## 0. Prime Directive

> **Read before you code. Prove before you merge. Own before you ship.**

You are building a sovereign super-app that will handle chat, money, location, and identity at national scale. A single copy-paste from an external GitHub repo can import a license risk, a CVE, or a UX inconsistency that costs months. **No external GitHub code is ever pasted into KebuGram.** Every line is traceable to a KebuGram decision, a KebuGram token, or a KebuGram contract.

---

## 1. Session Start Ritual (15 Minutes, Non-Negotiable)

Perform in order. Do not skip. Do not parallelize. Tick the box in the follow-up log.

1.  **Read `docs/10-SESSION_FOLLOWUP_LOG.md` — the last 2 entries + dashboard.** Understand: what was covered, what remains, next approved Step, blockers (sandbox, env, backend not yet provisioned). If the last entry says `BLOCKED — pnpm build sandbox`, you are still blocked — do not claim green.
2.  **Read `docs/02-PHASES_AND_TASKS_PLAN.md` — the current Phase and the exact Task.** Copy the Task row verbatim into your working notes: *Deliverable + Validation*. That is your contract for the session.
3.  **Read `docs/01-RULES_AND_GOVERNANCE.md` + `docs/11-CODING_ACCURACY_WORKFLOW.md` (this file) §2–§8.** Refresh gates.
4.  **Read `docs/00-TECHNICAL_DEVELOPMENT_PLAN.md` + relevant supplement** (`03-ARCHITECTURE_BLUEPRINT.md`, `04-DESIGN_SYSTEM_SPEC.md`, `05-SECURITY_GOVERNANCE.md`, etc.) for the domain you are touching.
5.  **Inventory previous code files — every file you will touch or be affected by:**

    *   List them: `apps/shell/src/app/layout.tsx`, `packages/tokens/tokens.json`, `packages/design-system/src/*`, `apps/<mfe>/src/contracts.ts`, `apps/shell/public/mfe-manifest.json`, `packages/<sdk>/src/index.ts` — exactly the files for the current Task plus their direct dependents.
    *   Open each file and read it **in full** (use `read_file` offset/limit, not assumptions). Note: tokens in use, props exported, Zod schemas, MF manifest entries, shell invariants (280/72px, 64px), taste violations (emoji/purple/glass) already present.
    *   Write a 5-line handoff note: *What exists → What this Task adds → What it must not break*. Keep it in your scratch pad, not in code comments.

**Exit criteria for ritual:** You can describe, without looking, the last session's Next Step, the current Task's validation, and the 3 files most at risk of regression. If you cannot, re-read.

---

## 2. Accuracy Rule — No Third-Party GitHub Code

### 2.1 Prohibited
- Copy-pasting any file, snippet, or config from a public GitHub repo (including `nextjs/examples`, `shadcn/ui`, `vercel/templates`, StackOverflow GitHub gists) into `kebugramos/` without a **full rewrite** against KebuGram tokens, contracts, and MF isolation.
- Using `npx create-*`, `npm create vite@latest`, or any generator that injects external boilerplate beyond `tooling/scripts/gen-mfe.ts` (the only sanctioned generator).
- Importing a component library that is not ` @kebugram/design-system` or a vetted `peerDependency` listed in `00-TECHNICAL_DEVELOPMENT_PLAN.md`.

### 2.2 Allowed
- Reading external docs for *knowledge* (Next.js 14, TanStack Query, Zustand, Zod) and then **authoring** the KebuGram implementation from scratch using KebuGram tokens, Zod schemas, and MF patterns.
- Using first-party package APIs (`next/font`, `zod`, `zustand`, `react`) — not their example apps.

### 2.3 Enforcement
- CI job `no-external-code` (future): `git diff --name-only | xargs grep -l "github.com"` + license scan. Today: manual review checklist in PR template §8.
- Violation → immediate revert, Phase paused, retro in `docs/retros/`.

---

## 3. Contract-First, Token-First, Shell-First

1.  **Zod before JSX.** For every new domain, author `src/contracts.ts` first (e.g., `ChatRowSchema`, `ProductSchema`, `PayIntentSchema`). Run mental parse: `schema.safeParse(showcase)` must pass with the one showcase record. No Zod = no UI.
2.  **Tokens before Tailwind.** No hex in components. Use `var(--color-sovereign-900)` or Tailwind `sovereign-900` mapped to CSS var. If a color is missing, add it to `packages/tokens/tokens.json` → `globals.css` → `tailwind.config.js` in that order. 1px/1 token Figma parity.
3.  **Shell before MFE.** Verify shell invariants are not duplicated: `SovereignSidebar` + `TopHeader` exist only in `apps/shell`; MFEs render inside `#mfe-slot`. If you find duplicate chrome in an MFE, delete it.

---

## 4. The 7-Step Task Workflow (Applied Every Task)

| Step | Action | Evidence You Produce |
|------|--------|----------------------|
| 1 | **Scope & Inventory** — list files to read/touch (see §1.5) | Checklist in Task evidence doc §1 |
| 2 | **Contract Draft** — `contracts.ts` Zod + inferred type + one showcase record (`isShowcase: true` excluded from analytics) | Diff of `contracts.ts` |
| 3 | **Author Code — Production Only** — typed, token-driven, loading/empty/error/offline states, `aria-*`, `data-testid`, no taste violations (see §6) | Diff of `App.tsx`/`Component.tsx` |
| 4 | **Self-Review Against Previous Files** — re-open every file from Step 1, confirm: no duplicate shell, no raw `fetch`/`new WebSocket` (must use `api-client`/`realtime-sdk`), no hardcoded secret, no external code, MF manifest entry correct | Review notes in evidence doc §4 |
| 5 | **Local Verification (even when sandbox blocked)** — run `pnpm install`, `lint`, `typecheck`, `test`, `build` locally if possible; if sandbox `proc/self/exe` blocked, mark `BLOCKED` with reason, do not claim pass | Evidence doc §Verification |
| 6 | **Gate Check** — CI gates: lint/typecheck/test≥85%/80%/bundle budget 180/120kB gz/axe 0/i18n no raw strings | Evidence doc §Gate |
| 7 | **Handoff** — update `10-SESSION_FOLLOWUP_LOG.md` (new entry + dashboard), `APPROVAL_LOG.md`, `mfe-manifest.json` if remote added, `TASK_*_EVIDENCE.md` | Commit set (untracked until user asks to commit per git skill) |

---

## 5. Review Checklist — What to Verify in Previous Files

Before marking a Task done, answer Yes to each:

- [ ] I re-read `10-SESSION_FOLLOWUP_LOG.md` last entry + dashboard and know the Next Step.
- [ ] I re-read the current Task row in `02-PHASES_AND_TASKS_PLAN.md` and my work matches its Deliverable+Validation verbatim.
- [ ] I re-read every file I listed in Step 1 and confirmed no regression (shell width 280/72, header 64, token usage, Zod schemas, MF manifest URL).
- [ ] No third-party GitHub code: no pasted snippet, no external component, no external template. All code authored for KebuGram.
- [ ] No secret in bundle: only `NEXT_PUBLIC_*` allowlist + runtime `__KEBUGRAM_CONFIG__`.
- [ ] No raw `fetch` outside `api-client`, no raw `new WebSocket` outside `realtime-sdk`, no `axios`.
- [ ] Amounts in `priceMinor`/`amountMinor` int, `Idempotency-Key` on KebuPay/market mutations.
- [ ] One showcase record only, flagged `isShowcase` where applicable, excluded from ads/analytics.
- [ ] Taste: no purple/indigo/violet or gradient hero, no `bg-clip-text`, no cream `#faf8f4` page, no aurora/glow, no Inter-only, no gray-400/500 body, no repeated eyebrow→headline→3-card, no 8-word 48px empty headline, no bento-for-everything, no uniform `rounded-2xl`, no glass+blur on every surface, no `hover:scale-105`, no emoji feature icons, no left-border accent card, no fade-up on everything, no motion ignoring `prefers-reduced-motion`.
- [ ] `TASK_*_EVIDENCE.md` and `10-SESSION_FOLLOWUP_LOG.md` updated (append-only, no overwrite of past entries).

---

## 6. Senior Design & Code Standards (27 Years)

- **Hierarchy over decoration:** Every screen has one 20px/700 heading, one 13px secondary descriptor, then content. Never an 8-word 48px empty headline.
- **Constraints breed quality:** Sovereign green `#0B3A2E` / `#115A48` + accent `#00C389` + surface `#F7F9F8` + 12px/8px radii + IBM Plex Sans — that's the palette. No new color without a token PR.
- **Isolation is the architecture:** MFEs own their Zustand slice + QueryClient scope + Zod boundary. Host owns routing/auth/consent/geo. Cross-MFE import = immediate revert.
- **Error is a state, not an afterthought:** Every route ships loading skeleton + empty + error + offline. Empty uses `EmptyState` from design-system, not ad-hoc text.
- **A11y is not optional:** `aria-current="page"` on active nav, `aria-label` on search, `role="dialog"` on consent, keyboard nav for shell, axe 0 violations.
- **Production is the only mode:** No `TODO: mock`, no `lorem`, no template filler. One real showcase record proves layout; everything else is empty until backend is provisioned.

---

## 7. When Blocked

- **Sandbox `proc/self/exe`:** Mark verification `BLOCKED — sandbox enforcement unavailable`, note in follow-up log §Verification + §Blockers, and request local verification (`pnpm install && pnpm build` in `kebugramos/`) before Phase promotion. Do not mark PASS.
- **Backend not provisioned (Go/Python/Java):** Implement against Zod contract + MSW handler with one showcase record; wire `api-client`/`realtime-sdk`/`map-sdk` to real base URL via `__KEBUGRAM_CONFIG__` so swap is config-only.
- **Conflict with approval gate:** `02-PHASES_AND_TASKS_PLAN.md` §10 — no Phase/Task starts without `APPROVED`. If you finished Task N.M, request `Approve Task N.M+1` before writing code. If you finished a Phase, request `Approve Phase N+1`.

---

## 8. PR Template (use for every Task PR)

```markdown
Task: Phase N Task N.M — Title
Follow-up: docs/10-SESSION_FOLLOWUP_LOG.md Entry YYYY-MM-DD — SXX
Contracts: src/contracts.ts (Zod schemas + one showcase)
Files reviewed: (list from §1.5)
No external GitHub code: □ confirmed (authored for KebuGram)
Shell invariants intact: □ sidebar 280/72, header 64, MFE slot
Taste: □ no violations (§6)
Verification: lint □ / typecheck □ / test □ / build □ / axe □ / i18n □ (or BLOCKED — reason)
Manifest: □ updated / □ n/a
Evidence: docs/TASK_N.M_EVIDENCE.md
Next: Phase N Task N.M+1 — Awaiting APPROVAL
```

---

## 9. Ownership

This workflow is owned by the **Tech Lead (you + me co-own)** and is versioned. Amend only via PR with owner approval. The follow-up log is the heartbeat — if it is not updated, the session did not happen.

*Read this workflow at session start. Live it for every Task. The next person (or you next week) must be able to continue from the follow-up log alone.*
