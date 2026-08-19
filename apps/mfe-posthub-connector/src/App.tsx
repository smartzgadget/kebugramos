import { useCallback, useEffect, useMemo, useState } from "react";
import { showcaseHealth, ConnectorHealth, ConnectorHealthSchema } from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function PostHubConnectorApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [health, setHealth] = useState<ConnectorHealth>(showcaseHealth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const h = await client.get(`/posthub/${health.connectorId}/health`, ConnectorHealthSchema).catch(() => showcaseHealth);
      setHealth(h);
      setAnnounce(`Status ${h.status}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Health unavailable");
    } finally {
      setLoading(false);
    }
  }, [client, health.connectorId]);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  const handlePing = useCallback(async () => {
    setLoading(true);
    try {
      await client.post(`/posthub/${health.connectorId}/ping`, ConnectorHealthSchema, {} as unknown as RequestInit).catch(() => null);
      setAnnounce("Ping sent — webhook queued");
      await fetchHealth();
    } finally {
      setLoading(false);
    }
  }, [client, health.connectorId, fetchHealth]);

  return (
    <section data-testid="posthub" style={{ maxWidth: 640, display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="Post Hub Connector">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Post Hub Connector</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Connector health + webhook status via Java Post Hub. One showcase connector.</p>
      </div>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — showing cached health.</div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Badge variant={health.status === "connected" ? "verified" : health.status === "degraded" ? "business" : "neutral"}>{health.status}</Badge>
        <Badge variant={health.webhook.status === "ok" ? "verified" : "neutral"}>webhook {health.webhook.status}</Badge>
        {health.isShowcase && <Badge variant="business">Showcase</Badge>}
      </div>
      {loading && <Skeleton height={80} />}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchHealth()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 16, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Status: {health.status}</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Webhook health: {health.webhook.status.toUpperCase()} {health.webhook.lastDeliveryAt ? `· last ${new Date(health.webhook.lastDeliveryAt).toLocaleString()}` : ""}</div>
        {health.webhook.lastError && <div style={{ fontSize: 12, color: "#B91C1C" }}>{health.webhook.lastError}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Button size="sm" data-testid="ping-btn" onClick={() => void handlePing()} loading={loading} aria-label="Ping webhook">Ping webhook</Button>
          <Button variant="ghost" size="sm" data-testid="refresh-btn" onClick={() => void fetchHealth()} aria-label="Refresh health">Refresh</Button>
        </div>
      </div>
    </section>
  );
}
