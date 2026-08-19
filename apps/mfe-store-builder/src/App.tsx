import { useCallback, useEffect, useMemo, useState } from "react";
import { showcaseStore, showcaseInventory, Store, InventoryItem, StoreSchema, InventoryItemSchema, InventoryResponseSchema, StoreResponseSchema } from "./contracts";
import { createClient } from "@kebugram/api-client";
import { Badge, Button, Input, Skeleton, EmptyState } from "@kebugram/design-system";

function getApiConfig() {
  const w = typeof window !== "undefined" ? (window as unknown as { __KEBUGRAM_CONFIG__?: { apiBase?: string } }) : undefined;
  return { apiBase: w?.__KEBUGRAM_CONFIG__?.apiBase ?? "/api" };
}

export default function StoreBuilderApp() {
  const client = useMemo(() => createClient(getApiConfig), []);
  const [store, setStore] = useState<Store>(showcaseStore);
  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [description, setDescription] = useState(store.description ?? "");
  const [inventory, setInventory] = useState<InventoryItem[]>(showcaseInventory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(store.status === "published");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("250.00");
  const [newItemStock, setNewItemStock] = useState("12");
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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await client.get(`/store/${store.id}`, StoreResponseSchema).catch(() => showcaseStore);
      setStore(s);
      setName(s.name);
      setSlug(s.slug);
      setDescription(s.description ?? "");
      setPublished(s.status === "published");
      const inv = await client.get(`/store/${store.id}/inventory`, InventoryResponseSchema).catch(() => ({ data: showcaseInventory }));
      if (inv.data.length) setInventory(inv.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Store unavailable");
    } finally {
      setLoading(false);
    }
  }, [client, store.id]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handlePublish = useCallback(async () => {
    const parsed = StoreSchema.safeParse({ id: store.id, name: name.trim(), slug: slug.trim(), description: description.trim() || undefined, status: "published" as const });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid store");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await client
        .post(`/store/${store.id}/publish`, StoreResponseSchema, { body: JSON.stringify(parsed.data) } as unknown as RequestInit)
        .catch(() => parsed.data as Store);
      setStore(saved);
      setPublished(saved.status === "published");
      setAnnounce("Store published");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }, [store.id, name, slug, description, client]);

  const handleAddItem = useCallback(async () => {
    const title = newItemTitle.trim();
    if (!title) return;
    const priceMinor = Math.round(parseFloat(newItemPrice || "0") * 100);
    const stock = parseInt(newItemStock || "0", 10);
    const item: InventoryItem = { id: `inv-local-${Date.now()}`, storeId: store.id, productId: `prod-${Date.now()}`, title, priceMinor: Number.isFinite(priceMinor) ? priceMinor : 0, currency: "RWF", stock: Number.isFinite(stock) ? stock : 0 };
    const parsed = InventoryItemSchema.safeParse(item);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid item");
      return;
    }
    setInventory((prev) => [parsed.data, ...prev]);
    setNewItemTitle("");
    setAnnounce("Item added");
    void client.post(`/store/${store.id}/inventory`, InventoryItemSchema, { body: JSON.stringify(parsed.data) } as unknown as RequestInit).catch(() => undefined);
  }, [newItemTitle, newItemPrice, newItemStock, store.id, client]);

  const removeItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
    void client.post(`/store/${store.id}/inventory/${id}/delete`, StoreResponseSchema, {} as unknown as RequestInit).catch(() => undefined);
  }, [store.id, client]);

  return (
    <section data-testid="store-builder" style={{ display: "grid", gap: 16, fontFamily: "var(--font-sans)", maxWidth: 680 }} aria-label="Store Builder">
      <div aria-live="polite" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>{announce}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>Store Builder</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 560 }}>Seller storefront builder — edit slug, description, inventory and publish. One showcase store.</p>
      </div>
      {isOffline && <div data-testid="offline-banner" role="status" style={{ border: "1px solid var(--color-border)", background: "#FFF9DB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Offline — edits cached, publish will sync when online.</div>}
      {published && <div data-testid="published" role="status" style={{ border: "1px solid #BBF7D0", background: "#ECFDF5", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>Published — <code>/s/{slug}</code> live via Java core. <Badge variant="verified">Published</Badge></div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{store.isShowcase && <Badge variant="business">Showcase</Badge>}<Badge variant={published ? "verified" : "neutral"}>{published ? "published" : "draft"}</Badge></div>
      {loading && <div data-testid="loading" style={{ display: "grid", gap: 8 }}><Skeleton height={24} /><Skeleton height={56} /></div>}
      {error && <div data-testid="error" style={{ border: "1px solid #FECACA", background: "#FFF1F2", borderRadius: 8, padding: 12, fontSize: 13 }}>{error} — <button type="button" data-testid="retry-btn" onClick={() => void fetchAll()} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13 }}>Retry</button></div>}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 10 }}>
        <label htmlFor="store-name" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Store name</label>
        <Input id="store-name" data-testid="store-name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Store name" maxLength={80} />
        <label htmlFor="store-slug" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Slug — <code style={{ fontSize: 11 }}>/s/{slug || "…"}</code></label>
        <Input id="store-slug" data-testid="store-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} aria-label="Slug" maxLength={40} />
        <label htmlFor="store-desc" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Description</label>
        <textarea id="store-desc" data-testid="store-desc" value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Description" maxLength={500} rows={3} placeholder="Describe your storefront" style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, resize: "vertical", fontFamily: "inherit" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-secondary)" }}><span>{description.length}/500</span><span>{slug.length}/40</span></div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={() => void fetchAll()} aria-label="Reset">Reset</Button>
          <Button data-testid="publish-btn" size="sm" onClick={() => void handlePublish()} loading={saving} disabled={!name.trim() || !slug.trim()} aria-label="Publish store">Publish store</Button>
        </div>
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, background: "white", padding: 14, display: "grid", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Inventory</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ flex: 1, minWidth: 160, display: "grid", gap: 4 }}><label htmlFor="inv-title" style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Title</label><Input id="inv-title" data-testid="inv-title" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} placeholder="Product title" aria-label="Product title" maxLength={80} /></div>
          <div style={{ width: 110, display: "grid", gap: 4 }}><label htmlFor="inv-price" style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Price (RWF)</label><Input id="inv-price" data-testid="inv-price" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} aria-label="Price" /></div>
          <div style={{ width: 90, display: "grid", gap: 4 }}><label htmlFor="inv-stock" style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Stock</label><Input id="inv-stock" data-testid="inv-stock" value={newItemStock} onChange={(e) => setNewItemStock(e.target.value)} aria-label="Stock" /></div>
          <Button size="sm" data-testid="add-item" onClick={() => void handleAddItem()} disabled={!newItemTitle.trim()} aria-label="Add item">Add</Button>
        </div>
        <div data-testid="inventory" style={{ display: "grid", gap: 8 }}>
          {inventory.length === 0 ? <EmptyState title="No inventory" description="Add the showcase item to prove publish flow." /> : inventory.map((it) => (
            <div key={it.id} data-testid={`item-${it.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", borderTop: "1px solid var(--color-surface)", paddingTop: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{it.title}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>RWF {(it.priceMinor / 100).toFixed(2)} · {it.stock} in stock</div></div>
              <Button variant="ghost" size="sm" aria-label={`Remove ${it.title}`} onClick={() => removeItem(it.id)}>Remove</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
