import { useCallback, useEffect, useMemo, useState } from "react";
import { search, SearchResult, SearchDomain, showcaseResults, SearchResponseSchema } from "@kebugram/search-sdk";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }).__KEBUGRAM_CONFIG__?.apiBase : undefined;
  return { apiBase: w ?? "/api" };
}

const DOMAINS: (SearchDomain | "all")[] = ["all", "chat", "tube", "market", "community"];

export default function SearchApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<SearchDomain | "all">("all");
  const [results, setResults] = useState<SearchResult[]>(showcaseResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tookMs, setTookMs] = useState(0);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const doSearch = useCallback(async () => {
    const q = debounced;
    if (!q) {
      setResults(showcaseResults);
      setTookMs(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Prefer unified gateway via api-client when provisioned, fallback to search-sdk showcase filtering
      const viaApi = await client
        .get(`/search?q=${encodeURIComponent(q)}${domain !== "all" ? `&domain=${domain}` : ""}`, SearchResponseSchema)
        .catch(() => null);
      if (viaApi) {
        setResults(viaApi.results);
        setTookMs(viaApi.tookMs);
      } else {
        const r = await search(q, domain === "all" ? undefined : (domain as SearchDomain));
        setResults(r.results);
        setTookMs(r.tookMs);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [debounced, domain, client]);

  useEffect(() => {
    void doSearch();
  }, [doSearch]);

  return (
    <section data-testid="mfe-search" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)", maxWidth: 560 }} aria-label="Kebu Search">
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Search</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Unified search — chat, tube, market, community. One showcase result per domain.</p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          data-testid="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chat, tube, market, community"
          aria-label="Unified search"
          style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "var(--color-surface-contrast)" }}
        />
        {query && <Button variant="ghost" size="sm" onClick={() => setQuery("")} aria-label="Clear">Clear</Button>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="tablist" aria-label="Domain filter">
        {DOMAINS.map((d) => (
          <button
            key={d}
            role="tab"
            aria-selected={domain === d}
            data-testid={`domain-${d}`}
            onClick={() => setDomain(d)}
            style={{
              border: domain === d ? "1.5px solid var(--color-sovereign-900)" : "1px solid var(--color-border)",
              background: domain === d ? "var(--color-surface)" : "white",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: domain === d ? 700 : 500,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }} data-testid="meta">{results.length} results · {tookMs}ms {debounced ? `· “${debounced}”` : ""}</div>
      {loading && <div data-testid="loading" style={{ display: "grid", gap: 8 }}><Skeleton height={56} /><Skeleton height={56} /></div>}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error}</div>}
      <div data-testid="results" style={{ display: "grid", gap: 8 }}>
        {!loading && results.length === 0 ? <EmptyState title="No results" description="Try another term — showcase is the only seeded index." /> : results.map((r) => (
          <a key={r.id} data-testid={`result-${r.id}`} href={r.href} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "block", textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Badge variant="neutral">{r.domain}</Badge>{r.isShowcase && <Badge variant="business">Showcase</Badge>}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6, color: "var(--color-text-primary)" }}>{r.title}</div>
            {r.snippet && <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{r.snippet}</div>}
          </a>
        ))}
      </div>
    </section>
  );
}
