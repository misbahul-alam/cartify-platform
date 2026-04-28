package domain

import "github.com/google/uuid"

type User struct {
	ID         uuid.UUID
	FirstName  string
	LastName   string
	Email      string
	Password   string
	IsActive   bool
	IsVerified bool
}

func (u *User) FullName() string {
	return u.FirstName + " " + u.LastName
}
