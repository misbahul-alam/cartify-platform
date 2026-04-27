package main

import (
	"github.com/gin-gonic/gin"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/infra/database"
	"github.com/misbahul-alam/cartify-platform/internal/user/model"
	"github.com/misbahul-alam/cartify-platform/internal/user/transport/http"
)

func main() {
	cfg := config.Load()
	db := database.NewPostgres(cfg.DB.URL)

	_ = db.AutoMigrate(&model.User{})

	r := gin.New()

	api := r.Group("/api/v1")

	http.Routes(api, db, cfg)

	_ = r.Run(":8000")
}
