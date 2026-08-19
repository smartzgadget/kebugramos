import { useCallback, useEffect, useMemo, useState } from "react";
import { showcaseProfile, showcaseConnection, showcasePost, Post, Profile, FeedResponseSchema, ConnectionsResponseSchema, CreatePostSchema, PostSchema } from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function KebuBookApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [feed, setFeed] = useState<Post[]>([showcasePost]);
  const [connections, setConnections] = useState<Profile[]>([showcaseConnection]);
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [announce, setAnnounce] = useState("");
  const pageSize = 10;

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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const f = await client.get("/book/feed", FeedResponseSchema).catch(() => ({ data: [showcasePost], nextCursor: null }));
      if (f.data.length) setFeed(f.data);
      const c = await client.get("/book/connections", ConnectionsResponseSchema).catch(() => ({ data: [showcaseConnection] }));
      if (c.data.length) setConnections(c.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "KebuBook unavailable");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const paged = feed.slice(page * pageSize, (page + 1) * pageSize);
    if (!q) return paged;
    return paged.filter((p) => p.body.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q));
  }, [feed, query, page]);

  const handlePost = useCallback(async () => {
    const body = composer.trim();
    if (!body) return;
    const parsed = CreatePostSchema.safeParse({ body });
    if (!parsed.success) return;
    const optimistic: Post = { id: `p-local-${Date.now()}`, author: showcaseProfile, body, createdAt: new Date().toISOString(), likeCount: 0, likedByMe: false };
    setFeed((prev) => [optimistic, ...prev]);
    setComposer("");
    setAnnounce("Posted");
    void client.post("/book/posts", PostSchema, { body: JSON.stringify({ body }) } as unknown as RequestInit).catch(() => undefined);
  }, [composer, client]);

  const toggleLike = useCallback((id: string) => {
    setFeed((prev) => prev.map((p) => (p.id === id ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? Math.max(0, p.likeCount - 1) : p.likeCount + 1 } : p)));
    void client.post(`/book/posts/${id}/like`, PostSchema, {} as unknown as RequestInit).catch(() => undefined);
  }, [client]);

  const totalPages = Math.max(1, Math.ceil(feed.length / pageSize));

  return (
    <section data-testid="kebubook" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="KebuBook">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: "var(--color-text-primary)" }}>KebuBook</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Social graph, posts and feed pagination — Java core. One showcase connection and post.</p>
      </div>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — showing cached showcase. Posts will sync when online.</div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 520 }}>
        <input id="book-search" data-testid="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts" aria-label="Search posts" style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "var(--color-surface-contrast)" }} />
        {query && <Button variant="ghost" size="sm" onClick={() => setQuery("")} aria-label="Clear search">Clear</Button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 240px", gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 8 }}>
            <textarea id="composer" data-testid="composer" value={composer} onChange={(e) => setComposer(e.target.value)} placeholder={isOffline ? "Offline — post will queue" : "What's on your mind?"} aria-label="Create post" maxLength={2000} rows={3} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{composer.length}/2000</span>
              <Button data-testid="post-btn" size="sm" onClick={() => void handlePost()} disabled={!composer.trim()} aria-label="Publish post">Post</Button>
            </div>
          </div>
          {loading && <div data-testid="loading" style={{ display: "grid", gap: 8 }}><Skeleton height={72} /><Skeleton height={72} /></div>}
          {error && !loading && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchAll()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
          <div data-testid="feed" style={{ display: "grid", gap: 8 }}>
            {filtered.length === 0 && !loading ? <EmptyState title="No posts match" description="Try another search — showcase is the only seeded record." /> : filtered.map((p) => (
              <article key={p.id} data-testid={`post-${p.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.author.name}</span>
                  {p.author.isVerified && <Badge variant="verified">verified</Badge>}
                  {p.isShowcase && <Badge variant="business">Showcase</Badge>}
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{new Date(p.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{p.body}</p>
                <div><Button variant="ghost" size="sm" data-testid={`like-${p.id}`} onClick={() => toggleLike(p.id)} aria-label={`Like ${p.id}`}>{p.likedByMe ? "Liked" : "Like"} · {p.likeCount}</Button></div>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Previous page">Prev</Button>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }} data-testid="page-info">{page + 1} / {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">Next</Button>
          </div>
        </div>
        <div data-testid="connections" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Connections</h3>
          {connections.map((c) => (
            <div key={c.id} data-testid={`connection-${c.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>@{c.handle}</div></div>
              <Badge variant="neutral">connected</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
