import { useState } from "react";
import { Button, Input } from "@kebugram/design-system";

export default function AIChatApp() {
  const [q, setQ] = useState("");
  const [stream, setStream] = useState("");
  const ask = async () => {
    setStream("");
    // SSE proxy to Python AI: /api/ai/chat?query=...
    const res = await fetch(`/api/ai/chat?query=${encodeURIComponent(q)}`);
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setStream((s) => s + decoder.decode(value));
    }
  };
  return (
    <section style={{ maxWidth: 640, display: "grid", gap: 12 }}>
      <h3 style={{ margin: 0 }}>AI Chat</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Kebu AI" aria-label="Ask AI" style={{ flex: 1 }} />
        <Button onClick={ask}>Ask</Button>
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 16, minHeight: 120, whiteSpace: "pre-wrap" }}>{stream || "Streaming response appears here (Python AI proxy, guardrails enforced server-side)."}</div>
    </section>
  );
}
