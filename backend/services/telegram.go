package services

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "os"
    "time"
)

type TelegramBot struct {
    BotToken string
    ChatID   string
}

type TelegramMessage struct {
    ChatID    string `json:"chat_id"`
    Text      string `json:"text"`
    ParseMode string `json:"parse_mode"`
}

type NotificationData struct {
    PhoneNumber      string
    Carrier          string
    Category         string
    Promotion        string
    ExpiryDate       time.Time
    DaysUntilExpiry  int
    Type             string // "promotion" or "sim"
}

func NewTelegramBot() *TelegramBot {
    return &TelegramBot{
        BotToken: os.Getenv("TELEGRAM_BOT_TOKEN"),
        ChatID:   os.Getenv("TELEGRAM_CHAT_ID"),
    }
}

func (tb *TelegramBot) IsConfigured() bool {
    return tb.BotToken != "" && tb.ChatID != ""
}

func (tb *TelegramBot) SendMessage(text string) error {
    if !tb.IsConfigured() {
        return fmt.Errorf("telegram bot not configured")
    }

    url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", tb.BotToken)

    message := TelegramMessage{
        ChatID:    tb.ChatID,
        Text:      text,
        ParseMode: "HTML",
    }

    jsonData, err := json.Marshal(message)
    if err != nil {
        return fmt.Errorf("failed to marshal message: %v", err)
    }

    resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
    if err != nil {
        return fmt.Errorf("failed to send telegram message: %v", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("telegram API returned status %d", resp.StatusCode)
    }

    return nil
}

func (tb *TelegramBot) SendExpiryNotification(data NotificationData) error {
    var message string
    var emoji string

    // Choose emoji based on carrier
    switch data.Carrier {
    case "ais":
        emoji = "🟢"
    case "dtac":
        emoji = "🔵"
    case "true":
        emoji = "🔴"
    default:
        emoji = "📱"
    }

    // Choose alert emoji based on days until expiry
    var alertEmoji string
    if data.DaysUntilExpiry <= 0 {
        alertEmoji = "🚨"
    } else if data.DaysUntilExpiry <= 7 {
        alertEmoji = "⚠️"
    } else {
        alertEmoji = "⏰"
    }

    if data.Type == "promotion" {
        message = fmt.Sprintf(
            "%s <b>แจ้งเตือนโปรโมชั่นหมดอายุ</b> %s\n\n"+
                "%s <b>เบอร์:</b> <code>%s</code>\n"+
                "📋 <b>หมวดหมู่:</b> %s\n"+
                "🎯 <b>โปรโมชั่น:</b> %s\n"+
                "📅 <b>วันหมดอายุ:</b> %s\n"+
                "⏱️ <b>เหลือเวลา:</b> %s",
            alertEmoji,
            emoji,
            data.PhoneNumber,
            data.Category,
            data.Promotion,
            data.ExpiryDate.Format("02/01/2006"),
            formatTimeRemaining(data.DaysUntilExpiry),
        )
    } else {
        message = fmt.Sprintf(
            "%s <b>แจ้งเตือนซิมหมดอายุ</b> %s\n\n"+
                "%s <b>เบอร์:</b> <code>%s</code>\n"+
                "📋 <b>หมวดหมู่:</b> %s\n"+
                "📅 <b>วันหมดอายุซิม:</b> %s\n"+
                "⏱️ <b>เหลือเวลา:</b> %s",
            alertEmoji,
            emoji,
            data.PhoneNumber,
            data.Category,
            data.ExpiryDate.Format("02/01/2006"),
            formatTimeRemaining(data.DaysUntilExpiry),
        )
    }

    return tb.SendMessage(message)
}

func (tb *TelegramBot) SendDailyReport(expiring []NotificationData, expired []NotificationData) error {
    if !tb.IsConfigured() {
        return fmt.Errorf("telegram bot not configured")
    }

    message := "📊 <b>รายงานประจำวัน - ระบบจัดการเบอร์มือถือ</b>\n\n"

    if len(expiring) > 0 {
        message += "⚠️ <b>เบอร์ที่จะหมดอายุใน 7 วัน:</b>\n"
        for _, data := range expiring {
            message += fmt.Sprintf("• %s (%s) - %s\n",
                data.PhoneNumber,
                data.Carrier,
                formatTimeRemaining(data.DaysUntilExpiry))
        }
        message += "\n"
    }

    if len(expired) > 0 {
        message += "🚨 <b>เบอร์ที่หมดอายุแล้ว:</b>\n"
        for _, data := range expired {
            message += fmt.Sprintf("• %s (%s) - หมดอายุแล้ว %d วัน\n",
                data.PhoneNumber,
                data.Carrier,
                -data.DaysUntilExpiry)
        }
        message += "\n"
    }

    if len(expiring) == 0 && len(expired) == 0 {
        message += "✅ <b>ไม่มีเบอร์ที่จะหมดอายุหรือหมดอายุแล้ว</b>\n"
    }

    message += fmt.Sprintf("\n📅 <i>%s</i>", time.Now().Format("02/01/2006 15:04"))

    return tb.SendMessage(message)
}

func formatTimeRemaining(days int) string {
    if days < 0 {
        return fmt.Sprintf("หมดอายุแล้ว %d วัน", -days)
    } else if days == 0 {
        return "หมดอายุวันนี้"
    } else if days == 1 {
        return "หมดอายุพรุ่งนี้"
    } else {
        return fmt.Sprintf("อีก %d วัน", days)
    }
}