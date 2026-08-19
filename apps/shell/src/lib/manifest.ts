import { z } from "zod";

export const MfeManifestSchema = z.object({
  mfes: z.record(
    z.object({
      version: z.string(),
      url: z.string().url(),
      integrity: z.string().optional(),
      disabled: z.boolean().optional(),
    })
  ),
  rollout: z.record(z.object({ percent: z.number().min(0).max(100), regions: z.array(z.string()).optional() })).optional(),
});

export type MfeManifest = z.infer<typeof MfeManifestSchema>;

let cached: MfeManifest | null = null;

export async function loadManifest(): Promise<MfeManifest> {
  if (cached) return cached;
  const res = await fetch("/mfe-manifest.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
  const json = await res.json();
  const parsed = MfeManifestSchema.parse(json);
  cached = parsed;
  return parsed;
}

export function isMfeEnabled(manifest: MfeManifest, name: string): boolean {
  const entry = manifest.mfes[name];
  if (!entry || entry.disabled) return false;
  const rollout = manifest.rollout?.[name];
  if (!rollout) return true;
  return rollout.percent > 0;
}
