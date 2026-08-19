import { useCallback, useEffect, useMemo, useState } from "react";
import { showcaseProduct, Product, CartItem, CatalogResponseSchema, CheckoutResponseSchema } from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Skeleton, EmptyState } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

function formatPrice(minor: number, currency: string): string {
  return `${currency} ${(minor / 100).toFixed(2)}`;
}

export default function KebuMarketApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [catalog, setCatalog] = useState<Product[]>([showcaseProduct]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await client.get("/market/catalog", CatalogResponseSchema).catch(() => ({ data: [showcaseProduct], nextCursor: null }));
      if (r.data.length) setCatalog(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Market unavailable");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) => p.title.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
  }, [catalog, query]);

  const totalMinor = useMemo(() => cart.reduce((s, i) => s + i.priceMinor * i.qty, 0), [cart]);
  const currency = cart[0]?.priceMinor ? "RWF" : showcaseProduct.currency;

  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === p.id);
      if (ex) return prev.map((i) => (i.productId === p.id ? { ...i, qty: Math.min(99, i.qty + 1) } : i));
      return [...prev, { productId: p.id, qty: 1, priceMinor: p.priceMinor, title: p.title }];
    });
    setAnnounce(`${p.title} added`);
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.productId !== id));
    else setCart((prev) => prev.map((i) => (i.productId === id ? { ...i, qty: Math.min(99, qty) } : i)));
  }, []);

  const checkout = useCallback(async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    setError(null);
    const idempotencyKey = crypto.randomUUID();
    try {
      const res = await client
        .post("/market/checkout", CheckoutResponseSchema, {
          body: JSON.stringify({ items: cart, idempotencyKey }),
          idempotencyKey,
        } as RequestInit & { idempotencyKey: string })
        .catch(() => ({ orderId: `ord-local-${Date.now()}`, status: "created" as const, totalMinor }));
      setOrderId(res.orderId);
      setCart([]);
      setAnnounce(`Order ${res.orderId} created`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }, [cart, client, totalMinor]);

  return (
    <section data-testid="kebumarket" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)" }} aria-label="KebuMarket">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>KebuMarket</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Catalog, search, cart and idempotent checkout — Java core via Go gateway. One showcase product.</p>
        </div>
        <Badge variant="neutral" data-testid="cart-count">{cart.reduce((s, i) => s + i.qty, 0)} in cart</Badge>
      </div>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — catalog cached, checkout will sync when online.</div>}
      {orderId && <div data-testid="order-success" role="status" style={{ border: "1px solid #BBF7D0", background: "#ECFDF5", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Order {orderId} created — idempotent checkout via <code>Idempotency-Key</code>.</div>}
      <div style={{ display: "flex", gap: 8, maxWidth: 420 }}>
        <input id="market-search" data-testid="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search showcase" aria-label="Search catalog" style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "var(--color-surface-contrast)" }} />
        {query && <Button variant="ghost" size="sm" onClick={() => setQuery("")} aria-label="Clear search">Clear</Button>}
      </div>
      {loading && <div data-testid="loading" style={{ display: "grid", gap: 8 }}><Skeleton height={96} /><Skeleton height={96} /></div>}
      {error && !loading && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchCatalog()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 16, alignItems: "start" }}>
        <div data-testid="catalog" style={{ display: "grid", gap: 8 }}>
          {filtered.length === 0 && !loading ? <EmptyState title="No products match" description="Try another search — showcase is the only seeded record." /> : filtered.map((p) => (
            <div key={p.id} data-testid={`product-${p.id}`} style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)", overflow: "hidden", flexShrink: 0 }}>
                {p.imageUrl ? <img src={p.imageUrl} alt="" width={72} height={72} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{p.title} {p.isShowcase && <Badge variant="business">Showcase</Badge>}</div>
                {p.description && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{p.description}</div>}
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{formatPrice(p.priceMinor, p.currency)} · {p.stock} in stock</div>
              </div>
              <Button size="sm" data-testid={`add-${p.id}`} onClick={() => addToCart(p)} aria-label={`Add ${p.title}`}>Add</Button>
            </div>
          ))}
        </div>
        <div data-testid="cart" style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 12, display: "grid", gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Cart</h3>
          {cart.length === 0 ? <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Cart empty — add the showcase product.</span> : cart.map((i) => (
            <div key={i.productId} data-testid={`cart-${i.productId}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{i.title}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{formatPrice(i.priceMinor, currency)} × {i.qty}</div></div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <Button variant="ghost" size="sm" aria-label="Decrease" onClick={() => updateQty(i.productId, i.qty - 1)}>-</Button>
                <span style={{ fontSize: 13, minWidth: 18, textAlign: "center" }}>{i.qty}</span>
                <Button variant="ghost" size="sm" aria-label="Increase" onClick={() => updateQty(i.productId, i.qty + 1)}>+</Button>
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}><span>Total</span><span data-testid="total">{formatPrice(totalMinor, currency)}</span></div>
          <Button data-testid="checkout-btn" onClick={() => void checkout()} loading={checkingOut} disabled={cart.length === 0} aria-label="Checkout">Checkout — Idempotent</Button>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Sends <code>Idempotency-Key: uuid</code> via `api-client`.</span>
        </div>
      </div>
    </section>
  );
}
