package service
import (
	"context"
	"errors"
	"mime/multipart"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/infra/storage"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
	"github.com/misbahul-alam/cartify-platform/internal/product/repository"
)

type ProductService interface {
	GetAll(page, limit int) ([]*domain.Product, int64, error)
	GetByID(id uuid.UUID) (*domain.Product, error)
	GetBySlug(slug string) (*domain.Product, error)
	Create(sku, name, slug, description string, price float64, categoryID *uuid.UUID, isStock, isFeatured bool) error
	Update(id uuid.UUID, sku, name, slug, description string, price float64, categoryID *uuid.UUID, isStock, isFeatured bool, status domain.ProductStatus) error
	Delete(id uuid.UUID) error
	UploadImage(ctx context.Context, productID uuid.UUID, file *multipart.FileHeader) error
	DeleteImage(ctx context.Context, productID, imageID uuid.UUID) error
	SetPrimaryImage(productID, imageID uuid.UUID) error
}

type productService struct {
	repo    repository.ProductRepo
	storage storage.Storage
}

func NewProductService(repo repository.ProductRepo, storage storage.Storage) ProductService {
	return &productService{
		repo:    repo,
		storage: storage,
	}
}

func (s *productService) GetAll(page, limit int) ([]*domain.Product, int64, error) {
	return s.repo.GetAll(page, limit)
}

func (s *productService) GetByID(id uuid.UUID) (*domain.Product, error) {
	return s.repo.GetByID(id)
}

func (s *productService) GetBySlug(slug string) (*domain.Product, error) {
	return s.repo.GetBySlug(slug)
}

func (s *productService) Create(sku, name, slug, description string, price float64, categoryID *uuid.UUID, isStock, isFeatured bool) error {
	product, err := domain.NewProduct(sku, name, slug, description, price, categoryID, isStock, isFeatured)
	if err != nil {
		return err
	}

	return s.repo.Create(product)
}

func (s *productService) Update(id uuid.UUID, sku, name, slug, description string, price float64, categoryID *uuid.UUID, isStock, isFeatured bool, status domain.ProductStatus) error {
	product, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	err = product.Update(sku, name, slug, description, price, categoryID, isStock, isFeatured, status)
	if err != nil {
		return err
	}

	return s.repo.Update(product)
}

func (s *productService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}

func (s *productService) UploadImage(ctx context.Context, productID uuid.UUID, file *multipart.FileHeader) error {
	product, err := s.repo.GetByID(productID)
	if err != nil {
		return err
	}

	url, publicID, err := s.storage.UploadFile(ctx, file, "products")
	if err != nil {
		return err
	}

	isPrimary := len(product.Images) == 0
	image := domain.NewProductImage(productID, url, publicID, isPrimary)

	return s.repo.AddImage(image)
}

func (s *productService) DeleteImage(ctx context.Context, productID, imageID uuid.UUID) error {
	product, err := s.repo.GetByID(productID)
	if err != nil {
		return err
	}

	var imageToDelete *domain.ProductImage
	for _, img := range product.Images {
		if img.ID == imageID {
			imageToDelete = img
			break
		}
	}

	if imageToDelete == nil {
		return errors.New("image not found")
	}

	// Delete from storage
	err = s.storage.DeleteFile(ctx, imageToDelete.PublicID)
	if err != nil {
		return err
	}

	// Delete from repository
	err = s.repo.DeleteImage(imageID)
	if err != nil {
		return err
	}

	// If the deleted image was primary and there are other images, set the first one as primary
	if imageToDelete.IsPrimary && len(product.Images) > 1 {
		var newPrimary *domain.ProductImage
		for _, img := range product.Images {
			if img.ID != imageID {
				newPrimary = img
				break
			}
		}
		if newPrimary != nil {
			newPrimary.IsPrimary = true
			return s.repo.UpdateImage(newPrimary)
		}
	}

	return nil
}

func (s *productService) SetPrimaryImage(productID, imageID uuid.UUID) error {
	product, err := s.repo.GetByID(productID)
	if err != nil {
		return err
	}

	var targetImage *domain.ProductImage
	for _, img := range product.Images {
		if img.ID == imageID {
			targetImage = img
			break
		}
	}

	if targetImage == nil {
		return errors.New("image not found")
	}

	// Start a transaction would be better here, but for now we'll do it sequentially
	for _, img := range product.Images {
		if img.IsPrimary {
			img.IsPrimary = false
			if err := s.repo.UpdateImage(img); err != nil {
				return err
			}
		}
	}

	targetImage.IsPrimary = true
	return s.repo.UpdateImage(targetImage)
}
