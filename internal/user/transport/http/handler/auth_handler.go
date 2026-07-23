package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
	"github.com/misbahul-alam/cartify-platform/internal/shared/utils"
	"github.com/misbahul-alam/cartify-platform/internal/user/service"
	"github.com/misbahul-alam/cartify-platform/internal/user/transport/http/dto"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(service *service.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

// Login godoc
// @Summary User Login
// @Description Authenticate user with email and password to receive JWT access and refresh tokens.
// @Tags Auth
// @Accept json
// @Produce json
// @Param login body dto.LoginRequest true "Login credentials"
// @Success 200 {object} response.Response{data=map[string]string} "Successfully authenticated. Returns access_token and refresh_token."
// @Failure 400 {object} response.Response "Invalid request payload or validation error."
// @Failure 401 {object} response.Response "Invalid email or password."
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	res, err := h.service.Login(req.Email, req.Password)

	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Login successful", gin.H{"access_token": res.AccessToken, "refresh_token": res.RefreshToken}, nil)
}

// Register godoc
// @Summary User Registration
// @Description Create a new user account with first name, last name, email, and password.
// @Tags Auth
// @Accept json
// @Produce json
// @Param register body dto.RegisterRequest true "Registration details"
// @Success 201 {object} response.Response "Successfully registered new user."
// @Failure 400 {object} response.Response "Validation error or user already exists."
// @Failure 500 {object} response.Response "Internal server error during registration."
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	err := h.service.Register(req.FirstName, req.LastName, req.Email, req.Password)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, "Registration successful", nil, nil)
}

// RefreshToken godoc
// @Summary Refresh Access Token
// @Description Generate a new access token using a valid refresh token.
// @Tags Auth
// @Accept json
// @Produce json
// @Param refresh body dto.RefreshRequest true "Refresh token"
// @Success 200 {object} response.Response{data=dto.AuthResponse} "Successfully generated new access token."
// @Failure 400 {object} response.Response "Invalid refresh token or request payload."
// @Failure 401 {object} response.Response "Refresh token expired or unauthorized."
// @Router /auth/refresh-token [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}
	newToken, err := h.service.RefreshToken(req.RefreshToken)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Token refreshed successfully", gin.H{
		"access_token": newToken,
	}, nil)
}
