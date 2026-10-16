package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
)

type visitor struct {
	count     int
	expiresAt time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(rl.window)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()
		rl.mu.Lock()
		for key, v := range rl.visitors {
			if now.After(v.expiresAt) {
				delete(rl.visitors, key)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.ClientIP()
		now := time.Now()

		rl.mu.Lock()
		v, ok := rl.visitors[key]
		if !ok || now.After(v.expiresAt) {
			v = &visitor{expiresAt: now.Add(rl.window)}
			rl.visitors[key] = v
		}
		v.count++
		exceeded := v.count > rl.limit
		rl.mu.Unlock()

		if exceeded {
			response.Error(c, http.StatusTooManyRequests, "too many requests, please try again later", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
