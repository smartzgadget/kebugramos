import { z } from "zod";

export const MiniPayIntentSchema = z.object({
  payeeId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  idempotencyKey: z.string().uuid(),
  source: z.enum(["plugin", "market", "chat"]).optional(),
});
export type MiniPayIntent = z.infer<typeof MiniPayIntentSchema>;

export const showcaseMiniIntent: MiniPayIntent = {
  payeeId: "plugin-showcase-1",
  amountMinor: 5000,
  currency: "RWF",
  idempotencyKey: "00000000-0000-4000-a000-000000000003",
  source: "plugin",
};
