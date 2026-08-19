import { z } from "zod";

export const RoutePointSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
export const RouteRequestSchema = z.object({ from: RoutePointSchema, to: RoutePointSchema });
export const RouteResponseSchema = z.object({
  distanceM: z.number().min(0),
  durationS: z.number().min(0),
  points: z.array(RoutePointSchema),
  provider: z.enum(["graphhopper", "cached"]),
});
export type RouteResponse = z.infer<typeof RouteResponseSchema>;

export const TrackingStatusSchema = z.enum(["pending", "in_transit", "delivered", "failed"]);
export const TrackingUpdateSchema = z.object({
  id: z.string().min(1),
  shipmentId: z.string().min(1),
  status: TrackingStatusSchema,
  at: z.string().datetime({ offset: true }),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});
export type TrackingUpdate = z.infer<typeof TrackingUpdateSchema>;

export const ShipmentSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  distanceM: z.number().min(0),
  status: TrackingStatusSchema,
  isShowcase: z.boolean().optional(),
});
export type Shipment = z.infer<typeof ShipmentSchema>;

export const showcaseShipment: Shipment = {
  id: "ship-showcase-1",
  from: "KGL",
  to: "BJM",
  distanceM: 42000,
  status: "in_transit",
  isShowcase: true,
};

export const showcaseTracking: TrackingUpdate[] = [
  { id: "tr-1", shipmentId: "ship-showcase-1", status: "pending", at: "2026-08-17T12:00:00.000Z", lat: -1.94, lon: 30.06 },
  { id: "tr-2", shipmentId: "ship-showcase-1", status: "in_transit", at: "2026-08-17T13:00:00.000Z", lat: -2.1, lon: 30.2 },
];

export function tileUrl(z: number, x: number, y: number) {
  const base = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { mapTileUrl?: string } }).__KEBUGRAM_CONFIG__?.mapTileUrl : "") ?? "https://tiles.kebugram.com";
  return `${base}/${z}/${x}/${y}.png`;
}

export async function route(from: [number, number], to: [number, number]): Promise<RouteResponse> {
  const base = (typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { graphhopperUrl?: string } }).__KEBUGRAM_CONFIG__?.graphhopperUrl : "") ?? "https://route.kebugram.com";
  const url = `${base}/route?point=${from[1]},${from[0]}&point=${to[1]},${to[0]}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Route failed ${res.status}`);
    const json = (await res.json()) as { paths?: Array<{ distance: number; time: number; points: { coordinates: number[][] } }> };
    const p = json.paths?.[0];
    if (p) return RouteResponseSchema.parse({ distanceM: p.distance, durationS: Math.round(p.time / 1000), points: p.points.coordinates.map((c) => [c[0], c[1]] as [number, number]), provider: "graphhopper" as const });
    throw new Error("no path");
  } catch {
    // Offline / not provisioned: cached showcase route KGL→BJM
    return { distanceM: 42000, durationS: 5400, points: [[30.06, -1.94], [30.2, -2.1]], provider: "cached" };
  }
}
