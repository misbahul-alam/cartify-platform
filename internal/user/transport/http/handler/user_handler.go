package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
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
		response.Unauthorized(c, "missing user id")
		return
	}

	userIDString, ok := userID.(string)
	if !ok || userIDString == "" {
		response.Unauthorized(c, "invalid user id")
		return
	}

	uid, err := uuid.Parse(userIDString)
	if err != nil {
		response.Unauthorized(c, "invalid user id format")
		return
	}

	user, err := h.service.GetUserById(uid)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "User profile retrieved successfully", user)
}
