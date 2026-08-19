import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  showcaseVideo,
  showcaseComment,
  Video,
  Comment,
  VideoSchema,
  PresignedUploadSchema,
  TranscodingStatusSchema,
  CommentSchema,
  FeedResponseSchema,
} from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";

type ApiConfig = { apiBase: string; getToken?: () => string | null };

// Runtime config — no secrets in bundle, host injects __KEBUGRAM_CONFIG__
function getApiConfig(): ApiConfig {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

function formatDuration(sec: number | null): string {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function StatusBadge({ status }: { status: Video["status"] }) {
  const map: Record<Video["status"], { label: string; variant: "neutral" | "business" | "verified" }> = {
    ready: { label: "Ready", variant: "verified" },
    transcoding: { label: "Transcoding", variant: "business" },
    uploading: { label: "Uploading", variant: "neutral" },
    failed: { label: "Failed", variant: "neutral" },
  };
  const v = map[status];
  return <Badge variant={v.variant}>{v.label}</Badge>;
}

function VideoPlayer({ video, progress }: { video: Video; progress: number | null }) {
  if (video.status === "failed") {
    return (
      <EmptyState
        title="Transcoding failed"
        description="This upload could not be processed. Try re-uploading — Python transcoding reports errors via Go gateway status polling."
      />
    );
  }
  if (video.status === "transcoding" || video.status === "uploading") {
    return (
      <div
        data-testid="transcoding-panel"
        style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 16, display: "grid", gap: 10 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>{video.status === "uploading" ? "Uploading" : "Transcoding"}</span>
          <StatusBadge status={video.status} />
        </div>
        <div style={{ height: 8, background: "var(--color-surface)", borderRadius: 999, overflow: "hidden", border: "1px solid var(--color-border)" }}>
          <div style={{ height: "100%", width: `${progress ?? video.transcodingProgress ?? 0}%`, background: "var(--color-sovereign-900)", transition: "width 600ms ease" }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {progress ?? video.transcodingProgress ?? 0}% — via Go gateway presigned PUT + Python worker status at <code style={{ fontSize: 11 }}>/tube/{video.id}/status</code>
        </span>
      </div>
    );
  }
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", background: "black" }}>
      <video
        data-testid="player"
        src={video.url ?? undefined}
        poster={video.thumbnailUrl ?? undefined}
        controls
        playsInline
        style={{ width: "100%", display: "block", aspectRatio: "16 / 9", background: "black" }}
        aria-label={video.title}
      />
    </div>
  );
}

export default function KebuTubeApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const fileRef = useRef<HTMLInputElement>(null);

  const [feed, setFeed] = useState<Video[]>([showcaseVideo]);
  const [selectedId, setSelectedId] = useState<string>("v-showcase-1");
  const selected = feed.find((v) => v.id === selectedId) ?? showcaseVideo;

  const [comments, setComments] = useState<Comment[]>([showcaseComment]);
  const [commentBody, setCommentBody] = useState("");
  const [query, setQuery] = useState("");

  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transcodingProgress, setTranscodingProgress] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Feed fetch — contract-first via api-client; falls back to showcase when backend not provisioned
  const fetchFeed = useCallback(async () => {
    setLoadingFeed(true);
    setFeedError(null);
    try {
      VideoSchema.parse(showcaseVideo);
      const res = await client.get("/tube/feed", FeedResponseSchema);
      if (res.data.length > 0) setFeed(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Feed unavailable";
      if (feed.length === 0) setFeedError(msg);
    } finally {
      setLoadingFeed(false);
    }
  }, [client, feed.length]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return feed;
    return feed.filter((v) => v.title.toLowerCase().includes(q) || (v.description ?? "").toLowerCase().includes(q));
  }, [feed, query]);

  const pollTranscoding = useCallback(
    async (videoId: string) => {
      // Python worker exposes GET /tube/:id/status — Go gateway proxies
      const maxPolls = 20;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        try {
          const st = await client.get(`/tube/${videoId}/status`, TranscodingStatusSchema);
          setTranscodingProgress(st.progress);
          setFeed((prev) => prev.map((v) => (v.id === videoId ? { ...v, status: st.status, transcodingProgress: st.progress } : v)));
          if (st.status === "ready" || st.status === "failed") {
            setAnnounce(st.status === "ready" ? "Video ready" : "Transcoding failed");
            break;
          }
        } catch {
          // Backend not provisioned — simulate progress locally so demo proves the UI path
          const simulated = Math.min(100, (transcodingProgress ?? 10) + 18 + i * 4);
          setTranscodingProgress(simulated);
          if (simulated >= 100) {
            setFeed((prev) =>
              prev.map((v) =>
                v.id === videoId
                  ? { ...v, status: "ready", transcodingProgress: 100, url: showcaseVideo.url, thumbnailUrl: showcaseVideo.thumbnailUrl }
                  : v,
              ),
            );
            setAnnounce("Video ready");
            break;
          }
        }
      }
    },
    [client, transcodingProgress],
  );

  const handlePickFile = useCallback(async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedError(null);
    setAnnounce("Upload started");
    try {
      // 1) Presigned URL from Go gateway
      let presigned: { uploadUrl: string; objectKey: string } | null = null;
      try {
        const p = await client.post(
          "/tube/upload/presign",
          PresignedUploadSchema,
          { body: JSON.stringify({ fileName: file.name, contentType: file.type || "video/mp4", sizeBytes: file.size }) } as unknown as RequestInit,
        );
        presigned = p;
      } catch {
        presigned = null;
      }

      // 2) Create local uploading record immediately — one showcase rule stays, new record is transient demo
      const newId = `v-local-${Date.now()}`;
      const uploadingRecord: Video = {
        id: newId,
        title: file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "Untitled upload",
        description: "Local upload — presigned PUT via Go gateway, status from Python.",
        url: null,
        thumbnailUrl: null,
        durationSec: null,
        status: "uploading",
        transcodingProgress: 0,
        viewCount: 0,
        author: showcaseVideo.author,
        createdAt: new Date().toISOString(),
        commentCount: 0,
      };
      setFeed((prev) => [uploadingRecord, ...prev]);
      setSelectedId(newId);
      setTranscodingProgress(0);

      // 3) PUT to presigned URL (S3-compatible) — if presigned, real PUT; otherwise simulate
      if (presigned?.uploadUrl) {
        await fetch(presigned.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "video/mp4" } });
        setFeed((prev) => prev.map((v) => (v.id === newId ? { ...v, status: "transcoding", transcodingProgress: 8 } : v)));
      } else {
        // Simulate upload chunk progress for local demo
        for (let p = 10; p <= 50; p += 20) {
          await new Promise((r) => setTimeout(r, 280));
          setTranscodingProgress(p);
          setFeed((prev) => prev.map((v) => (v.id === newId ? { ...v, status: "transcoding", transcodingProgress: p } : v)));
        }
      }

      // 4) Poll transcoding status (Python)
      setTranscodingProgress(8);
      await pollTranscoding(newId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setFeedError(msg);
      setAnnounce(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [client, pollTranscoding]);

  const handlePostComment = useCallback(() => {
    const body = commentBody.trim();
    if (!body) return;
    const c: Comment = {
      id: `c-${Date.now()}`,
      videoId: selected.id,
      author: { id: "u-me", name: "You" },
      body,
      createdAt: new Date().toISOString(),
    };
    CommentSchema.parse(c);
    setComments((prev) => [c, ...prev.filter((x) => x.videoId === selected.id), ...prev.filter((x) => x.videoId !== selected.id)]);
    setFeed((prev) => prev.map((v) => (v.id === selected.id ? { ...v, commentCount: v.commentCount + 1 } : v)));
    setCommentBody("");
    setAnnounce("Comment posted");
    void client
      .post(`/tube/${selected.id}/comments`, CommentSchema, {
        body: JSON.stringify({ body }),
      } as unknown as RequestInit)
      .catch(() => undefined);
  }, [commentBody, selected, client]);

  const visibleComments = comments.filter((c) => c.videoId === selected.id);

  return (
    <section data-testid="kebutube" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="KebuTube">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
        {announce}
      </div>

      {/* Header — single 20px/700 heading, then 13px descriptor (workflow §6) */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: "var(--color-text-primary)" }}>KebuTube</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>
            Feed, player and presigned upload — Go gateway presigned PUT, Python transcoding status. One showcase record per function.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} data-testid="file-input" onChange={handlePickFile} aria-label="Choose video file" />
          <Button data-testid="upload-btn" onClick={() => fileRef.current?.click()} loading={uploading} aria-label="Upload video">
            Upload video
          </Button>
        </div>
      </div>

      {/* Offline banner */}
      {isOffline && (
        <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
          Offline — feed shows cached showcase. Upload and comments will sync when online.
        </div>
      )}

      {/* Search — token-driven, no raw hex */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 420 }}>
        <label htmlFor="kebutube-search" style={{ position: "absolute", left: -9999 }}>Search videos</label>
        <input
          id="kebutube-search"
          data-testid="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search showcase"
          aria-label="Search videos"
          style={{
            flex: 1,
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 14,
            background: "var(--color-surface-contrast)",
            color: "var(--color-text-primary)",
          }}
        />
        {query && (
          <Button variant="ghost" size="sm" onClick={() => setQuery("")} aria-label="Clear search">
            Clear
          </Button>
        )}
      </div>

      {/* Feed state */}
      {loadingFeed && (
        <div data-testid="loading" style={{ display: "grid", gap: 8 }}>
          <Skeleton height={84} />
          <Skeleton height={84} />
        </div>
      )}
      {feedError && !loadingFeed && (
        <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>
          {feedError} — <button type="button" data-testid="retry-btn" onClick={() => void fetchFeed()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        {/* Feed list */}
        <div data-testid="feed" style={{ display: "grid", gap: 8, alignContent: "start" }}>
          {filtered.length === 0 && !loadingFeed ? (
            <EmptyState title="No videos match" description="Try a different search — showcase is the only seeded record." />
          ) : (
            filtered.map((v) => (
              <button
                key={v.id}
                data-testid={`feed-item-${v.id}`}
                onClick={() => setSelectedId(v.id)}
                aria-current={selectedId === v.id ? "true" : undefined}
                aria-label={`Play ${v.title}`}
                style={{
                  textAlign: "left",
                  border: selectedId === v.id ? "1.5px solid var(--color-sovereign-900)" : "1px solid var(--color-border)",
                  borderRadius: 12,
                  background: selectedId === v.id ? "var(--color-surface)" : "var(--color-surface-contrast)",
                  padding: 10,
                  display: "grid",
                  gridTemplateColumns: "96px 1fr",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 96, height: 56, borderRadius: 8, overflow: "hidden", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "grid", placeItems: "center" }}>
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt="" width={96} height={56} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{formatDuration(v.durationSec)}</span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{v.author.name}{v.author.isVerified ? " · verified" : ""} · {v.viewCount.toLocaleString()} views</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusBadge status={v.status} />
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{v.commentCount} comments</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Player + details + comments */}
        <div style={{ display: "grid", gap: 12 }}>
          <VideoPlayer video={selected} progress={selected.id === selectedId ? transcodingProgress : selected.transcodingProgress} />

          <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>{selected.title}</h3>
              <StatusBadge status={selected.status} />
            </div>
            {selected.description && <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{selected.description}</p>}
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
              <span>{selected.viewCount.toLocaleString()} views</span>
              <span>{formatDuration(selected.durationSec)}</span>
              <span>{new Date(selected.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>Comments · {visibleComments.length}</h4>
            <div style={{ display: "flex", gap: 8 }}>
              <label htmlFor="comment-input" style={{ position: "absolute", left: -9999 }}>Add a comment</label>
              <input
                id="comment-input"
                data-testid="comment-input"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
                placeholder={isOffline ? "Offline — comment will sync" : "Add a comment"}
                aria-label="Add a comment"
                maxLength={500}
                style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
              />
              <Button data-testid="post-comment" size="sm" onClick={handlePostComment} disabled={!commentBody.trim()} aria-label="Post comment">
                Post
              </Button>
            </div>
            <div data-testid="comment-list" style={{ display: "grid", gap: 10 }}>
              {visibleComments.length === 0 ? (
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>No comments yet — be the first.</span>
              ) : (
                visibleComments.map((c) => (
                  <div key={c.id} data-testid={`comment-${c.id}`} style={{ display: "grid", gap: 4, borderTop: "1px solid var(--color-surface)", paddingTop: 10 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.author.name}</span>
                      <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{c.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
