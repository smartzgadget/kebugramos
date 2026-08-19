import { z } from "zod";

export const PayIntentSchema = z.object({
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  payeeId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  note: z.string().max(140).optional(),
});
export type PayIntent = z.infer<typeof PayIntentSchema>;

export const LedgerEntrySchema = z.object({
  id: z.string().min(1),
  at: z.string().datetime({ offset: true }),
  amountMinor: z.number().int(),
  currency: z.string().length(3),
  counterparty: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  status: z.enum(["posted", "pending", "failed"]),
});
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

export const LedgerResponseSchema = z.object({ data: z.array(LedgerEntrySchema), balanceMinor: z.number().int() });

export const P2PRequestSchema = z.object({
  toHandle: z.string().min(2).max(32),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  idempotencyKey: z.string().uuid(),
});
export type P2PRequest = z.infer<typeof P2PRequestSchema>;

export const QRIntentSchema = z.object({ payeeId: z.string().min(1), amountMinor: z.number().int().positive().optional(), currency: z.string().length(3).optional() });

export const showcaseLedger: LedgerEntry[] = [
  { id: "le-1", at: "2026-08-17T12:00:00.000Z", amountMinor: -25000, currency: "RWF", counterparty: "KebuCraft Hub", idempotencyKey: "00000000-0000-4000-a000-000000000001", status: "posted" },
];

export const showcaseIntent: PayIntent = {
  amountMinor: 50000,
  currency: "RWF",
  payeeId: "u-showcase-2",
  idempotencyKey: "00000000-0000-4000-a000-000000000002",
  note: "One showcase P2P intent — signed webhook + audit log.",
};
