export default function DeveloperPortalApp() {
  return (
    <section style={{ maxWidth: 720, display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>Developer Portal</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>One showcase API key — docs, plugin runtime, partner adapters.</p>
      </header>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", background: "#F7F9F8" }}>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>kebu_live_…9f2a</span>
          <span style={{ fontSize: 11, border: "1px solid var(--color-border)", borderRadius: 999, padding: "3px 8px", background: "#EEF4F1" }}>Active</span>
        </div>
        <div style={{ padding: 14, display: "grid", gap: 8, fontSize: 13 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ border: "1px solid var(--color-border)", borderRadius: 999, padding: "4px 8px", fontSize: 11 }}>KebuPay • ledger</span>
            <span style={{ border: "1px solid var(--color-border)", borderRadius: 999, padding: "4px 8px", fontSize: 11 }}>Maps • OSM</span>
            <span style={{ border: "1px solid var(--color-border)", borderRadius: 999, padding: "4px 8px", fontSize: 11 }}>Realtime • Go</span>
          </div>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>Adapter docs and sandbox — no third-party GitHub code; all contracts via Zod.</p>
        </div>
      </div>
    </section>
  );
}
