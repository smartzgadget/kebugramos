import { z } from "zod";
export const ChatRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  lastMessage: z.string(),
  unreadCount: z.number().int().min(0),
  isBusiness: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  avatarUrl: z.string().url().optional(),
});
export type ChatRow = z.infer<typeof ChatRowSchema>;
export const ChatListResponseSchema = z.object({ data: z.array(ChatRowSchema), nextCursor: z.string().nullable() });
