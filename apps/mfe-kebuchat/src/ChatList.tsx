import { ChatRow } from "./contracts";
import { Badge } from "@kebugram/design-system";

export function ChatList({ chats, onSelect, selectedId }: { chats: ChatRow[]; onSelect: (id: string) => void; selectedId?: string }) {
  return (
    <div style={{ display: "grid", gap: 2 }}>
      <div style={{ padding: "8px 12px", display: "flex", gap: 8, overflowX: "auto" }}>
        {["All", "Unread", "Business", "Groups"].map((c) => (
          <span key={c} style={{ border: "1px solid var(--color-border)", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{c}</span>
        ))}
      </div>
      <input placeholder="Search chats" aria-label="Search chats" style={{ margin: "0 12px", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 10px" }} />
      {chats.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "none", background: selectedId === c.id ? "#EEF4F1" : "white", textAlign: "left", cursor: "pointer", borderBottom: "1px solid #F0F2F1" }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--color-sovereign-900)", display: "grid", placeItems: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>{c.title[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
              {c.isBusiness && <Badge variant="business">Business</Badge>}
              {c.isVerified && <Badge variant="verified">Verified</Badge>}
            </div>
            <div style={{ color: "var(--color-text-secondary)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage}</div>
          </div>
          {c.unreadCount > 0 && <span style={{ background: "var(--color-sovereign-900)", color: "white", borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{c.unreadCount}</span>}
        </button>
      ))}
    </div>
  );
}
