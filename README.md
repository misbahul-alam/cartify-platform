# 🛒 Cartify Platform

A production-oriented e-commerce platform with a Go (Gin + GORM) API and a
Next.js (App Router) storefront.

The backend follows a clean layered architecture — `domain` → `model` →
`repository` → `service` → `transport/http` — with per-feature modules for
users/auth, products, categories, cart, orders, and payments.

---

## 🚀 Tech Stack

**Backend**
- **Language:** Go
- **Framework:** Gin
- **ORM:** GORM
- **Database:** PostgreSQL
- **Cache / Cart store:** Redis
- **Auth:** JWT (access + refresh)
- **Media:** Cloudinary
- **Payments:** Stripe

**Frontend (`web/`)**
- **Framework:** Next.js (App Router) + React
- **Language:** TypeScript
- **State:** Zustand
- **Styling:** Tailwind CSS
- **HTTP:** Axios
- **Payments:** Stripe.js / React Stripe.js

---

## 📦 Project layout

```
cmd/api            # API entrypoint
cmd/seed           # Database seeder (sample users, products, orders)
infra              # config, database, cache, storage adapters
internal           # feature modules (user, product, cart, order, payment)
internal/shared    # middleware, response helpers, auth utilities
docs               # generated Swagger spec
web                # Next.js storefront
```

---

## ⚙️ Configuration

Copy `example.env` to `.env` and fill in the values. Keys used by the API:

| Variable | Purpose |
| --- | --- |
| `APP_ENV` | `development` or `production` |
| `SERVER_PORT` | HTTP port (default `8080`) |
| `DB_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis host:port |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_TTL` | Access token lifetime (e.g. `15m`) |
| `CART_TTL` | Redis cart TTL (e.g. `336h`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins |
| `CLOUDINARY_*` | Cloudinary credentials |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_CURRENCY` | Stripe config |

The storefront reads `web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🏃 Getting started

### Local (Go)

```bash
cp example.env .env
make run     # go run cmd/api/main.go
```

### Docker

```bash
cp example.env .env
docker compose up --build
```

The API is served at `http://localhost:8080`. Run the storefront locally with
`npm run dev` inside `web/` (with `web/.env.local` configured).

### Seed sample data

```bash
make seed
```

Seeds an admin (`admin@cartify.com`), a seller, two customers (password
`password123`), categories, products, orders, and payments.

---

## 📖 API Documentation

Swagger UI is available while the server is running at:
`http://localhost:8080/swagger/index.html`

Regenerate the spec after changing annotations:

```bash
make swag
```

---

## 🧪 Quality checks

```bash
# Backend
go build ./...
go vet ./...
go test ./...

# Frontend
cd web
npm run lint
npx tsc --noEmit
```

---

## 🔐 Auth flow

- `POST /api/v1/auth/register` — create an account
- `POST /api/v1/auth/login` — returns `access_token` + `refresh_token`
- `POST /api/v1/auth/refresh-token` — exchange a refresh token for a new access token

Send the access token as `Authorization: Bearer <token>`. Access tokens are
short-lived (`JWT_TTL`); the storefront refreshes them automatically.
