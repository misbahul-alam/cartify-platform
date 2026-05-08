package http

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/internal/product/repository"
	"github.com/misbahul-alam/cartify-platform/internal/product/service"
	"github.com/misbahul-alam/cartify-platform/internal/product/transport/http/handler"
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

	productRoute := r.Group("/products")
}
