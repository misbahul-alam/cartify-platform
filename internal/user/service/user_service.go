package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/shared/auth"
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

func (u *UserService) GetAllUsers() ([]model.User, error) {
	return u.repo.FindAllUsers()
}

func (u *UserService) UpdateProfile(id uuid.UUID, firstName, lastName string) (*model.User, error) {
	user, err := u.repo.FindUserById(id)
	if err != nil {
		return nil, err
	}

	user.FirstName = firstName
	user.LastName = lastName

	if err := u.repo.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (u *UserService) UpdatePassword(id uuid.UUID, oldPassword, newPassword string) error {
	user, err := u.repo.FindUserById(id)
	if err != nil {
		return err
	}

	if !auth.CheckPassword(oldPassword, user.Password) {
		return errors.New("old password does not match")
	}

	hashedPassword, err := auth.HashPassword(newPassword)
	if err != nil {
		return err
	}

	user.Password = hashedPassword
	return u.repo.UpdateUser(user)
}

func (u *UserService) DeleteUser(id uuid.UUID) error {
	return u.repo.DeleteUser(id)
}
