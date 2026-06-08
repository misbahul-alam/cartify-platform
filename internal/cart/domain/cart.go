package domain

import (
	"errors"

	"github.com/google/uuid"
	productDomain "github.com/misbahul-alam/cartify-platform/internal/product/domain"
)

var (
	ErrItemNotFound    = errors.New("item not found in cart")
	ErrInvalidQuantity = errors.New("quantity must be greater than zero")
)

type CartItem struct {
	ProductID uuid.UUID `json:"product_id"`
	Quantity  int       `json:"quantity"`
}

type Cart struct {
	UserID uuid.UUID   `json:"user_id"`
	Items  []*CartItem `json:"items"`
}

type CartDetailItem struct {
	Product  *productDomain.Product `json:"product"`
	Quantity int                    `json:"quantity"`
	Subtotal float64                `json:"subtotal"`
}

type CartDetail struct {
	UserID     uuid.UUID         `json:"user_id"`
	Items      []*CartDetailItem `json:"items"`
	TotalPrice float64           `json:"total_price"`
}

func NewCart(userID uuid.UUID) *Cart {
	return &Cart{
		UserID: userID,
		Items:  make([]*CartItem, 0),
	}
}

func (c *Cart) AddItem(productID uuid.UUID, quantity int) error {
	if quantity <= 0 {
		return ErrInvalidQuantity
	}

	for _, item := range c.Items {
		if item.ProductID == productID {
			item.Quantity += quantity
			return nil
		}
	}

	c.Items = append(c.Items, &CartItem{
		ProductID: productID,
		Quantity:  quantity,
	})
	return nil
}

func (c *Cart) UpdateItem(productID uuid.UUID, quantity int) error {
	if quantity <= 0 {
		return c.RemoveItem(productID)
	}

	for _, item := range c.Items {
		if item.ProductID == productID {
			item.Quantity = quantity
			return nil
		}
	}

	c.Items = append(c.Items, &CartItem{
		ProductID: productID,
		Quantity:  quantity,
	})
	return nil
}

func (c *Cart) RemoveItem(productID uuid.UUID) error {
	for i, item := range c.Items {
		if item.ProductID == productID {
			c.Items = append(c.Items[:i], c.Items[i+1:]...)
			return nil
		}
	}
	return ErrItemNotFound
}

func (c *Cart) Clear() {
	c.Items = make([]*CartItem, 0)
}
