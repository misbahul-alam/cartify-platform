package repository

import "gorm.io/gorm"

type ProductRepository interface{}
type ProductRepo struct {
	db *gorm.DB
}

func NewProductRepo(db *gorm.DB) *ProductRepo {
	return &ProductRepo{db: db}
}
