package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
)

func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(cfg.CORS.AllowedOrigins))
	allowAll := false
	for _, origin := range cfg.CORS.AllowedOrigins {
		if origin == "*" {
			allowAll = true
			break
		}
		allowed[origin] = struct{}{}
	}

	return cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			if allowAll {
				return true
			}
			_, ok := allowed[origin]
			return ok
		},

		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
			"HEAD",
		},

		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-CSRF-Token",
			"X-Access-Token",
			"X-Refresh-Token",
			"Access-Control-Allow-Origin",
		},

		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
		},

		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
