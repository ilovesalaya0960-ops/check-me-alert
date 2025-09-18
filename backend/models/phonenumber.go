package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type PhoneNumber struct {
    ID                    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    PhoneNumber          string             `json:"phoneNumber" bson:"phoneNumber" validate:"required"`
    Carrier              string             `json:"carrier" bson:"carrier" validate:"required,oneof=ais dtac true"`
    Category             string             `json:"category" bson:"category" validate:"required"`
    Promotion            string             `json:"promotion" bson:"promotion"`
    PromotionStartDate   *time.Time         `json:"promotionStartDate" bson:"promotionStartDate"`
    PromotionEndDate     *time.Time         `json:"promotionEndDate" bson:"promotionEndDate"`
    SimExpiryDate        *time.Time         `json:"simExpiryDate" bson:"simExpiryDate"`
    Notes                string             `json:"notes" bson:"notes"`

    // Timestamps
    CreatedAt            time.Time          `json:"createdAt" bson:"createdAt"`
    UpdatedAt            time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type PhoneNumberFilter struct {
    Carrier              string    `json:"carrier"`
    Category             string    `json:"category"`
    ExpiryDateFrom       *time.Time `json:"expiryDateFrom"`
    ExpiryDateTo         *time.Time `json:"expiryDateTo"`
    PromotionExpirySoon  bool      `json:"promotionExpirySoon"`
    SimExpirySoon        bool      `json:"simExpirySoon"`
    Days                 int       `json:"days"` // จำนวนวันที่จะหมดอายุ
}