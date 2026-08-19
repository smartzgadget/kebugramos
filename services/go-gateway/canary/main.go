package main

// Canary stub — runnable for HW-1/HW-3 hardening and canary E2E.
// Mirrors java-core/canary/CanaryService logic in Go.
// Contracts: services/contracts/canary.openapi.json
import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"
)

type Rollout struct {
	Percent int      `json:"percent"`
	Version string   `json:"version"`
	Regions []string `json:"regions"`
	SLO     struct {
		P95Ms     float64 `json:"p95Ms"`
		ErrorRate float64 `json:"errorRate"`
	} `json:"slo"`
}

var (
	mu   sync.Mutex
	m    = map[string]Rollout{}
	draining = false
	drainUntil time.Time
)

func initMap() {
	if len(m) == 0 {
		m["mfe-kebupay"] = Rollout{Percent: 100, Version: "0.1.0", Regions: []string{"RW", "KE", "UG", "TZ", "GLOBAL"}, SLO: struct{ P95Ms float64 `json:"p95Ms"`; ErrorRate float64 `json:"errorRate"` }{85, 0.002}}
		m["mfe-kebumarket"] = Rollout{Percent: 100, Version: "0.1.0", Regions: []string{"RW", "GLOBAL"}, SLO: struct{ P95Ms float64 `json:"p95Ms"`; ErrorRate float64 `json:"errorRate"` }{92, 0.001}}
		m["mfe-kebuchat"] = Rollout{Percent: 100, Version: "0.1.0", Regions: []string{"KE", "UG", "RW", "TZ", "GLOBAL"}, SLO: struct{ P95Ms float64 `json:"p95Ms"`; ErrorRate float64 `json:"errorRate"` }{78, 0.003}}
		m["mfe-kebutube"] = Rollout{Percent: 100, Version: "0.1.0", Regions: []string{"RW", "GLOBAL"}, SLO: struct{ P95Ms float64 `json:"p95Ms"`; ErrorRate float64 `json:"errorRate"` }{95, 0.0015}}
	}
}

func cors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(204)
		return
	}
	if draining && time.Now().Before(drainUntil) {
		http.Error(w, "draining for rollback", 503)
		return
	}
	mu.Lock()
	defer mu.Unlock()
	initMap()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}

type PromoteBody struct {
	Mfe       string `json:"mfe"`
	ToPercent int    `json:"toPercent"`
}

func promoteHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(204)
		return
	}
	if draining && time.Now().Before(drainUntil) {
		http.Error(w, "draining for rollback", 503)
		return
	}
	var b PromoteBody
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	if b.ToPercent != 5 && b.ToPercent != 25 && b.ToPercent != 100 {
		http.Error(w, "toPercent 5|25|100", 400)
		return
	}
	mu.Lock()
	defer mu.Unlock()
	initMap()
	cur, ok := m[b.Mfe]
	if !ok {
		http.Error(w, "mfe not found", 404)
		return
	}
	if cur.SLO.P95Ms > 120 || cur.SLO.ErrorRate > 0.01 {
		http.Error(w, "SLO breached", 412)
		return
	}
	order := map[int]int{5: 0, 25: 1, 100: 2}
	curIdx := order[cur.Percent]
	toIdx := order[b.ToPercent]
	if cur.Percent != 0 && toIdx < curIdx {
		http.Error(w, "downgrade via rollback", 400)
		return
	}
	// allow promoting from 100 back to 5 for testing: reset to 5
	cur.Percent = b.ToPercent
	m[b.Mfe] = cur
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}

type RollbackBody struct {
	Mfe    string `json:"mfe"`
	Reason string `json:"reason"`
}

func rollbackHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(204)
		return
	}
	var b RollbackBody
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	mu.Lock()
	m[b.Mfe] = Rollout{Percent: 0, Version: m[b.Mfe].Version, Regions: m[b.Mfe].Regions, SLO: m[b.Mfe].SLO}
	mu.Unlock()
	// drain 30s
	draining = true
	drainUntil = time.Now().Add(30 * time.Second)
	w.Header().Set("Content-Type", "application/json")
	mu.Lock()
	json.NewEncoder(w).Encode(m)
	mu.Unlock()
	go func() {
		time.Sleep(30 * time.Second)
		draining = false
	}()
}

func main() {
	http.HandleFunc("/canary/status", statusHandler)
	http.HandleFunc("/canary/promote", promoteHandler)
	http.HandleFunc("/canary/rollback", rollbackHandler)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		cors(w)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "canary", "version": "0.1.0"})
	})
	log.Printf("canary stub listening on :4000")
	log.Fatal(http.ListenAndServe(":4000", nil))
}
