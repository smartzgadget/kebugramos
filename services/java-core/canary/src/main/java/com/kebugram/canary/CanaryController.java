package com.kebugram.canary;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/canary")
public class CanaryController {
  private final CanaryService svc = new CanaryService();

  @GetMapping("/status")
  public Map<String, CanaryService.Rollout> status() { return svc.status(); }

  @PostMapping("/promote")
  public ResponseEntity<Map<String, CanaryService.Rollout>> promote(@RequestBody PromoteBody b) {
    try { return ResponseEntity.ok(svc.promote(b.mfe(), b.toPercent())); }
    catch (CanaryService.SloBreached e) { return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build(); }
  }

  @PostMapping("/rollback")
  public Map<String, CanaryService.Rollout> rollback(@RequestBody RollbackBody b) { return svc.rollback(b.mfe(), b.reason()); }

  public record PromoteBody(String mfe, int toPercent) {}
  public record RollbackBody(String mfe, String reason) {}
}
