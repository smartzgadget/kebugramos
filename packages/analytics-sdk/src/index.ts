import { z } from "zod";

export const MetricSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  trend: z.enum(["up", "down", "flat"]).optional(),
});
export type Metric = z.infer<typeof MetricSchema>;

export const DashboardSchema = z.object({
  consumer: z.array(MetricSchema),
  business: z.array(MetricSchema),
  at: z.string().datetime({ offset: true }),
  isShowcase: z.boolean().optional(),
});
export type Dashboard = z.infer<typeof DashboardSchema>;

export const showcaseDashboard: Dashboard = {
  consumer: [
    { name: "Reach", value: 12400, unit: "views", trend: "up" },
    { name: "Followers", value: 842, unit: "people", trend: "up" },
  ],
  business: [
    { name: "Revenue", value: 84000, unit: "RWF", trend: "up" },
    { name: "Orders", value: 128, unit: "orders", trend: "flat" },
  ],
  at: "2026-08-17T15:00:00.000Z",
  isShowcase: true,
};

// Otel wiring helper — FE emits via @kebugram/otel (shell), BE reports via python-ai/analytics
export function emitMetric(name: string, value: number, attrs?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as unknown as { __KEBUGRAM_OTEL__?: { emit: (n: string, v: number, a?: Record<string, string>) => void } }).__KEBUGRAM_OTEL__) {
    (window as unknown as { __KEBUGRAM_OTEL__: { emit: (n: string, v: number, a?: Record<string, string>) => void } }).__KEBUGRAM_OTEL__.emit(name, value, attrs);
  }
}
