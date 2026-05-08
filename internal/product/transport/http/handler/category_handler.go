package handler

import (
	"github.com/misbahul-alam/cartify-platform/internal/product/service"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler(service *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{service}
}
