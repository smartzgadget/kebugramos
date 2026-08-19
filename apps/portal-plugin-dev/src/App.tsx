import { type Role } from "@kebugram/permissions";
import { Badge, EmptyState } from "@kebugram/design-system";

const ALLOWED: Role[] = ["developer", "admin"];

export default function PortalPluginDevApp() {
  const role = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { role?: Role } }).__KEBUGRAM_CONFIG__?.role : undefined) ?? "consumer";
  const ok = ALLOWED.includes(role);
  return (
    <section data-testid="portal-plugin-dev" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)" }} aria-label="Plugin Dev Portal">
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Plugin Dev Portal</h2><p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Reuses `mfe-plugin-marketplace` discovery + `plugin-runtime-sdk` sandbox + `partner adapters`. RBAC developer|admin, iframe CSP.</p></div>
      <Badge variant={ok ? "verified" : "neutral"}>{ok ? `access granted · ${role}` : `blocked · ${role}`}</Badge>
      {!ok ? <EmptyState title="Not authorized" description="Plugin Dev requires developer role." /> : <div data-testid="portal-content" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, fontSize: 13 }}>Partner Adapter Orchestrator — same remotes, permission manifest `geo:coarse|pay:intent`</div>}
    </section>
  );
}
