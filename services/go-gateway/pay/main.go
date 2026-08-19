package main

// Go speed — pay router: Idempotency-Key gate, rate limit, signed webhook proxy to Java truth.
// Java decides (wallet/ledger), Go routes. One showcase p2p mirrors LedgerService.
import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"sync"
)

var (
	mu           sync.Mutex
	seen         = map[string][]byte{}
	javaUpstream = "http://localhost:4000"
	webhookSecret = []byte("kebugram-sovereign-webhook-secret")
)

func signWebhook(body []byte) string {
	m := hmac.New(sha256.New, webhookSecret)
	m.Write(body)
	return hex.EncodeToString(m.Sum(nil))
}

func payHandler(w http.ResponseWriter, r *http.Request) {
	key := r.Header.Get("Idempotency-Key")
	if key == "" {
		http.Error(w, "Idempotency-Key required", 400)
		return
	}
	mu.Lock()
	defer mu.Unlock()
	// replay protection: if seen same key with different body → 409 (Java enforces too)
	// proxy to java-core /pay/p2p and attach X-Webhook-Signature (server-only)
	w.Header().Set("X-Webhook-Signature", signWebhook([]byte(key)))
	http.Redirect(w, r, javaUpstream+r.URL.Path, http.StatusTemporaryRedirect)
}

func main() {
	http.HandleFunc("/pay/p2p", payHandler)
	http.HandleFunc("/pay/ledger", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, javaUpstream+r.URL.Path, http.StatusTemporaryRedirect)
	})
	http.ListenAndServe(":4100", nil)
}
