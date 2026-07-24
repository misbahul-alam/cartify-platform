FROM golang:1.26.3-alpine AS base

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./

RUN go mod download

FROM base AS dev

RUN go install github.com/air-verse/air@latest

COPY . .

EXPOSE 8080

FROM base AS builder

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/api

FROM alpine:3.22 AS prod

WORKDIR /app

RUN apk add --no-cache ca-certificates

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/main .

USER appuser

EXPOSE 8080

CMD ["./main"]