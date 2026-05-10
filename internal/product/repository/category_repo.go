package repository

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
	"github.com/misbahul-alam/cartify-platform/internal/product/model"
	"gorm.io/gorm"
)

type CategoryRepo interface {
	Create(category *domain.Category) error
	GetAll() ([]*domain.Category, error)
	GetByID(id uuid.UUID) (*domain.Category, error)
	Update(category *domain.Category) error
	Delete(id uuid.UUID) error
}

type categoryRepo struct {
	db *gorm.DB
}

func NewCategoryRepo(db *gorm.DB) CategoryRepo {
	return &categoryRepo{
		db: db,
	}
}

func (r *categoryRepo) Create(category *domain.Category) error {
	m := model.FromDomain(category)
	return r.db.Create(m).Error
}

func (r *categoryRepo) GetAll() ([]*domain.Category, error) {
	var categories []*model.Category

	err := r.db.Find(&categories).Error
	if err != nil {
		return nil, err
	}

	domainCategories := make([]*domain.Category, len(categories))
	for i, c := range categories {
		domainCategories[i] = c.ToDomain()
	}

	return domainCategories, nil
}

func (r *categoryRepo) GetByID(id uuid.UUID) (*domain.Category, error) {
	var category model.Category

	err := r.db.First(&category, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return category.ToDomain(), nil
}

func (r *categoryRepo) Update(category *domain.Category) error {
	m := model.FromDomain(category)
	return r.db.Save(m).Error
}

func (r *categoryRepo) Delete(id uuid.UUID) error {
	return r.db.Delete(&model.Category{}, "id = ?", id).Error
}
