package model

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleCustomer Role = "customer"
	RoleSeller   Role = "seller"
	RoleAdmin    Role = "admin"
)

type User struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FirstName  string    `gorm:"size:50;not null"`
	LastName   string    `gorm:"size:50;not null"`
	Email      string    `gorm:"unique;size:150;not null"`
	Role       Role      `gorm:"default:'customer';not null"`
	Password   string    `gorm:"size:255;not null"`
	IsActive   bool      `gorm:"default:true;not null"`
	IsVerified bool      `gorm:"default:false;not null"`
	CreatedAt  time.Time `gorm:"DEFAULT:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time `gorm:"DEFAULT:CURRENT_TIMESTAMP"`
}

func (User) TableName() string {
	return "users"
}
