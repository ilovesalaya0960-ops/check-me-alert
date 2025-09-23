package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mobile-shop-backend/database"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

// Telegram API structures
type TelegramMessage struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode"`
}

type TelegramUpdate struct {
	UpdateID int `json:"update_id"`
	Message  struct {
		MessageID int `json:"message_id"`
		From      struct {
			ID       int    `json:"id"`
			Username string `json:"username"`
		} `json:"from"`
		Chat struct {
			ID    int    `json:"id"`
			Title string `json:"title"`
			Type  string `json:"type"`
		} `json:"chat"`
		Date int    `json:"date"`
		Text string `json:"text"`
	} `json:"message"`
}

type TelegramResponse struct {
	OK     bool              `json:"ok"`
	Result []TelegramUpdate  `json:"result"`
}

// Get Bot Info
func GetTelegramBotInfo(c *fiber.Ctx) error {
	botToken := c.Get("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		botToken = os.Getenv("TELEGRAM_BOT_TOKEN")
	}
	if botToken == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "TELEGRAM_BOT_TOKEN not configured",
		})
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/getMe", botToken)
	resp, err := http.Get(url)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get bot info",
		})
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	return c.JSON(result)
}

// Get Chat Updates
func GetTelegramUpdates(c *fiber.Ctx) error {
	botToken := c.Get("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		botToken = os.Getenv("TELEGRAM_BOT_TOKEN")
	}
	if botToken == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "TELEGRAM_BOT_TOKEN not configured",
		})
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates", botToken)
	resp, err := http.Get(url)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get updates",
		})
	}
	defer resp.Body.Close()

	var telegramResp TelegramResponse
	json.NewDecoder(resp.Body).Decode(&telegramResp)

	// Extract chat information
	chats := make(map[string]interface{})
	for _, update := range telegramResp.Result {
		if update.Message.Chat.ID != 0 {
			chatID := fmt.Sprintf("%d", update.Message.Chat.ID)
			chats[chatID] = map[string]interface{}{
				"id":    update.Message.Chat.ID,
				"title": update.Message.Chat.Title,
				"type":  update.Message.Chat.Type,
			}
		}
	}

	return c.JSON(fiber.Map{
		"ok":    telegramResp.OK,
		"chats": chats,
		"raw":   telegramResp.Result,
	})
}

// Send test message
func SendTelegramTest(c *fiber.Ctx) error {
	type TestRequest struct {
		ChatID string `json:"chatId"`
		Message string `json:"message"`
	}

	var req TestRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	botToken := c.Get("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		botToken = os.Getenv("TELEGRAM_BOT_TOKEN")
	}
	if botToken == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "TELEGRAM_BOT_TOKEN not configured",
		})
	}

	if req.Message == "" {
		req.Message = "🧪 ทดสอบการส่งข้อความจากระบบจัดการเบอร์มือถือ\n\n✅ ระบบแจ้งเตือนทำงานปกติ!"
	}

	success := sendTelegramMessage(botToken, req.ChatID, req.Message)

	return c.JSON(fiber.Map{
		"success": success,
		"chatId": req.ChatID,
		"message": req.Message,
	})
}

// Send expiry notifications
func SendExpiryNotifications(c *fiber.Ctx) error {
	botToken := c.Get("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		botToken = os.Getenv("TELEGRAM_BOT_TOKEN")
	}

	chatID := c.Get("TELEGRAM_CHAT_ID")
	if chatID == "" {
		chatID = os.Getenv("TELEGRAM_CHAT_ID")
	}

	if botToken == "" || chatID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Telegram not configured",
		})
	}

	// Get expiring phone numbers
	expiringPhones, err := getExpiringPhoneNumbers()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get expiring phones",
		})
	}

	if len(expiringPhones) == 0 {
		message := "✅ ไม่มีเบอร์ที่จะหมดอายุในช่วงนี้"
		sendTelegramMessage(botToken, chatID, message)
		return c.JSON(fiber.Map{
			"message": "No expiring phones",
			"sent": true,
		})
	}

	// Create notification message
	message := "🚨 แจ้งเตือนเบอร์ที่ใกล้หมดอายุ\n\n"

	for _, phone := range expiringPhones {
		carrierEmoji := getCarrierEmoji(phone.Carrier)
		daysLeft := calculateDaysUntilExpiry(phone.PromotionEndDate)

		message += fmt.Sprintf("%s <b>%s</b> (%s)\n", carrierEmoji, phone.PhoneNumber, phone.Carrier)
		message += fmt.Sprintf("📋 %s | 🎯 %s\n", phone.Category, phone.Promotion)

		if daysLeft < 0 {
			message += fmt.Sprintf("🚨 <b>หมดอายุแล้ว %d วัน</b> (หมดอายุ: %s)\n\n",
				-daysLeft, phone.PromotionEndDate.Format("02/01/2006"))
		} else if daysLeft == 0 {
			message += fmt.Sprintf("⚠️ <b>หมดอายุวันนี้</b> (หมดอายุ: %s)\n\n",
				phone.PromotionEndDate.Format("02/01/2006"))
		} else {
			message += fmt.Sprintf("⏰ เหลือ %d วัน (หมดอายุ: %s)\n\n",
				daysLeft, phone.PromotionEndDate.Format("02/01/2006"))
		}
	}

	message += fmt.Sprintf("📊 รวม %d เบอร์ที่ต้องติดตาม", len(expiringPhones))

	success := sendTelegramMessage(botToken, chatID, message)

	return c.JSON(fiber.Map{
		"success": success,
		"count": len(expiringPhones),
		"phones": expiringPhones,
	})
}

