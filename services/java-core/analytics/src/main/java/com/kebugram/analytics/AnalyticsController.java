package com.kebugram.analytics;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {
  private final AnalyticsService svc = new AnalyticsService();

  @GetMapping("/dashboard")
  public AnalyticsService.Dashboard dashboard() { return svc.getDashboard(); }

  @PostMapping("/event")
  public Map<String, Object> event(@RequestBody Map<String, Object> body) {
    String name = (String) body.getOrDefault("name", "");
    Object v = body.get("value");
    double value = v instanceof Number n ? n.doubleValue() : 0;
    svc.emit(name, value);
    return Map.of("acked", true, "name", name, "value", value);
  }
}
