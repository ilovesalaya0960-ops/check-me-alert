package main

import (
    "log"
    "mobile-shop-backend/database"
    "mobile-shop-backend/handlers"

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
        c.Set("Access-Control-Allow-Origin", "*")
        c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")

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

    // Notification routes
    notifications := api.Group("/notifications")
    notifications.Get("/telegram/settings", handlers.GetTelegramSettings)
    notifications.Put("/telegram/settings", handlers.UpdateTelegramSettings)
    notifications.Post("/telegram/test", handlers.TestTelegramConnection)
    notifications.Post("/telegram/send/:id", handlers.SendExpiryNotification)
    notifications.Post("/telegram/daily-report", handlers.SendDailyReport)
    notifications.Get("/logs", handlers.GetNotificationLogs)

    // Start server
    port := ":8080"
    log.Printf("Server starting on port %s", port)
    log.Fatal(app.Listen(port))
}