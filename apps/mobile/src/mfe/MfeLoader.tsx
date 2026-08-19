import React, { Suspense } from "react";
import { Text, View } from "react-native";
import { MFE_REGISTRY, type MfeName } from "./registry";

class MfeErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) { return { error: e instanceof Error ? e.message : "Failed to load MFE" }; }
  render() {
    if (this.state.error) return <View style={{ padding: 16 }}><Text style={{ color: "#9E2B1C" }}>MFE failed: {this.state.error}</Text></View>;
    return this.props.children as React.ReactElement;
  }
}

function Fallback({ label }: { label: string }) {
  return <View style={{ padding: 24, alignItems: "center" }}><Text style={{ color: "#5B6B65", fontSize: 13 }}>Loading {label}…</Text></View>;
}

export function MfeLoader({ name }: { name: MfeName }) {
  const entry = MFE_REGISTRY[name];
  const Lazy = React.lazy(() => entry.loader().then((m) => ({ default: m.default })));
  return (
    <MfeErrorBoundary>
      <Suspense fallback={<Fallback label={entry.label} />}>
        <Lazy />
      </Suspense>
    </MfeErrorBoundary>
  );
}
