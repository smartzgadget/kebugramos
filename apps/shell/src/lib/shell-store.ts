import { create } from "zustand";

type ShellState = { collapsed: boolean; toggle: () => void; setCollapsed: (v: boolean) => void };
export const useShellStore = create<ShellState>((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}));
