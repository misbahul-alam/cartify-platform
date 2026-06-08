package dto

import "github.com/google/uuid"

type CartItemRequest struct {
	ProductID string `json:"product_id" binding:"required,uuid"`
	Quantity  int    `json:"quantity" binding:"required,gt=0"`
}

type ImageResponse struct {
	URL       string `json:"url"`
	IsPrimary bool   `json:"is_primary"`
}

type ProductResponse struct {
	ID          uuid.UUID       `json:"id"`
	SKU         string          `json:"sku"`
	Name        string          `json:"name"`
	Slug        string          `json:"slug"`
	Description string          `json:"description"`
	Price       float64         `json:"price"`
	Images      []ImageResponse `json:"images,omitempty"`
}

type CartItemResponse struct {
	Product  ProductResponse `json:"product"`
	Quantity int             `json:"quantity"`
	Subtotal float64         `json:"subtotal"`
}

type CartResponse struct {
	UserID     uuid.UUID          `json:"user_id"`
	Items      []CartItemResponse `json:"items"`
	TotalPrice float64            `json:"total_price"`
}
