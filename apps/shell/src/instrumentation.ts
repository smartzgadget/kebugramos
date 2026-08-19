export async function register() {
  // Next.js instrumentation hook — runs on server and client edge
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side Otel/Sentry init here when collector is ready
  }
}
