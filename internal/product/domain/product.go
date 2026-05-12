package domain

import (
	"errors"
	"strings"
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
	ID          uuid.UUID       `json:"id"`
	SKU         string          `json:"sku"`
	Name        string          `json:"name"`
	Slug        string          `json:"slug"`
	Description string          `json:"description"`
	Price       float64         `json:"price"`
	CategoryID  *uuid.UUID      `json:"category_id,omitempty"`
	Category    *Category       `json:"category,omitempty"`
	Images      []*ProductImage `json:"images,omitempty"`
	IsStock     bool            `json:"is_stock"`
	IsFeatured  bool            `json:"is_featured"`
	Status      ProductStatus   `json:"status"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

func NewProduct(sku, name, slug, description string, price float64, categoryID *uuid.UUID, isStock, isFeatured bool) (*Product, error) {
	if name == "" {
		return nil, errors.New("product name is required")
	}
	if sku == "" {
		return nil, errors.New("product SKU is required")
	}
	if price < 0 {
		return nil, errors.New("product price cannot be negative")
	}

	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	}

	return &Product{
		ID:          uuid.New(),
		SKU:         sku,
		Name:        name,
		Slug:        slug,
		Description: description,
		Price:       price,
		CategoryID:  categoryID,
		IsStock:     isStock,
		IsFeatured:  isFeatured,
		Status:      ProductActive,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}, nil
}

func (p *Product) Update(sku, name, slug, description string, price float64, categoryID *uuid.UUID, isStock, isFeatured bool, status ProductStatus) error {
	if name == "" {
		return errors.New("product name is required")
	}
	if sku == "" {
		return errors.New("product SKU is required")
	}
	if price < 0 {
		return errors.New("product price cannot be negative")
	}

	p.SKU = sku
	p.Name = name
	p.Slug = slug
	p.Description = description
	p.Price = price
	p.CategoryID = categoryID
	p.IsStock = isStock
	p.IsFeatured = isFeatured
	p.Status = status
	p.UpdatedAt = time.Now()

	return nil
}
