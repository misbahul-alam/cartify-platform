package service

import "github.com/misbahul-alam/cartify-platform/internal/product/repository"

type ProductService struct {
	repo repository.ProductRepo
}

func NewProductService(repo repository.ProductRepo) *ProductService {
	return &ProductService{repo: repo}
}
