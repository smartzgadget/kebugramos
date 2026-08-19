package com.kebugram.kebupay.ledger;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// Java truth — ledger + Idempotency-Key store. One showcase entry seeded.
// Go routes, Python scores — Java decides and records.
public class LedgerService {
  private final Map<String, LedgerEntry> byIdempotency = new ConcurrentHashMap<>();
  private final List<LedgerEntry> ledger = Collections.synchronizedList(new ArrayList<>());
  private long balanceMinor = 1_250_000; // XAF/RWF showcase

  public LedgerService() {
    LedgerEntry showcase = new LedgerEntry("le-1", Instant.parse("2026-08-17T12:00:00.000Z"), -25000, "RWF", "KebuCraft Hub", "00000000-0000-4000-a000-000000000001", "posted");
    ledger.add(showcase);
    byIdempotency.put(showcase.idempotencyKey(), showcase);
    balanceMinor += showcase.amountMinor();
  }

  public synchronized LedgerResponse getLedger() { return new LedgerResponse(List.copyOf(ledger), balanceMinor); }

  public synchronized LedgerResponse p2p(String toHandle, long amountMinor, String currency, String idempotencyKey) {
    LedgerEntry existing = byIdempotency.get(idempotencyKey);
    if (existing != null) {
      if (!existing.counterparty().equals(toHandle) || existing.amountMinor() != -amountMinor) throw new IdempotencyConflict();
      return getLedger();
    }
    if (amountMinor <= 0) throw new IllegalArgumentException("amountMinor positive");
    LedgerEntry e = new LedgerEntry("le-" + System.nanoTime(), Instant.now(), -amountMinor, currency, toHandle, idempotencyKey, "posted");
    ledger.add(0, e);
    byIdempotency.put(idempotencyKey, e);
    balanceMinor -= amountMinor;
    // audit: signed webhook emitted via go-gateway (server-only secret)
    return getLedger();
  }

  public record LedgerResponse(List<LedgerEntry> data, long balanceMinor) {}
  public static class IdempotencyConflict extends RuntimeException {}
}
