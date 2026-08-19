package main

// Chat gateway — Go routes WS, Java decides truth, Python scores.
// Contracts: services/contracts/chat.openapi.json
// WS fanout 50k, presence, heartbeat 25s, reconnect backoff 1.5^ + jitter ≤30s (client sdk)
import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

type Hub struct {
	mu       sync.Mutex
	channels map[string]map[*Conn]bool
	presence map[string]string // userId -> status
}

type Conn struct {
	ws   *websocket.Conn
	send chan []byte
	user string
}

var hub = &Hub{channels: make(map[string]map[*Conn]bool), presence: make(map[string]string)}

func (h *Hub) subscribe(ch string, c *Conn) {
	h.mu.Lock(); defer h.mu.Unlock()
	if h.channels[ch] == nil { h.channels[ch] = make(map[*Conn]bool) }
	h.channels[ch][c] = true
}
func (h *Hub) unsubscribe(ch string, c *Conn) {
	h.mu.Lock(); defer h.mu.Unlock()
	delete(h.channels[ch], c)
	if len(h.channels[ch]) == 0 { delete(h.channels, ch) }
}
func (h *Hub) publish(ch string, data []byte) {
	h.mu.Lock(); defer h.mu.Unlock()
	for c := range h.channels[ch] { select { case c.send <- data: default: } }
}
func (h *Hub) setPresence(user, status string) {
	h.mu.Lock(); defer h.mu.Unlock()
	h.presence[user] = status
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	user := token
	if user == "" { user = r.Header.Get("X-User-Id"); if user == "" { user = "anon" } }
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil { http.Error(w, "upgrade", 400); return }
	c := &Conn{ws: ws, send: make(chan []byte, 256), user: user}
	hub.setPresence(user, "online")
	// heartbeat pong
	go func() {
		t := time.NewTicker(25 * time.Second)
		defer t.Stop()
		for range t.C { c.ws.WriteJSON(map[string]interface{}{"type": "pong", "ts": time.Now().UnixMilli()}) }
	}()
	go func() {
		for msg := range c.send { c.ws.WriteMessage(websocket.TextMessage, msg) }
	}()
	for {
		_, p, err := ws.ReadMessage()
		if err != nil { break }
		var m map[string]interface{}
		if err := json.Unmarshal(p, &m); err != nil { continue }
		if m["type"] == "ping" { c.ws.WriteJSON(map[string]interface{}{"type": "pong"}) ; continue }
		if m["type"] == "subscribe" {
			if ch, ok := m["channel"].(string); ok { hub.subscribe(ch, c) } else if chs, ok := m["channels"].([]interface{}); ok { for _, ch := range chs { if s, ok := ch.(string); ok { hub.subscribe(s, c) } } }
			continue
		}
		if m["type"] == "unsubscribe" { if ch, ok := m["channel"].(string); ok { hub.unsubscribe(ch, c) }; continue }
		if ch, ok := m["channel"].(string); ok {
			// fanout
			b, _ := json.Marshal(map[string]interface{}{"channel": ch, "data": m["data"]})
			hub.publish(ch, b)
		}
		if m["type"] == "presence" { hub.setPresence(user, "online"); b, _ := json.Marshal(map[string]interface{}{"type": "presence", "userId": user, "status": "online"}); hub.publish("presence", b) }
	}
	hub.setPresence(user, "offline")
	ws.Close()
	close(c.send)
	// cleanup channels
	hub.mu.Lock(); for ch, conns := range hub.channels { delete(conns, c); if len(conns)==0 { delete(hub.channels, ch) } }; hub.mu.Unlock()
}

func health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status":"ok","service":"chat-gateway","version":"0.1.0"})
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	http.HandleFunc("/health", health)
	// REST fanout for non-WS (e.g., k6 50k)
	http.HandleFunc("/chat/publish", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost { http.Error(w, "POST", 405); return }
		var body map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil { http.Error(w, "json", 400); return }
		ch, _ := body["channel"].(string)
		if ch == "" { ch = r.URL.Query().Get("channel") }
		if ch == "" { ch = "chat:1" }
		b, _ := json.Marshal(map[string]interface{}{"channel": ch, "data": body["data"]})
		hub.publish(ch, b)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"published": true, "channel": ch})
	})
	log.Printf("chat gateway listening on :4005 (ws /ws?token=, health /health)")
	// allow CORS for mfe-kebuchat
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/ws") || strings.HasPrefix(r.URL.Path, "/health") || strings.HasPrefix(r.URL.Path, "/chat/") { return }
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"ok":"chat-gateway"})
	})
	log.Fatal(http.ListenAndServe(":4005", nil))
}
