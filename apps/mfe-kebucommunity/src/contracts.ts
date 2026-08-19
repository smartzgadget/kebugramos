import { z } from "zod";

export const GroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  handle: z.string().min(2).max(32),
  description: z.string().max(240).optional(),
  memberCount: z.number().int().min(0),
  isJoined: z.boolean().optional(),
  isShowcase: z.boolean().optional(),
});
export type Group = z.infer<typeof GroupSchema>;

export const ModerationStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type ModerationStatus = z.infer<typeof ModerationStatusSchema>;

export const PostSchema = z.object({
  id: z.string().min(1),
  groupId: z.string().min(1),
  author: z.object({ id: z.string(), name: z.string().min(1), isVerified: z.boolean().optional() }),
  body: z.string().min(1).max(1000),
  createdAt: z.string().datetime({ offset: true }),
  moderationStatus: ModerationStatusSchema,
  reportReason: z.string().nullable().optional(),
  isShowcase: z.boolean().optional(),
});
export type Post = z.infer<typeof PostSchema>;

export const FeedResponseSchema = z.object({
  data: z.array(PostSchema),
  nextCursor: z.string().nullable(),
});
export type FeedResponse = z.infer<typeof FeedResponseSchema>;

export const GroupsResponseSchema = z.object({ data: z.array(GroupSchema) });
export type GroupsResponse = z.infer<typeof GroupsResponseSchema>;

export const ModerationQueueSchema = z.object({ data: z.array(PostSchema) });
export type ModerationQueue = z.infer<typeof ModerationQueueSchema>;

export const CreatePostSchema = z.object({ groupId: z.string().min(1), body: z.string().min(1).max(1000) });
export type CreatePost = z.infer<typeof CreatePostSchema>;

export const ModerationActionSchema = z.object({
  postId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(240).optional(),
});
export type ModerationAction = z.infer<typeof ModerationActionSchema>;

// One showcase record per function
export const showcaseGroup: Group = {
  id: "g-showcase-1",
  name: "Heritage Circles",
  handle: "heritage-circles",
  description: "One showcase group proving groups → feed → moderation queue (RBAC).",
  memberCount: 1240,
  isJoined: true,
  isShowcase: true,
};

export const showcasePost: Post = {
  id: "p-showcase-1",
  groupId: "g-showcase-1",
  author: { id: "u-showcase", name: "Amina Bekele", isVerified: true },
  body: "Welcome to KebuCommunity — one showcase post. Groups share culture, feed stays civil via RBAC-gated moderation queue.",
  createdAt: "2026-08-17T10:00:00.000Z",
  moderationStatus: "approved",
  reportReason: null,
  isShowcase: true,
};

export const showcasePending: Post = {
  id: "p-showcase-pending-1",
  groupId: "g-showcase-1",
  author: { id: "u-showcase-2", name: "Dawit Kebede" },
  body: "Pending review post — used to prove moderation approve/reject with RBAC.",
  createdAt: "2026-08-17T10:30:00.000Z",
  moderationStatus: "pending",
  reportReason: null,
};
