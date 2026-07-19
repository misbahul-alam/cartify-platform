package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/order/domain"
)

type Order struct {
	ID              uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID          uuid.UUID    `gorm:"type:uuid;not null;index" json:"user_id"`
	Items           []*OrderItem `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE;" json:"items"`
	TotalPrice      float64      `gorm:"type:numeric(12,2);not null" json:"total_price"`
	ShippingAddress string       `gorm:"type:text;not null" json:"shipping_address"`
	Status          string       `gorm:"type:varchar(20);default:'pending';not null" json:"status"`
	CreatedAt       time.Time    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time    `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Order) TableName() string {
	return "orders"
}

type OrderItem struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID      uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	ProductID    uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	ProductName  string    `gorm:"size:255;not null" json:"product_name"`
	ProductPrice float64   `gorm:"type:numeric(12,2);not null" json:"product_price"`
	Quantity     int       `gorm:"not null" json:"quantity"`
	Subtotal     float64   `gorm:"type:numeric(12,2);not null" json:"subtotal"`
}

func (OrderItem) TableName() string {
	return "order_items"
}

func OrderFromDomain(o *domain.Order) *Order {
	items := make([]*OrderItem, len(o.Items))
	for i, item := range o.Items {
		items[i] = &OrderItem{
			ID:           item.ID,
			OrderID:      item.OrderID,
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductPrice: item.ProductPrice,
			Quantity:     item.Quantity,
			Subtotal:     item.Subtotal,
		}
	}

	return &Order{
		ID:              o.ID,
		UserID:          o.UserID,
		Items:           items,
		TotalPrice:      o.TotalPrice,
		ShippingAddress: o.ShippingAddress,
		Status:          string(o.Status),
		CreatedAt:       o.CreatedAt,
		UpdatedAt:       o.UpdatedAt,
	}
}

func (o *Order) OrderToDomain() *domain.Order {
	items := make([]*domain.OrderItem, len(o.Items))
	for i, item := range o.Items {
		items[i] = &domain.OrderItem{
			ID:           item.ID,
			OrderID:      item.OrderID,
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductPrice: item.ProductPrice,
			Quantity:     item.Quantity,
			Subtotal:     item.Subtotal,
		}
	}

	return &domain.Order{
		ID:              o.ID,
		UserID:          o.UserID,
		Items:           items,
		TotalPrice:      o.TotalPrice,
		ShippingAddress: o.ShippingAddress,
		Status:          domain.OrderStatus(o.Status),
		CreatedAt:       o.CreatedAt,
		UpdatedAt:       o.UpdatedAt,
	}
}
