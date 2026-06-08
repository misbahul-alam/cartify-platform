package cache

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

func NewRedisCache(addr string) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	if err := client.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis at %s: %v", addr, err)
		return nil
	}
	log.Println("Redis connected successfully")
	return client
}
