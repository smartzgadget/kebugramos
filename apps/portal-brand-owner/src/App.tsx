import { type Role } from "@kebugram/permissions";
import { Badge, EmptyState } from "@kebugram/design-system";

const ALLOWED: Role[] = ["brand_owner", "business", "admin", "compliance"];

export default function PortalBrandOwnerApp() {
  const role = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { role?: Role } }).__KEBUGRAM_CONFIG__?.role : undefined) ?? "consumer";
  const ok = ALLOWED.includes(role);
  return (
    <section data-testid="portal-brand-owner" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)" }} aria-label="Brand Owner Portal">
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Brand Owner Portal</h2><p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Reuses `mfe-brand-protection` (Case #BP-042) + `mfe-sponsorship` + `content-protection`. RBAC brand_owner|business|compliance|admin.</p></div>
      <Badge variant={ok ? "verified" : "neutral"}>{ok ? `access granted · ${role}` : `blocked · ${role}`}</Badge>
      {!ok ? <EmptyState title="Not authorized" description="Brand Owner requires brand_owner role." /> : <div data-testid="portal-content" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, fontSize: 13 }}>Brand Protection · Content Rights — same remotes, partner adapter: `POST /brand/protection/report`</div>}
    </section>
  );
}
