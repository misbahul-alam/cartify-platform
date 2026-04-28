package utils

import (
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

type ApiError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func ParseValidationError(err error) []ApiError {
	if ve, ok := errors.AsType[validator.ValidationErrors](err); ok {
		out := make([]ApiError, len(ve))
		for i, fe := range ve {
			out[i] = ApiError{
				Field:   fe.Field(),
				Message: getErrorMsg(fe),
			}
		}
		return out
	}
	return nil
}

func getErrorMsg(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("Should be at least %s characters", fe.Param())
	case "max":
		return fmt.Sprintf("Should be at most %s characters", fe.Param())
	case "eqfield":
		return fmt.Sprintf("Should be equal to %s", fe.Param())
	}
	return "Unknown error"
}
