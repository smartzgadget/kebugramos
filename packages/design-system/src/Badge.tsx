export function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "business" | "verified" }) {
  const bg = variant === "business" ? "#E6F4EF" : variant === "verified" ? "#0B3A2E" : "var(--color-surface)";
  const color = variant === "verified" ? "white" : variant === "business" ? "#0B3A2E" : "var(--color-text-secondary)";
  return <span style={{ background: bg, color, border: "1px solid var(--color-border)", borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{children}</span>;
}
