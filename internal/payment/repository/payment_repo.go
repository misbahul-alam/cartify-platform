package repository

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/payment/domain"
	"github.com/misbahul-alam/cartify-platform/internal/payment/model"
	"gorm.io/gorm"
)

type PaymentRepo interface {
	Create(payment *domain.Payment) error
	GetByID(id uuid.UUID) (*domain.Payment, error)
	GetByTransactionID(transactionID string) (*domain.Payment, error)
	Update(payment *domain.Payment) error
}

type paymentRepo struct {
	db *gorm.DB
}

func NewPaymentRepo(db *gorm.DB) PaymentRepo {
	return &paymentRepo{db: db}
}

func (r *paymentRepo) Create(payment *domain.Payment) error {
	m := model.PaymentFromDomain(payment)
	return r.db.Create(m).Error
}

func (r *paymentRepo) GetByID(id uuid.UUID) (*domain.Payment, error) {
	var p model.Payment
	err := r.db.First(&p, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return p.PaymentToDomain(), nil
}

func (r *paymentRepo) GetByTransactionID(transactionID string) (*domain.Payment, error) {
	var p model.Payment
	err := r.db.First(&p, "transaction_id = ?", transactionID).Error
	if err != nil {
		return nil, err
	}
	return p.PaymentToDomain(), nil
}

func (r *paymentRepo) Update(payment *domain.Payment) error {
	m := model.PaymentFromDomain(payment)
	return r.db.Save(m).Error
}
