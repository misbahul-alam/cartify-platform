package service

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/google/uuid"
	orderDomain "github.com/misbahul-alam/cartify-platform/internal/order/domain"
	orderService "github.com/misbahul-alam/cartify-platform/internal/order/service"
	"github.com/misbahul-alam/cartify-platform/internal/payment/domain"
	"github.com/misbahul-alam/cartify-platform/internal/payment/repository"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/webhook"
)

type PaymentService interface {
	RegisterGateway(provider domain.PaymentProvider, gateway domain.PaymentGateway)
	CreatePaymentIntent(ctx context.Context, orderID uuid.UUID, userID uuid.UUID, providerStr string) (*domain.CreatePaymentIntentOutput, error)
	ProcessStripeWebhook(ctx context.Context, payload []byte, sigHeader string, webhookSecret string) error
}

type paymentService struct {
	paymentRepo  repository.PaymentRepo
	orderService orderService.OrderService
	gateways     map[domain.PaymentProvider]domain.PaymentGateway
	mu           sync.RWMutex
}

func NewPaymentService(paymentRepo repository.PaymentRepo, orderService orderService.OrderService) PaymentService {
	return &paymentService{
		paymentRepo:  paymentRepo,
		orderService: orderService,
		gateways:     make(map[domain.PaymentProvider]domain.PaymentGateway),
	}
}

func (s *paymentService) RegisterGateway(provider domain.PaymentProvider, gateway domain.PaymentGateway) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.gateways[provider] = gateway
}

func (s *paymentService) getGateway(provider domain.PaymentProvider) (domain.PaymentGateway, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	gateway, ok := s.gateways[provider]
	if !ok {
		return nil, domain.ErrPaymentGatewayNotFound
	}
	return gateway, nil
}

func (s *paymentService) CreatePaymentIntent(ctx context.Context, orderID uuid.UUID, userID uuid.UUID, providerStr string) (*domain.CreatePaymentIntentOutput, error) {
	provider := domain.PaymentProvider(providerStr)
	gateway, err := s.getGateway(provider)
	if err != nil {
		return nil, err
	}

	order, err := s.orderService.GetOrder(ctx, orderID, userID, "")
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve order: %w", err)
	}

	if order.Status == orderDomain.OrderStatusPaid {
		return nil, domain.ErrOrderAlreadyPaid
	}
	if order.Status != orderDomain.OrderStatusPending && order.Status != orderDomain.OrderStatusProcessing {
		return nil, domain.ErrOrderNotPayable
	}

	input := domain.CreatePaymentIntentInput{
		OrderID:     order.ID.String(),
		Amount:      order.TotalPrice,
		Description: fmt.Sprintf("Payment for Order %s", order.ID.String()),
	}
	output, err := gateway.CreatePaymentIntent(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment intent: %w", err)
	}

	payment, err := domain.NewPayment(order.ID, providerStr, order.TotalPrice, "usd", output.TransactionID)
	if err != nil {
		return nil, err
	}

	if err := s.paymentRepo.Create(payment); err != nil {
		return nil, fmt.Errorf("failed to save payment: %w", err)
	}

	return output, nil
}

func (s *paymentService) ProcessStripeWebhook(ctx context.Context, payload []byte, sigHeader string, webhookSecret string) error {
	event, err := webhook.ConstructEvent(payload, sigHeader, webhookSecret)
	if err != nil {
		return fmt.Errorf("failed to verify webhook signature: %w", err)
	}

	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			return fmt.Errorf("failed to parse payment intent raw data: %w", err)
		}

		payment, err := s.paymentRepo.GetByTransactionID(paymentIntent.ID)
		if err != nil {
			return fmt.Errorf("failed to find payment by transaction ID %s: %w", paymentIntent.ID, err)
		}

		if err := s.orderService.UpdateOrderStatus(ctx, payment.OrderID, string(orderDomain.OrderStatusPaid)); err != nil {
			return fmt.Errorf("failed to update order status to paid: %w", err)
		}

		if err := payment.Complete(); err != nil {
			return err
		}
		if err := s.paymentRepo.Update(payment); err != nil {
			return fmt.Errorf("failed to update payment: %w", err)
		}
	case "payment_intent.payment_failed":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			return fmt.Errorf("failed to parse payment intent raw data: %w", err)
		}

		payment, err := s.paymentRepo.GetByTransactionID(paymentIntent.ID)
		if err != nil {
			return fmt.Errorf("failed to find payment by transaction ID %s: %w", paymentIntent.ID, err)
		}

		errMsg := "unknown error"
		if paymentIntent.LastPaymentError != nil {
			errMsg = paymentIntent.LastPaymentError.Msg
		}

		if err := payment.Fail(errMsg); err != nil {
			return err
		}
		if err := s.paymentRepo.Update(payment); err != nil {
			return fmt.Errorf("failed to update payment: %w", err)
		}
	}

	return nil
}
