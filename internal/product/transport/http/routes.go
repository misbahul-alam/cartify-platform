package http

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/infra/storage"
	"github.com/misbahul-alam/cartify-platform/internal/product/repository"
	"github.com/misbahul-alam/cartify-platform/internal/product/service"
	"github.com/misbahul-alam/cartify-platform/internal/product/transport/http/handler"
	"github.com/misbahul-alam/cartify-platform/internal/shared/middleware"
	"gorm.io/gorm"
)

func Routes(r *gin.RouterGroup, db *gorm.DB, config *config.Config) {
	categoryRepo := repository.NewCategoryRepo(db)
	productRepo := repository.NewProductRepo(db)

	cldStorage, err := storage.NewCloudinaryStorage(config)
	if err != nil {
		panic(err)
	}

	categoryService := service.NewCategoryService(categoryRepo)
	productService := service.NewProductService(productRepo, cldStorage)

	categoryHandler := handler.NewCategoryHandler(categoryService)
	productHandler := handler.NewProductHandler(productService)

	categoryRoute := r.Group("/categories")
	{
		categoryRoute.GET("/", categoryHandler.GetAll)
		categoryRoute.GET("/:id", categoryHandler.GetById)
		categoryRoute.GET("/slug/:slug", categoryHandler.GetBySlug)
		categoryRoute.POST("", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), categoryHandler.Create)
		categoryRoute.POST("/", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), categoryHandler.Create)
		categoryRoute.PUT("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), categoryHandler.Update)
		categoryRoute.DELETE("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), categoryHandler.Delete)
	}

	productRoute := r.Group("/products")
	{
		productRoute.GET("/", productHandler.GetAll)
		productRoute.GET("/:id", productHandler.GetById)
		productRoute.GET("/slug/:slug", productHandler.GetBySlug)
		productRoute.POST("/", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.Create)
		productRoute.PUT("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.Update)
		productRoute.DELETE("/:id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.Delete)

		productRoute.POST("/:id/images", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.UploadImage)
		productRoute.DELETE("/:id/images/:image_id", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.DeleteImage)
		productRoute.PATCH("/:id/images/:image_id/primary", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), productHandler.SetPrimaryImage)
	}
}
