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
}

func Load() *Config {
	v := viper.New()

	v.SetConfigFile(".env")
	v.AutomaticEnv()

	v.SetDefault("APP_ENV", "development")
	v.SetDefault("SERVER_PORT", "8000")
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

	duration, err := time.ParseDuration(v.GetString("JWT_TTL"))
	if err != nil {
		log.Printf("Invalid JWT_TTL, using default 15m: %v", err)
		duration = 15 * time.Minute
	}
	cfg.JWT.TTL = duration

	return cfg
}
