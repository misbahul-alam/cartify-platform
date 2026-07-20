package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/payment/domain"
)

type Payment struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID       uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	TransactionID string    `gorm:"type:varchar(255);not null;uniqueIndex" json:"transaction_id"`
	Provider      string    `gorm:"type:varchar(50);not null" json:"provider"`
	Amount        float64   `gorm:"type:numeric(12,2);not null" json:"amount"`
	Currency      string    `gorm:"type:varchar(10);not null" json:"currency"`
	Status        string    `gorm:"type:varchar(20);default:'pending';not null" json:"status"`
	ErrorMessage  string    `gorm:"type:text" json:"error_message,omitempty"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Payment) TableName() string {
	return "payments"
}

func PaymentFromDomain(p *domain.Payment) *Payment {
	return &Payment{
		ID:            p.ID,
		OrderID:       p.OrderID,
		TransactionID: p.TransactionID,
		Provider:      p.Provider,
		Amount:        p.Amount,
		Currency:      p.Currency,
		Status:        string(p.Status),
		ErrorMessage:  p.ErrorMessage,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
	}
}

func (p *Payment) PaymentToDomain() *domain.Payment {
	return &domain.Payment{
		ID:            p.ID,
		OrderID:       p.OrderID,
		TransactionID: p.TransactionID,
		Provider:      p.Provider,
		Amount:        p.Amount,
		Currency:      p.Currency,
		Status:        domain.PaymentStatus(p.Status),
		ErrorMessage:  p.ErrorMessage,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
	}
}
