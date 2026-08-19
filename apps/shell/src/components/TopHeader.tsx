export function TopHeader({ unreadCount = 0, onMenuToggle }: { unreadCount?: number; onMenuToggle?: () => void }) {
  return (
    <header className="shell__header" aria-label="Top bar">
      <button aria-label="Open menu" onClick={onMenuToggle} style={{ display: "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 10px" }} className="header__menu">
        Menu
      </button>
      <div className="header__search">
        <input placeholder="Search" aria-label="Global search" />
      </div>
      <div className="header__actions">
        <button aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} style={{ position: "relative", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 600 }}>
          Notifications
          {unreadCount > 0 && <span aria-hidden style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: 999, background: "#E11D48" }} />}
        </button>
        <button aria-label="Settings" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 600 }}>Settings</button>
        <div className="avatar" aria-label="Profile" role="img">K</div>
      </div>
    </header>
  );
}
