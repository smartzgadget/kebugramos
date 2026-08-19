import { z } from "zod";

export const BlogStatusSchema = z.enum(["draft", "published", "archived"]);
export type BlogStatus = z.infer<typeof BlogStatusSchema>;

export const BlogPostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(4).max(120),
  slug: z.string().min(2).max(80),
  mdx: z.string().min(1).max(50000),
  excerpt: z.string().max(240).optional(),
  status: BlogStatusSchema,
  author: z.object({ id: z.string(), name: z.string().min(1), isVerified: z.boolean().optional() }),
  updatedAt: z.string().datetime({ offset: true }),
  isShowcase: z.boolean().optional(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

export const BlogListResponseSchema = z.object({
  data: z.array(BlogPostSchema),
  nextCursor: z.string().nullable(),
});

export const showcaseBlog: BlogPost = {
  id: "b-showcase-1",
  title: "Sovereign Archives — Timket in Gondar",
  slug: "sovereign-archives-timket",
  mdx: "# Sovereign Archives\n\nOne showcase MDX post proving the blog editor autosaves to draft and publishes via Java core.\n\n- Tokens: `var(--color-sovereign-900)`\n- Autosave: 800ms debounce\n- Production only\n",
  excerpt: "One showcase MDX post proving editor autosave, draft and publish.",
  status: "published",
  author: { id: "u-showcase", name: "KebuGram Culture", isVerified: true },
  updatedAt: "2026-08-17T11:30:00.000Z",
  isShowcase: true,
};
