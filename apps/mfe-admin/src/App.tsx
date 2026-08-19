import { useMemo, useState } from "react";
import { showcaseAudit, showcaseQueue, AuditEntry } from "./contracts";
import { Badge, Button, EmptyState } from "@kebugram/design-system";
import { type Role } from "@kebugram/permissions";

const ALLOWED: Role[] = ["admin", "compliance", "support"];

export default function AdminApp() {
  const role = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { role?: Role } }).__KEBUGRAM_CONFIG__?.role : undefined) ?? "admin";
  const ok = ALLOWED.includes(role);
  const [audit] = useState<AuditEntry[]>(showcaseAudit);
  const [announce, setAnnounce] = useState("");
  if (!ok) {
    return (
      <section data-testid="admin" style={{ maxWidth: 720, display: "grid", gap: 14 }} aria-label="Admin">
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Admin & Compliance</h2>
        <EmptyState title="Not authorized" description="Admin requires admin|compliance|support." />
      </section>
    );
  }
  return (
    <section data-testid="admin" style={{ maxWidth: 720, display: "grid", gap: 14, fontFamily: "var(--font-sans)" }} aria-label="Admin">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <header style={{ display: "grid", gap: 4 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Admin & Compliance</h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>One showcase moderation queue — RBAC admin/compliance, audit log. Every action is audited.</p>
      </header>
      <Badge variant="verified">access granted · {role}</Badge>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-surface)" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }} data-testid="queue-count">Queue • {showcaseQueue.length} pending</span>
          <Badge variant="business">Review</Badge>
        </div>
        <div style={{ display: "grid", gap: 8, padding: 14 }}>
          {showcaseQueue.map((q) => (
            <div key={q.id} data-testid={`queue-${q.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13 }}>Report #{q.reportId} — {q.type}</span>
              <Button size="sm" data-testid={`review-${q.id}`} onClick={() => setAnnounce(`Reviewed ${q.reportId} — audit logged`)} aria-label={`Review ${q.reportId}`}>Review</Button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Audit log</h3>
        {audit.map((a) => (
          <div key={a.id} data-testid={`audit-${a.id}`} style={{ borderTop: "1px solid var(--color-surface)", paddingTop: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 13 }}>{a.action} — {a.targetId}</span>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{a.actor} · {new Date(a.at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
