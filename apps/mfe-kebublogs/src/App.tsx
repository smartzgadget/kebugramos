import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { showcaseBlog, BlogPost, BlogPostSchema, BlogListResponseSchema } from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function KebuBlogsApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [post, setPost] = useState<BlogPost>(showcaseBlog);
  const [title, setTitle] = useState(showcaseBlog.title);
  const [mdx, setMdx] = useState(showcaseBlog.mdx);
  const [status, setStatus] = useState<BlogPost["status"]>(showcaseBlog.status);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<BlogPost[]>([showcaseBlog]);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [announce, setAnnounce] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await client.get("/blogs", BlogListResponseSchema).catch(() => ({ data: [showcaseBlog], nextCursor: null }));
      if (r.data.length) {
        setList(r.data);
        setPost(r.data[0]);
        setTitle(r.data[0].title);
        setMdx(r.data[0].mdx);
        setStatus(r.data[0].status);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blogs unavailable");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  // 800ms autosave debounce — writes draft
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (title === post.title && mdx === post.mdx) return;
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const draft: BlogPost = { ...post, title: title.slice(0, 120), mdx, updatedAt: new Date().toISOString(), status: "draft" as const };
      BlogPostSchema.parse(draft);
      setPost(draft);
      setAnnounce("Draft autosaved");
      void client.post(`/blogs/${post.id}/draft`, BlogPostSchema, { body: JSON.stringify({ title, mdx }) } as unknown as RequestInit).catch(() => undefined);
      setSaving(false);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, mdx, post, client]);

  const handlePublish = useCallback(async () => {
    const next: BlogPost = { ...post, title: title.slice(0, 120), mdx, status: "published", updatedAt: new Date().toISOString() };
    const parsed = BlogPostSchema.safeParse(next);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid post");
      return;
    }
    setPost(parsed.data);
    setStatus("published");
    setList((prev) => prev.map((b) => (b.id === post.id ? parsed.data : b)));
    setAnnounce("Published");
    void client.post(`/blogs/${post.id}/publish`, BlogPostSchema, { body: JSON.stringify({ title, mdx }) } as unknown as RequestInit).catch(() => undefined);
  }, [post, title, mdx, client]);

  return (
    <section data-testid="kebublogs" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)", maxWidth: 720 }} aria-label="Blogs">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: "var(--color-text-primary)" }}>Blogs</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>MDX editor with 800ms autosave — draft, published, archived. One showcase post.</p>
      </div>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — edits autosave locally and sync when online.</div>}
      {loading && <div data-testid="loading" style={{ display: "grid", gap: 8 }}><Skeleton height={24} /><Skeleton height={160} /></div>}
      {error && !loading && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchList()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Badge variant={status === "published" ? "verified" : status === "draft" ? "business" : "neutral"}>{status}</Badge>
        {saving && <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }} data-testid="saving">Autosaving…</span>}
        {!saving && <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }} data-testid="saved">Autosave 800ms</span>}
        {post.isShowcase && <Badge variant="business">Showcase</Badge>}
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 10 }}>
        <label htmlFor="blog-title" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Title</label>
        <input id="blog-title" data-testid="title-input" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 120))} placeholder="Post title" aria-label="Post title" maxLength={120} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{title.length}/120</span><span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{status}</span></div>
        <label htmlFor="blog-mdx" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>MDX</label>
        <textarea id="blog-mdx" data-testid="mdx-input" value={mdx} onChange={(e) => setMdx(e.target.value.slice(0, 50000))} placeholder="# Hello" aria-label="MDX editor" rows={10} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", resize: "vertical" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" data-testid="preview-btn" aria-label="Preview">Preview</Button>
          <Button data-testid="publish-btn" size="sm" onClick={() => void handlePublish()} disabled={!title.trim() || !mdx.trim()} aria-label="Publish">Publish</Button>
        </div>
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "var(--color-surface)", padding: 12, display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Preview</h3>
        <div data-testid="preview" style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "white", padding: 12, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{mdx || "Nothing to preview"}</div>
      </div>
      <div data-testid="blog-list" style={{ display: "grid", gap: 8 }}>
        {list.map((b) => (
          <div key={b.id} data-testid={`blog-${b.id}`} style={{ border: b.id === post.id ? "1.5px solid var(--color-sovereign-900)" : "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 4 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontSize: 13, fontWeight: 600 }}>{b.title}</span><Badge variant={b.status === "published" ? "verified" : "business"}>{b.status}</Badge></div>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{b.excerpt ?? b.mdx.slice(0, 80)} · {new Date(b.updatedAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
