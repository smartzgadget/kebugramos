package com.kebugram.kebutube;
import java.time.Instant;
import java.util.*;

// Java truth — video + presigned via Go gateway, transcoding status polls Python
public class TubeService {
  public record Video(String id, String title, String status, int progress, String url) {}
  private final Map<String, Video> videos = new LinkedHashMap<>();
  public TubeService() { videos.put("vid-showcase-1", new Video("vid-showcase-1", "Sovereign Africa — Cameroon First", "ready", 100, "https://cdn.kebugram.com/showcase/cameroon.mp4")); }
  public record Presigned(String uploadUrl, String objectKey, String expiresAt) {}
  public Presigned presigned(String fileName, String contentType, long size) {
    String key = "tube/" + System.nanoTime() + "-" + fileName;
    return new Presigned("https://upload.kebugram.com/" + key + "?presigned=1", key, Instant.now().plusSeconds(900).toString());
  }
  public Map<String,Object> status(String id) {
    Video v = videos.get(id);
    if (v==null) throw new NoSuchElementException();
    return Map.of("videoId", v.id(), "status", v.status(), "progress", v.progress(), "error", "");
  }
  public Map<String,Object> feed() { return Map.of("data", List.copyOf(videos.values()), "nextCursor", ""); }
}
