package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/cart/domain"
	"github.com/misbahul-alam/cartify-platform/internal/cart/service"
	"github.com/misbahul-alam/cartify-platform/internal/cart/transport/http/dto"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
	"github.com/misbahul-alam/cartify-platform/internal/shared/utils"
)

type CartHandler struct {
	service service.CartService
}

func NewCartHandler(service service.CartService) *CartHandler {
	return &CartHandler{service: service}
}

// GetCart godoc
// @Summary Get Current User Cart
// @Description Retrieve all items in the currently authenticated user's cart.
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=dto.CartResponse} "Successfully retrieved cart."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /cart [get]
func (h *CartHandler) GetCart(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	cart, err := h.service.GetCart(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Cart retrieved successfully", h.toCartResponse(cart), nil)
}

// AddItem godoc
// @Summary Add Item to Cart
// @Description Add a product to the authenticated user's cart (increments quantity if already in cart).
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param item body dto.CartItemRequest true "Product details to add"
// @Success 200 {object} response.Response{data=dto.CartResponse} "Successfully added item, returns updated cart."
// @Failure 400 {object} response.Response "Invalid request payload or validation error."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /cart/items [post]
func (h *CartHandler) AddItem(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	var req dto.CartItemRequest
	if err := h.bindAndValidate(c, &req); err != nil {
		return
	}

	productID, _ := uuid.Parse(req.ProductID)
	ctx := c.Request.Context()
	cart, err := h.service.AddItem(ctx, userID, productID, req.Quantity)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Item added to cart successfully", h.toCartResponse(cart), nil)
}

// UpdateItem godoc
// @Summary Update Cart Item Quantity
// @Description Set the exact quantity of a product in the authenticated user's cart.
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param item body dto.CartItemRequest true "Product details to update"
// @Success 200 {object} response.Response{data=dto.CartResponse} "Successfully updated item, returns updated cart."
// @Failure 400 {object} response.Response "Invalid request payload or validation error."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /cart/items [put]
func (h *CartHandler) UpdateItem(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	var req dto.CartItemRequest
	if err := h.bindAndValidate(c, &req); err != nil {
		return
	}

	productID, _ := uuid.Parse(req.ProductID)
	ctx := c.Request.Context()
	cart, err := h.service.UpdateItem(ctx, userID, productID, req.Quantity)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Cart item updated successfully", h.toCartResponse(cart), nil)
}

// RemoveItem godoc
// @Summary Remove Item from Cart
// @Description Remove a product completely from the authenticated user's cart.
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param product_id path string true "Product UUID"
// @Success 200 {object} response.Response{data=dto.CartResponse} "Successfully removed item, returns updated cart."
// @Failure 400 {object} response.Response "Invalid product id format."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /cart/items/{product_id} [delete]
func (h *CartHandler) RemoveItem(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	productIDStr := c.Param("product_id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		response.BadRequest(c, "invalid product id format", nil)
		return
	}

	ctx := c.Request.Context()
	cart, err := h.service.RemoveItem(ctx, userID, productID)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Item removed from cart successfully", h.toCartResponse(cart), nil)
}

// ClearCart godoc
// @Summary Clear Entire Cart
// @Description Delete all items from the authenticated user's cart.
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response "Successfully cleared cart."
// @Failure 401 {object} response.Response "Unauthorized: Missing or invalid authentication token."
// @Failure 500 {object} response.Response "Internal server error."
// @Router /cart [delete]
func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		return
	}

	err = h.service.ClearCart(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Cart cleared successfully", nil, nil)
}

func (h *CartHandler) toCartResponse(cart *domain.CartDetail) dto.CartResponse {
	items := make([]dto.CartItemResponse, 0, len(cart.Items))
	for _, item := range cart.Items {
		images := make([]dto.ImageResponse, 0, len(item.Product.Images))
		for _, img := range item.Product.Images {
			images = append(images, dto.ImageResponse{
				URL:       img.URL,
				IsPrimary: img.IsPrimary,
			})
		}

		items = append(items, dto.CartItemResponse{
			Product: dto.ProductResponse{
				ID:          item.Product.ID,
				SKU:         item.Product.SKU,
				Name:        item.Product.Name,
				Slug:        item.Product.Slug,
				Description: item.Product.Description,
				Price:       item.Product.Price,
				Images:      images,
			},
			Quantity: item.Quantity,
			Subtotal: item.Subtotal,
		})
	}

	return dto.CartResponse{
		UserID:     cart.UserID,
		Items:      items,
		TotalPrice: cart.TotalPrice,
	}
}

func (h *CartHandler) bindAndValidate(c *gin.Context, req *dto.CartItemRequest) error {
	if err := c.ShouldBind(req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return err
	}

	_, err := uuid.Parse(req.ProductID)
	if err != nil {
		response.BadRequest(c, "invalid product id format", nil)
		return err
	}

	return nil
}

func (h *CartHandler) getUserID(c *gin.Context) (uuid.UUID, error) {
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
