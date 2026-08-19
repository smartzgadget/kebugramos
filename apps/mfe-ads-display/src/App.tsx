import { useMemo } from "react";
import { showcaseSlot, canServeAds } from "@kebugram/ads-sdk";
import { Badge, EmptyState } from "@kebugram/design-system";

export default function AdsDisplayApp() {
  const consentAds = useMemo(() => {
    const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { consent?: { ads?: boolean } } }).__KEBUGRAM_CONFIG__?.consent : undefined;
    return !!w?.ads;
  }, []);
  const canServe = canServeAds(consentAds);

  return (
    <section data-testid="ads-display" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)", maxWidth: 480 }} aria-label="Ads Display">
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Ads Display</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Feed inline placement — consent-gated, Python intelligence only when granted.</p>
      </div>
      <Badge variant={canServe ? "verified" : "neutral"}>{canServe ? "ads serve active" : "ads blocked until consent"}</Badge>
      {!canServe ? (
        <EmptyState title="Ads blocked" description="Feed inline slot dashed preview — fills only after consent.ads granted. No exfiltration." />
      ) : (
        <div data-testid="slot" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "var(--color-surface)", padding: 12, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><Badge variant="business">Sponsored</Badge><span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{showcaseSlot.placement}</span></div>
          <div style={{ border: "1px dashed var(--color-border)", borderRadius: 8, background: "white", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{showcaseSlot.campaignId}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>{showcaseSlot.cta}</div>
          </div>
        </div>
      )}
      <div style={{ border: "1px dashed var(--color-border)", borderRadius: 8, padding: 12, background: "#F7F9F8", fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center" }}>Dashed preview — real creative from Python when consent granted</div>
    </section>
  );
}
