package model

import (
	"time"

	"github.com/google/uuid"
)

type ProductStatus string

const (
	ProductActive   ProductStatus = "active"
	ProductInactive ProductStatus = "inactive"
	ProductDraft    ProductStatus = "draft"
)

type Product struct {
	ID          uuid.UUID     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SKU         string        `gorm:"uniqueIndex;not null" json:"sku"`
	Name        string        `gorm:"size:255;not null" json:"name"`
	Slug        string        `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Description string        `gorm:"type:text" json:"description"`
	Price       float64       `gorm:"type:numeric(12,2);not null;check:price >= 0" json:"price"`
	CategoryID  *uuid.UUID    `gorm:"type:uuid" json:"category_id,omitempty"`
	Category    *Category     `gorm:"constraint:OnDelete:SET NULL;" json:"category,omitempty"`
	IsStock     bool          `gorm:"default:true;not null" json:"is_stock"`
	IsFeatured  bool          `gorm:"default:false;not null" json:"is_featured"`
	Status      ProductStatus `gorm:"type:varchar(20);default:'active';not null" json:"status"`
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Product) TableName() string {
	return "products"
}
