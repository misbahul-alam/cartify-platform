package service

import "github.com/misbahul-alam/cartify-platform/internal/product/repository"

type CategoryService struct {
	repo repository.CategoryRepository
}

func NewCategoryService(repo repository.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}
