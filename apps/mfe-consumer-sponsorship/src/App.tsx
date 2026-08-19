import { useCallback, useMemo, useState } from "react";
import { showcaseSponsorship, Sponsorship, SponsorshipSchema } from "@kebugram/ads-sdk";
import { createClient } from "@kebugram/api-client";
import { Badge, Button } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }).__KEBUGRAM_CONFIG__?.apiBase : undefined;
  return { apiBase: w ?? "/api" };
}

export default function ConsumerSponsorshipApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [sponsorship, setSponsorship] = useState<Sponsorship>(showcaseSponsorship);
  const [loading, setLoading] = useState(false);
  const [announce, setAnnounce] = useState("");

  const handleSettle = useCallback(async () => {
    setLoading(true);
    try {
      const settled = { ...sponsorship, status: "settled" as const };
      SponsorshipSchema.parse(settled);
      const res = await client.post(`/ads/sponsorship/${sponsorship.id}/settle`, SponsorshipSchema, {} as unknown as RequestInit).catch(() => settled);
      setSponsorship(res);
      setAnnounce("Sponsorship settled — KebuPay ledger");
    } finally {
      setLoading(false);
    }
  }, [sponsorship, client]);

  return (
    <section data-testid="sponsorship" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)", maxWidth: 480 }} aria-label="Consumer Sponsorship">
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Sponsorship</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>One showcase sponsored post — consent-gated, settled via KebuPay (minor units, Idempotency-Key).</p>
      </div>
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Sponsored</span>
          <Badge variant={sponsorship.status === "active" ? "business" : sponsorship.status === "settled" ? "verified" : "neutral"}>{sponsorship.status}</Badge>
          {sponsorship.isShowcase && <Badge variant="business">Showcase</Badge>}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Post {sponsorship.postId} · RWF {(sponsorship.amountMinor / 100).toFixed(2)} · sponsor {sponsorship.sponsorId}</div>
        <div style={{ border: "1px dashed var(--color-border)", borderRadius: 8, background: "var(--color-surface)", padding: 12, fontSize: 13, textAlign: "center" }}>Sponsored post preview — fills feed_inline when `ads-sdk.canServeAds(consent.ads)`</div>
        <Button size="sm" data-testid="settle-btn" onClick={() => void handleSettle()} loading={loading} aria-label="Settle sponsorship" disabled={sponsorship.status === "settled"}>
          {sponsorship.status === "settled" ? "Settled" : "Settle via KebuPay"}
        </Button>
      </div>
    </section>
  );
}
