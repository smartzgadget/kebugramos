package com.kebugram.community;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

// Java truth — groups + feed + RBAC moderation queue
public class CommunityService {
  public record Group(String id, String name, String handle, String description, int memberCount, boolean isJoined) {}
  public record Post(String id, String groupId, String authorId, String authorName, String body, Instant createdAt, String moderationStatus) {}

  private final List<Group> groups = List.of(new Group("g-showcase-1", "Heritage Circles", "heritage-circles", "One showcase group proving groups → feed → moderation queue (RBAC).", 1240, true));
  private final CopyOnWriteArrayList<Post> posts = new CopyOnWriteArrayList<>(List.of(
    new Post("p-showcase-1", "g-showcase-1", "u-showcase", "Amina Bekele", "Welcome to KebuCommunity — one showcase post.", Instant.parse("2026-08-17T10:00:00.000Z"), "approved"),
    new Post("p-showcase-pending-1", "g-showcase-1", "u-showcase-2", "Dawit Kebede", "Pending review post", Instant.parse("2026-08-17T10:30:00.000Z"), "pending")
  ));

  public List<Group> groups() { return groups; }
  public List<Post> feed(String groupId) { return posts.stream().filter(p -> p.groupId().equals(groupId) && p.moderationStatus().equals("approved")).toList(); }
  public List<Post> queue(String role) { if (!Set.of("moderator","admin").contains(role)) throw new SecurityException("403"); return posts.stream().filter(p -> p.moderationStatus().equals("pending")).toList(); }
  public Post moderate(String postId, String action) {
    for (int i=0;i<posts.size();i++) {
      Post p = posts.get(i);
      if (p.id().equals(postId)) { Post u = new Post(p.id(), p.groupId(), p.authorId(), p.authorName(), p.body(), p.createdAt(), action.equals("approve")?"approved":"rejected"); posts.set(i,u); return u; }
    }
    throw new NoSuchElementException();
  }
  public Post create(String groupId, String body, String authorId) {
    Post p = new Post("p-"+System.nanoTime(), groupId, authorId, "Author", body, Instant.now(), "pending");
    posts.add(p); return p;
  }
}
