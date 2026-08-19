import { z } from "zod";
export const ProfileSchema = z.object({
  displayName: z.string().min(2).max(40),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;
