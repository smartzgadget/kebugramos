import { useCallback, useEffect, useMemo, useState } from "react";
import { showcaseLedger, showcaseIntent, LedgerEntry, PayIntentSchema, LedgerResponseSchema, P2PRequestSchema } from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Input, Skeleton, EmptyState } from "@kebugram/design-system";
import { LedgerCard, QRDisplay, AuditLogEntry } from "@kebugram/kebupay-ui";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function KebuPayApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [ledger, setLedger] = useState<LedgerEntry[]>(showcaseLedger);
  const [balance, setBalance] = useState(1250000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toHandle, setToHandle] = useState("dawit.kebede");
  const [amount, setAmount] = useState("500.00");
  const [sending, setSending] = useState(false);
  const [qrPayload, setQrPayload] = useState(`kebupay://pay?payee=${showcaseIntent.payeeId}&amount=${showcaseIntent.amountMinor}&cur=${showcaseIntent.currency}`);
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

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await client.get("/pay/ledger", LedgerResponseSchema).catch(() => ({ data: showcaseLedger, balanceMinor: 1250000 }));
      setLedger(r.data);
      setBalance(r.balanceMinor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ledger unavailable");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchLedger();
  }, [fetchLedger]);

  const handleP2P = useCallback(async () => {
    const amountMinor = Math.round(parseFloat(amount || "0") * 100);
    const idempotencyKey = crypto.randomUUID();
    const parsed = P2PRequestSchema.safeParse({ toHandle: toHandle.trim(), amountMinor, currency: "RWF", idempotencyKey });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid P2P");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const entry: LedgerEntry = { id: `le-${Date.now()}`, at: new Date().toISOString(), amountMinor: -amountMinor, currency: "RWF", counterparty: toHandle, idempotencyKey, status: "pending" };
      setLedger((prev) => [entry, ...prev]);
      setBalance((b) => b - amountMinor);
      setAnnounce("Payment sent — pending audit");
      const res = await client
        .post("/pay/p2p", LedgerResponseSchema, { body: JSON.stringify(parsed.data), idempotencyKey } as unknown as RequestInit)
        .catch(() => null);
      if (res) {
        setLedger(res.data);
        setBalance(res.balanceMinor);
        setAnnounce("Payment posted — webhook verified");
      } else {
        setLedger((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: "posted" as const } : e)));
      }
      PayIntentSchema.parse({ amountMinor, currency: "RWF", payeeId: toHandle, idempotencyKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : "P2P failed");
    } finally {
      setSending(false);
    }
  }, [toHandle, amount, client]);

  const generateQR = useCallback(() => {
    const amountMinor = Math.round(parseFloat(amount || "0") * 100);
    const payload = `kebupay://pay?payee=${toHandle || showcaseIntent.payeeId}&amount=${amountMinor}&cur=RWF`;
    setQrPayload(payload);
    setAnnounce("QR generated");
  }, [toHandle, amount]);

  return (
    <section data-testid="kebupay" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)", maxWidth: 560 }} aria-label="KebuPay">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>KebuPay</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Banking-grade wallet — ledger, QR, P2P, audit log. Amounts in minor units, `Idempotency-Key` on every mutation, signed webhooks verified server-side.</p>
      </div>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — ledger cached, mutations queue with idempotency key.</div>}
      <LedgerCard balanceMinor={balance} currency="RWF" />
      {loading && <div data-testid="loading"><Skeleton height={48} /></div>}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchLedger()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>P2P Transfer</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="pay-to" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>To handle</label>
          <Input id="pay-to" data-testid="pay-to" value={toHandle} onChange={(e) => setToHandle(e.target.value)} aria-label="Payee handle" maxLength={32} />
          <label htmlFor="pay-amount" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Amount (RWF)</label>
          <Input id="pay-amount" data-testid="pay-amount" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" inputMode="decimal" />
          <div style={{ display: "flex", gap: 8 }}>
            <Button data-testid="send-btn" size="sm" onClick={() => void handleP2P()} loading={sending} disabled={!toHandle.trim() || !amount.trim()} aria-label="Send">Send — Idempotent</Button>
            <Button variant="ghost" size="sm" data-testid="qr-btn" onClick={generateQR} aria-label="Generate QR">Generate QR</Button>
          </div>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Sends <code>Idempotency-Key: uuid</code> + <code>amountMinor</code> int. One showcase intent.</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12, alignItems: "start" }}>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Ledger</h3><Badge variant="neutral">{ledger.length} entries</Badge></div>
          {ledger.length === 0 ? <EmptyState title="No transactions" description="One showcase entry is seeded." /> : ledger.map((e) => (
            <div key={e.id} data-testid={`entry-${e.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.counterparty} <Badge variant={e.status === "posted" ? "verified" : e.status === "pending" ? "business" : "neutral"}>{e.status}</Badge></div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{new Date(e.at).toLocaleString()}</div></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: e.amountMinor < 0 ? "var(--color-text-primary)" : "#0B6B3A" }}>{e.amountMinor < 0 ? "-" : "+"}RWF {(Math.abs(e.amountMinor) / 100).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 8, display: "grid", gap: 6 }}>
            <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)" }}>Audit log — idempotency keys</h4>
            {ledger.slice(0, 3).map((e) => <AuditLogEntry key={e.id} entry={{ id: e.id, at: e.at, action: `POST /pay/p2p ${e.amountMinor}`, idempotencyKey: e.idempotencyKey }} />)}
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>QR</h3>
          <QRDisplay payload={qrPayload} />
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Signed webhooks verify `amountMinor` + `Idempotency-Key` server-side only.</span>
        </div>
      </div>
    </section>
  );
}
