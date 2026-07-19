package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusPaid       OrderStatus = "paid"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

var (
	ErrInvalidStatus        = errors.New("invalid order status")
	ErrCannotCancelOrder    = errors.New("cannot cancel order in current state")
	ErrCannotUpdateStatus   = errors.New("cannot update order status in current state")
	ErrEmptyShippingAddress = errors.New("shipping address cannot be empty")
	ErrNoOrderItems         = errors.New("order must have at least one item")
	ErrInvalidItemQuantity  = errors.New("order item quantity must be greater than zero")
)

type OrderItem struct {
	ID           uuid.UUID `json:"id"`
	OrderID      uuid.UUID `json:"order_id"`
	ProductID    uuid.UUID `json:"product_id"`
	ProductName  string    `json:"product_name"`
	ProductPrice float64   `json:"product_price"`
	Quantity     int       `json:"quantity"`
	Subtotal     float64   `json:"subtotal"`
}

type Order struct {
	ID              uuid.UUID    `json:"id"`
	UserID          uuid.UUID    `json:"user_id"`
	Items           []*OrderItem `json:"items"`
	TotalPrice      float64      `json:"total_price"`
	ShippingAddress string       `json:"shipping_address"`
	Status          OrderStatus  `json:"status"`
	CreatedAt       time.Time    `json:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at"`
}

func NewOrder(userID uuid.UUID, shippingAddress string, items []*OrderItem) (*Order, error) {
	if shippingAddress == "" {
		return nil, ErrEmptyShippingAddress
	}
	if len(items) == 0 {
		return nil, ErrNoOrderItems
	}

	orderID := uuid.New()
	var totalPrice float64

	for _, item := range items {
		if item.Quantity <= 0 {
			return nil, ErrInvalidItemQuantity
		}
		item.ID = uuid.New()
		item.OrderID = orderID
		item.Subtotal = item.ProductPrice * float64(item.Quantity)
		totalPrice += item.Subtotal
	}

	return &Order{
		ID:              orderID,
		UserID:          userID,
		Items:           items,
		TotalPrice:      totalPrice,
		ShippingAddress: shippingAddress,
		Status:          OrderStatusPending,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}, nil
}

func (o *Order) Cancel() error {
	if o.Status != OrderStatusPending && o.Status != OrderStatusProcessing {
		return ErrCannotCancelOrder
	}
	o.Status = OrderStatusCancelled
	o.UpdatedAt = time.Now()
	return nil
}

func (o *Order) UpdateStatus(newStatus OrderStatus) error {
	switch newStatus {
	case OrderStatusPending, OrderStatusProcessing, OrderStatusPaid, OrderStatusShipped, OrderStatusDelivered, OrderStatusCancelled:
		// allowed status
	default:
		return ErrInvalidStatus
	}

	if o.Status == OrderStatusDelivered || o.Status == OrderStatusCancelled {
		return ErrCannotUpdateStatus
	}

	o.Status = newStatus
	o.UpdatedAt = time.Now()
	return nil
}
