import { ProfileSchema } from "./contracts";
import { Button, Input } from "@kebugram/design-system";

export default function ProfileApp() {
  return (
    <section style={{ maxWidth: 480 }}>
      <h2 style={{ fontWeight: 700 }}>Profile</h2>
      <form style={{ display: "grid", gap: 12, marginTop: 12 }} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget as HTMLFormElement); const raw = { displayName: String(fd.get("displayName")), bio: String(fd.get("bio")) }; const p = ProfileSchema.safeParse(raw); if (!p.success) return alert(p.error.message); }}>
        <Input name="displayName" placeholder="Display name" aria-label="Display name" />
        <Input name="bio" placeholder="Bio" aria-label="Bio" />
        <Button type="submit">Save profile</Button>
      </form>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 8 }}>Avatar upload via presigned URL (Go gateway) — wired in Phase 3.</p>
    </section>
  );
}
