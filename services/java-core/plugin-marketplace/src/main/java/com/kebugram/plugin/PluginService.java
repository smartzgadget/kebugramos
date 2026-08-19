package com.kebugram.plugin;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// Java registry — plugin truth, permissions, CSP. Partner adapters versioned.
// Sandbox: iframe allow-scripts+allow-same-origin, trusted MF remote only if signed.
public class PluginService {
  public record PluginManifest(String id, String name, String version, List<String> permissions, String csp, String entryUrl, boolean isShowcase) {}

  private final Map<String, PluginManifest> registry = new ConcurrentHashMap<>();
  private final Set<String> installed = ConcurrentHashMap.newKeySet();

  public PluginService() {
    PluginManifest showcase = new PluginManifest("kebu-loyalty", "kebu-loyalty", "0.3.0", List.of("geo:coarse", "pay:intent"), "default-src 'self' https://cdn.kebugram.com; script-src 'self';", "https://cdn.kebugram.com/plugins/kebu-loyalty/index.js", true);
    registry.put(showcase.id(), showcase);
  }

  public List<PluginManifest> list() { return List.copyOf(registry.values()); }
  public Optional<PluginManifest> get(String id) { return Optional.ofNullable(registry.get(id)); }
  public boolean install(String id) {
    if (!registry.containsKey(id)) return false;
    installed.add(id);
    return true;
  }
  public boolean uninstall(String id) { return installed.remove(id); }
  public boolean isInstalled(String id) { return installed.contains(id); }
  public boolean canAccess(String id, String permission) {
    PluginManifest m = registry.get(id);
    return m != null && m.permissions().contains(permission);
  }
  public String sandboxedAttributes(String id) {
    PluginManifest m = registry.get(id);
    if (m == null) return "";
    return "sandbox=\"allow-scripts allow-same-origin\" csp=\"" + m.csp() + "\"";
  }
}
