package service

import (
	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/user/model"
	"github.com/misbahul-alam/cartify-platform/internal/user/repository"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (u *UserService) GetUserById(id uuid.UUID) (*model.User, error) {
	res, err := u.repo.FindUserById(id)
	if err != nil {
		return nil, err
	}
	return res, nil
}
