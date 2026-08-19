import React, { useEffect, useState } from "react";
import { Text, View, Button, Linking, Pressable } from "react-native";
import { mobileConfig, getRefreshToken, authenticateBiometric, registerPush, openCamera, handleDeepLink } from "./config";
import { MfeLoader } from "./mfe/MfeLoader";
import { TAB_TO_MFE, isMfeTab, type MfeTab } from "./mfe/registry";

const TABS: { id: MfeTab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "tube", label: "Tube" },
  { id: "market", label: "Market" },
  { id: "pay", label: "Pay" },
];

export default function MobileApp() {
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [biometric, setBiometric] = useState<string>("idle");
  const [push, setPush] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MfeTab>("chat");

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      setDeepLink(url);
      const p = handleDeepLink(url);
      if (p && isMfeTab(p.screen)) setActiveTab(p.screen);
    });
    Linking.getInitialURL()
      .then((url) => {
        if (!url) return;
        setDeepLink(url);
        const p = handleDeepLink(url);
        if (p && isMfeTab(p.screen)) setActiveTab(p.screen);
      })
      .catch(() => undefined);
    return () => sub.remove();
  }, []);

  const parsed = deepLink ? handleDeepLink(deepLink) : null;
  const mfeName = TAB_TO_MFE[activeTab];

  return (
    <View testID="mobile" style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#F7F9F8" }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#0B3A2E" }}>KebuGram Mobile</Text>
      <Text style={{ fontSize: 13, color: "#5B6B65" }}>Expo host — deep linking {mobileConfig.deepLink}, SecureStore, biometrics, push, camera/QR, MMKV offline.</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            testID={`tab-${t.id}`}
            onPress={() => setActiveTab(t.id)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: activeTab === t.id ? "#0B3A2E" : "white", borderWidth: 1, borderColor: activeTab === t.id ? "#0B3A2E" : "#DDE4E1" }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: activeTab === t.id ? "white" : "#0B3A2E" }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ borderWidth: 1, borderColor: "#DDE4E1", borderRadius: 12, backgroundColor: "white", padding: 12, gap: 8 }}>
        <Text>Deep link: {parsed ? `${parsed.screen}${parsed.id ? `/${parsed.id}` : ""}` : "none — open kebugram://chat/1"}</Text>
        <Text>Cache: {mobileConfig.offlineCache} · SecureStore: {mobileConfig.secureStore ? "on" : "off"}</Text>
        <Button title="Authenticate (biometric)" onPress={async () => setBiometric((await authenticateBiometric()) ? "ok" : "fail")} />
        <Text testID="biometric">Biometric: {biometric}</Text>
        <Button title="Register push" onPress={async () => setPush((await registerPush()) ?? "denied")} />
        <Text testID="push">Push: {push ?? "—"}</Text>
        <Button title="Open camera/QR" onPress={async () => setPush((await openCamera()) ? "camera ok" : "camera denied")} />
        <Button title="Check refresh token" onPress={async () => setPush((await getRefreshToken()) ?? "no token")} />
      </View>

      <View style={{ flex: 1, borderWidth: 1, borderColor: "#DDE4E1", borderRadius: 12, backgroundColor: "white", overflow: "hidden" }}>
        <MfeLoader name={mfeName} />
      </View>
    </View>
  );
}
