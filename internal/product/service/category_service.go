package service

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
	"github.com/misbahul-alam/cartify-platform/internal/product/repository"
)

type CategoryService interface {
	GetAll() ([]*domain.Category, error)
	GetByID(id uuid.UUID) (*domain.Category, error)
	Create(name, slug, description string, parentID *uuid.UUID) error
	Update(id uuid.UUID, name, slug, description string, status domain.Status, parentID *uuid.UUID) error
	Delete(id uuid.UUID) error
}

type categoryService struct {
	repo repository.CategoryRepo
}

func NewCategoryService(repo repository.CategoryRepo) CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) GetAll() ([]*domain.Category, error) {
	return s.repo.GetAll()
}

func (s *categoryService) GetByID(id uuid.UUID) (*domain.Category, error) {
	return s.repo.GetByID(id)
}

func (s *categoryService) Create(name, slug, description string, parentID *uuid.UUID) error {
	category, err := domain.NewCategory(name, slug, description, parentID)
	if err != nil {
		return err
	}

	return s.repo.Create(category)
}

func (s *categoryService) Update(id uuid.UUID, name, slug, description string, status domain.Status, parentID *uuid.UUID) error {
	category, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	err = category.Update(name, slug, description, status, parentID)
	if err != nil {
		return err
	}

	return s.repo.Update(category)
}

func (s *categoryService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
