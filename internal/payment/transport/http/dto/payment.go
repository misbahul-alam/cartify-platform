package dto

type CreatePaymentIntentRequest struct {
	OrderID  string `json:"order_id" binding:"required,uuid"`
	Provider string `json:"provider" binding:"required"`
}

type CreatePaymentIntentResponse struct {
	ClientSecret  string `json:"client_secret"`
	TransactionID string `json:"transaction_id"`
}
