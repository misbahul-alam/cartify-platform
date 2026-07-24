package domain

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	Public  Status = "public"
	Private Status = "private"
)

type Category struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	ImageUrl    string     `json:"image_url"`
	Status      Status     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func NewCategory(name, slug, description string, parentID *uuid.UUID, imageURL string) (*Category, error) {
	if name == "" {
		return nil, errors.New("category name is required")
	}

	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	}

	return &Category{
		ID:          uuid.New(),
		Name:        name,
		Slug:        slug,
		Description: description,
		ParentID:    parentID,
		ImageUrl:    imageURL,
		Status:      Public,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}, nil
}

func (c *Category) Update(name, slug, description string, status Status, parentID *uuid.UUID, imageURL string) error {
	if name == "" {
		return errors.New("category name is required")
	}
	c.Name = name
	c.Slug = slug
	c.Description = description
	c.Status = status
	c.ParentID = parentID
	c.ImageUrl = imageURL
	c.UpdatedAt = time.Now()
	return nil
}