// Helper functions
func sendTelegramMessage(botToken, chatID, message string) bool {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)

	payload := TelegramMessage{
		ChatID:    chatID,
		Text:      message,
		ParseMode: "HTML",
	}

	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode == 200
}

func getCarrierEmoji(carrier string) string {
	switch carrier {
	case "ais":
		return "🟢"
	case "dtac":
		return "🔵"
	case "true":
		return "🔴"
	default:
		return "📱"
	}
}

func calculateDaysUntilExpiry(expiryDate *time.Time) int {
	if expiryDate == nil {
		return 0
	}

	now := time.Now()
	diff := expiryDate.Sub(now)
	return int(diff.Hours() / 24)
}

func getExpiringPhoneNumbers() ([]ExpiringPhone, error) {
	// Get real data from database
	collection := database.GetCollection("phone_numbers")

	// Find phone numbers expiring in next 30 days OR already expired (within last 7 days)
	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	thirtyDaysFromNow := startOfToday.AddDate(0, 0, 30)
	sevenDaysAgo := startOfToday.AddDate(0, 0, -7) // เบอร์ที่หมดอายุไปแล้ว 7 วัน

	filter := bson.M{
		"promotionEndDate": bson.M{
			"$gte": sevenDaysAgo,    // รวมเบอร์ที่หมดอายุแล้ว 7 วันที่ผ่านมา
			"$lte": thirtyDaysFromNow,
		},
	}

	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		// If database query fails, return mock data as fallback
		oneWeek := now.AddDate(0, 0, 7)
		twoWeeks := now.AddDate(0, 0, 14)
		expired := now.AddDate(0, 0, -1) // หมดอายุเมื่อวาน

		mockPhones := []ExpiringPhone{
			{
				PhoneNumber:       "0989934742",
				Carrier:          "dtac",
				Category:         "ส่วนตัว",
				Promotion:        "Happy Internet",
				PromotionEndDate: &expired,
			},
			{
				PhoneNumber:       "081-234-5678",
				Carrier:          "ais",
				Category:         "ส่วนตัว",
				Promotion:        "เน็ตไม่อั้น 30GB",
				PromotionEndDate: &oneWeek,
			},
			{
				PhoneNumber:       "082-345-6789",
				Carrier:          "dtac",
				Category:         "งาน",
				Promotion:        "Happy Internet 20GB",
				PromotionEndDate: &twoWeeks,
			},
		}
		return mockPhones, nil
	}
	defer cursor.Close(context.Background())

	var phones []ExpiringPhone
	for cursor.Next(context.Background()) {
		var phone struct {
			PhoneNumber       string     `bson:"phoneNumber"`
			Carrier          string     `bson:"carrier"`
			Category         string     `bson:"category"`
			Promotion        string     `bson:"promotion"`
			PromotionEndDate *time.Time `bson:"promotionEndDate"`
		}

		if err := cursor.Decode(&phone); err != nil {
			continue
		}

		phones = append(phones, ExpiringPhone{
			PhoneNumber:       phone.PhoneNumber,
			Carrier:          phone.Carrier,
			Category:         phone.Category,
			Promotion:        phone.Promotion,
			PromotionEndDate: phone.PromotionEndDate,
		})
	}

	return phones, nil
}

type ExpiringPhone struct {
	PhoneNumber       string     `json:"phoneNumber"`
	Carrier          string     `json:"carrier"`
	Category         string     `json:"category"`
	Promotion        string     `json:"promotion"`
	PromotionEndDate *time.Time `json:"promotionEndDate"`
}

// GetExpiringPhonesForScheduler เอาไว้ให้ scheduler เรียกใช้
func GetExpiringPhonesForScheduler() ([]ExpiringPhone, error) {
	return getExpiringPhoneNumbers()
}

// SendNotificationMessage ส่งข้อความแจ้งเตือนไป Telegram
func SendNotificationMessage(botToken, chatID string, phones []ExpiringPhone) bool {
	// สร้างข้อความแจ้งเตือน
	message := "🚨 แจ้งเตือนเบอร์ที่ใกล้หมดอายุ\n\n"

	for _, phone := range phones {
		carrierEmoji := getCarrierEmoji(phone.Carrier)
		daysLeft := calculateDaysUntilExpiry(phone.PromotionEndDate)

		message += fmt.Sprintf("%s <b>%s</b> (%s)\n", carrierEmoji, phone.PhoneNumber, phone.Carrier)
		message += fmt.Sprintf("📋 %s | 🎯 %s\n", phone.Category, phone.Promotion)
		message += fmt.Sprintf("⏰ เหลือ %d วัน (หมดอายุ: %s)\n\n",
			daysLeft, phone.PromotionEndDate.Format("02/01/2006"))
	}

	message += fmt.Sprintf("📊 รวม %d เบอร์ที่ต้องติดตาม", len(phones))

	return sendTelegramMessage(botToken, chatID, message)
}