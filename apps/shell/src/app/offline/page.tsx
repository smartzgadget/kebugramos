export default function OfflinePage() {
  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "var(--font-sans)" }}>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 20, maxWidth: 520, display: "grid", gap: 8, textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0B3A2E" }}>You are offline</h1>
        <p style={{ margin: 0, fontSize: 13, color: "#5B6B65" }}>KebuGram shell is cached. MFE manifests and recent API responses are available. Reconnect to sync — MMKV on mobile, Cache API on web.</p>
        <p style={{ margin: 0, fontSize: 12, color: "#5B6B65" }}>Deep links kebugram:// still route to cached chat · tube · market · pay.</p>
      </div>
    </main>
  );
}
