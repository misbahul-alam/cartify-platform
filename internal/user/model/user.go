package model

import "time"

type Role string

const (
	RoleCustomer Role = "customer"
	RoleSeller   Role = "seller"
	RoleAdmin    Role = "admin"
)

type User struct {
	ID         int64     `gorm:"primary_key;AUTO_INCREMENT"`
	FirstName  string    `gorm:"size:50;not null"`
	LastName   string    `gorm:"size:50;not null"`
	Email      string    `gorm:"unique;size:150;not null"`
	Role       Role      `gorm:"default:'customer';not null'"`
	Password   string    `gorm:"size:255;not null"`
	IsActive   bool      `gorm:"default:true;not null"`
	IsVerified bool      `gorm:"default:false;not null"`
	CreatedAt  time.Time `gorm:"DEFAULT:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time `gorm:"DEFAULT:CURRENT_TIMESTAMP"`
}

func (User) TableName() string {
	return "users"
}
