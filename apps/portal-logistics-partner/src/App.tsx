import { type Role } from "@kebugram/permissions";
import { Badge, EmptyState } from "@kebugram/design-system";

const ALLOWED: Role[] = ["logistics", "agent", "business", "admin"];

export default function PortalLogisticsPartnerApp() {
  const role = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { role?: Role } }).__KEBUGRAM_CONFIG__?.role : undefined) ?? "consumer";
  const ok = ALLOWED.includes(role);
  return (
    <section data-testid="portal-logistics-partner" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)" }} aria-label="Logistics Partner Portal">
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Logistics Partner Portal</h2><p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Reuses `mfe-logistics-partner-hub` + `mfe-logistics` OSM/GraphHopper + `map-sdk`. Partner adapter via Java `Partner Adapter Orchestrator`.</p></div>
      <Badge variant={ok ? "verified" : "neutral"}>{ok ? `access granted · ${role}` : `blocked · ${role}`}</Badge>
      {!ok ? <EmptyState title="Not authorized" description="Logistics Partner requires logistics|agent role." /> : <div data-testid="portal-content" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, fontSize: 13 }}>Route calc · Tracking map — same remotes, partner adapter test: `POST /logistics/partner/:id/handover`</div>}
    </section>
  );
}
