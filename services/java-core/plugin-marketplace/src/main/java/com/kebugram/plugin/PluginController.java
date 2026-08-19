package com.kebugram.plugin;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/plugins")
public class PluginController {
  private final PluginService svc = new PluginService();

  @GetMapping
  public Map<String, Object> list() { return Map.of("data", svc.list()); }

  @PostMapping("/{id}/install")
  public Map<String, Object> install(@PathVariable String id) {
    boolean ok = svc.install(id);
    if (!ok) throw new RuntimeException("not found");
    return Map.of("installed", true, "id", id);
  }

  @PostMapping("/{id}/uninstall")
  public Map<String, Object> uninstall(@PathVariable String id) {
    svc.uninstall(id);
    return Map.of("installed", false, "id", id);
  }
}
