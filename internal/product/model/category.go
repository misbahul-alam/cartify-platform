package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
)

type Category struct {
	ID          uuid.UUID     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string        `gorm:"size:35;not null" json:"name"`
	Slug        string        `gorm:"size:35;uniqueIndex;not null" json:"slug"`
	Description string        `gorm:"type:text" json:"description"`
	ParentID    *uuid.UUID    `gorm:"type:uuid" json:"parent_id,omitempty"`
	ImageUrl    string        `gorm:"type:text" json:"image_url"`
	Status      domain.Status `gorm:"type:varchar(20);default:'public';not null" json:"status"`
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Category) TableName() string {
	return "categories"
}

func CategoryFromDomain(c *domain.Category) *Category {
	return &Category{
		ID:          c.ID,
		Name:        c.Name,
		Slug:        c.Slug,
		Description: c.Description,
		ParentID:    c.ParentID,
		ImageUrl:    c.ImageUrl,
		Status:      c.Status,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}

func (c *Category) CategoryToDomain() *domain.Category {
	return &domain.Category{
		ID:          c.ID,
		Name:        c.Name,
		Slug:        c.Slug,
		Description: c.Description,
		ParentID:    c.ParentID,
		ImageUrl:    c.ImageUrl,
		Status:      c.Status,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}
