package dto

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=20"`
}

type RegisterRequest struct {
	FirstName       string `json:"first_name" binding:"required,max=30"`
	LastName        string `json:"last_name" binding:"required,max=30"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8,max=20"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type UpdateProfileRequest struct {
	FirstName string `json:"first_name,omitempty" binding:"omitempty,max=30"`
	LastName  string `json:"last_name,omitempty" binding:"omitempty,max=30"`
}

type UpdatePasswordRequest struct {
	OldPassword     string `json:"old_password" binding:"required,min=8,max=20"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=20"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
}
