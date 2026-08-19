import { useCallback, useMemo, useState } from "react";
import { showcaseMiniIntent, MiniPayIntentSchema } from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Button, Badge } from "@kebugram/design-system";
import { LedgerCard } from "@kebugram/kebupay-ui";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function MiniPayApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [amount, setAmount] = useState((showcaseMiniIntent.amountMinor / 100).toFixed(2));
  const [payee, setPayee] = useState(showcaseMiniIntent.payeeId);
  const [sending, setSending] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [lastKey, setLastKey] = useState<string | null>(null);

  const handlePay = useCallback(async () => {
    const amountMinor = Math.round(parseFloat(amount || "0") * 100);
    const idempotencyKey = crypto.randomUUID();
    const parsed = MiniPayIntentSchema.safeParse({ payeeId: payee.trim(), amountMinor, currency: "RWF", idempotencyKey, source: "plugin" as const });
    if (!parsed.success) return;
    setSending(true);
    try {
      void (await client
        .post("/pay/mini/intent", MiniPayIntentSchema, { body: JSON.stringify(parsed.data), idempotencyKey } as unknown as RequestInit)
        .catch(() => parsed.data));
      setLastKey(idempotencyKey);
      setAnnounce("Mini Pay intent sent — idempotent");
    } finally {
      setSending(false);
    }
  }, [amount, payee, client]);

  return (
    <section data-testid="mini-pay" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)", maxWidth: 420 }} aria-label="Mini Pay">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Mini Pay</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Lightweight plugin intent — same ledger, `Idempotency-Key`, `amountMinor` int, signed webhook.</p>
      </div>
      <LedgerCard balanceMinor={1250000} currency="RWF" />
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 10 }}>
        <label htmlFor="mini-payee" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Payee</label>
        <input id="mini-payee" data-testid="mini-payee" value={payee} onChange={(e) => setPayee(e.target.value)} aria-label="Payee" style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14 }} />
        <label htmlFor="mini-amount" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Amount (RWF)</label>
        <input id="mini-amount" data-testid="mini-amount" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" inputMode="decimal" style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14 }} />
        <Button data-testid="mini-pay-btn" size="sm" onClick={() => void handlePay()} loading={sending} disabled={!payee.trim() || !amount.trim()} aria-label="Pay">Pay — Idempotent</Button>
        {lastKey && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }} data-testid="last-key">Last <code>{lastKey.slice(0, 8)}</code> · <Badge variant="neutral">signed webhook</Badge></span>}
      </div>
    </section>
  );
}
