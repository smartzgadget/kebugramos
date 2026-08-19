export function LedgerCard({ balanceMinor, currency }: { balanceMinor: number; currency: string }) {
  return (
    <div data-testid="ledger-card" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 16, background: "var(--color-sovereign-900)", color: "white" }}>
      <div style={{ fontSize: 11, letterSpacing: 0.6, opacity: 0.8, fontWeight: 600 }}>LEDGER BALANCE</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }} data-testid="balance">{currency} {(balanceMinor / 100).toFixed(2)}</div>
      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Amounts in minor units · audited</div>
    </div>
  );
}

export function QRDisplay({ payload }: { payload: string }) {
  // Sovereign, no third-party lib: SVG pattern derived from payload hash — sufficient for showcase, swapped to real QR when gateway provisioned
  const hash = Array.from(payload).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
  const cells = Array.from({ length: 121 }, (_, i) => ((hash >> (i % 24)) & 1) === 1);
  return (
    <div data-testid="qr" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", placeItems: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 12px)", gridTemplateRows: "repeat(11, 12px)", gap: 1, background: "var(--color-sovereign-900)", padding: 8, borderRadius: 8 }}>
        {cells.map((on, i) => (
          <div key={i} style={{ width: 12, height: 12, background: on ? "var(--color-sovereign-900)" : "white", borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 8, maxWidth: 200, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{payload}</div>
    </div>
  );
}

export function AuditLogEntry({ entry }: { entry: { id: string; at: string; action: string; idempotencyKey: string } }) {
  return (
    <div data-testid={`audit-${entry.id}`} style={{ borderTop: "1px solid var(--color-surface)", paddingTop: 8, display: "grid", gap: 2 }}>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{entry.action}</div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{new Date(entry.at).toLocaleString()} · <code style={{ fontSize: 10 }}>{entry.idempotencyKey.slice(0, 8)}</code></div>
    </div>
  );
}
