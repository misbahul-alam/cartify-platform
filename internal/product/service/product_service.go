package service

import "github.com/misbahul-alam/cartify-platform/internal/product/repository"

type ProductService struct {
	repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}
