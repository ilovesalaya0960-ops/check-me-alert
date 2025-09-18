package main

import (
	"log"
	"mobile-phone-backend/database"
	"mobile-phone-backend/handlers"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables in development
	if os.Getenv("ENVIRONMENT") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found")
		}
	}

	// Connect to MongoDB
	database.Connect()

	// Create Fiber app with production settings
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
		// Production settings
		Prefork:       os.Getenv("ENVIRONMENT") == "production",
		CaseSensitive: true,
		StrictRouting: true,
		ServerHeader:  "Mobile Phone Management API",
		AppName:       "Mobile Phone Management v1.0.0",
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} ${latency}\n",
	}))

	// CORS configuration for production
	if os.Getenv("ENVIRONMENT") == "production" {
		app.Use(cors.New(cors.Config{
			AllowOrigins:     os.Getenv("FRONTEND_URL"), // Set this to your frontend URL
			AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
			AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
			AllowCredentials: false,
		}))
	} else {
		app.Use(cors.New(cors.Config{
			AllowOrigins: "*",
			AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
			AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		}))
	}

	// Health check endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message":     "Mobile Phone Management API",
			"version":     "1.0.0",
			"status":      "healthy",
			"environment": os.Getenv("ENVIRONMENT"),
		})
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "ok",
			"timestamp": c.Context().Time(),
		})
	})

	// API routes
	api := app.Group("/api/v1")

	// Phone number routes
	phones := api.Group("/phone-numbers")
	phones.Get("/", handlers.GetPhoneNumbers)
	phones.Post("/", handlers.CreatePhoneNumber)
	phones.Get("/expiring", handlers.GetExpiringPhoneNumbers)
	phones.Get("/stats", handlers.GetPhoneStats)
	phones.Get("/:id", handlers.GetPhoneNumber)
	phones.Put("/:id", handlers.UpdatePhoneNumber)
	phones.Delete("/:id", handlers.DeletePhoneNumber)

	// Carrier routes
	carriers := api.Group("/carriers")
	carriers.Get("/", handlers.GetCarriers)
	carriers.Post("/", handlers.CreateCarrier)

	// Category routes
	categories := api.Group("/categories")
	categories.Get("/", handlers.GetCategories)
	categories.Post("/", handlers.CreateCategory)

	// Promotion routes
	promotions := api.Group("/promotions")
	promotions.Get("/", handlers.GetPromotions)
	promotions.Post("/", handlers.CreatePromotion)

	// Telegram routes
	telegram := api.Group("/telegram")
	telegram.Get("/settings", handlers.GetTelegramSettings)
	telegram.Post("/settings", handlers.UpdateTelegramSettings)
	telegram.Post("/test", handlers.TestTelegram)
	telegram.Post("/send-daily-report", handlers.SendDailyReport)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("🌍 Environment: %s", os.Getenv("ENVIRONMENT"))
	log.Fatal(app.Listen(":" + port))
}