import { z } from "zod";

export const ConsentSchema = z.object({ ads: z.boolean(), analytics: z.boolean(), location: z.boolean() });
export type Consent = z.infer<typeof ConsentSchema>;

export const PermissionManifestSchema = z.object({
  allowedHosts: z.array(z.string().min(1)),
  allowCookies: z.boolean(),
  allowGeolocation: z.boolean(),
  csp: z.string().min(1),
});
export type PermissionManifest = z.infer<typeof PermissionManifestSchema>;

export const showcaseManifest: PermissionManifest = {
  allowedHosts: ["example.kebugram.com", "partner.kebugram.com"],
  allowCookies: false,
  allowGeolocation: false,
  csp: "default-src 'self' https://example.kebugram.com; script-src 'none';",
};

export const showcaseUrl = "https://example.kebugram.com/showcase";
