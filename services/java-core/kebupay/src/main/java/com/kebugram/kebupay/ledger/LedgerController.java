package com.kebugram.kebupay.ledger;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pay")
public class LedgerController {
  private final LedgerService svc = new LedgerService();

  @GetMapping("/ledger")
  public LedgerService.LedgerResponse ledger() { return svc.getLedger(); }

  @PostMapping("/p2p")
  public ResponseEntity<LedgerService.LedgerResponse> p2p(@RequestHeader("Idempotency-Key") String key, @RequestBody P2PRequest req) {
    if (!key.equals(req.idempotencyKey())) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    try {
      return ResponseEntity.ok(svc.p2p(req.toHandle(), req.amountMinor(), req.currency(), key));
    } catch (LedgerService.IdempotencyConflict e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
  }
  public record P2PRequest(String toHandle, long amountMinor, String currency, String idempotencyKey) {}
}
