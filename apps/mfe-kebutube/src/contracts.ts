import { z } from "zod";

export const VideoStatusSchema = z.enum(["uploading", "transcoding", "ready", "failed"]);
export type VideoStatus = z.infer<typeof VideoStatusSchema>;

export const CommentSchema = z.object({
  id: z.string().min(1),
  videoId: z.string().min(1),
  author: z.object({ id: z.string(), name: z.string().min(1), isVerified: z.boolean().optional() }),
  body: z.string().min(1).max(500),
  createdAt: z.string().datetime({ offset: true }),
});
export type Comment = z.infer<typeof CommentSchema>;

export const VideoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  url: z.string().url().nullable(),
  thumbnailUrl: z.string().url().nullable(),
  durationSec: z.number().int().min(0).nullable(),
  status: VideoStatusSchema,
  transcodingProgress: z.number().int().min(0).max(100).nullable(),
  viewCount: z.number().int().min(0),
  author: z.object({ id: z.string(), name: z.string().min(1), isVerified: z.boolean().optional() }),
  createdAt: z.string().datetime({ offset: true }),
  commentCount: z.number().int().min(0),
  isShowcase: z.boolean().optional(),
});
export type Video = z.infer<typeof VideoSchema>;

export const FeedResponseSchema = z.object({
  data: z.array(VideoSchema),
  nextCursor: z.string().nullable(),
});
export type FeedResponse = z.infer<typeof FeedResponseSchema>;

export const PresignedUploadSchema = z.object({
  uploadUrl: z.string().url(),
  objectKey: z.string().min(1),
  expiresAt: z.string().datetime({ offset: true }),
});
export type PresignedUpload = z.infer<typeof PresignedUploadSchema>;

export const PresignedRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().min(1),
});
export type PresignedRequest = z.infer<typeof PresignedRequestSchema>;

export const TranscodingStatusSchema = z.object({
  videoId: z.string(),
  status: VideoStatusSchema,
  progress: z.number().int().min(0).max(100),
  error: z.string().nullable(),
});
export type TranscodingStatus = z.infer<typeof TranscodingStatusSchema>;

// One showcase record per function — excluded from analytics
export const showcaseVideo: Video = {
  id: "v-showcase-1",
  title: "Sovereign Roots — Timket in Gondar",
  description: "One showcase record proving feed → player → presigned upload → Python transcoding → comments.",
  url: "https://cdn.kebugram.com/showcase/v-showcase-1.mp4",
  thumbnailUrl: "https://cdn.kebugram.com/showcase/v-showcase-1.jpg",
  durationSec: 142,
  status: "ready",
  transcodingProgress: 100,
  viewCount: 2841,
  author: { id: "u-showcase", name: "KebuGram Culture", isVerified: true },
  createdAt: "2026-08-17T08:00:00.000Z",
  commentCount: 1,
  isShowcase: true,
};

export const showcaseComment: Comment = {
  id: "c-showcase-1",
  videoId: "v-showcase-1",
  author: { id: "u-showcase-2", name: "Amina Bekele" },
  body: "Timket footage is sharp — transcoding kept the colors true. Looking forward to more cultural archives.",
  createdAt: "2026-08-17T09:10:00.000Z",
};
