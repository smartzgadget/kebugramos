# KebuGram — Plugin Runtime & Marketplace Spec
> **Location:** `kebugramos/docs/08-PLUGIN_RUNTIME_SPEC.md`

## 1. Purpose
Enable third-party plugins and partner adapters without compromising shell/MFE isolation or KebuPay sovereignty.

## 2. Architecture
- **Marketplace (`mfe-plugin-marketplace`):** discovery, install, update, permissions, billing (via KebuPay), reviews. Backed by Java plugin registry.
- **Runtime (`plugin-runtime-sdk` + host PluginGuard):**
  - Plugins load as sandboxed iframe (`sandbox="allow-scripts allow-same-origin"`) or MF remote if `trusted: true` (Kebu-signed only).
  - Host exposes `KebuGramPluginAPI` via `postMessage` bridge — Zod-validated (`PluginRequestSchema`).
  - Allowed APIs: `getAuthToken` (scoped), `getGeo` (coarse), `pay` (via KebuPay intent), `notify`, `storage` (namespaced), `openBrowser`.
  - Denied: direct DOM, cookie access, `fetch` to arbitrary origins (allowlist: `*.kebugram.com` + declared `allowedOrigins`).

## 3. Permission Manifest (declared at publish)
```json
{
  "name": "kebu-loyalty",
  "version": "0.3.0",
  "permissions": ["geo:coarse", "pay:intent", "storage"],
  "allowedOrigins": ["https://api.partner.com"],
  "csp": "default-src 'self' https://api.partner.com"
}
```
- Install prompts user with permission sheet; consent revocable in Settings → Plugins.

## 4. Lifecycle
Publish → Review (security + brand) → Sign → Stage → Canary (5%) → Prod. Untrusted plugins never get `trusted` flag.

## 5. Partner Adapters
- Adapter layer translates partner APIs (logistics, pay, geo) behind `@kebugram/partner-sdk` — frontends never call partner directly.
- Adapter versioned independently; host feature-flag selects adapter version per region.

## 6. Validation
- E2E: install plugin → grant perms → call `pay` intent → KebuPay flow → verify ledger → revoke perm → call blocked.
- Security: attempt sandbox escape → blocked + Sentry alert.
