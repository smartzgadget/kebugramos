package com.kebugram.market;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// Java truth — catalog (showcase prod), store + inventory, idempotent checkout
public class MarketService {
  private final Product showcase = new Product("prod-showcase-1", "KebuCraft Basket — Handwoven", "One showcase product proving catalog → search → cart → idempotent checkout.", 25000, "RWF", "https://cdn.kebugram.com/showcase/basket.jpg", 12, true);
  private final Store store = new Store("store-showcase-1", "KebuCraft Hub", "kebucraft-hub", "One showcase storefront — inventory + publish via Java core.", "published", true);
  private final InventoryItem inv = new InventoryItem("inv-1", "store-showcase-1", "prod-showcase-1", "KebuCraft Basket", 25000, "RWF", 12);
  private final Map<String, CheckoutResponse> byKey = new ConcurrentHashMap<>();

  public CatalogResponse catalog(String cursor) { return new CatalogResponse(List.of(showcase), null); }
  public Store getStore(String id) { if (!id.equals(store.id()) && !id.equals(store.slug())) throw new NoSuchElementException(); return store; }
  public InventoryResponse inventory(String storeId) { return new InventoryResponse(List.of(inv)); }

  public synchronized CheckoutResponse checkout(List<CartItem> items, String idempotencyKey) {
    CheckoutResponse existing = byKey.get(idempotencyKey);
    if (existing != null) return existing;
    long total = items.stream().mapToLong(i -> (long) i.priceMinor() * i.qty()).sum();
    CheckoutResponse r = new CheckoutResponse("ord-" + System.nanoTime(), "created", total);
    byKey.put(idempotencyKey, r);
    return r;
  }

  public record Product(String id, String title, String description, long priceMinor, String currency, String imageUrl, int stock, boolean isShowcase) {}
  public record CatalogResponse(List<Product> data, String nextCursor) {}
  public record CartItem(String productId, int qty, long priceMinor, String title) {}
  public record Store(String id, String name, String slug, String description, String status, boolean isShowcase) {}
  public record InventoryItem(String id, String storeId, String productId, String title, long priceMinor, String currency, int stock) {}
  public record InventoryResponse(List<InventoryItem> data) {}
  public record CheckoutResponse(String orderId, String status, long totalMinor) {}
}
