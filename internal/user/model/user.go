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
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	FirstName  string    `gorm:"size:50;not null" json:"first_name"`
	LastName   string    `gorm:"size:50;not null" json:"last_name"`
	Email      string    `gorm:"unique;size:150;not null" json:"email"`
	Role       Role      `gorm:"default:'customer';not null" json:"role"`
	Password   string    `gorm:"size:255;not null" json:"-"`
	IsActive   bool      `gorm:"default:true;not null" json:"is_active"`
	IsVerified bool      `gorm:"default:false;not null" json:"is_verified"`
	CreatedAt  time.Time `gorm:"DEFAULT:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time `gorm:"DEFAULT:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
