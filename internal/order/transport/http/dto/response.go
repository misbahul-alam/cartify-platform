package dto

import (
	"time"

	"github.com/google/uuid"
)

type OrderItemResponse struct {
	ID           uuid.UUID `json:"id"`
	ProductID    uuid.UUID `json:"product_id"`
	ProductName  string    `json:"product_name"`
	ProductPrice float64   `json:"product_price"`
	Quantity     int       `json:"quantity"`
	Subtotal     float64   `json:"subtotal"`
}

type OrderResponse struct {
	ID              uuid.UUID            `json:"id"`
	UserID          uuid.UUID            `json:"user_id"`
	Items           []*OrderItemResponse `json:"items"`
	TotalPrice      float64              `json:"total_price"`
	ShippingAddress string               `json:"shipping_address"`
	Status          string               `json:"status"`
	CreatedAt       time.Time            `json:"created_at"`
	UpdatedAt       time.Time            `json:"updated_at"`
}

type PaginatedOrdersResponse struct {
	Total int64            `json:"total"`
	Page  int              `json:"page"`
	Limit int              `json:"limit"`
	Data  []*OrderResponse `json:"data"`
}
