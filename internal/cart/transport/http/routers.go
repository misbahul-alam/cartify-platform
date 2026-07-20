package http

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	cartRepository "github.com/misbahul-alam/cartify-platform/internal/cart/repository"
	cartService "github.com/misbahul-alam/cartify-platform/internal/cart/service"
	cartHandler "github.com/misbahul-alam/cartify-platform/internal/cart/transport/http/handler"
	productRepository "github.com/misbahul-alam/cartify-platform/internal/product/repository"
	"github.com/misbahul-alam/cartify-platform/internal/shared/middleware"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Routes(r *gin.RouterGroup, db *gorm.DB, redisClient *redis.Client, config *config.Config) {
	productRepo := productRepository.NewProductRepo(db)
	cartRepo := cartRepository.NewCartRepo(redisClient, config.Redis.TTL)
	cService := cartService.NewCartService(cartRepo, productRepo)
	handler := cartHandler.NewCartHandler(cService)

	cartRoute := r.Group("cart", middleware.AuthMiddleware(config))
	{
		cartRoute.GET("", handler.GetCart)
		cartRoute.DELETE("", handler.ClearCart)
		cartRoute.POST("/items", handler.AddItem)
		cartRoute.PUT("/items", handler.UpdateItem)
		cartRoute.DELETE("/items/:product_id", handler.RemoveItem)
	}
}

