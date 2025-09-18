package handlers

import (
    "context"
    "fmt"
    "mobile-shop-backend/database"
    "mobile-shop-backend/models"
    "mobile-shop-backend/services"
    "time"

    "github.com/gofiber/fiber/v2"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// Get Telegram settings
func GetTelegramSettings(c *fiber.Ctx) error {
    collection := database.GetCollection("telegram_settings")
    var settings models.TelegramSettings

    err := collection.FindOne(context.Background(), bson.M{}).Decode(&settings)
    if err != nil {
        // Return default settings if none exists
        defaultSettings := models.TelegramSettings{
            IsEnabled:        false,
            NotifyPromotion:  true,
            NotifySim:        true,
            DaysBeforeExpiry: 7,
            DailyReport:      false,
            DailyReportTime:  "09:00",
        }
        return c.JSON(defaultSettings)
    }

    // Don't expose the bot token to frontend
    settings.BotToken = ""
    return c.JSON(settings)
}

// Update Telegram settings
func UpdateTelegramSettings(c *fiber.Ctx) error {
    var settings models.TelegramSettings
    if err := c.BodyParser(&settings); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    collection := database.GetCollection("telegram_settings")

    // Check if settings exist
    var existingSettings models.TelegramSettings
    err := collection.FindOne(context.Background(), bson.M{}).Decode(&existingSettings)

    if err != nil {
        // Create new settings
        settings.ID = primitive.NewObjectID()
        settings.CreatedAt = time.Now()
        settings.UpdatedAt = time.Now()

        _, err := collection.InsertOne(context.Background(), settings)
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "Failed to create settings"})
        }
    } else {
        // Update existing settings
        settings.ID = existingSettings.ID
        settings.CreatedAt = existingSettings.CreatedAt
        settings.UpdatedAt = time.Now()

        // If bot token is empty, keep the existing one
        if settings.BotToken == "" {
            settings.BotToken = existingSettings.BotToken
        }

        _, err := collection.ReplaceOne(
            context.Background(),
            bson.M{"_id": existingSettings.ID},
            settings,
        )
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "Failed to update settings"})
        }
    }

    // Don't return the bot token
    settings.BotToken = ""
    return c.JSON(settings)
}

// Test Telegram connection
func TestTelegramConnection(c *fiber.Ctx) error {
    collection := database.GetCollection("telegram_settings")
    var settings models.TelegramSettings

    err := collection.FindOne(context.Background(), bson.M{}).Decode(&settings)
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Telegram settings not found"})
    }

    if !settings.IsEnabled || settings.BotToken == "" || settings.ChatID == "" {
        return c.Status(400).JSON(fiber.Map{"error": "Telegram not properly configured"})
    }

    // Create temporary telegram bot with settings
    bot := &services.TelegramBot{
        BotToken: settings.BotToken,
        ChatID:   settings.ChatID,
    }

    testMessage := "🧪 <b>ทดสอบการเชื่อมต่อ Telegram</b>\n\n" +
                  "✅ การเชื่อมต่อระหว่างระบบจัดการเบอร์มือถือกับ Telegram ทำงานได้ปกติ\n\n" +
                  fmt.Sprintf("⏰ <i>%s</i>", time.Now().Format("02/01/2006 15:04:05"))

    err = bot.SendMessage(testMessage)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": "Failed to send test message",
            "details": err.Error(),
        })
    }

    return c.JSON(fiber.Map{"message": "Test message sent successfully"})
}

// Send notification for expiring phone numbers
func SendExpiryNotification(c *fiber.Ctx) error {
    phoneNumberID := c.Params("id")
    objectID, err := primitive.ObjectIDFromHex(phoneNumberID)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid phone number ID"})
    }

    // Get phone number
    phoneCollection := database.GetCollection("phone_numbers")
    var phoneNumber models.PhoneNumber
    err = phoneCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&phoneNumber)
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Phone number not found"})
    }

    // Get notification type from query
    notificationType := c.Query("type", "promotion")

    // Get settings
    settingsCollection := database.GetCollection("telegram_settings")
    var settings models.TelegramSettings
    err = settingsCollection.FindOne(context.Background(), bson.M{}).Decode(&settings)
    if err != nil || !settings.IsEnabled {
        return c.Status(400).JSON(fiber.Map{"error": "Telegram notifications not enabled"})
    }

    // Create telegram bot
    bot := &services.TelegramBot{
        BotToken: settings.BotToken,
        ChatID:   settings.ChatID,
    }

    // Prepare notification data
    var expiryDate time.Time
    if notificationType == "sim" {
        if phoneNumber.SimExpiryDate == nil {
            return c.Status(400).JSON(fiber.Map{"error": "Sim expiry date not set"})
        }
        expiryDate = *phoneNumber.SimExpiryDate
    } else {
        if phoneNumber.PromotionEndDate == nil {
            return c.Status(400).JSON(fiber.Map{"error": "Promotion end date not set"})
        }
        expiryDate = *phoneNumber.PromotionEndDate
    }

    daysUntilExpiry := int(time.Until(expiryDate).Hours() / 24)

    notificationData := services.NotificationData{
        PhoneNumber:     phoneNumber.PhoneNumber,
        Carrier:         phoneNumber.Carrier,
        Category:        phoneNumber.Category,
        Promotion:       phoneNumber.Promotion,
        ExpiryDate:      expiryDate,
        DaysUntilExpiry: daysUntilExpiry,
        Type:            notificationType,
    }

    // Send notification
    err = bot.SendExpiryNotification(notificationData)

    // Log notification
    logCollection := database.GetCollection("notification_logs")
    log := models.NotificationLog{
        ID:               primitive.NewObjectID(),
        PhoneNumberID:    objectID,
        PhoneNumber:      phoneNumber.PhoneNumber,
        NotificationType: notificationType,
        SentAt:           time.Now(),
        CreatedAt:        time.Now(),
    }

    if err != nil {
        log.Status = "failed"
        log.ErrorMessage = err.Error()
        logCollection.InsertOne(context.Background(), log)
        return c.Status(500).JSON(fiber.Map{
            "error": "Failed to send notification",
            "details": err.Error(),
        })
    }

    log.Status = "sent"
    logCollection.InsertOne(context.Background(), log)

    return c.JSON(fiber.Map{"message": "Notification sent successfully"})
}

