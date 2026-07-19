package repository

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/order/domain"
	"github.com/misbahul-alam/cartify-platform/internal/order/model"
	"gorm.io/gorm"
)

type OrderRepo interface {
	Create(order *domain.Order) error
	GetByID(id uuid.UUID) (*domain.Order, error)
	GetByUserID(userID uuid.UUID, page, limit int) ([]*domain.Order, int64, error)
	GetAll(page, limit int) ([]*domain.Order, int64, error)
	Update(order *domain.Order) error
}

type orderRepo struct {
	db *gorm.DB
}

func NewOrderRepo(db *gorm.DB) OrderRepo {
	return &orderRepo{db: db}
}

func (r *orderRepo) Create(order *domain.Order) error {
	m := model.OrderFromDomain(order)
	return r.db.Create(m).Error
}

func (r *orderRepo) GetByID(id uuid.UUID) (*domain.Order, error) {
	var o model.Order
	err := r.db.Preload("Items").First(&o, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return o.OrderToDomain(), nil
}

func (r *orderRepo) GetByUserID(userID uuid.UUID, page, limit int) ([]*domain.Order, int64, error) {
	var orders []*model.Order
	var total int64

	db := r.db.Model(&model.Order{}).Where("user_id = ?", userID)
	db.Count(&total)

	offset := (page - 1) * limit
	err := db.Preload("Items").Order("created_at desc").Offset(offset).Limit(limit).Find(&orders).Error
	if err != nil {
		return nil, 0, err
	}

	domainOrders := make([]*domain.Order, len(orders))
	for i, o := range orders {
		domainOrders[i] = o.OrderToDomain()
	}

	return domainOrders, total, nil
}

func (r *orderRepo) GetAll(page, limit int) ([]*domain.Order, int64, error) {
	var orders []*model.Order
	var total int64

	db := r.db.Model(&model.Order{})
	db.Count(&total)

	offset := (page - 1) * limit
	err := db.Preload("Items").Order("created_at desc").Offset(offset).Limit(limit).Find(&orders).Error
	if err != nil {
		return nil, 0, err
	}

	domainOrders := make([]*domain.Order, len(orders))
	for i, o := range orders {
		domainOrders[i] = o.OrderToDomain()
	}

	return domainOrders, total, nil
}

func (r *orderRepo) Update(order *domain.Order) error {
	m := model.OrderFromDomain(order)
	return r.db.Save(m).Error
}
