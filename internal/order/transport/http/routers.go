package http

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	cartRepository "github.com/misbahul-alam/cartify-platform/internal/cart/repository"
	cartService "github.com/misbahul-alam/cartify-platform/internal/cart/service"
	orderRepository "github.com/misbahul-alam/cartify-platform/internal/order/repository"
	orderService "github.com/misbahul-alam/cartify-platform/internal/order/service"
	orderHandler "github.com/misbahul-alam/cartify-platform/internal/order/transport/http/handler"
	productRepository "github.com/misbahul-alam/cartify-platform/internal/product/repository"
	"github.com/misbahul-alam/cartify-platform/internal/shared/middleware"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Routes(r *gin.RouterGroup, db *gorm.DB, redisClient *redis.Client, config *config.Config) {
	productRepo := productRepository.NewProductRepo(db)
	cartRepo := cartRepository.NewCartRepo(redisClient, config.Redis.TTL)
	cartService := cartService.NewCartService(cartRepo, productRepo)

	orderRepo := orderRepository.NewOrderRepo(db)
	orderService := orderService.NewOrderService(orderRepo, cartService)
	handler := orderHandler.NewOrderHandler(orderService)

	orderRoute := r.Group("orders", middleware.AuthMiddleware(config))
	{
		orderRoute.POST("", handler.CreateOrder)
		orderRoute.GET("", handler.ListUserOrders)
		orderRoute.GET("/all", middleware.RoleMiddleware("admin", "seller"), handler.ListAllOrders)
		orderRoute.GET("/:id", handler.GetOrder)
		orderRoute.PUT("/:id/cancel", handler.CancelOrder)
		orderRoute.PUT("/:id/status", middleware.RoleMiddleware("admin", "seller"), handler.UpdateOrderStatus)
	}
}
