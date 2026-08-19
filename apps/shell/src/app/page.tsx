export default function HomePage() {
  return (
    <section style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 8px", letterSpacing: -0.5 }}>
        Welcome to KebuGram
      </h1>
      <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
        Sovereign super-app shell. Select a module from the sidebar — each micro-frontend loads into this slot via Module Federation.
      </p>
      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface-contrast)",
        }}
      >
        <strong>One showcase record per module</strong>
        <p style={{ margin: "6px 0 0", color: "var(--color-text-secondary)", fontSize: 14 }}>
          This empty state proves the shell layout. Real modules replace this content at runtime.
        </p>
      </div>
    </section>
  );
}
