package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/internal/shared/auth"
)

func AuthMiddleware(config *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":  http.StatusUnauthorized,
				"error": "Authorization header is empty",
			})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":  http.StatusUnauthorized,
				"error": "Authorization header is invalid",
			})
			return
		}

		jwt := auth.NewJWTManager(config.JWT.Secret)

		claims, err := jwt.Verify(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":  http.StatusUnauthorized,
				"error": "Authorization header is invalid",
			})
			return
		}
		if claims.Type != "access" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":  http.StatusUnauthorized,
				"error": "Authorization header is invalid",
			})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()

	}
}
