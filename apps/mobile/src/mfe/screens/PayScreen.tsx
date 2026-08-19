import React from "react";
import { Text, View } from "react-native";

const SHOWCASE = { balanceMinor: 1250000, currency: "XAF", lastTx: { id: "tx-1", amountMinor: 50000, status: "settled" } };

export default function PayScreen() {
  return (
    <View testID="mfe-kebupay" style={{ flex: 1, padding: 12, gap: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#0B3A2E" }}>KebuPay</Text>
      <Text style={{ fontSize: 12, color: "#5B6B65" }}>Dynamic MFE · JS split · deep link kebugram://pay</Text>
      <View style={{ borderWidth: 1, borderColor: "#DDE4E1", borderRadius: 12, backgroundColor: "white", padding: 12, gap: 6 }}>
        <Text style={{ fontWeight: "600", color: "#0B3A2E" }}>Balance {(SHOWCASE.balanceMinor / 100).toLocaleString()} {SHOWCASE.currency}</Text>
        <Text style={{ fontSize: 12, color: "#5B6B65" }}>Last {SHOWCASE.lastTx.id} · {(SHOWCASE.lastTx.amountMinor / 100).toLocaleString()} {SHOWCASE.currency} · {SHOWCASE.lastTx.status}</Text>
        <Text style={{ fontSize: 12, color: "#5B6B65" }}>SecureStore refresh + biometrics gate · Idempotency-Key</Text>
      </View>
    </View>
  );
}
