package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type TelegramSettings struct {
    ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    BotToken          string            `json:"botToken" bson:"botToken"`
    ChatID            string            `json:"chatId" bson:"chatId"`
    IsEnabled         bool              `json:"isEnabled" bson:"isEnabled"`

    // Notification preferences
    NotifyPromotion   bool              `json:"notifyPromotion" bson:"notifyPromotion"`
    NotifySim         bool              `json:"notifySim" bson:"notifySim"`
    DaysBeforeExpiry  int               `json:"daysBeforeExpiry" bson:"daysBeforeExpiry"`
    DailyReport       bool              `json:"dailyReport" bson:"dailyReport"`
    DailyReportTime   string            `json:"dailyReportTime" bson:"dailyReportTime"` // format: "09:00"

    // Timestamps
    CreatedAt         time.Time         `json:"createdAt" bson:"createdAt"`
    UpdatedAt         time.Time         `json:"updatedAt" bson:"updatedAt"`
}

type NotificationLog struct {
    ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    PhoneNumberID   primitive.ObjectID `json:"phoneNumberId" bson:"phoneNumberId"`
    PhoneNumber     string            `json:"phoneNumber" bson:"phoneNumber"`
    NotificationType string            `json:"notificationType" bson:"notificationType"` // "promotion", "sim", "daily_report"
    Message         string            `json:"message" bson:"message"`
    Status          string            `json:"status" bson:"status"` // "sent", "failed"
    ErrorMessage    string            `json:"errorMessage" bson:"errorMessage"`
    SentAt          time.Time         `json:"sentAt" bson:"sentAt"`
    CreatedAt       time.Time         `json:"createdAt" bson:"createdAt"`
}