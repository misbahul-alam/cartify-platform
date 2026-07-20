package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
)

func RoleMiddleware(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, ok := c.Get("role")
		if !ok {
			response.Unauthorized(c, "User role not found")
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			response.Unauthorized(c, "Invalid user role")
			c.Abort()
			return
		}

		authorized := false
		for _, role := range roles {
			if roleStr == role {
				authorized = true
				break
			}
		}

		if !authorized {
			response.Error(c, 403, "You are not authorized to access this resource", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
