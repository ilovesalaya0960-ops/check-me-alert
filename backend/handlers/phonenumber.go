package handlers

import (
    "context"
    "mobile-shop-backend/database"
    "mobile-shop-backend/models"
    "time"

    "github.com/gofiber/fiber/v2"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo/options"
)

func GetPhoneNumbers(c *fiber.Ctx) error {
    collection := database.GetCollection("phone_numbers")

    page := c.QueryInt("page", 1)
    limit := c.QueryInt("limit", 10)
    skip := (page - 1) * limit

    findOptions := options.Find()
    findOptions.SetLimit(int64(limit))
    findOptions.SetSkip(int64(skip))
    findOptions.SetSort(bson.D{{Key: "createdAt", Value: -1}})

    // Build filter based on query parameters
    filter := bson.M{}

    if carrier := c.Query("carrier"); carrier != "" {
        filter["carrier"] = carrier
    }

    if category := c.Query("category"); category != "" {
        filter["category"] = category
    }

    cursor, err := collection.Find(context.Background(), filter, findOptions)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch phone numbers"})
    }
    defer cursor.Close(context.Background())

    var phoneNumbers []models.PhoneNumber
    if err = cursor.All(context.Background(), &phoneNumbers); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to decode phone numbers"})
    }

    // Get total count
    total, _ := collection.CountDocuments(context.Background(), filter)

    return c.JSON(fiber.Map{
        "phoneNumbers": phoneNumbers,
        "total": total,
        "page": page,
        "limit": limit,
    })
}

func GetPhoneNumber(c *fiber.Ctx) error {
    id := c.Params("id")
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid phone number ID"})
    }

    collection := database.GetCollection("phone_numbers")
    var phoneNumber models.PhoneNumber

    err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&phoneNumber)
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Phone number not found"})
    }

    return c.JSON(phoneNumber)
}

func CreatePhoneNumber(c *fiber.Ctx) error {
    var phoneNumber models.PhoneNumber
    if err := c.BodyParser(&phoneNumber); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    // Validate carrier
    if phoneNumber.Carrier != "ais" && phoneNumber.Carrier != "dtac" && phoneNumber.Carrier != "true" {
        return c.Status(400).JSON(fiber.Map{"error": "Carrier must be one of: ais, dtac, true"})
    }

    phoneNumber.ID = primitive.NewObjectID()
    phoneNumber.CreatedAt = time.Now()
    phoneNumber.UpdatedAt = time.Now()

    collection := database.GetCollection("phone_numbers")
    _, err := collection.InsertOne(context.Background(), phoneNumber)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to create phone number"})
    }

    return c.Status(201).JSON(phoneNumber)
}

func UpdatePhoneNumber(c *fiber.Ctx) error {
    id := c.Params("id")
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid phone number ID"})
    }

    var updates map[string]interface{}
    if err := c.BodyParser(&updates); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    // Validate carrier if it's being updated
    if carrier, exists := updates["carrier"]; exists {
        carrierStr, ok := carrier.(string)
        if !ok || (carrierStr != "ais" && carrierStr != "dtac" && carrierStr != "true") {
            return c.Status(400).JSON(fiber.Map{"error": "Carrier must be one of: ais, dtac, true"})
        }
    }

    updates["updatedAt"] = time.Now()

    collection := database.GetCollection("phone_numbers")
    _, err = collection.UpdateOne(
        context.Background(),
        bson.M{"_id": objectID},
        bson.M{"$set": updates},
    )
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to update phone number"})
    }

    return c.JSON(fiber.Map{"message": "Phone number updated successfully"})
}

func DeletePhoneNumber(c *fiber.Ctx) error {
    id := c.Params("id")
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid phone number ID"})
    }

    collection := database.GetCollection("phone_numbers")
    _, err = collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to delete phone number"})
    }

    return c.JSON(fiber.Map{"message": "Phone number deleted successfully"})
}

func SearchPhoneNumbers(c *fiber.Ctx) error {
    query := c.Query("q")
    if query == "" {
        return c.Status(400).JSON(fiber.Map{"error": "Search query required"})
    }

    collection := database.GetCollection("phone_numbers")

    filter := bson.M{
        "$or": []bson.M{
            {"phoneNumber": bson.M{"$regex": query, "$options": "i"}},
            {"carrier": bson.M{"$regex": query, "$options": "i"}},
            {"category": bson.M{"$regex": query, "$options": "i"}},
            {"promotion": bson.M{"$regex": query, "$options": "i"}},
        },
    }

    cursor, err := collection.Find(context.Background(), filter)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Search failed"})
    }
    defer cursor.Close(context.Background())

    var phoneNumbers []models.PhoneNumber
    if err = cursor.All(context.Background(), &phoneNumbers); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to decode search results"})
    }

    return c.JSON(fiber.Map{"phoneNumbers": phoneNumbers})
}

func GetExpiringPhoneNumbers(c *fiber.Ctx) error {
    days := c.QueryInt("days", 30) // Default 30 days
    expiryType := c.Query("type", "promotion") // promotion or sim

    collection := database.GetCollection("phone_numbers")

    now := time.Now()
    futureDate := now.AddDate(0, 0, days)

    var filter bson.M

    if expiryType == "sim" {
        filter = bson.M{
            "simExpiryDate": bson.M{
                "$gte": now,
                "$lte": futureDate,
            },
        }
    } else {
        filter = bson.M{
            "promotionEndDate": bson.M{
                "$gte": now,
                "$lte": futureDate,
            },
        }
    }

    cursor, err := collection.Find(context.Background(), filter)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch expiring phone numbers"})
    }
    defer cursor.Close(context.Background())

    var phoneNumbers []models.PhoneNumber
    if err = cursor.All(context.Background(), &phoneNumbers); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to decode expiring phone numbers"})
    }

    return c.JSON(fiber.Map{
        "phoneNumbers": phoneNumbers,
        "expiryType": expiryType,
        "days": days,
        "total": len(phoneNumbers),
    })
}

func GetPhoneNumbersByCarrier(c *fiber.Ctx) error {
    collection := database.GetCollection("phone_numbers")

    pipeline := []bson.M{
        {
            "$group": bson.M{
                "_id": "$carrier",
                "count": bson.M{"$sum": 1},
                "phoneNumbers": bson.M{"$push": "$$ROOT"},
            },
        },
        {
            "$sort": bson.M{"count": -1},
        },
    }

    cursor, err := collection.Aggregate(context.Background(), pipeline)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to aggregate by carrier"})
    }
    defer cursor.Close(context.Background())

    var results []bson.M
    if err = cursor.All(context.Background(), &results); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to decode aggregation results"})
    }

    return c.JSON(fiber.Map{"carrierStats": results})
}