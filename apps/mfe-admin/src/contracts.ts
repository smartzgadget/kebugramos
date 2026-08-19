import { z } from "zod";

export const AuditEntrySchema = z.object({
  id: z.string().min(1),
  at: z.string().datetime({ offset: true }),
  actor: z.string().min(1),
  action: z.string().min(1),
  targetId: z.string().min(1),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

export const QueueItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["report", "appeal", "brand"]),
  status: z.enum(["pending", "review", "resolved"]),
  reportId: z.string().min(1),
});
export type QueueItem = z.infer<typeof QueueItemSchema>;

export const showcaseAudit: AuditEntry[] = [
  { id: "au-1", at: "2026-08-17T14:10:00.000Z", actor: "admin@kebugram", action: "Reviewed report #R-118", targetId: "R-118" },
];

export const showcaseQueue: QueueItem[] = [
  { id: "q-1", type: "report", status: "pending", reportId: "R-118" },
  { id: "q-2", type: "brand", status: "review", reportId: "BP-042" },
];
