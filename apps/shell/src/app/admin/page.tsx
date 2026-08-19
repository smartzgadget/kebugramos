import { EmptyState } from "@kebugram/design-system";

function KebabMenu() {
  return (
    <button aria-label="Open menu" style={{ border: "1px solid var(--color-border)", background: "white", borderRadius: 8, padding: "4px 8px", lineHeight: 1 }}>⋮</button>
  );
}

export default function AdminPage() {
  return (
    <section style={{ maxWidth: 720, display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>Admin & Compliance</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>Moderation queue — RBAC admin/compliance, audit log.</p>
      </header>

      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ border: "1px solid var(--color-sovereign-900)", background: "var(--color-sovereign-900)", color: "white", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>Review</button>
        <button style={{ border: "1px solid var(--color-border)", background: "white", borderRadius: 999, padding: "6px 12px", fontSize: 12 }}>Approved</button>
        <button style={{ border: "1px solid var(--color-border)", background: "white", borderRadius: 999, padding: "6px 12px", fontSize: 12 }}>Rejected</button>
      </div>

      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F7F9F8" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Queue • 3 pending</span>
          <span style={{ fontSize: 11, border: "1px solid #D9A700", background: "#FFF4CC", borderRadius: 999, padding: "3px 8px", fontWeight: 600 }}>Review</span>
        </div>
        <div style={{ display: "grid", gap: 0 }}>
          <div style={{ borderBottom: "1px solid #F0F2F1", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Report #R-118 — community post</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>RBAC: compliance • 2h ago</div>
            </div>
            <KebabMenu />
          </div>
          <div style={{ borderBottom: "1px solid #F0F2F1", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Report #R-119 — marketplace listing</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>RBAC: admin • 5h ago</div>
            </div>
            <KebabMenu />
          </div>
          <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Report #R-120 — tube comment</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>RBAC: compliance • 1d ago</div>
            </div>
            <KebabMenu />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Empty state</h4>
        <EmptyState title="No pending reports" description="All caught up — new reports will appear here." />
        <button style={{ justifySelf: "start", background: "var(--color-sovereign-900)", color: "white", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600 }}>Create report</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Error state</h4>
        <EmptyState title="Failed to load queue" description="We couldn't fetch the moderation queue. Check your connection and try again." />
        <button style={{ justifySelf: "start", background: "white", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600 }}>Retry</button>
      </div>
    </section>
  );
}
