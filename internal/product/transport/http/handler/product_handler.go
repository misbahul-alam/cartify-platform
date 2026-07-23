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

// GetAll godoc
// @Summary      Get all products
// @Description  Get a list of all products with pagination
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        page   query     int  false  "Page number"
// @Param        limit  query     int  false  "Limit per page"
// @Success      200    {object}  response.Response
// @Failure      404    {object}  response.Response
// @Router       /products [get]
func (h *ProductHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	products, total, err := h.service.GetAll(page, limit)
	if err != nil {
		response.NotFound(c, "Product Not Found")
		return
	}

	response.Success(c, http.StatusOK, "Products retrieved successfully", products, &response.Pagination{
		Total: int(total),
		Page:  page,
		Limit: limit,
	})
}

// GetById godoc
// @Summary      Get product by ID
// @Description  Get details of a single product by its UUID
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Product ID (UUID)"
// @Success      200  {object}  response.Response
// @Failure      404  {object}  response.Response
// @Router       /products/{id} [get]
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

	response.Success(c, http.StatusOK, "Product retrieved successfully", product, nil)
}

// GetBySlug godoc
// @Summary      Get product by Slug
// @Description  Get details of a single product by its URL slug
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        slug  path      string  true  "Product Slug"
// @Success      200   {object}  response.Response
// @Failure      404   {object}  response.Response
// @Router       /products/slug/{slug} [get]
func (h *ProductHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	product, err := h.service.GetBySlug(slug)
	if err != nil {
		response.NotFound(c, "Product Not Found")
		return
	}

	response.Success(c, http.StatusOK, "Product retrieved successfully", product, nil)
}

// Create godoc
// @Summary      Create product
// @Description  Create a new product (Admin only)
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        request  body      dto.CreateProductRequest  true  "Create Product Request"
// @Success      201      {object}  response.Response
// @Failure      400      {object}  response.Response
// @Failure      500      {object}  response.Response
// @Security     BearerAuth
// @Router       /products [post]
func (h *ProductHandler) Create(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		response.ValidationError(c, utils.ParseValidationError(err))
		return
	}

	err := h.service.Create(req.SKU, req.Name, req.Slug, req.Description, req.Price, req.CategoryID, req.IsStock, req.IsFeatured)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Product Created", nil, nil)
}

// Update godoc
// @Summary      Update product
// @Description  Update product details by its UUID (Admin only)
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        id       path      string                    true  "Product ID (UUID)"
// @Param        request  body      dto.ProductUpdateRequest  true  "Update Product Request"
// @Success      200      {object}  response.Response
// @Failure      400      {object}  response.Response
// @Failure      404      {object}  response.Response
// @Security     BearerAuth
// @Router       /products/{id} [put]
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

	response.Success(c, http.StatusOK, "Product Updated", nil, nil)
}

// Delete godoc
// @Summary      Delete product
// @Description  Delete a product by its UUID (Admin only)
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Product ID (UUID)"
// @Success      200  {object}  response.Response
// @Failure      404  {object}  response.Response
// @Security     BearerAuth
// @Router       /products/{id} [delete]
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
	response.Success(c, http.StatusOK, "Product Deleted", nil, nil)
}

// UploadImage godoc
// @Summary      Upload product image
// @Description  Upload an image file for a product (Admin only)
// @Tags         products
// @Accept       multipart/form-data
// @Produce      json
// @Param        id     path      string  true  "Product ID (UUID)"
// @Param        image  formData  file    true  "Product Image file"
// @Success      200    {object}  response.Response
// @Failure      400    {object}  response.Response
// @Failure      500    {object}  response.Response
// @Security     BearerAuth
// @Router       /products/{id}/images [post]
func (h *ProductHandler) UploadImage(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.NotFound(c, "Invalid Product ID")
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		response.ValidationError(c, map[string]string{
			"image": "Image is required",
		})
		return
	}

	err = h.service.UploadImage(c.Request.Context(), id, file)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Image Uploaded", nil, nil)
}

// DeleteImage godoc
// @Summary      Delete product image
// @Description  Delete an image from a product by its UUID (Admin only)
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        id        path      string  true  "Product ID (UUID)"
// @Param        image_id  path      string  true  "Image ID (UUID)"
// @Success      200       {object}  response.Response
// @Failure      404       {object}  response.Response
// @Failure      500       {object}  response.Response
// @Security     BearerAuth
// @Router       /products/{id}/images/{image_id} [delete]
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
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Image Deleted", nil, nil)
}

// SetPrimaryImage godoc
// @Summary      Set primary image
// @Description  Set an image as the primary cover image for a product (Admin only)
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        id        path      string  true  "Product ID (UUID)"
// @Param        image_id  path      string  true  "Image ID (UUID)"
// @Success      200       {object}  response.Response
// @Failure      404       {object}  response.Response
// @Failure      500       {object}  response.Response
// @Security     BearerAuth
// @Router       /products/{id}/images/{image_id}/primary [patch]
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
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Primary Image Set", nil, nil)
}
