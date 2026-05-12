package domain

import (
	"github.com/google/uuid"
)

type ProductImage struct {
	ID        uuid.UUID `json:"id"`
	ProductID uuid.UUID `json:"product_id"`
	URL       string    `json:"url"`
	PublicID  string    `json:"public_id"`
	IsPrimary bool      `json:"is_primary"`
}

func NewProductImage(productID uuid.UUID, url, publicID string, isPrimary bool) *ProductImage {
	return &ProductImage{
		ID:        uuid.New(),
		ProductID: productID,
		URL:       url,
		PublicID:  publicID,
		IsPrimary: isPrimary,
	}
}
