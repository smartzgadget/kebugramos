import { z } from "zod";

export const ConnectionStatusSchema = z.enum(["pending", "accepted", "blocked"]);
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

export const ProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  handle: z.string().min(2).max(32),
  avatarUrl: z.string().url().nullable().optional(),
  isVerified: z.boolean().optional(),
  isShowcase: z.boolean().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const PostSchema = z.object({
  id: z.string().min(1),
  author: ProfileSchema,
  body: z.string().min(1).max(2000),
  createdAt: z.string().datetime({ offset: true }),
  likeCount: z.number().int().min(0),
  likedByMe: z.boolean().optional(),
  isShowcase: z.boolean().optional(),
});
export type Post = z.infer<typeof PostSchema>;

export const FeedResponseSchema = z.object({
  data: z.array(PostSchema),
  nextCursor: z.string().nullable(),
});

export const ConnectionsResponseSchema = z.object({ data: z.array(ProfileSchema) });

export const CreatePostSchema = z.object({ body: z.string().min(1).max(2000) });

export const showcaseProfile: Profile = {
  id: "u-showcase",
  name: "Amina Bekele",
  handle: "amina.bekele",
  avatarUrl: null,
  isVerified: true,
  isShowcase: true,
};

export const showcaseConnection: Profile = {
  id: "u-showcase-2",
  name: "Dawit Kebede",
  handle: "dawit.kebede",
  avatarUrl: null,
  isVerified: false,
};

export const showcasePost: Post = {
  id: "p-showcase-1",
  author: showcaseProfile,
  body: "One showcase KebuBook post — social graph, feed pagination and like. Production content only, no demo filler.",
  createdAt: "2026-08-17T11:00:00.000Z",
  likeCount: 12,
  likedByMe: false,
  isShowcase: true,
};
