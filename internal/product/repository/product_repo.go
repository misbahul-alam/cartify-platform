package repository

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
	"github.com/misbahul-alam/cartify-platform/internal/product/model"
	"gorm.io/gorm"
)

type ProductRepo interface {
	Create(product *domain.Product) error
	GetAll(page, limit int) ([]*domain.Product, int64, error)
	GetByID(id uuid.UUID) (*domain.Product, error)
	GetBySlug(slug string) (*domain.Product, error)
	Update(product *domain.Product) error
	Delete(id uuid.UUID) error
	AddImage(image *domain.ProductImage) error
	DeleteImage(id uuid.UUID) error
	UpdateImage(image *domain.ProductImage) error
}
type productRepo struct {
	db *gorm.DB
}

func NewProductRepo(db *gorm.DB) ProductRepo {
	return &productRepo{db: db}
}

func (r *productRepo) Create(product *domain.Product) error {
	m := model.ProductFromDomain(product)
	return r.db.Create(m).Error
}

func (r *productRepo) GetAll(page, limit int) ([]*domain.Product, int64, error) {
	var products []*model.Product
	var total int64

	db := r.db.Model(&model.Product{})
	db.Count(&total)

	offset := (page - 1) * limit
	err := db.Preload("Category").Preload("Images").Offset(offset).Limit(limit).Find(&products).Error
	if err != nil {
		return nil, 0, err
	}

	domainProducts := make([]*domain.Product, len(products))
	for i, p := range products {
		domainProducts[i] = p.ProductToDomain()
	}

	return domainProducts, total, nil
}

func (r *productRepo) GetByID(id uuid.UUID) (*domain.Product, error) {
	var product model.Product

	err := r.db.Preload("Category").Preload("Images").First(&product, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return product.ProductToDomain(), nil
}

func (r *productRepo) GetBySlug(slug string) (*domain.Product, error) {
	var product model.Product

	err := r.db.Preload("Category").Preload("Images").First(&product, "slug = ?", slug).Error
	if err != nil {
		return nil, err
	}

	return product.ProductToDomain(), nil
}

func (r *productRepo) Update(product *domain.Product) error {
	m := model.ProductFromDomain(product)
	return r.db.Save(m).Error
}

func (r *productRepo) Delete(id uuid.UUID) error {
	return r.db.Delete(&model.Product{}, "id = ?", id).Error
}

func (r *productRepo) AddImage(image *domain.ProductImage) error {
	m := model.ProductImageFromDomain(image)
	return r.db.Create(m).Error
}

func (r *productRepo) DeleteImage(id uuid.UUID) error {
	return r.db.Delete(&model.ProductImage{}, "id = ?", id).Error
}

func (r *productRepo) UpdateImage(image *domain.ProductImage) error {
	m := model.ProductImageFromDomain(image)
	return r.db.Save(m).Error
}
