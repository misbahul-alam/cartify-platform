package http

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/internal/product/repository"
	"github.com/misbahul-alam/cartify-platform/internal/product/service"
	"github.com/misbahul-alam/cartify-platform/internal/product/transport/http/handler"
	"github.com/misbahul-alam/cartify-platform/internal/shared/middleware"
	"gorm.io/gorm"
)

func Routes(r *gin.RouterGroup, db *gorm.DB, config *config.Config) {
	categoryRepo := repository.NewCategoryRepo(db)
	productRepo := repository.NewProductRepo(db)

	categoryService := service.NewCategoryService(categoryRepo)
	productService := service.NewProductService(productRepo)

	categoryHandler := handler.NewCategoryHandler(categoryService)
	productHandler := handler.NewProductHandler(productService)

	categoryRoute := r.Group("/categories")
	{
		categoryRoute.GET("/", categoryHandler.GetAll)
		categoryRoute.GET("/:id", categoryHandler.GetById)
		categoryRoute.POST("/", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), categoryHandler.Create)
		categoryRoute.PUT("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), categoryHandler.Update)
		categoryRoute.DELETE("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), categoryHandler.Delete)
	}
	productRoute := r.Group("/products")
	{
		productRoute.GET("/", productHandler.GetAll)
		productRoute.GET("/:id", productHandler.GetById)
		productRoute.POST("/", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.Create)
		productRoute.PUT("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.Update)
		productRoute.DELETE("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.Delete)
	}
}
