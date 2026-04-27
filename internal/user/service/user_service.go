package service

import "github.com/misbahul-alam/cartify-platform/internal/user/repository"

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}
