package com.kebugram.chat;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
// Java truth — chat rows, messages, presence. Go routes WS.
public class ChatService {
  public record ChatRow(String id, String title, String lastMessage, int unreadCount, boolean isBusiness, boolean isVerified) {}
  public record Message(String id, String chatId, String text, Instant at) {}
  private final Map<String, ChatRow> rows = new ConcurrentHashMap<>();
  private final Map<String, List<Message>> messages = new ConcurrentHashMap<>();
  public ChatService() {
    ChatRow showcase = new ChatRow("1", "KebuStore Support", "Your order #4821 is out for delivery", 2, true, true);
    rows.put(showcase.id(), showcase);
    messages.put(showcase.id(), new ArrayList<>(List.of(new Message("m-1", showcase.id(), showcase.lastMessage(), Instant.parse("2026-08-17T12:00:00.000Z")))));
  }
  public List<ChatRow> list() { return List.copyOf(rows.values()); }
  public List<Message> getMessages(String chatId) { return List.copyOf(messages.getOrDefault(chatId, List.of())); }
  public Message send(String chatId, String text) {
    Message m = new Message("m-" + System.nanoTime(), chatId, text, Instant.now());
    messages.computeIfAbsent(chatId, k -> Collections.synchronizedList(new ArrayList<>())).add(m);
    return m;
  }
}
