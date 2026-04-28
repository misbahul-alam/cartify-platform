package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
	"github.com/misbahul-alam/cartify-platform/internal/user/service"
	"github.com/misbahul-alam/cartify-platform/internal/user/transport/http/dto"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(service *service.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBind(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}

	res, err := h.service.Login(req.Email, req.Password)

	if err != nil {
		response.BadRequest(c, "Login failed", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Login successful", gin.H{"access_token": res.AccessToken, "refresh_token": res.RefreshToken})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBind(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}

	err := h.service.Register(req.FirstName, req.LastName, req.Email, req.Password)
	if err != nil {
		response.BadRequest(c, "Registration failed", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Registration successful", nil)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBind(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}
	newToken, err := h.service.RefreshToken(req.RefreshToken)
	if err != nil {
		response.BadRequest(c, "Token refresh failed", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Token refreshed successfully", gin.H{
		"access_token": newToken,
	})
}
