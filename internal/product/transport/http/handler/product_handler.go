package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/product/domain"
	"github.com/misbahul-alam/cartify-platform/internal/product/service"
	"github.com/misbahul-alam/cartify-platform/internal/product/transport/http/dto"
	"github.com/misbahul-alam/cartify-platform/internal/shared/response"
	"github.com/misbahul-alam/cartify-platform/internal/shared/utils"
)

type ProductHandler struct {
	service service.ProductService
}

func NewProductHandler(service service.ProductService) *ProductHandler {
	return &ProductHandler{service}
}

func (h *ProductHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	products, total, err := h.service.GetAll(page, limit)
	if err != nil {
		response.NotFound(c, "Product Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    products,
		"success": true,
		"meta": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *ProductHandler) GetById(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Product ID")
		return
	}

	product, err := h.service.GetByID(id)
	if err != nil {
		response.NotFound(c, "Product Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    product,
		"success": true,
	})
}

func (h *ProductHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	product, err := h.service.GetBySlug(slug)
	if err != nil {
		response.NotFound(c, "Product Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    product,
		"success": true,
	})
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	err := h.service.Create(req.SKU, req.Name, req.Slug, req.Description, req.Price, req.CategoryID, req.IsStock, req.IsFeatured)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Product Created",
	})
}

func (h *ProductHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Product ID")
		return
	}
	var req dto.ProductUpdateRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	err = h.service.Update(id, req.SKU, req.Name, req.Slug, req.Description, req.Price, req.CategoryID, req.IsStock, req.IsFeatured, domain.ProductStatus(req.Status))
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product Updated",
	})
}

func (h *ProductHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Product ID")
		return
	}
	err = h.service.Delete(id)
	if err != nil {
		response.NotFound(c, "Product Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product Deleted",
	})
}

func (h *ProductHandler) UploadImage(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Product ID")
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Image is required",
		})
		return
	}

	err = h.service.UploadImage(c.Request.Context(), id, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image Uploaded",
	})
}

func (h *ProductHandler) DeleteImage(c *gin.Context) {
	productIDParam := c.Param("id")
	productID, err := uuid.Parse(productIDParam)
	if err != nil {
		response.NotFound(c, "Invalid Product ID")
		return
	}

	imageIDParam := c.Param("image_id")
	imageID, err := uuid.Parse(imageIDParam)
	if err != nil {
		response.NotFound(c, "Invalid Image ID")
		return
	}

	err = h.service.DeleteImage(c.Request.Context(), productID, imageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image Deleted",
	})
}

func (h *ProductHandler) SetPrimaryImage(c *gin.Context) {
	productIDParam := c.Param("id")
	productID, err := uuid.Parse(productIDParam)
	if err != nil {
		response.NotFound(c, "Invalid Product ID")
		return
	}

	imageIDParam := c.Param("image_id")
	imageID, err := uuid.Parse(imageIDParam)
	if err != nil {
		response.NotFound(c, "Invalid Image ID")
		return
	}

	err = h.service.SetPrimaryImage(productID, imageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Primary Image Set",
	})
}
