import { useState } from "react";
import { Button, Input } from "@kebugram/design-system";

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  return (
    <div style={{ borderTop: "1px solid var(--color-border)", padding: 12, display: "grid", gap: 8, background: "white" }}>
      {typing && <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Typing…</span>}
      <div style={{ display: "flex", gap: 8 }}>
        <Input value={text} onChange={(e) => { setText(e.target.value); setTyping(e.target.value.length > 0); }} placeholder="Type a message" aria-label="Message" style={{ flex: 1 }} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onSend(text); setText(""); setTyping(false); } }} />
        <Button onClick={() => { if (text.trim()) { onSend(text); setText(""); setTyping(false); } }}>Send</Button>
      </div>
      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
        <span>Attach</span><span>Voice</span><span>Read receipts</span>
      </div>
    </div>
  );
}
