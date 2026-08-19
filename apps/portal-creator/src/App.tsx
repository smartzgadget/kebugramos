import { canAccess, type Role } from "@kebugram/permissions";
import { Badge, EmptyState } from "@kebugram/design-system";

const ALLOWED: Role[] = ["creator", "admin"];

export default function PortalCreatorApp() {
  const role = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { role?: Role } }).__KEBUGRAM_CONFIG__?.role : undefined) ?? "consumer";
  const ok = ALLOWED.includes(role) || canAccess("/tube", role);
  return (
    <section data-testid="portal-creator" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)" }} aria-label="Creator Portal">
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Creator Portal</h2><p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Reuses `mfe-kebutube` upload + `mfe-analytics` + `mfe-consumer-sponsorship`. RBAC creator|admin.</p></div>
      <Badge variant={ok ? "verified" : "neutral"}>{ok ? `access granted · ${role}` : `blocked · ${role}`}</Badge>
      {!ok ? <EmptyState title="Not authorized" description="Creator Portal requires creator role." /> : <div data-testid="portal-content" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, fontSize: 13 }}>KebuTube Upload · Analytics · Sponsorship — same remotes</div>}
    </section>
  );
}
