package domain

type User struct {
	ID         int64
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
