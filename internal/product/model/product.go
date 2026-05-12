package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
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
	Images      []*ProductImage `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE;" json:"images,omitempty"`
	IsStock     bool          `gorm:"default:true;not null" json:"is_stock"`
	IsFeatured  bool          `gorm:"default:false;not null" json:"is_featured"`
	Status      ProductStatus `gorm:"type:varchar(20);default:'active';not null" json:"status"`
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Product) TableName() string {
	return "products"
}

func ProductFromDomain(p *domain.Product) *Product {
	var category *Category
	if p.Category != nil {
		category = CategoryFromDomain(p.Category)
	}

	images := make([]*ProductImage, len(p.Images))
	for i, img := range p.Images {
		images[i] = ProductImageFromDomain(img)
	}

	return &Product{
		ID:          p.ID,
		SKU:         p.SKU,
		Name:        p.Name,
		Slug:        p.Slug,
		Description: p.Description,
		Price:       p.Price,
		CategoryID:  p.CategoryID,
		Category:    category,
		Images:      images,
		IsStock:     p.IsStock,
		IsFeatured:  p.IsFeatured,
		Status:      ProductStatus(p.Status),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func (p *Product) ProductToDomain() *domain.Product {
	var category *domain.Category
	if p.Category != nil {
		category = p.Category.CategoryToDomain()
	}

	images := make([]*domain.ProductImage, len(p.Images))
	for i, img := range p.Images {
		images[i] = img.ProductImageToDomain()
	}

	return &domain.Product{
		ID:          p.ID,
		SKU:         p.SKU,
		Name:        p.Name,
		Slug:        p.Slug,
		Description: p.Description,
		Price:       p.Price,
		CategoryID:  p.CategoryID,
		Category:    category,
		Images:      images,
		IsStock:     p.IsStock,
		IsFeatured:  p.IsFeatured,
		Status:      domain.ProductStatus(p.Status),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}
