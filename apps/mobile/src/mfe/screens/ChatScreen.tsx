import React from "react";
import { FlatList, Text, View } from "react-native";

// Production showcase — one conversation; WS via go-gateway /v1/chat, REST fallback api-client
const SHOWCASE = { id: "conv-1", title: "KebuGram Council", lastMessage: "Sovereign stack: Java truth · Go speed · Python intelligence.", unread: 1 };

export default function ChatScreen() {
  return (
    <View testID="mfe-kebuchat" style={{ flex: 1, padding: 12, gap: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#0B3A2E" }}>KebuChat</Text>
      <Text style={{ fontSize: 12, color: "#5B6B65" }}>Dynamic MFE · JS split · deep link kebugram://chat/1</Text>
      <View style={{ borderWidth: 1, borderColor: "#DDE4E1", borderRadius: 12, backgroundColor: "white", padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: "600", color: "#0B3A2E" }}>{SHOWCASE.title}</Text>
        <Text style={{ fontSize: 13, color: "#1A2E26" }}>{SHOWCASE.lastMessage}</Text>
        <FlatList data={[SHOWCASE]} keyExtractor={(i) => i.id} renderItem={({ item }) => <Text style={{ fontSize: 12, color: "#5B6B65" }}>{item.id} · unread {item.unread}</Text>} />
      </View>
    </View>
  );
}
