package model

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
)

type ProductImage struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	URL       string    `gorm:"size:255;not null" json:"url"`
	PublicID  string    `gorm:"size:255;not null" json:"public_id"`
	IsPrimary bool      `gorm:"default:false;not null" json:"is_primary"`
}

func (ProductImage) TableName() string {
	return "product_images"
}

func ProductImageFromDomain(i *domain.ProductImage) *ProductImage {
	return &ProductImage{
		ID:        i.ID,
		ProductID: i.ProductID,
		URL:       i.URL,
		PublicID:  i.PublicID,
		IsPrimary: i.IsPrimary,
	}
}

func (i *ProductImage) ProductImageToDomain() *domain.ProductImage {
	return &domain.ProductImage{
		ID:        i.ID,
		ProductID: i.ProductID,
		URL:       i.URL,
		PublicID:  i.PublicID,
		IsPrimary: i.IsPrimary,
	}
}
