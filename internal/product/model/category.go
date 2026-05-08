package model

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	Public  Status = "public"
	Private Status = "private"
)

type Category struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string     `gorm:"size:50;not null" json:"name"`
	Slug        string     `gorm:"size:50;uniqueIndex;not null" json:"slug"`
	Description string     `gorm:"type:text" json:"description"`
	ParentID    *uuid.UUID `gorm:"type:uuid" json:"parent_id,omitempty"`
	Status      Status     `gorm:"type:varchar(20);default:'public';not null" json:"status"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Category) TableName() string {
	return "categories"
}
