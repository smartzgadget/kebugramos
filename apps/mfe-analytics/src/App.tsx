import { useCallback, useEffect, useMemo, useState } from "react";
import { showcaseDashboard, Dashboard, DashboardSchema, emitMetric } from "@kebugram/analytics-sdk";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }).__KEBUGRAM_CONFIG__?.apiBase : undefined;
  return { apiBase: w ?? "/api" };
}

export default function AnalyticsApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [dashboard, setDashboard] = useState<Dashboard>(showcaseDashboard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await client.get("/analytics/dashboard", DashboardSchema).catch(() => showcaseDashboard);
      setDashboard(d);
      setAnnounce("Dashboard updated");
      emitMetric("analytics.fetch", 1, { source: "mfe-analytics" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analytics unavailable");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <section data-testid="analytics" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="Analytics">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Analytics</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Consumer + business dashboards — Python AI + Java core, Otel → Grafana. One showcase metric per side.</p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge variant="neutral">Otel</Badge>
        <Badge variant="neutral">Grafana</Badge>
        {dashboard.isShowcase && <Badge variant="business">Showcase</Badge>}
        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{new Date(dashboard.at).toLocaleString()}</span>
      </div>
      {loading && <div data-testid="loading" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><Skeleton height={96} /><Skeleton height={96} /></div>}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchDashboard()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Consumer</h3>
          {dashboard.consumer.length === 0 ? <EmptyState title="No consumer metrics" description="One showcase metric is seeded." /> : dashboard.consumer.map((m) => (
            <div key={m.name} data-testid={`consumer-${m.name}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{m.unit}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 18, fontWeight: 800 }}>{m.value.toLocaleString()}</div><Badge variant={m.trend === "up" ? "verified" : m.trend === "down" ? "neutral" : "business"}>{m.trend ?? "flat"}</Badge></div>
            </div>
          ))}
        </div>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Business</h3>
          {dashboard.business.length === 0 ? <EmptyState title="No business metrics" description="One showcase metric is seeded." /> : dashboard.business.map((m) => (
            <div key={m.name} data-testid={`business-${m.name}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{m.unit}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 18, fontWeight: 800 }}>{m.unit === "RWF" ? `RWF ${(m.value / 1).toLocaleString()}` : m.value.toLocaleString()}</div><Badge variant={m.trend === "up" ? "verified" : "neutral"}>{m.trend ?? "flat"}</Badge></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" data-testid="refresh-btn" onClick={() => void fetchDashboard()} loading={loading} aria-label="Refresh">Refresh — Otel</Button>
        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", alignSelf: "center" }}>Emits `analytics.fetch` via `__KEBUGRAM_OTEL__` → `python-ai/analytics`</span>
      </div>
    </section>
  );
}
