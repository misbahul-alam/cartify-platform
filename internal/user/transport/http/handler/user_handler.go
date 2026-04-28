package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/internal/user/service"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(service *service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) Me(c *gin.Context) {
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "missing user id",
		})
		return
	}

	userIDString, ok := userID.(string)
	if !ok || userIDString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "invalid user id",
		})
		return
	}

	user, err := h.service.GetUserById(userIDString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})

}
