import * as React from "react";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <React.Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>{children}</React.Suspense>;
}

export function AuthGuard({ children, isAuthed = false }: { children: React.ReactNode; isAuthed?: boolean }) {
  if (!isAuthed) return <div style={{ padding: 24, border: "1px dashed var(--color-border)", borderRadius: 12 }}>Sign in to continue — AuthGuard blocked unauthenticated access.</div>;
  return <>{children}</>;
}

export function ConsentBanner({ onAccept }: { onAccept?: () => void }) {
  return (
    <div role="dialog" aria-label="Consent" style={{ position: "fixed", bottom: 16, left: 16, right: 16, background: "var(--color-surface-contrast)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
      <span style={{ flex: 1, fontSize: 14 }}>We use essential cookies. Analytics and ads require your consent.</span>
      <button onClick={onAccept} style={{ background: "var(--color-sovereign-900)", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 600 }}>Accept</button>
    </div>
  );
}

export const GeoContext = React.createContext<{ region: string; setRegion: (r: string) => void } | null>(null);

export function PluginGuard({ children, allowed = true }: { children: React.ReactNode; allowed?: boolean }) {
  if (!allowed) return <div style={{ padding: 24 }}>Plugin blocked by permission manifest.</div>;
  return <>{children}</>;
}
