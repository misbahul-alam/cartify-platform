package domain

import (
	"context"
)

type PaymentProvider string

const (
	PaymentProviderStripe PaymentProvider = "stripe"
)

type CreatePaymentIntentInput struct {
	OrderID     string  `json:"order_id"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Description string  `json:"description"`
}

type CreatePaymentIntentOutput struct {
	ClientSecret  string `json:"client_secret"`
	TransactionID string `json:"transaction_id"`
}

type PaymentGateway interface {
	CreatePaymentIntent(ctx context.Context, input CreatePaymentIntentInput) (*CreatePaymentIntentOutput, error)
}
