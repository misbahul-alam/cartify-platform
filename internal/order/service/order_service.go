package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	cartService "github.com/misbahul-alam/cartify-platform/internal/cart/service"
	"github.com/misbahul-alam/cartify-platform/internal/order/domain"
	"github.com/misbahul-alam/cartify-platform/internal/order/repository"
)

type OrderService interface {
	CreateOrder(ctx context.Context, userID uuid.UUID, shippingAddress string) (*domain.Order, error)
	GetOrder(ctx context.Context, id uuid.UUID, userID uuid.UUID, role string) (*domain.Order, error)
	ListUserOrders(ctx context.Context, userID uuid.UUID, page, limit int) ([]*domain.Order, int64, error)
	ListAllOrders(ctx context.Context, page, limit int) ([]*domain.Order, int64, error)
	CancelOrder(ctx context.Context, id uuid.UUID, userID uuid.UUID, role string) error
	UpdateOrderStatus(ctx context.Context, id uuid.UUID, status string) error
}

type orderService struct {
	orderRepo   repository.OrderRepo
	cartService cartService.CartService
}

func NewOrderService(orderRepo repository.OrderRepo, cartService cartService.CartService) OrderService {
	return &orderService{
		orderRepo:   orderRepo,
		cartService: cartService,
	}
}

func (s *orderService) CreateOrder(ctx context.Context, userID uuid.UUID, shippingAddress string) (*domain.Order, error) {
	cart, err := s.cartService.GetCart(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve cart: %w", err)
	}

	if len(cart.Items) == 0 {
		return nil, errors.New("cannot create order with an empty cart")
	}

	orderItems := make([]*domain.OrderItem, len(cart.Items))
	for i, item := range cart.Items {
		if item.Product == nil {
			return nil, errors.New("cart item contains invalid product data")
		}
		if !item.Product.IsStock {
			return nil, fmt.Errorf("product %s is out of stock", item.Product.Name)
		}
		orderItems[i] = &domain.OrderItem{
			ProductID:    item.Product.ID,
			ProductName:  item.Product.Name,
			ProductPrice: item.Product.Price,
			Quantity:     item.Quantity,
		}
	}

	order, err := domain.NewOrder(userID, shippingAddress, orderItems)
	if err != nil {
		return nil, err
	}

	if err := s.orderRepo.Create(order); err != nil {
		return nil, fmt.Errorf("failed to save order: %w", err)
	}

	if err := s.cartService.ClearCart(ctx, userID); err != nil {

	}

	return order, nil
}

func (s *orderService) GetOrder(ctx context.Context, id uuid.UUID, userID uuid.UUID, role string) (*domain.Order, error) {
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if role != "admin" && role != "seller" && order.UserID != userID {
		return nil, errors.New("you are not authorized to view this order")
	}

	return order, nil
}

func (s *orderService) ListUserOrders(ctx context.Context, userID uuid.UUID, page, limit int) ([]*domain.Order, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	return s.orderRepo.GetByUserID(userID, page, limit)
}

func (s *orderService) ListAllOrders(ctx context.Context, page, limit int) ([]*domain.Order, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	return s.orderRepo.GetAll(page, limit)
}

func (s *orderService) CancelOrder(ctx context.Context, id uuid.UUID, userID uuid.UUID, role string) error {
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		return err
	}

	if role != "admin" && role != "seller" && order.UserID != userID {
		return errors.New("you are not authorized to cancel this order")
	}

	if err := order.Cancel(); err != nil {
		return err
	}

	return s.orderRepo.Update(order)
}

func (s *orderService) UpdateOrderStatus(ctx context.Context, id uuid.UUID, status string) error {
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		return err
	}

	domainStatus := domain.OrderStatus(status)
	if err := order.UpdateStatus(domainStatus); err != nil {
		return err
	}

	return s.orderRepo.Update(order)
}
