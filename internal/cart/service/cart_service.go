package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/cart/domain"
	"github.com/misbahul-alam/cartify-platform/internal/cart/repository"
	productDomain "github.com/misbahul-alam/cartify-platform/internal/product/domain"
	productRepo "github.com/misbahul-alam/cartify-platform/internal/product/repository"
)

type CartService interface {
	GetCart(ctx context.Context, userID uuid.UUID) (*domain.CartDetail, error)
	AddItem(ctx context.Context, userID uuid.UUID, productID uuid.UUID, quantity int) (*domain.CartDetail, error)
	UpdateItem(ctx context.Context, userID uuid.UUID, productID uuid.UUID, quantity int) (*domain.CartDetail, error)
	RemoveItem(ctx context.Context, userID uuid.UUID, productID uuid.UUID) (*domain.CartDetail, error)
	ClearCart(ctx context.Context, userID uuid.UUID) error
}

type cartService struct {
	cartRepo    repository.CartRepo
	productRepo productRepo.ProductRepo
}

func NewCartService(cartRepo repository.CartRepo, productRepo productRepo.ProductRepo) CartService {
	return &cartService{
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

func (s *cartService) GetCart(ctx context.Context, userID uuid.UUID) (*domain.CartDetail, error) {
	cart, err := s.cartRepo.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	detailItems := make([]*domain.CartDetailItem, 0)
	var totalPrice float64
	var itemsToSave []*domain.CartItem
	changed := false

	for _, item := range cart.Items {
		prod, err := s.productRepo.GetByID(item.ProductID)
		if err != nil {
			changed = true
			continue
		}
		if prod.Status != productDomain.ProductActive {
			changed = true
			continue
		}

		subtotal := prod.Price * float64(item.Quantity)
		detailItems = append(detailItems, &domain.CartDetailItem{
			Product:  prod,
			Quantity: item.Quantity,
			Subtotal: subtotal,
		})
		totalPrice += subtotal
		itemsToSave = append(itemsToSave, item)
	}

	if changed {
		cart.Items = itemsToSave
		if err := s.cartRepo.Save(ctx, cart); err != nil {
			return nil, err
		}
	}

	return &domain.CartDetail{
		UserID:     userID,
		Items:      detailItems,
		TotalPrice: totalPrice,
	}, nil
}

func (s *cartService) AddItem(ctx context.Context, userID uuid.UUID, productID uuid.UUID, quantity int) (*domain.CartDetail, error) {
	if _, err := s.validateProduct(ctx, productID); err != nil {
		return nil, err
	}

	cart, err := s.cartRepo.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	if err := cart.AddItem(productID, quantity); err != nil {
		return nil, err
	}

	if err := s.cartRepo.Save(ctx, cart); err != nil {
		return nil, err
	}

	return s.GetCart(ctx, userID)
}

func (s *cartService) UpdateItem(ctx context.Context, userID uuid.UUID, productID uuid.UUID, quantity int) (*domain.CartDetail, error) {
	if quantity <= 0 {
		return s.RemoveItem(ctx, userID, productID)
	}

	if _, err := s.validateProduct(ctx, productID); err != nil {
		return nil, err
	}

	cart, err := s.cartRepo.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	if err := cart.UpdateItem(productID, quantity); err != nil {
		return nil, err
	}

	if err := s.cartRepo.Save(ctx, cart); err != nil {
		return nil, err
	}

	return s.GetCart(ctx, userID)
}

func (s *cartService) RemoveItem(ctx context.Context, userID uuid.UUID, productID uuid.UUID) (*domain.CartDetail, error) {
	cart, err := s.cartRepo.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	if err := cart.RemoveItem(productID); err != nil {
		return nil, err
	}

	if err := s.cartRepo.Save(ctx, cart); err != nil {
		return nil, err
	}

	return s.GetCart(ctx, userID)
}

func (s *cartService) ClearCart(ctx context.Context, userID uuid.UUID) error {
	return s.cartRepo.Delete(ctx, userID)
}

func (s *cartService) validateProduct(ctx context.Context, productID uuid.UUID) (*productDomain.Product, error) {
	prod, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, errors.New("product not found")
	}
	if prod.Status != productDomain.ProductActive {
		return nil, errors.New("product is not active")
	}
	if !prod.IsStock {
		return nil, errors.New("product is out of stock")
	}
	return prod, nil
}
