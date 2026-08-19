// OpenTelemetry FE — lightweight browser tracer (OTLP via collector)
export function initOtel() {
  if (typeof window === "undefined") return;
  // Production: wire to @opentelemetry/sdk-trace-web + OTLP exporter
  // Stub keeps bundle small until collector URL is provisioned
  const cfg = (window as unknown as { __KEBUGRAM_CONFIG__?: { otlpEndpoint?: string } }).__KEBUGRAM_CONFIG__;
  if (!cfg?.otlpEndpoint) return;
  // Lazy import to avoid bundling OTel in initial chunk
  import("@opentelemetry/sdk-trace-web").then(({ WebTracerProvider }) => {
    const provider = new WebTracerProvider();
    provider.register();
  }).catch(() => {});
}
