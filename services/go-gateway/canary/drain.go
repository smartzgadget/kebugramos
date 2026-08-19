package main

// Go gateway canary drain — on manifest disabled (percent 0) drain 30s then 503, rollback <60s end-to-end.
import (
	"context"
	"net/http"
	"sync/atomic"
	"time"
)

var draining atomic.Bool

func drainHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if draining.Load() {
			http.Error(w, "draining for rollback", 503)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func startDrain(ctx context.Context) {
	draining.Store(true)
	go func() {
		select {
		case <-time.After(30 * time.Second):
			draining.Store(false)
		case <-ctx.Done():
			draining.Store(false)
		}
	}()
}
