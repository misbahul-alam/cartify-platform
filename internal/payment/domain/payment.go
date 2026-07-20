package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

var (
	ErrOrderAlreadyPaid        = errors.New("order is already paid")
	ErrOrderNotPayable         = errors.New("order cannot be paid in its current state")
	ErrPaymentGatewayNotFound  = errors.New("payment gateway provider not found")
	ErrPaymentNotFound         = errors.New("payment not found")
	ErrInvalidPaymentStatus    = errors.New("invalid payment status transition")
	ErrInvalidPaymentAmount    = errors.New("payment amount must be greater than zero")
	ErrEmptyTransactionID      = errors.New("transaction ID cannot be empty")
	ErrEmptyProvider           = errors.New("payment provider cannot be empty")
)

type Payment struct {
	ID            uuid.UUID     `json:"id"`
	OrderID       uuid.UUID     `json:"order_id"`
	TransactionID string        `json:"transaction_id"`
	Provider      string        `json:"provider"`
	Amount        float64       `json:"amount"`
	Currency      string        `json:"currency"`
	Status        PaymentStatus `json:"status"`
	ErrorMessage  string        `json:"error_message,omitempty"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
}

func NewPayment(orderID uuid.UUID, provider string, amount float64, currency string, transactionID string) (*Payment, error) {
	if provider == "" {
		return nil, ErrEmptyProvider
	}
	if amount <= 0 {
		return nil, ErrInvalidPaymentAmount
	}
	if transactionID == "" {
		return nil, ErrEmptyTransactionID
	}

	now := time.Now()
	return &Payment{
		ID:            uuid.New(),
		OrderID:       orderID,
		TransactionID: transactionID,
		Provider:      provider,
		Amount:        amount,
		Currency:      currency,
		Status:        PaymentStatusPending,
		CreatedAt:     now,
		UpdatedAt:     now,
	}, nil
}

func (p *Payment) Complete() error {
	if p.Status == PaymentStatusCompleted {
		return nil
	}
	if p.Status == PaymentStatusFailed || p.Status == PaymentStatusRefunded {
		return ErrInvalidPaymentStatus
	}
	p.Status = PaymentStatusCompleted
	p.UpdatedAt = time.Now()
	return nil
}

func (p *Payment) Fail(errMsg string) error {
	if p.Status == PaymentStatusCompleted || p.Status == PaymentStatusRefunded {
		return ErrInvalidPaymentStatus
	}
	p.Status = PaymentStatusFailed
	p.ErrorMessage = errMsg
	p.UpdatedAt = time.Now()
	return nil
}
