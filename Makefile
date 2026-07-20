run:
	go run cmd/api/main.go
build:
	go build cmd/api/main.go
lint:
	golangci-lint run 
swag:
	go run github.com/swaggo/swag/cmd/swag@latest init -g cmd/api/main.go
seed:
	go run cmd/seed/main.go