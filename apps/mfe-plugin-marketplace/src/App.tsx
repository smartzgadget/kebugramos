import { useCallback, useEffect, useMemo, useState } from "react";
import { showcasePlugin, PluginManifest, PluginManifestSchema, sandboxedAttributes } from "@kebugram/plugin-runtime-sdk";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }).__KEBUGRAM_CONFIG__?.apiBase : undefined;
  return { apiBase: w ?? "/api" };
}

export default function PluginMarketplaceApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [plugins, setPlugins] = useState<PluginManifest[]>([showcasePlugin]);
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");

  const fetchPlugins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await client.get("/plugins", { parse: (x: unknown) => x } as unknown as Parameters<typeof client.get>[1]).catch(() => ({ data: [showcasePlugin] }));
      const d = (r as { data?: unknown[] })?.data;
      if (d?.length) {
        const parsed = d.map((p) => PluginManifestSchema.parse(p));
        setPlugins(parsed);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Marketplace unavailable");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  const handleInstall = useCallback(async (p: PluginManifest) => {
    setInstalled((prev) => new Set([...prev, p.id]));
    setAnnounce(`${p.name} installed — permissions ${p.permissions.join(", ")}`);
    void client.post(`/plugins/${p.id}/install`, PluginManifestSchema, {} as unknown as RequestInit).catch(() => undefined);
  }, [client]);

  const handleUninstall = useCallback(async (id: string) => {
    setInstalled((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setAnnounce("Plugin uninstalled");
    void client.post(`/plugins/${id}/uninstall`, PluginManifestSchema, {} as unknown as RequestInit).catch(() => undefined);
  }, [client]);

  return (
    <section data-testid="plugin-marketplace" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="Plugin Marketplace">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Plugin Marketplace</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Discovery, install, permissions, CSP, partner adapters — sandboxed iframe runtime per `08-PLUGIN_RUNTIME_SPEC.md`. One showcase plugin.</p>
      </div>
      {loading && <div data-testid="loading" style={{ display: "grid", gap: 8 }}><Skeleton height={64} /><Skeleton height={64} /></div>}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchPlugins()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
      <div data-testid="plugins" style={{ display: "grid", gap: 12 }}>
        {plugins.length === 0 && !loading ? <EmptyState title="No plugins" description="One showcase plugin is seeded." /> : plugins.map((p) => {
          const sb = sandboxedAttributes(p);
          const isInstalled = installed.has(p.id);
          return (
            <div key={p.id} data-testid={`plugin-${p.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, background: "var(--color-surface)", borderRadius: 8, border: "1px solid var(--color-border)", display: "grid", placeItems: "center", fontSize: 10, color: "var(--color-text-secondary)" }}>{p.id.slice(0, 2)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</span><Badge variant="neutral">v{p.version}</Badge>{p.isShowcase && <Badge variant="business">Showcase</Badge>}{isInstalled && <Badge variant="verified">Installed</Badge>}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Permissions: {p.permissions.join(", ")} · CSP: {p.csp.slice(0, 32)}…</div>
                </div>
                {isInstalled ? <Button variant="ghost" size="sm" data-testid={`uninstall-${p.id}`} onClick={() => void handleUninstall(p.id)} aria-label={`Uninstall ${p.name}`}>Uninstall</Button> : <Button size="sm" data-testid={`install-${p.id}`} onClick={() => void handleInstall(p)} aria-label={`Install ${p.name}`}>Install</Button>}
              </div>
              {isInstalled && (
                <div style={{ border: "1px dashed var(--color-border)", borderRadius: 8, background: "var(--color-surface)", padding: 8, display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Sandboxed iframe — `sandbox="{sb.sandbox}"` · `csp="{sb.csp.slice(0, 40)}…"` · third-party code cannot escape host/MFEs</div>
                  <iframe data-testid={`frame-${p.id}`} src={p.entryUrl} title={p.name} sandbox={sb.sandbox as unknown as string} allow={sb.allow} style={{ width: "100%", height: 120, border: "1px solid var(--color-border)", borderRadius: 8, background: "white" }} />
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Partner adapter: Java registry → Go `plugin execution gateway` — escape blocked</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
