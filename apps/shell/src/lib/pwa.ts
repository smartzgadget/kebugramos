export function registerPwa(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function onOnlineChange(cb: (online: boolean) => void): () => void {
  const a = () => cb(true);
  const b = () => cb(false);
  window.addEventListener("online", a);
  window.addEventListener("offline", b);
  return () => {
    window.removeEventListener("online", a);
    window.removeEventListener("offline", b);
  };
}
