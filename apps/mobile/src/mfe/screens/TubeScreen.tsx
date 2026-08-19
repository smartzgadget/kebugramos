import React from "react";
import { Text, View } from "react-native";

const SHOWCASE = { id: "vid-1", title: "Sovereign Africa — Cameroon First", channel: "KebuTube Official", views: "12.4k" };

export default function TubeScreen() {
  return (
    <View testID="mfe-kebutube" style={{ flex: 1, padding: 12, gap: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#0B3A2E" }}>KebuTube</Text>
      <Text style={{ fontSize: 12, color: "#5B6B65" }}>Dynamic MFE · JS split · deep link kebugram://tube/1</Text>
      <View style={{ borderWidth: 1, borderColor: "#DDE4E1", borderRadius: 12, backgroundColor: "white", padding: 12, gap: 6 }}>
        <View style={{ height: 96, borderRadius: 8, backgroundColor: "#0B3A2E", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "white", fontSize: 12 }}>▶ {SHOWCASE.title}</Text>
        </View>
        <Text style={{ fontWeight: "600", color: "#0B3A2E" }}>{SHOWCASE.title}</Text>
        <Text style={{ fontSize: 12, color: "#5B6B65" }}>{SHOWCASE.channel} · {SHOWCASE.views} views</Text>
      </View>
    </View>
  );
}
