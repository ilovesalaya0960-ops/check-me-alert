package scheduler

import (
	"log"
	"mobile-shop-backend/handlers"
	"os"
	"time"
)

// StartDailyNotificationScheduler เริ่มต้นระบบแจ้งเตือนอัตโนมัติทุกวัน
func StartDailyNotificationScheduler() {
	go func() {
		ticker := time.NewTicker(24 * time.Hour) // ทุก 24 ชั่วโมง
		defer ticker.Stop()

		// ส่งแจ้งเตือนครั้งแรกหลังจาก 1 นาที (สำหรับทดสอบ)
		time.Sleep(1 * time.Minute)
		sendDailyNotification()

		// จากนั้นส่งทุกวันเวลา 00:10
		for {
			now := time.Now()
			next := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 10, 0, 0, now.Location())
			duration := next.Sub(now)

			time.Sleep(duration)
			sendDailyNotification()
		}
	}()

	log.Println("📅 Daily notification scheduler started")
}

// StartTestNotificationScheduler เริ่มต้นระบบแจ้งเตือนทดสอบทุก 5 นาที
func StartTestNotificationScheduler() {
	go func() {
		ticker := time.NewTicker(5 * time.Minute) // ทุก 5 นาที
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				sendDailyNotification()
			}
		}
	}()

	log.Println("🧪 Test notification scheduler started (every 5 minutes)")
}

func sendDailyNotification() {
	// ตรวจสอบ environment variables
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	chatID := os.Getenv("TELEGRAM_CHAT_ID")

	if botToken == "" || chatID == "" {
		log.Println("⚠️ TELEGRAM_BOT_TOKEN หรือ TELEGRAM_CHAT_ID ไม่ได้ตั้งค่า - ข้ามการส่งแจ้งเตือน")
		return
	}

	log.Printf("🔔 กำลังส่งแจ้งเตือนอัตโนมัติ (Bot: %s, Chat: %s)", botToken[:10]+"...", chatID)

	// เรียก API โดยตรงแทนการใช้ handler
	expiringPhones, err := handlers.GetExpiringPhonesForScheduler()
	if err != nil {
		log.Printf("❌ ไม่สามารถดึงข้อมูลเบอร์ที่หมดอายุ: %v", err)
		return
	}

	if len(expiringPhones) == 0 {
		log.Println("✅ ไม่มีเบอร์ที่จะหมดอายุในช่วงนี้")
		return
	}

	// สร้างข้อความแจ้งเตือน
	success := handlers.SendNotificationMessage(botToken, chatID, expiringPhones)
	if success {
		log.Printf("✅ ส่งแจ้งเตือนสำเร็จ (%d เบอร์)", len(expiringPhones))
	} else {
		log.Println("❌ ส่งแจ้งเตือนไม่สำเร็จ")
	}
}