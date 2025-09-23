package main

import (
    "log"
    "mobile-shop-backend/database"
    "mobile-shop-backend/handlers"
    "mobile-shop-backend/scheduler"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/joho/godotenv"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Connect to MongoDB
    database.Connect()

    // Start notification scheduler
    // scheduler.StartTestNotificationScheduler() // ใช้สำหรับทดสอบ (ทุก 5 นาที)
    scheduler.StartDailyNotificationScheduler() // ใช้สำหรับการทำงานจริง (ทุกวัน 00:10)

    // Create Fiber app
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
    })

    // Middleware
    app.Use(func(c *fiber.Ctx) error {
        // CORS middleware with environment-aware origins
        allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
        if allowedOrigins == "" {
            // Default for development and fallback
            allowedOrigins = "*"
        }

        c.Set("Access-Control-Allow-Origin", allowedOrigins)
        c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization,TELEGRAM_BOT_TOKEN,TELEGRAM_CHAT_ID")
        c.Set("Access-Control-Allow-Credentials", "true")

        if c.Method() == "OPTIONS" {
            return c.SendStatus(204)
        }

        return c.Next()
    })
    app.Use(logger.New())

    // Health check
    app.Get("/", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "message": "Phone Number Management API is running!",
            "version": "1.0.0",
        })
    })

    // API routes
    api := app.Group("/api/v1")

    // Phone Number routes
    phoneNumbers := api.Group("/phone-numbers")
    phoneNumbers.Get("/", handlers.GetPhoneNumbers)
    phoneNumbers.Post("/", handlers.CreatePhoneNumber)
    phoneNumbers.Get("/search", handlers.SearchPhoneNumbers)
    phoneNumbers.Get("/expiring", handlers.GetExpiringPhoneNumbers)
    phoneNumbers.Get("/carriers", handlers.GetPhoneNumbersByCarrier)
    phoneNumbers.Get("/:id", handlers.GetPhoneNumber)
    phoneNumbers.Put("/:id", handlers.UpdatePhoneNumber)
    phoneNumbers.Delete("/:id", handlers.DeletePhoneNumber)

    // Telegram routes
    telegram := api.Group("/telegram")
    telegram.Get("/bot-info", handlers.GetTelegramBotInfo)
    telegram.Get("/updates", handlers.GetTelegramUpdates)
    telegram.Post("/test", handlers.SendTelegramTest)
    telegram.Post("/notify-expiry", handlers.SendExpiryNotifications)

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    // Ensure port has colon prefix
    if port[0] != ':' {
        port = ":" + port
    }

    log.Printf("Server starting on port %s", port)
    log.Fatal(app.Listen(port))
}