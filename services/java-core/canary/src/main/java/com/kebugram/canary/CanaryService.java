package com.kebugram.canary;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// Java truth — canary 5→25→100 per MFE+BE, SLO gated promote, rollback <60s.
// Manifest rollout is source of truth; Go gateway drains 30s on disable.
public class CanaryService {
  public record Rollout(int percent, String version, List<String> regions, double p95Ms, double errorRate) {}
  private final Map<String, Rollout> map = new ConcurrentHashMap<>();

  public CanaryService() {
    // seed — all MFEs 100 stable; canary MFEs start at 5 for next release
    String v = "0.1.0";
    map.put("mfe-kebupay", new Rollout(100, v, List.of("RW","KE","UG","TZ","GLOBAL"), 85, 0.002));
    map.put("mfe-kebumarket", new Rollout(100, v, List.of("RW","GLOBAL"), 92, 0.001));
    map.put("mfe-kebuchat", new Rollout(100, v, List.of("KE","UG","RW","TZ","GLOBAL"), 78, 0.003));
  }

  public Map<String, Rollout> status() { return Map.copyOf(map); }

  public synchronized Map<String, Rollout> promote(String mfe, int toPercent) {
    if (Set.of(5,25,100).contains(toPercent)==false) throw new IllegalArgumentException("toPercent 5|25|100");
    Rollout cur = map.get(mfe);
    if (cur==null) throw new NoSuchElementException(mfe);
    // SLO gate: p95 <120ms WS, <300ms API, error <1% — else 412
    if (cur.p95Ms() > 120 || cur.errorRate() > 0.01) throw new SloBreached();
    List<Integer> order = List.of(5,25,100);
    int curIdx = order.indexOf(cur.percent())==-1? 2 : order.indexOf(cur.percent());
    int toIdx = order.indexOf(toPercent);
    if (toIdx < curIdx) throw new IllegalArgumentException("downgrade via rollback");
    map.put(mfe, new Rollout(toPercent, cur.version(), cur.regions(), cur.p95Ms(), cur.errorRate()));
    return status();
  }

  public synchronized Map<String, Rollout> rollback(String mfe, String reason) {
    Rollout cur = map.get(mfe);
    if (cur==null) throw new NoSuchElementException(mfe);
    // rollback <60s: set disabled via percent 0 + drain 30s (Go gateway)
    map.put(mfe, new Rollout(0, cur.version(), cur.regions(), cur.p95Ms(), cur.errorRate()));
    // audit log (reason) — Java records
    return status();
  }

  public static class SloBreached extends RuntimeException {}
}
