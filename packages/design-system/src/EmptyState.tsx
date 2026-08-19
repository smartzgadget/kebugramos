export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ border: "1px dashed var(--color-border)", borderRadius: 12, padding: 24, textAlign: "center", background: "var(--color-surface-contrast)" }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      {description && <div style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 6 }}>{description}</div>}
    </div>
  );
}
