export default function BrandProtectionApp() {
  return (
    <section style={{ maxWidth: 640, display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>Brand Protection</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>One showcase takedown — registry + partner adapter verification.</p>
      </header>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Case #BP-042 — KebuCraft mark</span>
          <span style={{ fontSize: 11, fontWeight: 600, border: "1px solid #E7C200", background: "#FFF9DB", borderRadius: 999, padding: "3px 8px" }}>Under review</span>
        </div>
        <div style={{ padding: 14, display: "grid", gap: 8, fontSize: 13, color: "var(--color-text-secondary)" }}>
          <div>Reporter: verified business • Evidence: 2 listings • Adapter: Java registry</div>
        </div>
      </div>
    </section>
  );
}
