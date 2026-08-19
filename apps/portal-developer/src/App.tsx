import { type Role } from "@kebugram/permissions";
import { Badge, EmptyState } from "@kebugram/design-system";

const ALLOWED: Role[] = ["developer", "admin"];

export default function PortalDeveloperApp() {
  const role = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { role?: Role } }).__KEBUGRAM_CONFIG__?.role : undefined) ?? "consumer";
  const ok = ALLOWED.includes(role);
  return (
    <section data-testid="portal-developer" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)" }} aria-label="Developer Portal">
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Developer Portal</h2><p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Reuses `mfe-developer-portal` + `mfe-plugin-marketplace` (docs, plugin runtime, partner adapters). RBAC developer|admin. CSP + permission manifest.</p></div>
      <Badge variant={ok ? "verified" : "neutral"}>{ok ? `access granted · ${role}` : `blocked · ${role}`}</Badge>
      {!ok ? <EmptyState title="Not authorized" description="Developer Portal requires developer role." /> : <div data-testid="portal-content" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, fontSize: 13 }}>Docs · Plugin Marketplace · Partner Adapters — same remotes, `mfe-manifest.json` + `plugin-runtime-sdk` sandbox</div>}
    </section>
  );
}
