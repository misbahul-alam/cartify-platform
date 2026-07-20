package http

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	cartRepository "github.com/misbahul-alam/cartify-platform/internal/cart/repository"
	cartService "github.com/misbahul-alam/cartify-platform/internal/cart/service"
	orderRepository "github.com/misbahul-alam/cartify-platform/internal/order/repository"
	orderService "github.com/misbahul-alam/cartify-platform/internal/order/service"
	"github.com/misbahul-alam/cartify-platform/internal/payment/domain"
	"github.com/misbahul-alam/cartify-platform/internal/payment/gateway/stripe"
	"github.com/misbahul-alam/cartify-platform/internal/payment/repository"
	"github.com/misbahul-alam/cartify-platform/internal/payment/service"
	"github.com/misbahul-alam/cartify-platform/internal/payment/transport/http/handler"
	productRepository "github.com/misbahul-alam/cartify-platform/internal/product/repository"
	"github.com/misbahul-alam/cartify-platform/internal/shared/middleware"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Routes(r *gin.RouterGroup, db *gorm.DB, redisClient *redis.Client, config *config.Config) {
	productRepo := productRepository.NewProductRepo(db)
	cartRepo := cartRepository.NewCartRepo(redisClient, config.Redis.TTL)
	cartServ := cartService.NewCartService(cartRepo, productRepo)

	orderRepo := orderRepository.NewOrderRepo(db)
	orderServ := orderService.NewOrderService(orderRepo, cartServ)

	paymentRepo := repository.NewPaymentRepo(db)
	paymentServ := service.NewPaymentService(paymentRepo, orderServ)

	stripeGateway := stripe.NewStripeGateway(config.Stripe.SecretKey, config.Stripe.Currency)
	paymentServ.RegisterGateway(domain.PaymentProviderStripe, stripeGateway)

	paymentHandler := handler.NewPaymentHandler(paymentServ, config)

	r.POST("/payments/intent", middleware.AuthMiddleware(config), paymentHandler.CreatePaymentIntent)
	r.POST("/payments/webhook/stripe", paymentHandler.StripeWebhook)
}
