package main

import (
	"flag"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/misbahul-alam/cartify-platform/infra/config"
	"github.com/misbahul-alam/cartify-platform/infra/database"
	"github.com/misbahul-alam/cartify-platform/internal/shared/auth"

	orderModel "github.com/misbahul-alam/cartify-platform/internal/order/model"
	paymentModel "github.com/misbahul-alam/cartify-platform/internal/payment/model"
	productDomain "github.com/misbahul-alam/cartify-platform/internal/product/domain"
	productModel "github.com/misbahul-alam/cartify-platform/internal/product/model"
	userModel "github.com/misbahul-alam/cartify-platform/internal/user/model"
)

func main() {
	cleanDb := flag.Bool("clean", true, "Truncate tables before seeding")
	flag.Parse()

	log.Println("Starting database seed process...")

	cfg := config.Load()
	db := database.NewPostgres(cfg.DB.URL, cfg.AppEnv)

	db.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

	log.Println("Running database migrations/AutoMigrate...")
	if err := db.AutoMigrate(
		&userModel.User{},
		&productModel.Category{},
		&productModel.Product{},
		&productModel.ProductImage{},
		&orderModel.Order{},
		&orderModel.OrderItem{},
		&paymentModel.Payment{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	if *cleanDb {
		log.Println("Cleaning existing tables...")
		tables := []string{
			"payments",
			"order_items",
			"orders",
			"product_images",
			"products",
			"categories",
			"users",
		}
		for _, table := range tables {
			log.Printf("Truncating table: %s", table)
			if err := db.Exec("TRUNCATE TABLE " + table + " RESTART IDENTITY CASCADE").Error; err != nil {
				log.Printf("Warning: failed to truncate table %s: %v (might not exist yet or locked)", table, err)
			}
		}
	}

	log.Println("Seeding Users...")
	hashedPassword, err := auth.HashPassword("password123")
	if err != nil {
		log.Fatalf("Failed to hash user password: %v", err)
	}

	adminUser := userModel.User{
		ID:         uuid.New(),
		FirstName:  "Admin",
		LastName:   "User",
		Email:      "admin@cartify.com",
		Role:       userModel.RoleAdmin,
		Password:   hashedPassword,
		IsActive:   true,
		IsVerified: true,
	}

	sellerUser := userModel.User{
		ID:         uuid.New(),
		FirstName:  "Seller",
		LastName:   "Shop",
		Email:      "seller@cartify.com",
		Role:       userModel.RoleSeller,
		Password:   hashedPassword,
		IsActive:   true,
		IsVerified: true,
	}

	customer1 := userModel.User{
		ID:         uuid.New(),
		FirstName:  "John",
		LastName:   "Doe",
		Email:      "john@example.com",
		Role:       userModel.RoleCustomer,
		Password:   hashedPassword,
		IsActive:   true,
		IsVerified: true,
	}

	customer2 := userModel.User{
		ID:         uuid.New(),
		FirstName:  "Jane",
		LastName:   "Smith",
		Email:      "jane@example.com",
		Role:       userModel.RoleCustomer,
		Password:   hashedPassword,
		IsActive:   true,
		IsVerified: true,
	}

	users := []userModel.User{adminUser, sellerUser, customer1, customer2}
	for _, u := range users {
		if err := db.Create(&u).Error; err != nil {
			log.Fatalf("Failed to seed user %s: %v", u.Email, err)
		}
	}
	log.Printf("Successfully seeded %d users", len(users))

	log.Println("Seeding Categories...")
	catElectronics := productModel.Category{
		ID:          uuid.New(),
		Name:        "Electronics",
		Slug:        "electronics",
		Description: "Gadgets, devices, and computing accessories",
		Status:      productDomain.Public,
	}
	catClothing := productModel.Category{
		ID:          uuid.New(),
		Name:        "Clothing",
		Slug:        "clothing",
		Description: "Trendy apparel for men, women, and children",
		Status:      productDomain.Public,
	}
	catBooks := productModel.Category{
		ID:          uuid.New(),
		Name:        "Books",
		Slug:        "books",
		Description: "Fiction, non-fiction, academic, and development books",
		Status:      productDomain.Public,
	}
	catHomeKitchen := productModel.Category{
		ID:          uuid.New(),
		Name:        "Home & Kitchen",
		Slug:        "home-kitchen",
		Description: "Furniture, smart home appliances, and kitchenware",
		Status:      productDomain.Public,
	}
	catSportsOutdoors := productModel.Category{
		ID:          uuid.New(),
		Name:        "Sports & Outdoors",
		Slug:        "sports-outdoors",
		Description: "Sporting goods, training gear, and camping equipment",
		Status:      productDomain.Public,
	}

	categories := []productModel.Category{catElectronics, catClothing, catBooks, catHomeKitchen, catSportsOutdoors}
	for _, c := range categories {
		if err := db.Create(&c).Error; err != nil {
			log.Fatalf("Failed to seed category %s: %v", c.Name, err)
		}
	}
	log.Printf("Successfully seeded %d categories", len(categories))

	log.Println("Seeding Products...")

	uuidPtr := func(u uuid.UUID) *uuid.UUID { return &u }

	productsToSeed := []struct {
		Product productModel.Product
		Images  []string
	}{
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "ELEC-IPHONE15PM",
				Name:        "iPhone 15 Pro Max",
				Slug:        "iphone-15-pro-max",
				Description: "The ultimate iPhone featuring a durable titanium design, powerful camera upgrades, and the A17 Pro chip.",
				Price:       1199.99,
				CategoryID:  uuidPtr(catElectronics.ID),
				IsStock:     true,
				IsFeatured:  true,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "ELEC-SONYXM5",
				Name:        "Sony WH-1000XM5",
				Slug:        "sony-wh-1000xm5",
				Description: "Industry-leading noise-canceling headphones with dual processors, 8 microphones, and exceptional call quality.",
				Price:       399.99,
				CategoryID:  uuidPtr(catElectronics.ID),
				IsStock:     true,
				IsFeatured:  true,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "ELEC-DELLXPS15",
				Name:        "Dell XPS 15 Laptop",
				Slug:        "dell-xps-15-laptop",
				Description: "High-performance laptop with a stunning OLED display, Intel Core i9 processor, and dedicated NVIDIA GeForce graphics.",
				Price:       1899.99,
				CategoryID:  uuidPtr(catElectronics.ID),
				IsStock:     true,
				IsFeatured:  false,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "CLOT-ORGCOTTON-T",
				Name:        "Organic Cotton T-Shirt",
				Slug:        "organic-cotton-t-shirt",
				Description: "Made from 100% organic cotton, this lightweight, breathable, and comfortable T-shirt is perfect for everyday wear.",
				Price:       24.99,
				CategoryID:  uuidPtr(catClothing.ID),
				IsStock:     true,
				IsFeatured:  false,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "CLOT-PREMDENIM-J",
				Name:        "Premium Denim Jeans",
				Slug:        "premium-denim-jeans",
				Description: "Slim-fit stretch denim jeans crafted for comfort and durability. Classic 5-pocket styling.",
				Price:       59.99,
				CategoryID:  uuidPtr(catClothing.ID),
				IsStock:     true,
				IsFeatured:  true,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "BOOK-CLEANCODE",
				Name:        "Clean Code",
				Slug:        "clean-code-book",
				Description: "A Handbook of Agile Software Craftsmanship by Robert C. Martin. Learn how to write code that is clean, readable, and maintainable.",
				Price:       34.99,
				CategoryID:  uuidPtr(catBooks.ID),
				IsStock:     true,
				IsFeatured:  true,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "BOOK-DDIA",
				Name:        "Designing Data-Intensive Applications",
				Slug:        "designing-data-intensive-applications",
				Description: "The definitive guide to help you navigate the diverse landscape of databases, queues, and processing frameworks.",
				Price:       44.99,
				CategoryID:  uuidPtr(catBooks.ID),
				IsStock:     true,
				IsFeatured:  false,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "HOME-AIRFRYERXL",
				Name:        "Air Fryer Max XL",
				Slug:        "air-fryer-max-xl",
				Description: "Fast, easy, and healthy cooking with up to 75% less fat than traditional frying methods. 5.5-quart capacity.",
				Price:       129.99,
				CategoryID:  uuidPtr(catHomeKitchen.ID),
				IsStock:     true,
				IsFeatured:  false,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "HOME-ERGOCHAIR",
				Name:        "Ergonomic Office Chair",
				Slug:        "ergonomic-office-chair",
				Description: "High-back desk chair featuring adjustable lumbar support, 3D armrests, and dynamic tilt tension.",
				Price:       249.99,
				CategoryID:  uuidPtr(catHomeKitchen.ID),
				IsStock:     true,
				IsFeatured:  true,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "SPOR-MTBBIKE",
				Name:        "Mountain Trail Bike",
				Slug:        "mountain-trail-bike",
				Description: "All-terrain mountain bike featuring a lightweight aluminum frame, full suspension, and hydraulic disc brakes.",
				Price:       799.99,
				CategoryID:  uuidPtr(catSportsOutdoors.ID),
				IsStock:     true,
				IsFeatured:  false,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600",
			},
		},
		{
			Product: productModel.Product{
				ID:          uuid.New(),
				SKU:         "SPOR-CAMPTENT",
				Name:        "Waterproof Camping Tent",
				Slug:        "waterproof-camping-tent",
				Description: "4-person double-layer family camping tent with rainfly, easy setup mechanism, and excellent ventilation.",
				Price:       149.99,
				CategoryID:  uuidPtr(catSportsOutdoors.ID),
				IsStock:     true,
				IsFeatured:  true,
				Status:      productModel.ProductActive,
			},
			Images: []string{
				"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600",
			},
		},
	}

	productMap := make(map[string]productModel.Product)

	for _, item := range productsToSeed {
		p := item.Product
		if err := db.Create(&p).Error; err != nil {
			log.Fatalf("Failed to seed product %s: %v", p.Name, err)
		}
		productMap[p.SKU] = p

		for i, imgURL := range item.Images {
			img := productModel.ProductImage{
				ID:        uuid.New(),
				ProductID: p.ID,
				URL:       imgURL,
				PublicID:  p.Slug + "_img_" + uuid.New().String()[:8],
				IsPrimary: i == 0,
			}
			if err := db.Create(&img).Error; err != nil {
				log.Fatalf("Failed to seed product image for %s: %v", p.Name, err)
			}
		}
	}
	log.Printf("Successfully seeded %d products and their images", len(productsToSeed))

	log.Println("Seeding Orders and Payments...")

	pIphone := productMap["ELEC-IPHONE15PM"]
	pSony := productMap["ELEC-SONYXM5"]

	order1 := orderModel.Order{
		ID:              uuid.New(),
		UserID:          customer1.ID,
		TotalPrice:      1599.98,
		ShippingAddress: "123 Main St, New York, NY 10001",
		Status:          "delivered",
		CreatedAt:       time.Now().Add(-14 * 24 * time.Hour),
		UpdatedAt:       time.Now().Add(-14 * 24 * time.Hour),
	}
	if err := db.Create(&order1).Error; err != nil {
		log.Fatalf("Failed to seed order 1: %v", err)
	}

	orderItem1_1 := orderModel.OrderItem{
		ID:           uuid.New(),
		OrderID:      order1.ID,
		ProductID:    pIphone.ID,
		ProductName:  pIphone.Name,
		ProductPrice: pIphone.Price,
		Quantity:     1,
		Subtotal:     pIphone.Price,
	}
	orderItem1_2 := orderModel.OrderItem{
		ID:           uuid.New(),
		OrderID:      order1.ID,
		ProductID:    pSony.ID,
		ProductName:  pSony.Name,
		ProductPrice: pSony.Price,
		Quantity:     1,
		Subtotal:     pSony.Price,
	}
	if err := db.Create(&orderItem1_1).Error; err != nil || db.Create(&orderItem1_2).Error != nil {
		log.Fatalf("Failed to seed order items for order 1: %v", err)
	}

	payment1 := paymentModel.Payment{
		ID:            uuid.New(),
		OrderID:       order1.ID,
		TransactionID: "pi_mock_john_123456",
		Provider:      "stripe",
		Amount:        order1.TotalPrice,
		Currency:      "usd",
		Status:        "succeeded",
		CreatedAt:     order1.CreatedAt,
		UpdatedAt:     order1.CreatedAt,
	}
	if err := db.Create(&payment1).Error; err != nil {
		log.Fatalf("Failed to seed payment 1: %v", err)
	}

	pCleanCode := productMap["BOOK-CLEANCODE"]
	pAirFryer := productMap["HOME-AIRFRYERXL"]

	order2 := orderModel.Order{
		ID:              uuid.New(),
		UserID:          customer2.ID,
		TotalPrice:      199.97,
		ShippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
		Status:          "pending",
		CreatedAt:       time.Now().Add(-3 * 24 * time.Hour),
		UpdatedAt:       time.Now().Add(-3 * 24 * time.Hour),
	}
	if err := db.Create(&order2).Error; err != nil {
		log.Fatalf("Failed to seed order 2: %v", err)
	}

	orderItem2_1 := orderModel.OrderItem{
		ID:           uuid.New(),
		OrderID:      order2.ID,
		ProductID:    pCleanCode.ID,
		ProductName:  pCleanCode.Name,
		ProductPrice: pCleanCode.Price,
		Quantity:     2,
		Subtotal:     pCleanCode.Price * 2,
	}
	orderItem2_2 := orderModel.OrderItem{
		ID:           uuid.New(),
		OrderID:      order2.ID,
		ProductID:    pAirFryer.ID,
		ProductName:  pAirFryer.Name,
		ProductPrice: pAirFryer.Price,
		Quantity:     1,
		Subtotal:     pAirFryer.Price,
	}
	if err := db.Create(&orderItem2_1).Error; err != nil || db.Create(&orderItem2_2).Error != nil {
		log.Fatalf("Failed to seed order items for order 2: %v", err)
	}

	payment2 := paymentModel.Payment{
		ID:            uuid.New(),
		OrderID:       order2.ID,
		TransactionID: "pi_mock_jane_789012",
		Provider:      "stripe",
		Amount:        order2.TotalPrice,
		Currency:      "usd",
		Status:        "pending",
		CreatedAt:     order2.CreatedAt,
		UpdatedAt:     order2.CreatedAt,
	}
	if err := db.Create(&payment2).Error; err != nil {
		log.Fatalf("Failed to seed payment 2: %v", err)
	}

	log.Println("Successfully seeded orders, items, and payment mock details.")
	log.Println("Database seeding completed successfully!")
}
