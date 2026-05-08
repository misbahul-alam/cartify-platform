package handler

import (
	"errors"
	"fmt"
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

// Me godoc
// @Summary Get Current User Profile
// @Description Retrieve the detailed profile information of the currently authenticated user.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=model.User} "Successfully retrieved user profile."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 404 {object} response.Response "User not found."
// @Router /users/me [get]
func (h *UserHandler) Me(c *gin.Context) {
	uid, err := h.getUserID(c)
	if err != nil {
		return
	}

	fmt.Println("id:", uid)

	user, err := h.service.GetUserById(uid)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "User profile retrieved successfully", user)
}

// GetAll godoc
// @Summary List All Users
// @Description Retrieve a list of all registered users. This endpoint is restricted to administrators.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]model.User} "Successfully retrieved list of users."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 403 {object} response.Response "Forbidden: Insufficient permissions (Admin only)."
// @Router /users [get]
func (h *UserHandler) GetAll(c *gin.Context) {
	users, err := h.service.GetAllUsers()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Users retrieved successfully", users)
}

// UpdateProfile godoc
// @Summary Update Profile
// @Description Modify the personal details (first name, last name) of the currently authenticated user.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param profile body dto.UpdateProfileRequest true "New profile details"
// @Success 200 {object} response.Response{data=model.User} "Successfully updated profile."
// @Failure 400 {object} response.Response "Invalid request payload or validation error."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Router /users/profile [patch]
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

// UpdatePassword godoc
// @Summary Change Password
// @Description Update the password for the currently authenticated user. Requires verifying the old password.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param password body dto.UpdatePasswordRequest true "Current and new password details"
// @Success 200 {object} response.Response "Successfully updated password."
// @Failure 400 {object} response.Response "Validation error or incorrect old password."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Router /users/update-password [post]
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

// Delete godoc
// @Summary Delete Account
// @Description Permanently remove the currently authenticated user's account from the system.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response "Successfully deleted user account."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error during account deletion."
// @Router /users [delete]
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
