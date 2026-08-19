import { LoginSchema } from "./contracts";
import { Button, Input } from "@kebugram/design-system";

export function LoginForm({ onSubmit }: { onSubmit: (v: unknown) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const raw = { email: String(fd.get("email")), password: String(fd.get("password")) };
        const parsed = LoginSchema.safeParse(raw);
        if (!parsed.success) return alert(parsed.error.message);
        onSubmit(parsed.data);
      }}
      style={{ display: "grid", gap: 12, maxWidth: 360 }}
    >
      <Input name="email" placeholder="Email" aria-label="Email" required />
      <Input name="password" type="password" placeholder="Password" aria-label="Password" required />
      <Button type="submit">Sign in</Button>
    </form>
  );
}

export default function AuthApp() {
  return (
    <section>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Sign in to KebuGram</h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Sovereign identity — JWT 15m access, httpOnly refresh rotation (server).</p>
      <LoginForm onSubmit={() => {}} />
    </section>
  );
}
