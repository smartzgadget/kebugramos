import { z } from "zod";

export const ConnectorStatusSchema = z.enum(["connected", "disconnected", "degraded"]);
export const WebhookHealthSchema = z.object({
  status: z.enum(["ok", "failing"]),
  lastDeliveryAt: z.string().datetime({ offset: true }).nullable(),
  lastError: z.string().nullable(),
});
export const ConnectorHealthSchema = z.object({
  connectorId: z.string().min(1),
  status: ConnectorStatusSchema,
  webhook: WebhookHealthSchema,
  isShowcase: z.boolean().optional(),
});
export type ConnectorHealth = z.infer<typeof ConnectorHealthSchema>;

export const showcaseHealth: ConnectorHealth = {
  connectorId: "posthub-showcase-1",
  status: "connected",
  webhook: { status: "ok", lastDeliveryAt: "2026-08-17T14:00:00.000Z", lastError: null },
  isShowcase: true,
};
