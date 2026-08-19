import { canAccess, type Role } from "@kebugram/permissions";
import { Badge, EmptyState } from "@kebugram/design-system";

const ALLOWED: Role[] = ["business", "admin", "support"];

export default function PortalBusinessApp() {
  const role = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { role?: Role } }).__KEBUGRAM_CONFIG__?.role : undefined) ?? "consumer";
  const ok = ALLOWED.includes(role) || canAccess("/ads", role);

  return (
    <section data-testid="portal-business" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)" }} aria-label="Business Portal">
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Business Portal</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Portal shell variant — reuses `mfe-business-pages` + `mfe-ads-manager|display` + `mfe-analytics` + `mfe-plugin-marketplace`. RBAC via `permissions`.</p>
      </div>
      <Badge variant={ok ? "verified" : "neutral"}>{ok ? `access granted · ${role}` : `blocked · ${role} not in business|admin`}</Badge>
      {!ok ? (
        <EmptyState title="Not authorized" description="Business Portal requires business|admin role — switch via Account Switcher." />
      ) : (
        <div data-testid="portal-content" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Business Pages · Ads Manager · Analytics · Plugin Marketplace</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Same remotes as `apps/shell` via `mfe-manifest.json` — `loadRemote('mfe-business-pages')` etc., no duplicated shell chrome.</div>
          <div style={{ border: "1px dashed var(--color-border)", borderRadius: 8, background: "var(--color-surface)", padding: 12, fontSize: 13, textAlign: "center" }}>Portal composition — RBAC smoke: `canAccess('/ads', role)`</div>
        </div>
      )}
    </section>
  );
}
