package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
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
