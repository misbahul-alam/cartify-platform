package service

import (
	"errors"
	"fmt"

	"github.com/misbahul-alam/cartify-platform/internal/shared/auth"
	"github.com/misbahul-alam/cartify-platform/internal/user/repository"
)

type AuthService struct {
	repo repository.UserRepository
	jwt  *auth.JWTManager
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func NewAuthService(repo repository.UserRepository, jwt *auth.JWTManager) *AuthService {
	return &AuthService{repo: repo, jwt: jwt}
}

func (s *AuthService) Register(firstName string, lastName string, email string, password string) error {
	_, err := s.repo.FindUserByEmail(email)
	if err == nil {
		return errors.New("user already exists")
	}

	hashPassword, _ := auth.HashPassword(password)
	user, err := s.repo.CreateUser(
		firstName, lastName, email, hashPassword,
	)
	if err != nil {
		return err
	}

	fmt.Println(user)

	return nil
}
func (s *AuthService) Login(email string, password string) (*TokenResponse, error) {
	user, err := s.repo.FindUserByEmail(email)

	if err != nil {
		return nil, err
	}

	if !auth.CheckPassword(password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	access, _ := s.jwt.GenerateAccess(user.ID.String(), string(user.Role))
	refresh, _ := s.jwt.GenerateRefresh(user.ID.String(), string(user.Role))

	return &TokenResponse{
		AccessToken:  access,
		RefreshToken: refresh,
	}, nil

}

func (s *AuthService) RefreshToken(token string) (string, error) {
	if token == "" {
		return "", errors.New("invalid token")

	}

	claims, err := s.jwt.Verify(token)
	if err != nil || claims == nil {
		return "", err
	}
	if claims.Type != "refresh" {
		return "", errors.New("invalid token")
	}

	newToken, err := s.jwt.GenerateAccess(claims.ID, string(claims.Role))
	if err != nil {
		return "", err

	}
	return newToken, nil

}
