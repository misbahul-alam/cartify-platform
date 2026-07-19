package dto

type CreateOrderRequest struct {
	ShippingAddress string `json:"shipping_address" binding:"required"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required"`
}
