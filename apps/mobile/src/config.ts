import { Platform, Linking } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";

// Expo host — reuses shared packages via JS split per feature, native shells for sensitive APIs
// Deep linking, SecureStore (refresh), biometrics, push, camera/QR, MMKV offline cache

export const mobileConfig = {
  deepLink: "kebugram://",
  secureStore: Platform.OS !== "web",
  offlineCache: "mmkv",
  linking: {
    prefixes: ["kebugram://", "https://kebugram.com"],
    config: {
      screens: {
        Chat: "chat/:id?",
        Tube: "tube/:id?",
        Market: "market/:id?",
        Pay: "pay",
      },
    },
  },
};

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync("kebugram_refresh");
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync("kebugram_refresh", token, { keychainService: "kebugram" });
}

export async function authenticateBiometric(): Promise<boolean> {
  const has = await LocalAuthentication.hasHardwareAsync();
  if (!has) return false;
  const res = await LocalAuthentication.authenticateAsync({ promptMessage: "Unlock KebuGram" });
  return res.success;
}

export async function registerPush(): Promise<string | null> {
  const perm = await Notifications.getPermissionsAsync();
  if (perm.status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") return null;
  }
  const token = await Notifications.getExpoPushTokenAsync().catch(() => null);
  return token?.data ?? null;
}

export async function openCamera(): Promise<boolean> {
  const perm = await Camera.getCameraPermissionsAsync();
  if (perm.status !== "granted") {
    const req = await Camera.requestCameraPermissionsAsync();
    return req.status === "granted";
  }
  return true;
}

export function handleDeepLink(url: string): { screen: string; id?: string } | null {
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path ?? "";
    const [screen, id] = path.split("/");
    if (["chat", "tube", "market", "pay", "logistics"].includes(screen)) return { screen, id };
    return null;
  } catch {
    return null;
  }
}
