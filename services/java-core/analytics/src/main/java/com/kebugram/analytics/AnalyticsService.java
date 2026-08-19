package com.kebugram.analytics;

import java.time.Instant;
import java.util.List;

// Java orchestration — consumer + business dashboards.
// Python scores/intelligence, Java decides and records. One showcase per side.
public class AnalyticsService {
  public record Metric(String name, double value, String unit, String trend) {}
  public record Dashboard(List<Metric> consumer, List<Metric> business, String at, boolean isShowcase) {}

  public Dashboard getDashboard() {
    return new Dashboard(
      List.of(
        new Metric("Reach", 12400, "views", "up"),
        new Metric("Followers", 842, "people", "up")
      ),
      List.of(
        new Metric("Revenue", 84000, "RWF", "up"),
        new Metric("Orders", 128, "orders", "flat")
      ),
      Instant.now().toString(),
      true
    );
  }

  public boolean emit(String name, double value) {
    // Otel emit stub — real: push to Grafana via Otel collector
    return name != null && !name.isBlank();
  }
}
