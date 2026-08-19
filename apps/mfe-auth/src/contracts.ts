import { z } from "zod";

export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export type LoginInput = z.infer<typeof LoginSchema>;

export const OtpSchema = z.object({ email: z.string().email(), code: z.string().length(6) });

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({ id: z.string(), email: z.string().email(), displayName: z.string() }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
