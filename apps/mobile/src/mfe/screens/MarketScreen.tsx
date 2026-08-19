import React from "react";
import { Text, View } from "react-native";

const SHOWCASE = { id: "prod-1", title: "Kebu Coffee — Cameroon Highlands", priceMinor: 450000, currency: "XAF", stock: 42 };

export default function MarketScreen() {
  return (
    <View testID="mfe-kebumarket" style={{ flex: 1, padding: 12, gap: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#0B3A2E" }}>KebuMarket</Text>
      <Text style={{ fontSize: 12, color: "#5B6B65" }}>Dynamic MFE · JS split · deep link kebugram://market/1</Text>
      <View style={{ borderWidth: 1, borderColor: "#DDE4E1", borderRadius: 12, backgroundColor: "white", padding: 12, gap: 6 }}>
        <Text style={{ fontWeight: "600", color: "#0B3A2E" }}>{SHOWCASE.title}</Text>
        <Text style={{ fontSize: 13, color: "#1A2E26" }}>{(SHOWCASE.priceMinor / 100).toLocaleString()} {SHOWCASE.currency} · stock {SHOWCASE.stock}</Text>
        <Text style={{ fontSize: 12, color: "#5B6B65" }}>Idempotency-Key via api-client · ledger XAF minor units</Text>
      </View>
    </View>
  );
}
