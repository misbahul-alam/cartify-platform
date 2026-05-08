package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/internal/shared/auth"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
)

func AuthMiddleware(config *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header is empty")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.Unauthorized(c, "Authorization header is invalid")
			c.Abort()
			return
		}

		jwt := auth.NewJWTManager(config.JWT.Secret, config.JWT.TTL)

		claims, err := jwt.Verify(parts[1])
		if err != nil {
			response.Unauthorized(c, "Authorization header is invalid")
			c.Abort()
			return
		}

		if claims.Type != "access" {
			response.Unauthorized(c, "Authorization header is invalid")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()

	}
}
