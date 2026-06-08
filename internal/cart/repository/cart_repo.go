package repository

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/internal/cart/domain"
	"github.com/redis/go-redis/v9"
)

type CartRepo interface {
	Get(ctx context.Context, userID uuid.UUID) (*domain.Cart, error)
	Save(ctx context.Context, cart *domain.Cart) error
	Delete(ctx context.Context, userID uuid.UUID) error
}

type cartRepo struct {
	redis *redis.Client
	ttl   time.Duration
}

func NewCartRepo(redisClient *redis.Client, ttl time.Duration) CartRepo {
	return &cartRepo{
		redis: redisClient,
		ttl:   ttl,
	}
}

func (r *cartRepo) getCartKey(userID uuid.UUID) string {
	return fmt.Sprintf("cart:%s", userID.String())
}

func (r *cartRepo) Get(ctx context.Context, userID uuid.UUID) (*domain.Cart, error) {
	key := r.getCartKey(userID)

	res, err := r.redis.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	cart := domain.NewCart(userID)

	if len(res) == 0 {
		return cart, nil
	}

	for prodIDStr, qtyStr := range res {
		productID, err := uuid.Parse(prodIDStr)
		if err != nil {
			continue
		}

		quantity, err := strconv.Atoi(qtyStr)
		if err != nil {
			continue
		}

		cart.Items = append(cart.Items, &domain.CartItem{
			ProductID: productID,
			Quantity:  quantity,
		})
	}

	return cart, nil
}

func (r *cartRepo) Save(ctx context.Context, cart *domain.Cart) error {
	key := r.getCartKey(cart.UserID)

	if len(cart.Items) == 0 {
		return r.Delete(ctx, cart.UserID)
	}

	pipe := r.redis.Pipeline()

	pipe.Del(ctx, key)

	items := make(map[string]interface{})
	for _, item := range cart.Items {
		items[item.ProductID.String()] = item.Quantity
	}

	pipe.HSet(ctx, key, items)
	pipe.Expire(ctx, key, r.ttl)

	_, err := pipe.Exec(ctx)
	return err
}

func (r *cartRepo) Delete(ctx context.Context, userID uuid.UUID) error {
	key := r.getCartKey(userID)
	return r.redis.Del(ctx, key).Err()
}
