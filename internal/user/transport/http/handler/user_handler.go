package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
	"github.com/misbahul-alam/cartify-platform/internal/shared/utils"
	"github.com/misbahul-alam/cartify-platform/internal/user/service"
	"github.com/misbahul-alam/cartify-platform/internal/user/transport/http/dto"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(service *service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) Me(c *gin.Context) {
	uid, err := h.getUserID(c)
	if err != nil {
		return
	}

	user, err := h.service.GetUserById(uid)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "User profile retrieved successfully", user)
}

func (h *UserHandler) GetAll(c *gin.Context) {
	users, err := h.service.GetAllUsers()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Users retrieved successfully", users)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	uid, err := h.getUserID(c)
	if err != nil {
		return
	}

	var req dto.UpdateProfileRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	user, err := h.service.UpdateProfile(uid, req.FirstName, req.LastName)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Profile updated successfully", user)
}

func (h *UserHandler) UpdatePassword(c *gin.Context) {
	uid, err := h.getUserID(c)
	if err != nil {
		return
	}

	var req dto.UpdatePasswordRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	if err := h.service.UpdatePassword(uid, req.OldPassword, req.NewPassword); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Password updated successfully", nil)
}

func (h *UserHandler) Delete(c *gin.Context) {
	uid, err := h.getUserID(c)
	if err != nil {
		return
	}

	if err := h.service.DeleteUser(uid); err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "User deleted successfully", nil)
}

func (h *UserHandler) getUserID(c *gin.Context) (uuid.UUID, error) {
	userID, ok := c.Get("user_id")
	if !ok {
		response.Unauthorized(c, "missing user id")
		return uuid.Nil, errors.New("missing user id")
	}

	userIDString, ok := userID.(string)
	if !ok || userIDString == "" {
		response.Unauthorized(c, "invalid user id")
		return uuid.Nil, errors.New("invalid user id")
	}

	uid, err := uuid.Parse(userIDString)
	if err != nil {
		response.Unauthorized(c, "invalid user id format")
		return uuid.Nil, err
	}

	return uid, nil
}
