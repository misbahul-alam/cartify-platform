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

type CategoryHandler struct {
	service service.CategoryService
}

func NewCategoryHandler(service service.CategoryService) *CategoryHandler {
	return &CategoryHandler{service}
}

func (h *CategoryHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	categories, total, err := h.service.GetAll(page, limit)
	if err != nil {
		response.NotFound(c, "Category Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    categories,
		"success": true,
		"meta": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}
func (h *CategoryHandler) GetById(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Category ID")
		return
	}

	category, err := h.service.GetByID(id)
	if err != nil {
		response.NotFound(c, "Category Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    category,
		"success": true,
	})
}
func (h *CategoryHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	category, err := h.service.GetBySlug(slug)
	if err != nil {
		response.NotFound(c, "Category Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    category,
		"success": true,
	})
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	err := h.service.Create(req.Name, req.Slug, req.Description, req.ParentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Category Created",
	})
}
func (h *CategoryHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Category ID")
		return
	}
	var req dto.CategoryUpdateRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	status := domain.Status(req.Status)
	if status == "" {
		status = domain.Public
	}

	err = h.service.Update(id, req.Name, req.Slug, req.Description, status, req.ParentID)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Category Updated",
	})
}
func (h *CategoryHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Category ID")
		return
	}
	err = h.service.Delete(id)
	if err != nil {
		response.NotFound(c, "Category Not Found")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Category Deleted",
	})
}
