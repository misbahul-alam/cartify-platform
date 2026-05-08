package repository

import "gorm.io/gorm"

type CategoryRepository interface {
}
type CategoryRepo struct {
	db *gorm.DB
}

func NewCategoryRepo(db *gorm.DB) *CategoryRepo {
	return &CategoryRepo{db: db}
}
