package repository

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/user/model"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindUserByEmail(email string) (*model.User, error)
	FindUserById(id uuid.UUID) (*model.User, error)
	CreateUser(firstName string, lastName string, email string, password string) (*model.User, error)
}

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {

	return &UserRepo{db: db}
}

func (repo *UserRepo) FindUserByEmail(email string) (*model.User, error) {
	var user model.User

	err := repo.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
func (repo *UserRepo) FindUserById(id uuid.UUID) (*model.User, error) {
	var user model.User
	err := repo.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (repo *UserRepo) CreateUser(firstName, lastName, email, password string) (*model.User, error) {
	user := &model.User{
		FirstName: firstName,
		LastName:  lastName,
		Email:     email,
		Password:  password,
	}

	if err := repo.db.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}
