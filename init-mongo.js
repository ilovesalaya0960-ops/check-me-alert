// init-mongo.js
db = db.getSiblingDB('phone_management');

// Create collections
db.createCollection('phone_numbers');
db.createCollection('customers');

// Create indexes for better performance
db.phone_numbers.createIndex({ "phoneNumber": 1 }, { unique: true });
db.phone_numbers.createIndex({ "carrier": 1 });
db.phone_numbers.createIndex({ "category": 1 });
db.phone_numbers.createIndex({ "promotionEndDate": 1 });
db.phone_numbers.createIndex({ "simExpiryDate": 1 });
db.phone_numbers.createIndex({ "createdAt": -1 });

db.customers.createIndex({ "phone": 1 });
db.customers.createIndex({ "email": 1 });
db.customers.createIndex({ "createdAt": -1 });

// Insert sample phone numbers data
db.phone_numbers.insertMany([
  {
    phoneNumber: "081-234-5678",
    carrier: "ais",
    category: "ส่วนตัว",
    promotion: "เน็ตไม่อั้น 30GB",
    promotionStartDate: new Date("2024-01-01"),
    promotionEndDate: new Date("2024-12-31"),
    simExpiryDate: new Date("2025-12-31"),
    notes: "เบอร์หลัก",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    phoneNumber: "082-345-6789",
    carrier: "dtac",
    category: "งาน",
    promotion: "Happy Internet 20GB",
    promotionStartDate: new Date("2024-02-01"),
    promotionEndDate: new Date("2024-11-30"),
    simExpiryDate: new Date("2025-06-30"),
    notes: "เบอร์ทำงาน",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    phoneNumber: "083-456-7890",
    carrier: "true",
    category: "ธุรกิจ",
    promotion: "Super Internet 50GB",
    promotionStartDate: new Date("2024-03-01"),
    promotionEndDate: new Date("2024-09-30"),
    simExpiryDate: new Date("2025-03-31"),
    notes: "เบอร์ธุรกิจ",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Database initialized with sample data');