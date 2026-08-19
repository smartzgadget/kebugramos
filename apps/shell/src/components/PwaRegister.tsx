"use client";
import { useEffect, useState } from "react";
import { registerPwa, onOnlineChange, isOnline } from "@/lib/pwa";

export function PwaRegister() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    registerPwa();
    setOnline(isOnline());
    return onOnlineChange(setOnline);
  }, []);
  if (online) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "#0B3A2E", color: "white", padding: "8px 14px", borderRadius: 999, fontSize: 12, fontFamily: "var(--font-sans)", border: "1px solid rgba(255,255,255,0.14)", zIndex: 50 }}>
      Offline · shell cached — reconnecting…
    </div>
  );
}
