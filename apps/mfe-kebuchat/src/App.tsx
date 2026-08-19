import { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatRow } from "./contracts";

const showcase: ChatRow[] = [{ id: "1", title: "KebuStore Support", lastMessage: "Your order #4821 is out for delivery", unreadCount: 2, isBusiness: true, isVerified: true }];

export default function KebuChatApp() {
  const [selected, setSelected] = useState<string | undefined>("1");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", background: "white", minHeight: 480 }}>
      <div style={{ borderRight: "1px solid var(--color-border)", overflow: "auto" }}>
        <ChatList chats={showcase} selectedId={selected} onSelect={setSelected} />
        <div style={{ display: "flex", gap: 4, padding: 8, borderTop: "1px solid var(--color-border)", fontSize: 12, fontWeight: 600, justifyContent: "space-around" }}>
          <span>Chats</span><span>Calls</span><span>Business</span><span>Settings</span>
        </div>
      </div>
      <div style={{ padding: 16, display: "grid", placeItems: selected ? "start" : "center" }}>
        {selected ? <div><h3 style={{ margin: 0 }}>Chat {selected}</h3><p style={{ color: "var(--color-text-secondary)" }}>Messages render here — realtime via Go gateway + `realtime-sdk`.</p></div> : <div style={{ color: "var(--color-text-secondary)" }}>Select a chat</div>}
      </div>
    </div>
  );
}
