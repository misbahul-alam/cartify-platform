package handler

import (
	"errors"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/internal/payment/domain"
	"github.com/misbahul-alam/cartify-platform/internal/payment/service"
	"github.com/misbahul-alam/cartify-platform/internal/payment/transport/http/dto"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
	"github.com/misbahul-alam/cartify-platform/internal/shared/utils"
)

type PaymentHandler struct {
	service service.PaymentService
	config  *config.Config
}

func NewPaymentHandler(service service.PaymentService, config *config.Config) *PaymentHandler {
	return &PaymentHandler{
		service: service,
		config:  config,
	}
}

// CreatePaymentIntent godoc
// @Summary Create Payment Intent
// @Description Create a payment intent for a pending order
// @Tags Payments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param payment body dto.CreatePaymentIntentRequest true "Payment creation details"
// @Success 201 {object} response.Response{data=dto.CreatePaymentIntentResponse} "Successfully created payment intent."
// @Failure 400 {object} response.Response "Invalid request payload or order already paid."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /payments/intent [post]
func (h *PaymentHandler) CreatePaymentIntent(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	var req dto.CreatePaymentIntentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	orderID, err := uuid.Parse(req.OrderID)
	if err != nil {
		response.BadRequest(c, "invalid order id format", nil)
		return
	}

	output, err := h.service.CreatePaymentIntent(c.Request.Context(), orderID, userID, req.Provider)
	if err != nil {
		if errors.Is(err, domain.ErrOrderAlreadyPaid) {
			response.BadRequest(c, err.Error(), nil)
			return
		}
		if errors.Is(err, domain.ErrOrderNotPayable) {
			response.BadRequest(c, err.Error(), nil)
			return
		}
		if errors.Is(err, domain.ErrPaymentGatewayNotFound) {
			response.BadRequest(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Payment intent created successfully", dto.CreatePaymentIntentResponse{
		ClientSecret:  output.ClientSecret,
		TransactionID: output.TransactionID,
	}, nil)
}

// StripeWebhook godoc
// @Summary Stripe Webhook
// @Description Handle Stripe webhook events to update payment status
// @Tags Payments
// @Accept json
// @Produce json
// @Param payload body string true "Webhook payload"
// @Success 200 {string} string "OK"
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /payments/webhook/stripe [post]
func (h *PaymentHandler) StripeWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(1048576)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.String(http.StatusBadRequest, "failed to read request body")
		return
	}

	sigHeader := c.GetHeader("Stripe-Signature")
	if sigHeader == "" {
		c.String(http.StatusBadRequest, "missing Stripe-Signature header")
		return
	}

	err = h.service.ProcessStripeWebhook(c.Request.Context(), payload, sigHeader, h.config.Stripe.WebhookSecret)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func (h *PaymentHandler) getUserID(c *gin.Context) (uuid.UUID, error) {
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
