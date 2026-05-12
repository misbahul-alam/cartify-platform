package config

import (
	"log"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	AppEnv     string
	ServerPort string

	DB struct {
		URL string
	}

	JWT struct {
		Secret string
		TTL    time.Duration
	}

	Cloudinary struct {
		CloudName string
		APIKey    string
		APISecret string
		Folder    string
	}
}

func Load() *Config {
	v := viper.New()

	v.SetConfigFile(".env")
	v.AutomaticEnv()

	v.SetDefault("APP_ENV", "development")
	v.SetDefault("SERVER_PORT", "8080")
	v.SetDefault("JWT_TTL", "15m")

	if err := v.ReadInConfig(); err != nil {
		log.Println("No .env file found, using env only")
	}

	cfg := &Config{
		AppEnv:     v.GetString("APP_ENV"),
		ServerPort: v.GetString("SERVER_PORT"),
	}

	cfg.DB.URL = v.GetString("DB_URL")
	cfg.JWT.Secret = v.GetString("JWT_SECRET")

	cfg.Cloudinary.CloudName = v.GetString("CLOUDINARY_CLOUD_NAME")
	cfg.Cloudinary.APIKey = v.GetString("CLOUDINARY_API_KEY")
	cfg.Cloudinary.APISecret = v.GetString("CLOUDINARY_API_SECRET")
	cfg.Cloudinary.Folder = v.GetString("CLOUDINARY_FOLDER")

	duration, err := time.ParseDuration(v.GetString("JWT_TTL"))
	if err != nil {
		log.Printf("Invalid JWT_TTL, using default 15m: %v", err)
		duration = 15 * time.Minute
	}
	cfg.JWT.TTL = duration

	return cfg
}
