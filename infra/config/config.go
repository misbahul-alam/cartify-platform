package config

import (
	"log"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	AppEnv string

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
	v.SetDefault("JWT_TTL", "15m")

	if err := v.ReadInConfig(); err != nil {
		log.Println("No .env file found, using env only")
	}

	cfg := &Config{
		AppEnv: v.GetString("APP_ENV"),
	}

	cfg.DB.URL = v.GetString("DB_URL")
	cfg.JWT.Secret = v.GetString("JWT_SECRET")
	cfg.JWT.TTL, _ = time.ParseDuration(v.GetString("JWT_TTL"))

	return cfg
}
