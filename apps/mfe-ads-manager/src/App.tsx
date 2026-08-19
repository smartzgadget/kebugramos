import { useCallback, useEffect, useMemo, useState } from "react";
import { showcaseCampaign, Campaign, CampaignSchema } from "@kebugram/ads-sdk";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Input, Skeleton, EmptyState } from "@kebugram/design-system";

function getConsent() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { consent?: { ads?: boolean; analytics?: boolean } } }).__KEBUGRAM_CONFIG__?.consent : undefined;
  return !!w?.ads;
}

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }).__KEBUGRAM_CONFIG__?.apiBase : undefined;
  return { apiBase: w ?? "/api" };
}

export default function AdsManagerApp() {
  const consentAds = useMemo(() => getConsent(), []);
  const client = useMemo(() => createClient(getApiConfig), []);
  const [campaigns, setCampaigns] = useState<Campaign[]>([showcaseCampaign]);
  const [title, setTitle] = useState(showcaseCampaign.title);
  const [budget, setBudget] = useState((showcaseCampaign.budgetMinor / 100).toFixed(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await client.get("/ads/campaigns", { parse: (x: unknown) => x } as unknown as Parameters<typeof client.get>[1]).catch(() => ({ data: [showcaseCampaign] }));
      const d = (r as { data?: Campaign[] })?.data;
      if (d?.length) setCampaigns(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ads unavailable");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreate = useCallback(async () => {
    if (!consentAds) {
      setError("Ads blocked until consent granted — Python ads intelligence gated.");
      return;
    }
    const parsed = CampaignSchema.safeParse({ id: `camp-${Date.now()}`, title: title.trim(), budgetMinor: Math.round(parseFloat(budget || "0") * 100), currency: "RWF", status: "draft" as const });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid campaign");
      return;
    }
    setCampaigns((prev) => [parsed.data, ...prev]);
    setAnnounce("Campaign created — draft");
    void client.post("/ads/campaigns", CampaignSchema, { body: JSON.stringify(parsed.data) } as unknown as RequestInit).catch(() => undefined);
  }, [title, budget, consentAds, client]);

  return (
    <section data-testid="ads-manager" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)", maxWidth: 560 }} aria-label="Ad Manager">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Ad Manager</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Campaign manager — Python ads intelligence, consent-gated serving (blocked until consent.ads).</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Badge variant={consentAds ? "verified" : "neutral"}>{consentAds ? "consent granted" : "consent blocked — ads gated"}</Badge>
        {showcaseCampaign.isShowcase && <Badge variant="business">Showcase</Badge>}
      </div>
      {!consentAds && <div data-testid="gate" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Ads serve blocked until consent — no Python intelligence exfiltration.</div>}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 10 }}>
        <label htmlFor="camp-title" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Campaign title</label>
        <Input id="camp-title" data-testid="camp-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Campaign title" maxLength={80} />
        <label htmlFor="camp-budget" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Budget (RWF)</label>
        <Input id="camp-budget" data-testid="camp-budget" value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Budget" inputMode="decimal" />
        <Button size="sm" data-testid="create-camp" onClick={() => void handleCreate()} disabled={!title.trim()} aria-label="Create campaign">Create campaign</Button>
      </div>
      {loading && <Skeleton height={56} />}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error}</div>}
      <div data-testid="campaigns" style={{ display: "grid", gap: 8 }}>
        {campaigns.map((c) => (
          <div key={c.id} data-testid={`camp-${c.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.title} {c.isShowcase && <Badge variant="business">Showcase</Badge>}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>RWF {(c.budgetMinor / 100).toFixed(2)} · {c.status}</div></div>
            <Badge variant={c.status === "active" ? "verified" : "neutral"}>{c.status}</Badge>
          </div>
        ))}
      </div>
      {campaigns.length === 0 && !loading && <EmptyState title="No campaigns" description="One showcase campaign is seeded." />}
    </section>
  );
}
