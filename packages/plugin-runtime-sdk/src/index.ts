import { z } from "zod";

export const PermissionSchema = z.enum(["geo:coarse", "geo:precise", "pay:intent", "ads:read", "storage:local"]);
export const PluginManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(40),
  version: z.string().min(1),
  permissions: z.array(PermissionSchema),
  csp: z.string().min(1),
  entryUrl: z.string().url(),
  isShowcase: z.boolean().optional(),
});
export type PluginManifest = z.infer<typeof PluginManifestSchema>;

export const showcasePlugin: PluginManifest = {
  id: "kebu-loyalty",
  name: "kebu-loyalty",
  version: "0.3.0",
  permissions: ["geo:coarse", "pay:intent"],
  csp: "default-src 'self' https://cdn.kebugram.com; script-src 'self';",
  entryUrl: "https://cdn.kebugram.com/plugins/kebu-loyalty/index.js",
  isShowcase: true,
};

export function sandboxedAttributes(manifest: PluginManifest): { sandbox: string; csp: string; allow: string } {
  return {
    sandbox: "allow-scripts allow-same-origin",
    csp: manifest.csp,
    allow: manifest.permissions.includes("geo:precise") ? "geolocation" : "",
  };
}

export function canAccess(permission: z.infer<typeof PermissionSchema>, manifest: PluginManifest): boolean {
  return manifest.permissions.includes(permission);
}
