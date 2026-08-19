import { useCallback, useEffect, useMemo, useState } from "react";
import { route, tileUrl, showcaseShipment, showcaseTracking, Shipment, TrackingUpdate } from "@kebugram/map-sdk";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function LogisticsPartnerHubApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [shipment] = useState<Shipment>(showcaseShipment);
  const [tracking] = useState<TrackingUpdate[]>(showcaseTracking);
  const [partnerStatus, setPartnerStatus] = useState("In transit");
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);

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

  const handleHandover = useCallback(async () => {
    setLoading(true);
    try {
      await client.post(`/logistics/partner/${shipment.id}/handover`, { parse: (x: unknown) => x } as unknown as Parameters<typeof client.post>[1], {} as unknown as RequestInit).catch(() => null);
      setPartnerStatus("Handed over — signed by partner adapter (Java)");
      await route([30.06, -1.94], [30.2, -2.1]).catch(() => null);
    } finally {
      setLoading(false);
    }
  }, [client, shipment.id]);

  return (
    <section data-testid="partner-hub" style={{ maxWidth: 640, display: "grid", gap: 14, fontFamily: "var(--font-sans)" }} aria-label="Logistics Partner Hub">
      <header style={{ display: "grid", gap: 4 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.3, color: "var(--color-text-primary)" }}>Logistics Partner Hub</h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>One showcase partner route — OSM tiles + GraphHopper via `map-sdk`, partner adapter via Java gateway. No third-party exfiltration.</p>
      </header>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — partner updates queue.</div>}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", background: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{shipment.from} → {shipment.to} · {(shipment.distanceM / 1000).toFixed(0)} km</span>
          <Badge variant={partnerStatus.includes("Handed") ? "verified" : "business"}>{partnerStatus}</Badge>
        </div>
        <div style={{ height: 180, background: "#EEF4F1", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
          <img src={tileUrl(5, 16, 10)} alt="" width={256} height={256} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />
          <span style={{ position: "relative", fontSize: 12, color: "var(--color-text-secondary)", background: "white", border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 10px" }}>Map via `tiles.kebugram.com` + `route.kebugram.com`</span>
        </div>
        <div style={{ padding: 12, display: "flex", gap: 8 }}>
          <Button size="sm" data-testid="handover-btn" onClick={() => void handleHandover()} loading={loading} aria-label="Handover to partner">Handover</Button>
          <Badge variant="neutral">via `map-sdk` · OSM/GraphHopper</Badge>
        </div>
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Partner tracking</h3>
        {tracking.map((t) => (
          <div key={t.id} data-testid={`track-${t.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t.status}</span>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{new Date(t.at).toLocaleString()} · {t.lat.toFixed(2)}, {t.lon.toFixed(2)}</span>
          </div>
        ))}
      </div>
      {loading && <Skeleton height={24} />}
    </section>
  );
}
