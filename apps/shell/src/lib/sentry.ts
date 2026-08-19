import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (typeof window === "undefined") return;
  Sentry.init({
    dsn: (window as unknown as { __KEBUGRAM_CONFIG__?: { sentryDsn?: string } }).__KEBUGRAM_CONFIG__?.sentryDsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beforeSend(event: any) {
      // Strip PII — never send raw tokens or emails
      if (event.request?.headers) delete (event.request.headers as Record<string, string>)["Authorization"];
      return event;
    },
  });
}
