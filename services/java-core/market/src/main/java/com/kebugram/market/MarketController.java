package com.kebugram.market;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class MarketController {
  private final MarketService svc = new MarketService();

  @GetMapping("/market/catalog")
  public MarketService.CatalogResponse catalog(@RequestParam(required = false) String cursor) { return svc.catalog(cursor); }

  @PostMapping("/market/checkout")
  public ResponseEntity<MarketService.CheckoutResponse> checkout(@RequestHeader("Idempotency-Key") String key, @RequestBody CheckoutBody body) {
    if (!key.equals(body.idempotencyKey())) return ResponseEntity.badRequest().build();
    return ResponseEntity.ok(svc.checkout(body.items(), key));
  }

  @GetMapping("/store/{id}")
  public MarketService.Store store(@PathVariable String id) { return svc.getStore(id); }

  @GetMapping("/store/{id}/inventory")
  public MarketService.InventoryResponse inv(@PathVariable String id) { return svc.inventory(id); }

  public record CheckoutBody(List<MarketService.CartItem> items, String idempotencyKey) {}
}
