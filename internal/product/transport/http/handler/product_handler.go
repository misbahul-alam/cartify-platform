package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/internal/product/service"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(service *service.ProductService) *ProductHandler {
	return &ProductHandler{service}
}

func (handler *ProductHandler) GetAll(c *gin.Context)  {}
func (handler *ProductHandler) GetById(c *gin.Context) {}
func (handler *ProductHandler) Create(c *gin.Context)  {}
func (handler *ProductHandler) Update(c *gin.Context)  {}
func (handler *ProductHandler) Delete(c *gin.Context)  {}
