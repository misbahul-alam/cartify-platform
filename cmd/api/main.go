package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/misbahul-alam/cartify-platform/docs"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/infra/database"
	productModel "github.com/misbahul-alam/cartify-platform/internal/product/model"
	userModel "github.com/misbahul-alam/cartify-platform/internal/user/model"
	userHttp "github.com/misbahul-alam/cartify-platform/internal/user/transport/http"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Cartify Platform API
// @version 1.0
// @description This is the API documentation for the Cartify Platform, an e-commerce solution built with Go, Gin, and PostgreSQL. It provides endpoints for user management, product catalog, order processing, and more.

// @contact.name Misbahul Alam
// @contact.url https://misbahulalam.com
// @contact.email misbahulalam64@gmail.com

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer " followed by a space and then your token. For example: "Bearer eyJhbGci..."

func main() {
	cfg := config.Load()

	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	db := database.NewPostgres(cfg.DB.URL, cfg.AppEnv)

	db.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

	if err := db.AutoMigrate(
		&userModel.User{},
		&productModel.Category{},
		&productModel.Product{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api/v1")
	userHttp.Routes(api, db, cfg)

	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
