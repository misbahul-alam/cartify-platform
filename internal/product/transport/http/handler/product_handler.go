package handler

import (
	"github.com/misbahul-alam/cartify-platform/internal/product/service"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(service *service.ProductService) *ProductHandler {
	return &ProductHandler{service}
}
