package http

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/internal/shared/auth"
	"github.com/misbahul-alam/cartify-platform/internal/shared/middleware"
	"github.com/misbahul-alam/cartify-platform/internal/user/repository"
	"github.com/misbahul-alam/cartify-platform/internal/user/service"
	"github.com/misbahul-alam/cartify-platform/internal/user/transport/http/handler"
	"gorm.io/gorm"
)

func Routes(r *gin.RouterGroup, db *gorm.DB, config *config.Config) {
	jwt := auth.NewJWTManager(config.JWT.Secret, config.JWT.TTL)
	userRepo := repository.NewUserRepo(db)

	userService := service.NewUserService(userRepo)
	authService := service.NewAuthService(userRepo, jwt)

	userHandler := handler.NewUserHandler(userService)
	authHandler := handler.NewAuthHandler(authService)

	authRoute := r.Group("auth")
	{
		authRoute.POST("/login", authHandler.Login)
		authRoute.POST("/register", authHandler.Register)
		authRoute.POST("/refresh-token", authHandler.RefreshToken)
	}

	userRoute := r.Group("users")
	{
		userRoute.GET("/me", middleware.AuthMiddleware(config), userHandler.Me)
		userRoute.GET("", middleware.AuthMiddleware(config), middleware.RoleMiddleware("admin"), userHandler.GetAll)
		userRoute.PATCH("", middleware.AuthMiddleware(config), userHandler.UpdateProfile)
		userRoute.POST("/update-password", middleware.AuthMiddleware(config), userHandler.UpdatePassword)
		userRoute.DELETE("", middleware.AuthMiddleware(config), userHandler.Delete)
	}
}
