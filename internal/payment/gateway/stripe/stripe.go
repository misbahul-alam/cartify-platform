package stripe

import (
	"context"
	"fmt"
	"math"

	"github.com/misbahul-alam/cartify-platform/internal/payment/domain"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/paymentintent"
)

type stripeGateway struct {
	secretKey string
	currency  string
}

func NewStripeGateway(secretKey string, defaultCurrency string) domain.PaymentGateway {
	stripe.Key = secretKey
	return &stripeGateway{
		secretKey: secretKey,
		currency:  defaultCurrency,
	}
}

func (g *stripeGateway) CreatePaymentIntent(ctx context.Context, input domain.CreatePaymentIntentInput) (*domain.CreatePaymentIntentOutput, error) {

	amountInCents := int64(math.Round(input.Amount * 100))

	currency := input.Currency
	if currency == "" {
		currency = g.currency
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(amountInCents),
		Currency: stripe.String(currency),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}
	params.AddMetadata("order_id", input.OrderID)

	pi, err := paymentintent.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create Stripe payment intent: %w", err)
	}

	return &domain.CreatePaymentIntentOutput{
		ClientSecret:  pi.ClientSecret,
		TransactionID: pi.ID,
	}, nil
}
