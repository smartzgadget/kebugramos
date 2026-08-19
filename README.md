# KebuGram Project — Docs Index
> **Folder:** `kebugramos/` | **Created:** 2026

## Docs
| Doc | Purpose | When to read |
|---|---|---|
| `docs/00-TECHNICAL_DEVELOPMENT_PLAN.md` | Full technical blueprint: stack, monorepo, MF contract, backend map, envs, Done definition | Start here |
| `docs/01-RULES_AND_GOVERNANCE.md` | Enforced governance: branches, commits, CI gates, design invariants, MF rules, security, approval protocol | Before any code |
| `docs/02-PHASES_AND_TASKS_PLAN.md` | **Approval-gated execution plan** — 9 phases, tasks, validation, approval log (Phase + per-Task) | Execution order |
| `docs/03-ARCHITECTURE_BLUEPRINT.md` | Monorepo build graph, Host↔Remote contract, state ownership, API client, mobile bridge, runtime config | Architecture deep dive |
| `docs/04-DESIGN_SYSTEM_SPEC.md` | Tokens, primitives, shell invariants, theming/i18n, visual regression | Design & FE work |
| `docs/05-SECURITY_GOVERNANCE.md` | Threat model, auth, KebuPay, plugin sandbox, privacy, supply chain, incident | Security per Task |
| `docs/06-TESTING_QA_STRATEGY.md` | Pyramid, tooling (Vitest/RTL/Playwright/Chromatic/Detox), MSW, a11y, budgets | QA per Task |
| `docs/07-CICD_RELEASE_GOVERNANCE.md` | Pipelines, manifest canary, envs, Changesets, rollback drill | Release every Task |
| `docs/08-PLUGIN_RUNTIME_SPEC.md` | Marketplace + sandboxed runtime, permission manifest, partner adapters | Plugin work |
| `docs/09-STATE_API_DATA_GOVERNANCE.md` | Contract-first (Zod→OpenAPI), api-client, Query/Zustand, realtime, offline | Data layer |
| `docs/10-SESSION_FOLLOWUP_LOG.md` | **Session follow-up log — updated every session** (append-only, dashboard, blockers, Next Step) — **read first at session start** | Start of every session |
| `docs/11-CODING_ACCURACY_WORKFLOW.md` | **Senior accuracy rule & workflow (27y) — no third-party GitHub code, 7-step Task flow, previous-file review, taste, PR template** — mandatory before coding | Before every Task |

## Approval Protocol (Summary)
- **Phase gate:** `Phase N — Request Approval to Start → APPROVED` before any Task in that Phase.
- **Task gate:** `Task N.M — Request Approval to Start → Build (prod) → Demo + Evidence → Approval to Proceed` before next Task.
- Log approvals in `02-PHASES_AND_TASKS_PLAN.md §9`.

## Session Ritual (Senior Workflow — Must Follow)
1. Read `docs/10-SESSION_FOLLOWUP_LOG.md` (last 2 entries + dashboard)
2. Read `docs/11-CODING_ACCURACY_WORKFLOW.md` §1–§5
3. Read `docs/02-PHASES_AND_TASKS_PLAN.md` current Task + inventory previous files
4. Then code — production-only, token-first, Zod-first, taste-checked, no third-party GitHub code

## Next Step
**Phase 0–3 done, Phases 4–8 scaffolded (24 remotes). Awaiting your `Approve` for next Task.** Each Task is demoed and requires approval before the next (see `10-SESSION_FOLLOWUP_LOG.md` dashboard).

## Structure (will be created on Phase 0)
```
kebugramos/
├── apps/ (shell + MFEs + mobile)
├── packages/ (design-system, tokens, api-client, sdks)
├── docs/ (this folder)
├── tooling/
└── .github/workflows/
```
