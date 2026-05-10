package service

import (
	"errors"
	"fmt"

	"github.com/misbahul-alam/cartify-platform/internal/shared/auth"
	"github.com/misbahul-alam/cartify-platform/internal/user/repository"
)

type AuthService struct {
	repo repository.UserRepo
	jwt  *auth.JWTManager
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func NewAuthService(repo repository.UserRepo, jwt *auth.JWTManager) *AuthService {
	return &AuthService{repo: repo, jwt: jwt}
}

func (s *AuthService) Register(firstName string, lastName string, email string, password string) error {
	_, err := s.repo.FindUserByEmail(email)
	if err == nil {
		return errors.New("user already exists")
	}

	hashPassword, err := auth.HashPassword(password)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	_, err = s.repo.CreateUser(
		firstName, lastName, email, hashPassword,
	)
	if err != nil {
		return err
	}

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

	access, err := s.jwt.GenerateAccess(user.ID.String(), string(user.Role))
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refresh, err := s.jwt.GenerateRefresh(user.ID.String(), string(user.Role))
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

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
