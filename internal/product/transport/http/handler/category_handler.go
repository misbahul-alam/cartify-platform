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

// GetAll godoc
// @Summary      Get all categories
// @Description  Get a list of all categories with pagination
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        page   query     int  false  "Page number"
// @Param        limit  query     int  false  "Limit per page"
// @Success      200    {object}  response.Response
// @Failure      404    {object}  response.Response
// @Router       /categories [get]
func (h *CategoryHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	categories, total, err := h.service.GetAll(page, limit)
	if err != nil {
		response.NotFound(c, "Category Not Found")
		return
	}

	response.Success(c, http.StatusOK, "Categories retrieved successfully", categories, &response.Pagination{
		Total: int(total),
		Page:  page,
		Limit: limit,
	})
}

// GetById godoc
// @Summary      Get category by ID
// @Description  Get details of a single category by its UUID
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Category ID (UUID)"
// @Success      200  {object}  response.Response
// @Failure      404  {object}  response.Response
// @Router       /categories/{id} [get]
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
	response.Success(c, http.StatusOK, "Category retrieved successfully", category, nil)
}

// GetBySlug godoc
// @Summary      Get category by Slug
// @Description  Get details of a single category by its URL slug
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        slug  path      string  true  "Category Slug"
// @Success      200   {object}  response.Response
// @Failure      404   {object}  response.Response
// @Router       /categories/slug/{slug} [get]
func (h *CategoryHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	category, err := h.service.GetBySlug(slug)
	if err != nil {
		response.NotFound(c, "Category Not Found")
		return
	}
	response.Success(c, http.StatusOK, "Category retrieved successfully", category, nil)
}

// Create godoc
// @Summary      Create category
// @Description  Create a new category (Admin only)
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        request  body      dto.CreateCategoryRequest  true  "Create Category Request"
// @Success      201      {object}  response.Response
// @Failure      400      {object}  response.Response
// @Failure      500      {object}  response.Response
// @Security     BearerAuth
// @Router       /categories [post]
func (h *CategoryHandler) Create(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	err := h.service.Create(req.Name, req.Slug, req.Description, req.ImageUrl, req.ParentID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Category Created", nil, nil)
}

// Update godoc
// @Summary      Update category
// @Description  Update category details by its UUID (Admin only)
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id       path      string                     true  "Category ID (UUID)"
// @Param        request  body      dto.CategoryUpdateRequest  true  "Update Category Request"
// @Success      200      {object}  response.Response
// @Failure      400      {object}  response.Response
// @Failure      404      {object}  response.Response
// @Security     BearerAuth
// @Router       /categories/{id} [put]
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

	err = h.service.Update(id, req.Name, req.Slug, req.Description, req.ImageUrl, status, req.ParentID)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Category Updated", nil, nil)
}

// Delete godoc
// @Summary      Delete category
// @Description  Delete a category by its UUID (Admin only)
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Category ID (UUID)"
// @Success      200  {object}  response.Response
// @Failure      404  {object}  response.Response
// @Security     BearerAuth
// @Router       /categories/{id} [delete]
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
	response.Success(c, http.StatusOK, "Category Deleted", nil, nil)
}
