package repository

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/user/model"
	"gorm.io/gorm"
)

type UserRepo interface {
	FindUserByEmail(email string) (*model.User, error)
	FindUserById(id uuid.UUID) (*model.User, error)
	FindAllUsers() ([]model.User, error)
	CreateUser(firstName string, lastName string, email string, password string) (*model.User, error)
	UpdateUser(user *model.User) error
	DeleteUser(id uuid.UUID) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) UserRepo {

	return &userRepo{db: db}
}

func (repo *userRepo) FindUserByEmail(email string) (*model.User, error) {
	var user model.User

	err := repo.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (repo *userRepo) FindUserById(id uuid.UUID) (*model.User, error) {
	var user model.User
	err := repo.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (repo *userRepo) FindAllUsers() ([]model.User, error) {
	var users []model.User
	if err := repo.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (repo *userRepo) CreateUser(firstName, lastName, email, password string) (*model.User, error) {
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

func (repo *userRepo) UpdateUser(user *model.User) error {
	return repo.db.Save(user).Error
}

func (repo *userRepo) DeleteUser(id uuid.UUID) error {
	return repo.db.Delete(&model.User{}, id).Error
}
