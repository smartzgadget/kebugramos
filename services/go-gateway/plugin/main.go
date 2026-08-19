package main

// Plugin gateway stub — Go routes, Java decides, CSP enforced.
// Contracts: services/contracts/plugin.openapi.json
import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

type PluginManifest struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Version  string   `json:"version"`
	Permissions []string `json:"permissions"`
	CSP      string   `json:"csp"`
	EntryURL string   `json:"entryUrl"`
	IsShowcase *bool  `json:"isShowcase,omitempty"`
}

var (
	mu        sync.Mutex
	plugins   = map[string]PluginManifest{}
	installed = map[string]bool{}
)

func initPlugins() {
	if len(plugins) == 0 {
		b := true
		plugins["kebu-loyalty"] = PluginManifest{ID: "kebu-loyalty", Name: "kebu-loyalty", Version: "0.3.0", Permissions: []string{"geo:coarse", "pay:intent"}, CSP: "default-src 'self' https://cdn.kebugram.com; script-src 'self';", EntryURL: "https://cdn.kebugram.com/plugins/kebu-loyalty/index.js", IsShowcase: &b}
	}
}

func cors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions { w.WriteHeader(204); return }
	mu.Lock(); initPlugins(); list := make([]PluginManifest, 0, len(plugins)); for _, v := range plugins { list = append(list, v) }; mu.Unlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"data": list})
}

func installHandler(w http.ResponseWriter, r *http.Request) {
	cors(w)
	if r.Method == http.MethodOptions { w.WriteHeader(204); return }
	mu.Lock(); initPlugins()
	id := r.URL.Path[len("/plugins/"):]; if len(id) > 8 && id[len(id)-8:] == "/install" { id = id[:len(id)-8] } else if len(id) > 10 && id[len(id)-10:] == "/uninstall" { id = id[:len(id)-10] }
	if _, ok := plugins[id]; !ok { mu.Unlock(); http.Error(w, "not found", 404); return }
	if r.URL.Path[len(r.URL.Path)-8:] == "/install" { installed[id] = true } else { delete(installed, id) }
	mu.Unlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"installed": r.URL.Path[len(r.URL.Path)-8:] == "/install", "id": id})
	// CSP + sandbox escape blocked: iframe sandbox="allow-scripts allow-same-origin" enforced client-side
}

func main() {
	http.HandleFunc("/plugins", listHandler)
	http.HandleFunc("/plugins/", installHandler)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { cors(w); json.NewEncoder(w).Encode(map[string]string{"status":"ok","service":"plugin","version":"0.1.0"}) })
	log.Printf("plugin gateway listening on :4103")
	log.Fatal(http.ListenAndServe(":4103", nil))
}
