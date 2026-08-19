export function Skeleton({ width = "100%", height = 16 }: { width?: string | number; height?: string | number }) {
  return <div style={{ width, height, background: "#EDEEF0", borderRadius: 8, animation: "pulse 1.2s infinite" }} />;
}
export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ border: "1px dashed var(--color-border)", borderRadius: 12, padding: 24, textAlign: "center", background: "var(--color-surface-contrast)" }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      {description && <div style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 6 }}>{description}</div>}
    </div>
  );
}
