# KebuGram — CI/CD & Release Governance
> **Location:** `kebugramos/docs/07-CICD_RELEASE_GOVERNANCE.md`

## 1. Pipelines (`.github/workflows/`)
- `ci.yml` (on PR): install → lint → typecheck → test → build (turbo) → bundle-budget → axe + i18n check → Playwright smoke (MSW) → Chromatic (if design touched). Blocks merge.
- `release.yml` (on `develop`/`main`): build → push artifacts → publish `mfe-manifest.json` → canary deploy → smoke against deployed env → promote or rollback.
- `nightly.yml`: full Playwright vs `staging`, Detox vs emulator, CodeQL, `pnpm audit`.

## 2. Manifest & Canary
```json
{
  "mfes": {
    "mfe-kebuchat": { "version": "1.4.0", "url": "https://cdn.kebugram.com/mfe-kebuchat/1.4.0/remoteEntry.js", "integrity": "sha384-..." },
    "mfe-kebupay": { "version": "2.1.0", "url": "...", "disabled": false }
  },
  "rollout": { "mfe-kebuchat": { "percent": 25, "regions": ["KE", "UG"] } }
}
```
- Host fetches manifest every 60s (SWR) + on hard nav. Pin previous version in one edit for instant rollback (<60s).
- Canary: 5% (10m bake) → 25% (30m) → 100% gated by SLO (error rate <1%, p95 <300ms).

## 3. Environments
- `local` (MSW) → `dev` (auto-deploy per PR) → `staging` (promote on `develop` green) → `prod` (promote on `main` + manifest canary).
- Secrets via vault injected as runtime `__KEBUGRAM_CONFIG__`; never baked at build.

## 4. Versioning
- **Changesets** for semver; `pnpm changeset` in PR; `pnpm changeset version` + `publish` in release pipeline.
- Host and remotes version independently; shared packages are versioned together.

## 5. Rollback Drill
- Once per Phase (Phase 8 mandatory): intentionally canary a broken remote → verify 60s pin-rollback → SLO recovers → postmortem in `docs/retros/`.