// Send daily report
func SendDailyReport(c *fiber.Ctx) error {
    // Get settings
    settingsCollection := database.GetCollection("telegram_settings")
    var settings models.TelegramSettings
    err := settingsCollection.FindOne(context.Background(), bson.M{}).Decode(&settings)
    if err != nil || !settings.IsEnabled || !settings.DailyReport {
        return c.Status(400).JSON(fiber.Map{"error": "Daily report not enabled"})
    }

    // Get expiring phone numbers
    phoneCollection := database.GetCollection("phone_numbers")
    now := time.Now()
    weekFromNow := now.AddDate(0, 0, 7)

    // Get phones with promotions expiring in 7 days
    promotionFilter := bson.M{
        "promotionEndDate": bson.M{
            "$gte": now,
            "$lte": weekFromNow,
        },
    }

    // Get expired phones
    expiredPromotionFilter := bson.M{
        "promotionEndDate": bson.M{"$lt": now},
    }

    var expiring []services.NotificationData
    var expired []services.NotificationData

    // Get expiring promotions
    cursor, _ := phoneCollection.Find(context.Background(), promotionFilter)
    var phones []models.PhoneNumber
    cursor.All(context.Background(), &phones)

    for _, phone := range phones {
        if phone.PromotionEndDate != nil {
            daysUntil := int(time.Until(*phone.PromotionEndDate).Hours() / 24)
            expiring = append(expiring, services.NotificationData{
                PhoneNumber:     phone.PhoneNumber,
                Carrier:         phone.Carrier,
                Category:        phone.Category,
                DaysUntilExpiry: daysUntil,
                Type:            "promotion",
            })
        }
    }

    // Get expired promotions
    cursor, _ = phoneCollection.Find(context.Background(), expiredPromotionFilter)
    phones = []models.PhoneNumber{}
    cursor.All(context.Background(), &phones)

    for _, phone := range phones {
        if phone.PromotionEndDate != nil {
            daysUntil := int(time.Until(*phone.PromotionEndDate).Hours() / 24)
            expired = append(expired, services.NotificationData{
                PhoneNumber:     phone.PhoneNumber,
                Carrier:         phone.Carrier,
                Category:        phone.Category,
                DaysUntilExpiry: daysUntil,
                Type:            "promotion",
            })
        }
    }

    // Create telegram bot and send report
    bot := &services.TelegramBot{
        BotToken: settings.BotToken,
        ChatID:   settings.ChatID,
    }

    err = bot.SendDailyReport(expiring, expired)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": "Failed to send daily report",
            "details": err.Error(),
        })
    }

    return c.JSON(fiber.Map{"message": "Daily report sent successfully"})
}

// Get notification logs
func GetNotificationLogs(c *fiber.Ctx) error {
    collection := database.GetCollection("notification_logs")

    page := c.QueryInt("page", 1)
    limit := c.QueryInt("limit", 20)
    skip := (page - 1) * limit

    findOptions := options.Find()
    findOptions.SetLimit(int64(limit))
    findOptions.SetSkip(int64(skip))
    findOptions.SetSort(bson.D{{Key: "createdAt", Value: -1}})

    cursor, err := collection.Find(context.Background(), bson.M{}, findOptions)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch notification logs"})
    }
    defer cursor.Close(context.Background())

    var logs []models.NotificationLog
    if err = cursor.All(context.Background(), &logs); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to decode notification logs"})
    }

    total, _ := collection.CountDocuments(context.Background(), bson.M{})

    return c.JSON(fiber.Map{
        "logs": logs,
        "total": total,
        "page": page,
        "limit": limit,
    })
}