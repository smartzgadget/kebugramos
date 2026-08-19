import { useEffect, useMemo, useState } from "react";
import { showcaseUrl, showcaseManifest, ConsentSchema } from "./contracts";
import { Badge, Button, EmptyState } from "@kebugram/design-system";

function getConsent(): { ads: boolean; analytics: boolean } {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { consent?: { ads?: boolean; analytics?: boolean } } }).__KEBUGRAM_CONFIG__?.consent : undefined;
  const parsed = ConsentSchema.safeParse({ ads: !!w?.ads, analytics: !!w?.analytics, location: false });
  return { ads: parsed.success ? parsed.data.ads : false, analytics: parsed.success ? parsed.data.analytics : false };
}

export default function BrowserApp() {
  const consent = useMemo(() => getConsent(), []);
  const [url, setUrl] = useState(showcaseUrl);
  const [inputUrl, setInputUrl] = useState(showcaseUrl);
  const [allowed, setAllowed] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return "";
      }
    })();
    setAllowed(consent.analytics && showcaseManifest.allowedHosts.includes(host));
  }, [url, consent.analytics]);

  const handleGo = () => {
    try {
      const u = new URL(inputUrl);
      if (!showcaseManifest.allowedHosts.includes(u.host)) {
        setAnnounce("Host not in permission manifest");
        return;
      }
      setUrl(u.toString());
      setAnnounce(`Navigated to ${u.host}`);
    } catch {
      setAnnounce("Invalid URL");
    }
  };

  return (
    <section data-testid="browser" style={{ display: "grid", gap: 12, fontFamily: "var(--font-sans)" }} aria-label="Browser">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Browser</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Lightweight in-app browser — consent-aware, CSP + permission manifest. Tracking blocked until consent.</p>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Badge variant={consent.analytics ? "verified" : "neutral"}>{consent.analytics ? "consent granted" : "consent blocked"}</Badge>
        <Badge variant="neutral">CSP: {showcaseManifest.csp.slice(0, 32)}…</Badge>
        <Badge variant="neutral">{showcaseManifest.allowedHosts.length} hosts</Badge>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input data-testid="url-input" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="https://example.kebugram.com" aria-label="URL" style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14 }} />
        <Button size="sm" data-testid="go-btn" onClick={handleGo} aria-label="Go">Go</Button>
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", background: "white" }}>
        <div style={{ height: 36, borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", padding: "0 10px", gap: 8, background: "var(--color-surface)" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
          <span style={{ marginLeft: "auto", fontSize: 11, border: "1px solid var(--color-border)", borderRadius: 999, padding: "2px 8px", background: allowed ? "#ECFDF5" : "#FFF1F2" }}>{allowed ? "tracking allowed" : "tracking blocked"}</span>
        </div>
        <div style={{ height: 320, background: "var(--color-surface)", display: "grid", placeItems: "center", padding: 12 }}>
          {!allowed ? (
            <EmptyState title="Consent required" description="Tracking and cookies blocked — grant analytics consent to load partner content. Host must be in permission manifest." />
          ) : (
            <iframe data-testid="frame" src={url} title="Partner content" sandbox="allow-scripts allow-same-origin" allow="" style={{ width: "100%", height: 320, border: "none", background: "white" }} csp={showcaseManifest.csp} />
          )}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Permission manifest: {showcaseManifest.allowedHosts.join(", ")} · cookies {showcaseManifest.allowCookies ? "on" : "off"}</div>
    </section>
  );
}
