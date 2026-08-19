import { useCallback, useEffect, useMemo, useState } from "react";
import { route, tileUrl, showcaseShipment, showcaseTracking, Shipment, TrackingUpdate, RouteResponseSchema } from "@kebugram/map-sdk";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function LogisticsApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [shipment] = useState<Shipment>(showcaseShipment);
  const [tracking, setTracking] = useState<TrackingUpdate[]>(showcaseTracking);
  const [routeInfo, setRouteInfo] = useState<{ distanceM: number; durationS: number; provider: string } | null>({ distanceM: 42000, durationS: 5400, provider: "cached" });
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

  const calcRoute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await route([30.06, -1.94], [30.2, -2.1]);
      RouteResponseSchema.parse(r);
      setRouteInfo({ distanceM: r.distanceM, durationS: r.durationS, provider: r.provider });
      setAnnounce(`Route ${r.distanceM}m via ${r.provider}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Routing failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTracking = useCallback(async () => {
    try {
      const r = await client.get(`/logistics/shipments/${shipment.id}/tracking`, { parse: (x: unknown) => x } as unknown as Parameters<typeof client.get>[1]).catch(() => ({ data: showcaseTracking }));
      const d = (r as { data?: TrackingUpdate[] })?.data;
      if (d?.length) setTracking(d);
    } catch {
      // keep showcase
    }
  }, [client, shipment.id]);

  useEffect(() => {
    void fetchTracking();
  }, [fetchTracking]);

  return (
    <section data-testid="logistics" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="Logistics">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Kebu Logistics</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>OSM tiles + GraphHopper routing via `map-sdk` — no third-party exfiltration. One showcase KGL→BJM shipment.</p>
      </div>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — map tiles cached, routing uses cached showcase.</div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Badge variant="verified">{shipment.status}</Badge>
        <Badge variant="neutral">{shipment.from} → {shipment.to}</Badge>
        {shipment.isShowcase && <Badge variant="business">Showcase</Badge>}
        <Badge variant="neutral">{routeInfo ? `${(routeInfo.distanceM / 1000).toFixed(1)} km · ${Math.round(routeInfo.durationS / 60)} min · ${routeInfo.provider}` : "—"}</Badge>
      </div>
      {loading && <Skeleton height={180} />}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error}</div>}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", background: "white" }}>
        <div style={{ height: 220, background: "#EEF4F1", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
          <img src={tileUrl(5, 16, 10)} alt="" width={256} height={256} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
          <div style={{ position: "relative", border: "1px solid var(--color-border)", borderRadius: 8, background: "white", padding: "8px 12px", fontSize: 12 }}>Route KGL → BJM · {routeInfo?.provider} · tiles via `tiles.kebugram.com`</div>
        </div>
        <div style={{ padding: 12, display: "flex", gap: 8 }}>
          <Button size="sm" data-testid="route-btn" onClick={() => void calcRoute()} loading={loading} aria-label="Calculate route">Calculate route</Button>
          <Button variant="ghost" size="sm" data-testid="track-btn" onClick={() => void fetchTracking()} aria-label="Refresh tracking">Refresh tracking</Button>
        </div>
      </div>
      <div data-testid="tracking" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Tracking</h3>
        {tracking.length === 0 ? <EmptyState title="No updates" description="One showcase tracking is seeded." /> : tracking.map((t) => (
          <div key={t.id} data-testid={`track-${t.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
            <div><span style={{ fontSize: 13, fontWeight: 600 }}>{t.status}</span><span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 6 }}>{new Date(t.at).toLocaleString()}</span></div>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{t.lat.toFixed(2)}, {t.lon.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
