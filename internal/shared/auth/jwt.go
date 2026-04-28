package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
	secret    string
	accessTTL time.Duration
}

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Type   string `json:"type"`
	jwt.RegisteredClaims
}

func NewJWTManager(secret string, accessTTL time.Duration) *JWTManager {
	return &JWTManager{secret: secret, accessTTL: accessTTL}
}

func (j *JWTManager) generate(userID string, role string, ttl time.Duration, tokenType string) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		Type:   tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secret))
}

func (j *JWTManager) GenerateAccess(userID string, role string) (string, error) {
	return j.generate(userID, role, j.accessTTL, "access")
}

func (j *JWTManager) GenerateRefresh(userID string, role string) (string, error) {
	return j.generate(userID, role, 7*24*time.Hour, "refresh")
}

func (j *JWTManager) Verify(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(j.secret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, err
	}

	return claims, nil
}
