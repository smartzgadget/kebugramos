package main

// KebuPay gateway stub — runnable for HW-1/HW-2 hardening and canary E2E.
// Serves ledger truth locally (Java truth mirrored) when javaUpstream unreachable.
// Contracts: services/contracts/kebupay.openapi.json
import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
)

var (
	mu              sync.Mutex
	seen            = map[string][]byte{} // Idempotency-Key -> request body
	entries         []LedgerEntry
	balanceMinor    = 1250000 // showcase balance 1_250_000
	webhookSecret   = []byte("kebugram-sovereign-webhook-secret")
	javaUpstream    = "http://localhost:4000"
)

type LedgerEntry struct {
	ID             string `json:"id"`
	At             string `json:"at"`
	AmountMinor    int    `json:"amountMinor"`
	Currency       string `json:"currency"`
	Counterparty   string `json:"counterparty"`
	IdempotencyKey string `json:"idempotencyKey"`
	Status         string `json:"status"`
}

type LedgerResponse struct {
	Data         []LedgerEntry `json:"data"`
	BalanceMinor int           `json:"balanceMinor"`
}

type P2PRequest struct {
	ToHandle       string `json:"toHandle"`
	AmountMinor    int    `json:"amountMinor"`
	Currency       string `json:"currency"`
	IdempotencyKey string `json:"idempotencyKey"`
}

func signWebhook(body []byte) string {
	m := hmac.New(sha256.New, webhookSecret)
	m.Write(body)
	return hex.EncodeToString(m.Sum(nil))
}

func cors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key, X-Webhook-Signature, Authorization")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(204)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "kebupay-gateway", "version": "0.1.0"})
}

func ledgerHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(204)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", 405)
		return
	}
	mu.Lock()
	defer mu.Unlock()
	// seed showcase entry if empty
	if len(entries) == 0 {
		entries = []LedgerEntry{{
			ID: "le-showcase-1", At: time.Now().UTC().Format(time.RFC3339),
			AmountMinor: 50000, Currency: "RWF", Counterparty: "showcase@kebugram", IdempotencyKey: uuid.NewString(), Status: "posted",
		}}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LedgerResponse{Data: entries, BalanceMinor: balanceMinor})
}

func p2pHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(204)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	key := r.Header.Get("Idempotency-Key")
	if key == "" {
		http.Error(w, "Idempotency-Key required", 400)
		return
	}
	if _, err := uuid.Parse(key); err != nil {
		http.Error(w, "Idempotency-Key must be uuid", 400)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "read body", 400)
		return
	}
	var req P2PRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	if req.ToHandle == "" || len(req.ToHandle) < 2 || len(req.ToHandle) > 32 {
		http.Error(w, "toHandle 2..32 required", 400)
		return
	}
	if req.AmountMinor < 1 {
		http.Error(w, "amountMinor >=1", 400)
		return
	}
	if len(req.Currency) != 3 {
		http.Error(w, "currency 3 chars", 400)
		return
	}
	// idempotency: same key with different body → 409
	mu.Lock()
	defer mu.Unlock()
	if prev, ok := seen[key]; ok {
		if string(prev) != string(body) {
			http.Error(w, "duplicate Idempotency-Key with different payload", 409)
			return
		}
		// replay same payload → return current ledger 200 (idempotent)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Webhook-Signature", signWebhook(body))
		json.NewEncoder(w).Encode(LedgerResponse{Data: entries, BalanceMinor: balanceMinor})
		return
	}
	seen[key] = body
	// seed
	if len(entries) == 0 {
		entries = []LedgerEntry{{
			ID: "le-showcase-1", At: time.Now().UTC().Format(time.RFC3339),
			AmountMinor: 50000, Currency: "RWF", Counterparty: "showcase@kebugram", IdempotencyKey: uuid.NewString(), Status: "posted",
		}}
	}
	e := LedgerEntry{
		ID: uuid.NewString(), At: time.Now().UTC().Format(time.RFC3339),
		AmountMinor: req.AmountMinor, Currency: req.Currency, Counterparty: req.ToHandle,
		IdempotencyKey: key, Status: "posted",
	}
	entries = append([]LedgerEntry{e}, entries...)
	balanceMinor += req.AmountMinor
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Webhook-Signature", signWebhook(body))
	json.NewEncoder(w).Encode(LedgerResponse{Data: entries, BalanceMinor: balanceMinor})
}

func main() {
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/pay/ledger", ledgerHandler)
	http.HandleFunc("/pay/p2p", p2pHandler)
	// also serve ledger on api-gateway alias
	http.HandleFunc("/api/pay/ledger", ledgerHandler)
	http.HandleFunc("/api/pay/p2p", p2pHandler)
	log.Printf("kebupay-gateway listening on :4100 (contracts kebupay.openapi.json)")
	log.Fatal(http.ListenAndServe(":4100", nil))
}
