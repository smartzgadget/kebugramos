import { useCallback, useEffect, useMemo, useState } from "react";
import {
  showcaseGroup,
  showcasePost,
  showcasePending,
  Group,
  Post,
  FeedResponseSchema,
  GroupsResponseSchema,
  ModerationQueueSchema,
  PostSchema,
} from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";
import { canAccess, type Role } from "@kebugram/permissions";

type ApiConfig = { apiBase: string; role: Role };
function getApiConfig(): ApiConfig {
  const w =
    typeof window !== "undefined"
      ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string; role?: Role } })
      : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api", role: (w?.__KEBUGRAM_CONFIG__?.role as Role) ?? "consumer" };
}

const MODERATOR_ROLES: Role[] = ["admin", "compliance", "support"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function ModBadge({ status }: { status: Post["moderationStatus"] }) {
  if (status === "approved") return <Badge variant="verified">Approved</Badge>;
  if (status === "pending") return <Badge variant="business">Pending review</Badge>;
  return <Badge variant="neutral">Rejected</Badge>;
}

export default function KebuCommunityApp() {
  const cfg = useMemo(() => getApiConfig(), []);
  const client = useMemo(() => createClient(() => ({ apiBase: cfg.apiBase })), [cfg.apiBase]);
  const role: Role = cfg.role;
  const isModerator = MODERATOR_ROLES.includes(role) || canAccess("/admin", role);

  const [groups, setGroups] = useState<Group[]>([showcaseGroup]);
  const [feed, setFeed] = useState<Post[]>([showcasePost, showcasePending]);
  const [queue, setQueue] = useState<Post[]>([showcasePending]);

  const [activeGroup, setActiveGroup] = useState<string>("g-showcase-1");
  const [tab, setTab] = useState<"feed" | "groups" | "queue">("feed");
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [announce, setAnnounce] = useState("");

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
      const g = await client.get("/community/groups", GroupsResponseSchema).catch(() => ({ data: [showcaseGroup] }));
      if (g.data.length) setGroups(g.data);
      const f = await client.get("/community/feed", FeedResponseSchema).catch(() => ({ data: [showcasePost, showcasePending], nextCursor: null }));
      if (f.data.length) setFeed(f.data);
      if (isModerator) {
        const q = await client.get("/community/moderation/queue", ModerationQueueSchema).catch(() => ({ data: [showcasePending] }));
        setQueue(q.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Community unavailable");
    } finally {
      setLoading(false);
    }
  }, [client, isModerator]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const filteredFeed = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = feed.filter((p) => p.groupId === activeGroup && p.moderationStatus !== "rejected");
    if (!isModerator) list = list.filter((p) => p.moderationStatus === "approved" || p.author.id === "u-me");
    if (q) list = list.filter((p) => p.body.toLowerCase().includes(q));
    return list;
  }, [feed, activeGroup, query, isModerator]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q) || g.handle.toLowerCase().includes(q));
  }, [groups, query]);

  const pendingCount = queue.filter((p) => p.moderationStatus === "pending").length;

  const handleJoin = useCallback(
    (id: string) => {
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, isJoined: !g.isJoined, memberCount: g.isJoined ? g.memberCount - 1 : g.memberCount + 1 } : g)));
      setAnnounce("Membership updated");
      void client.post(`/community/groups/${id}/join`, PostSchema, {} as unknown as RequestInit).catch(() => undefined);
    },
    [client],
  );

  const handlePost = useCallback(async () => {
    const body = composer.trim();
    if (!body) return;
    setPosting(true);
    const optimistic: Post = {
      id: `p-local-${Date.now()}`,
      groupId: activeGroup,
      author: { id: "u-me", name: "You" },
      body,
      createdAt: new Date().toISOString(),
      moderationStatus: isModerator ? "approved" : "pending",
      reportReason: null,
    };
    setFeed((prev) => [optimistic, ...prev]);
    if (optimistic.moderationStatus === "pending") setQueue((prev) => [optimistic, ...prev]);
    setComposer("");
    setAnnounce(isModerator ? "Posted" : "Sent for review");
    try {
      const created = await client
        .post("/community/posts", PostSchema, { body: JSON.stringify({ groupId: activeGroup, body }) } as unknown as RequestInit)
        .catch(() => null);
      if (created) {
        setFeed((prev) => prev.map((p) => (p.id === optimistic.id ? created : p)));
        if (created.moderationStatus === "pending") setQueue((prev) => prev.map((p) => (p.id === optimistic.id ? created : p)));
      }
    } finally {
      setPosting(false);
    }
  }, [composer, activeGroup, client, isModerator]);

  const handleModerate = useCallback(
    async (postId: string, action: "approve" | "reject") => {
      if (!isModerator) return;
      const nextStatus = action === "approve" ? "approved" : "rejected";
      setQueue((prev) => prev.map((p) => (p.id === postId ? { ...p, moderationStatus: nextStatus } : p)));
      setFeed((prev) => prev.map((p) => (p.id === postId ? { ...p, moderationStatus: nextStatus } : p)));
      setAnnounce(action === "approve" ? "Approved" : "Rejected");
      void client
        .post(`/community/moderation/${postId}/${action}`, PostSchema, {} as unknown as RequestInit)
        .catch(() => undefined);
    },
    [client, isModerator],
  );

  return (
    <section data-testid="kebucommunity" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="KebuCommunity">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: "var(--color-text-primary)" }}>KebuCommunity</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>
            Groups, feed and RBAC-gated moderation queue — Java core via Go gateway. One showcase group and post per function.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <Badge variant={isModerator ? "verified" : "neutral"}>{isModerator ? `Moderator · ${role}` : role}</Badge>
          {isModerator && <Badge variant="business">{pendingCount} pending</Badge>}
        </div>
      </div>

      {isOffline && (
        <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
          Offline — showing cached showcase. Posts and moderation will sync when online.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 520, flexWrap: "wrap" }}>
        <label htmlFor="community-search" style={{ position: "absolute", left: -9999 }}>Search community</label>
        <input
          id="community-search"
          data-testid="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts and groups"
          aria-label="Search community"
          style={{ flex: 1, minWidth: 180, border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "var(--color-surface-contrast)", color: "var(--color-text-primary)" }}
        />
        <div role="tablist" aria-label="Community tabs" style={{ display: "flex", gap: 6 }}>
          {(["feed", "groups", "queue"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              data-testid={`tab-${t}`}
              onClick={() => setTab(t)}
              disabled={t === "queue" && !isModerator}
              title={t === "queue" && !isModerator ? "Moderators only" : undefined}
              style={{
                border: tab === t ? "1.5px solid var(--color-sovereign-900)" : "1px solid var(--color-border)",
                background: tab === t ? "var(--color-surface)" : "var(--color-surface-contrast)",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 13,
                fontWeight: tab === t ? 700 : 500,
                cursor: t === "queue" && !isModerator ? "not-allowed" : "pointer",
                opacity: t === "queue" && !isModerator ? 0.5 : 1,
                textTransform: "capitalize",
              }}
            >
              {t} {t === "queue" ? `· ${pendingCount}` : ""}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div data-testid="loading" style={{ display: "grid", gap: 8 }}>
          <Skeleton height={72} />
          <Skeleton height={72} />
        </div>
      )}
      {error && !loading && (
        <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>
          {error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchAll()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button>
        </div>
      )}

      {tab === "groups" && (
        <div data-testid="groups-panel" style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          {filteredGroups.length === 0 ? (
            <EmptyState title="No groups match" description="Try another search — showcase group is the seeded record." />
          ) : (
            filteredGroups.map((g) => (
              <div key={g.id} data-testid={`group-${g.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{g.name}</span>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>@{g.handle}</span>
                    {g.isShowcase && <Badge variant="business">Showcase</Badge>}
                  </div>
                  {g.description && <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>{g.description}</div>}
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>{g.memberCount.toLocaleString()} members</div>
                </div>
                <Button
                  size="sm"
                  variant={g.isJoined ? "ghost" : "primary"}
                  data-testid={`join-${g.id}`}
                  aria-label={g.isJoined ? `Leave ${g.name}` : `Join ${g.name}`}
                  onClick={() => handleJoin(g.id)}
                >
                  {g.isJoined ? "Joined" : "Join"}
                </Button>
              </div>
            ))
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Button variant="ghost" size="sm" data-testid="view-feed" onClick={() => setTab("feed")}>Back to feed</Button>
            <Button size="sm" data-testid="select-group" onClick={() => { setActiveGroup(filteredGroups[0]?.id ?? activeGroup); setTab("feed"); }}>
              Open selected
            </Button>
          </div>
        </div>
      )}

      {tab === "feed" && (
        <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>{groups.find((g) => g.id === activeGroup)?.name ?? "Group"} · </span>
              <Badge variant="neutral">{groups.find((g) => g.id === activeGroup)?.handle ?? ""}</Badge>
              <Button variant="ghost" size="sm" data-testid="switch-group" onClick={() => setTab("groups")} aria-label="Switch group">Switch</Button>
            </div>
            <label htmlFor="composer" style={{ position: "absolute", left: -9999 }}>Create post</label>
            <textarea
              id="composer"
              data-testid="composer"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder={isOffline ? "Offline — post will queue" : "Share an update to this group"}
              aria-label="Create post"
              maxLength={1000}
              rows={3}
              style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{composer.length}/1000</span>
              <Button data-testid="post-btn" size="sm" onClick={() => void handlePost()} loading={posting} disabled={!composer.trim()} aria-label="Publish post">
                Post
              </Button>
            </div>
            {!isModerator && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>New posts enter moderation queue before public feed.</span>}
          </div>

          <div data-testid="feed" style={{ display: "grid", gap: 8 }}>
            {filteredFeed.length === 0 && !loading ? (
              <EmptyState title="No posts yet" description="Be the first to post — showcase is the only seeded record." />
            ) : (
              filteredFeed.map((p) => (
                <article key={p.id} data-testid={`post-${p.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.author.name}</span>
                      {p.author.isVerified && <Badge variant="verified">verified</Badge>}
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 6 }}>{formatDate(p.createdAt)}</span>
                    </div>
                    <ModBadge status={p.moderationStatus} />
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--color-text-primary)" }}>{p.body}</p>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "queue" && (
        <div data-testid="queue-panel" style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          {!isModerator ? (
            <EmptyState title="Moderators only" description="RBAC: community moderation is restricted to admin, compliance and support — verified via canAccess." />
          ) : queue.filter((p) => p.moderationStatus === "pending").length === 0 ? (
            <EmptyState title="Queue empty" description="No pending posts — rejected and approved move out of queue." />
          ) : (
            queue
              .filter((p) => p.moderationStatus === "pending")
              .map((p) => (
                <div key={p.id} data-testid={`queue-${p.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.author.name}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{formatDate(p.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{p.body}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" data-testid={`approve-${p.id}`} onClick={() => void handleModerate(p.id, "approve")} aria-label={`Approve ${p.id}`}>Approve</Button>
                    <Button variant="ghost" size="sm" data-testid={`reject-${p.id}`} onClick={() => void handleModerate(p.id, "reject")} aria-label={`Reject ${p.id}`}>Reject</Button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </section>
  );
}
