package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/order/domain"
	"github.com/misbahul-alam/cartify-platform/internal/order/service"
	"github.com/misbahul-alam/cartify-platform/internal/order/transport/http/dto"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
	"github.com/misbahul-alam/cartify-platform/internal/shared/utils"
)

type OrderHandler struct {
	service service.OrderService
}

func NewOrderHandler(service service.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

// CreateOrder godoc
// @Summary Create Order from Cart
// @Description Checkout the items in the cart and create a pending order.
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param order body dto.CreateOrderRequest true "Shipping address details"
// @Success 201 {object} response.Response{data=dto.OrderResponse} "Successfully created order."
// @Failure 400 {object} response.Response "Invalid request payload or empty cart."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /orders [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	var req dto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	order, err := h.service.CreateOrder(c.Request.Context(), userID, req.ShippingAddress)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Order created successfully", h.toOrderResponse(order), nil)
}

// GetOrder godoc
// @Summary Get Order by ID
// @Description Retrieve details of a specific order.
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Order UUID"
// @Success 200 {object} response.Response{data=dto.OrderResponse} "Successfully retrieved order."
// @Failure 400 {object} response.Response "Invalid order ID format."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 403 {object} response.Response "Forbidden: Not allowed to access this order."
// @Failure 404 {object} response.Response "Order not found."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /orders/{id} [get]
func (h *OrderHandler) GetOrder(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	role, _ := h.getUserRole(c)

	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		response.BadRequest(c, "invalid order id format", nil)
		return
	}

	order, err := h.service.GetOrder(c.Request.Context(), orderID, userID, role)
	if err != nil {
		if err.Error() == "you are not authorized to view this order" {
			response.Forbidden(c, err.Error())
			return
		}
		response.NotFound(c, "order not found")
		return
	}

	response.Success(c, http.StatusOK, "Order retrieved successfully", h.toOrderResponse(order), nil)
}

// ListUserOrders godoc
// @Summary List User Orders
// @Description Retrieve a list of paginated orders for the authenticated user.
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Page limit" default(10)
// @Success 200 {object} response.Response{data=dto.PaginatedOrdersResponse} "Successfully retrieved orders list."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /orders [get]
func (h *OrderHandler) ListUserOrders(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	orders, total, err := h.service.ListUserOrders(c.Request.Context(), userID, page, limit)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Orders retrieved successfully", dto.PaginatedOrdersResponse{
		Total: total,
		Page:  page,
		Limit: limit,
		Data:  h.toOrdersResponse(orders),
	}, nil)
}

// ListAllOrders godoc
// @Summary List All Orders (Admin/Seller)
// @Description Retrieve a paginated list of all orders.
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Page limit" default(10)
// @Success 200 {object} response.Response{data=dto.PaginatedOrdersResponse} "Successfully retrieved all orders."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 403 {object} response.Response "Forbidden: Admins/Sellers only."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /orders/all [get]
func (h *OrderHandler) ListAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	orders, total, err := h.service.ListAllOrders(c.Request.Context(), page, limit)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "All orders retrieved successfully", dto.PaginatedOrdersResponse{
		Total: total,
		Page:  page,
		Limit: limit,
		Data:  h.toOrdersResponse(orders),
	}, nil)
}

// CancelOrder godoc
// @Summary Cancel Order
// @Description Cancel a pending or processing order.
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Order UUID"
// @Success 200 {object} response.Response "Successfully cancelled order."
// @Failure 400 {object} response.Response "Invalid order ID format or cannot cancel."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 403 {object} response.Response "Forbidden: Not authorized to cancel this order."
// @Failure 404 {object} response.Response "Order not found."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /orders/{id}/cancel [put]
func (h *OrderHandler) CancelOrder(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	role, _ := h.getUserRole(c)

	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		response.BadRequest(c, "invalid order id format", nil)
		return
	}

	err = h.service.CancelOrder(c.Request.Context(), orderID, userID, role)
	if err != nil {
		if err.Error() == "you are not authorized to cancel this order" {
			response.Forbidden(c, err.Error())
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Order cancelled successfully", nil, nil)
}

// UpdateOrderStatus godoc
// @Summary Update Order Status (Admin/Seller)
// @Description Update the status of an order.
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Order UUID"
// @Param status body dto.UpdateStatusRequest true "New status value"
// @Success 200 {object} response.Response "Successfully updated order status."
// @Failure 400 {object} response.Response "Invalid status or transitions."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 403 {object} response.Response "Forbidden: Admins/Sellers only."
// @Failure 404 {object} response.Response "Order not found."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /orders/{id}/status [put]
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		response.BadRequest(c, "invalid order id format", nil)
		return
	}

	var req dto.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	err = h.service.UpdateOrderStatus(c.Request.Context(), orderID, req.Status)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Order status updated successfully", nil, nil)
}

func (h *OrderHandler) toOrderResponse(o *domain.Order) *dto.OrderResponse {
	items := make([]*dto.OrderItemResponse, len(o.Items))
	for i, item := range o.Items {
		items[i] = &dto.OrderItemResponse{
			ID:           item.ID,
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductPrice: item.ProductPrice,
			Quantity:     item.Quantity,
			Subtotal:     item.Subtotal,
		}
	}

	return &dto.OrderResponse{
		ID:              o.ID,
		UserID:          o.UserID,
		Items:           items,
		TotalPrice:      o.TotalPrice,
		ShippingAddress: o.ShippingAddress,
		Status:          string(o.Status),
		CreatedAt:       o.CreatedAt,
		UpdatedAt:       o.UpdatedAt,
	}
}

func (h *OrderHandler) toOrdersResponse(orders []*domain.Order) []*dto.OrderResponse {
	res := make([]*dto.OrderResponse, len(orders))
	for i, o := range orders {
		res[i] = h.toOrderResponse(o)
	}
	return res
}

func (h *OrderHandler) getUserID(c *gin.Context) (uuid.UUID, error) {
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

func (h *OrderHandler) getUserRole(c *gin.Context) (string, error) {
	role, ok := c.Get("role")
	if !ok {
		return "", errors.New("missing user role")
	}

	roleStr, ok := role.(string)
	if !ok {
		return "", errors.New("invalid user role")
	}

	return roleStr, nil
}
