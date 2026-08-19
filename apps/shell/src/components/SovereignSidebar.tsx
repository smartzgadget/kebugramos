const nav = [
  { label: "KebuChat", href: "/chat" },
  { label: "KebuTube", href: "/tube" },
  { label: "KebuMarket", href: "/market" },
  { label: "KebuCommunity", href: "/community" },
  { label: "KebuPay", href: "/pay" },
  { label: "KebuBook", href: "/book" },
  { label: "Profile", href: "/profile" },
  { label: "Ad Manager", href: "/ads" },
  { label: "Blogs", href: "/blogs" },
  { label: "Help and Support", href: "/help" },
];

export function SovereignSidebar({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <aside className="shell__sidebar" aria-label="Primary">
      <div className="sidebar__brand">
        <span style={{ fontWeight: 800, letterSpacing: 0.5 }}>KebuGram</span>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }} aria-hidden>SO</span>
      </div>
      <div className="sidebar__search">
        <input placeholder="Search KebuGram" aria-label="Search KebuGram" />
      </div>
      <nav className="sidebar__nav" aria-label="Ecosystem">
        {nav.map((item) => {
          const active = currentPath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={active ? "active" : undefined}
              style={active ? { background: "rgba(255,255,255,0.12)" } : undefined}
            >
              <span className="nav__dot" aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: active ? "var(--color-accent-500)" : "rgba(255,255,255,0.5)" }} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
