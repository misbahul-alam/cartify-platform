package dto

import "github.com/google/uuid"

type CreateCategoryRequest struct {
	Name        string     `json:"name" binding:"required,min=3,max=35"`
	Slug        string     `json:"slug" binding:"required,min=3,max=35"`
	Description string     `json:"description" binding:"required,min=3,max=100"`
	ParentID    *uuid.UUID `json:"parent_id"`
}

type CategoryUpdateRequest struct {
	Name        string     `json:"name" binding:"required,min=3,max=35"`
	Slug        string     `json:"slug" binding:"required,min=3,max=35"`
	Description string     `json:"description" binding:"required,min=3,max=100"`
	ParentID    *uuid.UUID `json:"parent_id"`
	Status      string     `json:"status" binding:"omitempty,oneof=public private"`
}

type CreateProductRequest struct {
	SKU         string     `json:"sku" binding:"required"`
	Name        string     `json:"name" binding:"required,min=3,max=255"`
	Slug        string     `json:"slug" binding:"required"`
	Description string     `json:"description" binding:"required"`
	Price       float64    `json:"price" binding:"required,gte=0"`
	CategoryID  *uuid.UUID `json:"category_id" binding:"required"`
	IsStock     bool       `json:"is_stock" binding:"omitempty"`
	IsFeatured  bool       `json:"is_featured" binding:"omitempty"`
}

type ProductUpdateRequest struct {
	SKU         string     `json:"sku" binding:"required"`
	Name        string     `json:"name" binding:"required,min=3,max=255"`
	Slug        string     `json:"slug" binding:"omitempty"`
	Description string     `json:"description" binding:"omitempty"`
	Price       float64    `json:"price" binding:"required,gte=0"`
	CategoryID  *uuid.UUID `json:"category_id" binding:"omitempty"`
	IsStock     bool       `json:"is_stock" binding:"omitempty"`
	IsFeatured  bool       `json:"is_featured" binding:"omitempty"`
	Status      string     `json:"status" binding:"required,oneof=active inactive draft"`
}
