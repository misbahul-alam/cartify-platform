package dto

import "github.com/google/uuid"

type CreateCategoryRequest struct {
	Name        string     `json:"name" binding:"required,min=3,max=35"`
	Slug        string     `json:"slug" binding:"required,min=3,max=35"`
	Description string     `json:"description" binding:"required,min=3,max=100"`
	ParentID    *uuid.UUID `json:"parent_id"`
}

type CategoryUpdateRequest struct {
	Name        string     `json:"name" binding:"required,min=3,max=35"`
	Slug        string     `json:"slug" binding:"required,min=3,max=35"`
	Description string     `json:"description" binding:"required,min=3,max=100"`
	ParentID    *uuid.UUID `json:"parent_id"`
	Status      string     `json:"status" binding:"omitempty,oneof=public private"`
}
