import React from "react";

// JS split per feature — native parity for chat|tube|market|pay
// Each entry lazy-loads its screen; shell never bundles all MFEs upfront.

export const MFE_REGISTRY = {
  "mfe-kebuchat": {
    label: "KebuChat",
    tab: "chat" as const,
    loader: () => import("./screens/ChatScreen"),
  },
  "mfe-kebutube": {
    label: "KebuTube",
    tab: "tube" as const,
    loader: () => import("./screens/TubeScreen"),
  },
  "mfe-kebumarket": {
    label: "KebuMarket",
    tab: "market" as const,
    loader: () => import("./screens/MarketScreen"),
  },
  "mfe-kebupay": {
    label: "KebuPay",
    tab: "pay" as const,
    loader: () => import("./screens/PayScreen"),
  },
} as const;

export type MfeName = keyof typeof MFE_REGISTRY;
export type MfeTab = (typeof MFE_REGISTRY)[MfeName]["tab"];

export const TAB_TO_MFE: Record<MfeTab, MfeName> = {
  chat: "mfe-kebuchat",
  tube: "mfe-kebutube",
  market: "mfe-kebumarket",
  pay: "mfe-kebupay",
};

export function isMfeTab(v: string): v is MfeTab {
  return v === "chat" || v === "tube" || v === "market" || v === "pay";
}
