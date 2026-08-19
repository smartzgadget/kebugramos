type Handler = (payload: unknown) => void;
type PresenceHandler = (presence: { userId: string; status: "online" | "offline" }) => void;

let ws: WebSocket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
const subs = new Map<string, Set<Handler>>();
const presenceSubs = new Set<PresenceHandler>();

function heartbeat() {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
  }
}

function scheduleHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(heartbeat, 25000);
}

export function connect(url: string, getToken: () => string | null) {
  if (ws && ws.readyState !== WebSocket.CLOSED) return ws;
  const token = getToken();
  ws = new WebSocket(`${url}?token=${token ?? ""}`);

  ws.onopen = () => {
    reconnectAttempts = 0;
    scheduleHeartbeat();
    ws!.send(JSON.stringify({ type: "subscribe", channels: Array.from(subs.keys()) }));
  };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data) as { channel?: string; type?: string; data?: unknown; userId?: string; status?: string };
      if (msg.type === "pong") return;
      if (msg.type === "presence" && msg.userId) {
        presenceSubs.forEach((h) => h({ userId: msg.userId!, status: (msg.status as "online" | "offline") ?? "online" }));
        return;
      }
      if (msg.channel) subs.get(msg.channel)?.forEach((h) => h(msg.data));
    } catch {}
  };

  ws.onclose = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    ws = null;
    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts) + Math.random() * 2000, 30000);
    reconnectAttempts += 1;
    setTimeout(() => connect(url, getToken), delay);
  };

  ws.onerror = () => ws?.close();
  return ws;
}

export function subscribe(channel: string, handler: Handler): () => void {
  if (!subs.has(channel)) subs.set(channel, new Set());
  subs.get(channel)!.add(handler);
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "subscribe", channel }));
  return () => {
    subs.get(channel)?.delete(handler);
    if (subs.get(channel)?.size === 0 && ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "unsubscribe", channel }));
  };
}

export function subscribePresence(handler: PresenceHandler): () => void {
  presenceSubs.add(handler);
  return () => presenceSubs.delete(handler);
}

export function publish(channel: string, data: unknown) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ channel, data }));
}

export function disconnect() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  ws?.close();
  ws = null;
  heartbeatTimer = null;
}
