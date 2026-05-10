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
	ID          uuid.UUID
	Name        string
	Slug        string
	Description string
	ParentID    *uuid.UUID
	Status      Status
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func NewCategory(name, slug, description string, parentID *uuid.UUID) (*Category, error) {
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
		Status:      Public,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}, nil
}

func (c *Category) Update(name, slug, description string, status Status, parentID *uuid.UUID) error {
	if name == "" {
		return errors.New("category name is required")
	}
	c.Name = name
	c.Slug = slug
	c.Description = description
	c.Status = status
	c.ParentID = parentID
	c.UpdatedAt = time.Now()
	return nil
}
