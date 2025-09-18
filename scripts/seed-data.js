// seed-data.js
// MongoDB Data Seeding Script for Phone Management System

// Connect to database
db = db.getSiblingDB('phone_management');

print('🌱 Starting data seeding for phone_management database...');

// ==========================================
// CARRIERS DATA
// ==========================================
print('\n📡 Seeding carriers data...');

const carriers = [
  {
    _id: ObjectId(),
    code: "ais",
    name: "AIS",
    fullName: "Advanced Info Service",
    color: "#00A651",
    logo: "/images/carriers/ais.png",
    customerService: "1175",
    website: "https://www.ais.co.th",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    code: "dtac",
    name: "DTAC",
    fullName: "Total Access Communication",
    color: "#1E3A8A",
    logo: "/images/carriers/dtac.png",
    customerService: "1678",
    website: "https://www.dtac.co.th",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    code: "true",
    name: "TRUE",
    fullName: "True Corporation",
    color: "#DC2626",
    logo: "/images/carriers/true.png",
    customerService: "1331",
    website: "https://www.truemove.com",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

try {
  db.carriers.deleteMany({}); // Clear existing data
  db.carriers.insertMany(carriers);
  print('✅ Inserted', carriers.length, 'carriers');
} catch (e) {
  print('❌ Error inserting carriers:', e.message);
}

// ==========================================
// CATEGORIES DATA
// ==========================================
print('\n📂 Seeding categories data...');

const categories = [
  {
    _id: ObjectId(),
    name: "ส่วนตัว",
    description: "เบอร์สำหรับใช้งานส่วนตัว",
    color: "#3B82F6",
    icon: "user",
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "งาน",
    description: "เบอร์สำหรับใช้งานในที่ทำงาน",
    color: "#10B981",
    icon: "briefcase",
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "ธุรกิจ",
    description: "เบอร์สำหรับติดต่อธุรกิจ",
    color: "#F59E0B",
    icon: "building",
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "ครอบครัว",
    description: "เบอร์สำหรับสมาชิกในครอบครัว",
    color: "#EF4444",
    icon: "heart",
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "ลูกค้า",
    description: "เบอร์สำหรับติดต่อลูกค้า",
    color: "#8B5CF6",
    icon: "users",
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

try {
  db.categories.deleteMany({}); // Clear existing data
  db.categories.insertMany(categories);
  print('✅ Inserted', categories.length, 'categories');
} catch (e) {
  print('❌ Error inserting categories:', e.message);
}

// ==========================================
// PROMOTIONS DATA
// ==========================================
print('\n🎯 Seeding promotions data...');

const aisCarrierId = carriers.find(c => c.code === "ais")._id;
const dtacCarrierId = carriers.find(c => c.code === "dtac")._id;
const trueCarrierId = carriers.find(c => c.code === "true")._id;

const promotions = [
  // AIS Promotions
  {
    _id: ObjectId(),
    name: "เน็ตไม่อั้น 30GB",
    carrierId: aisCarrierId,
    description: "เน็ตไม่อั้น 30GB ความเร็วสูงสุด 10Mbps",
    price: 599,
    validity: 30,
    data: 30,
    voice: 0,
    sms: 0,
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "Max Speed Unlimited",
    carrierId: aisCarrierId,
    description: "เน็ตไม่อั้น ความเร็วเต็มที่ไม่จำกัด",
    price: 899,
    validity: 30,
    data: -1, // Unlimited
    voice: 0,
    sms: 0,
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // DTAC Promotions
  {
    _id: ObjectId(),
    name: "Happy Internet 20GB",
    carrierId: dtacCarrierId,
    description: "เน็ต 20GB + โทรฟรี 100 นาที",
    price: 450,
    validity: 30,
    data: 20,
    voice: 100,
    sms: 0,
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "Go+ Unlimited",
    carrierId: dtacCarrierId,
    description: "เน็ตไม่อั้น + โทรฟรีทุกเครือข่าย",
    price: 799,
    validity: 30,
    data: -1, // Unlimited
    voice: -1, // Unlimited
    sms: 0,
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // TRUE Promotions
  {
    _id: ObjectId(),
    name: "Super Internet 50GB",
    carrierId: trueCarrierId,
    description: "เน็ต 50GB ความเร็วสูง + LINE, Facebook ไม่จำกัด",
    price: 650,
    validity: 30,
    data: 50,
    voice: 0,
    sms: 0,
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "Unlimited Plus",
    carrierId: trueCarrierId,
    description: "เน็ตไม่อั้น + Netflix, YouTube Premium ฟรี",
    price: 999,
    validity: 30,
    data: -1, // Unlimited
    voice: -1, // Unlimited
    sms: -1, // Unlimited
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

try {
  db.promotions.deleteMany({}); // Clear existing data
  db.promotions.insertMany(promotions);
  print('✅ Inserted', promotions.length, 'promotions');
} catch (e) {
  print('❌ Error inserting promotions:', e.message);
}

// ==========================================
// SAMPLE PHONE NUMBERS DATA
// ==========================================
print('\n📱 Seeding sample phone numbers data...');

const samplePhoneNumbers = [
  {
    _id: ObjectId(),
    phoneNumber: "081-234-5678",
    carrier: "ais",
    category: "ส่วนตัว",
    promotion: "เน็ตไม่อั้น 30GB",
    promotionStartDate: new Date('2024-01-01'),
    promotionEndDate: new Date('2024-12-31'),
    simExpiryDate: new Date('2025-12-31'),
    simSerial: "AIS123456789",
    notes: "เบอร์หลักสำหรับใช้งานส่วนตัว",
    status: "active",
    tags: ["หลัก", "ส่วนตัว"],
    lastNotified: null,
    notificationCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    createdBy: ObjectId()
  },
  {
    _id: ObjectId(),
    phoneNumber: "082-345-6789",
    carrier: "dtac",
    category: "งาน",
    promotion: "Happy Internet 20GB",
    promotionStartDate: new Date('2024-02-01'),
    promotionEndDate: new Date('2025-01-31'),
    simExpiryDate: new Date('2025-06-30'),
    simSerial: "DTAC987654321",
    notes: "เบอร์สำหรับติดต่องาน",
    status: "active",
    tags: ["งาน", "ออฟฟิศ"],
    lastNotified: null,
    notificationCount: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    createdBy: ObjectId()
  },
  {
    _id: ObjectId(),
    phoneNumber: "083-456-7890",
    carrier: "true",
    category: "ธุรกิจ",
    promotion: "Super Internet 50GB",
    promotionStartDate: new Date('2024-03-01'),
    promotionEndDate: new Date('2025-09-25'), // จะหมดอายุเร็วๆ นี้
    simExpiryDate: new Date('2025-03-31'), // หมดอายุแล้ว
    simSerial: "TRUE555444333",
    notes: "เบอร์ธุรกิจ - ต้องต่ออายุเร็วๆ นี้",
    status: "active",
    tags: ["ธุรกิจ", "ลูกค้า"],
    lastNotified: new Date('2024-09-15'),
    notificationCount: 2,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    createdBy: ObjectId()
  },
  {
    _id: ObjectId(),
    phoneNumber: "084-567-8901",
    carrier: "ais",
    category: "ครอบครัว",
    promotion: "Max Speed Unlimited",
    promotionStartDate: new Date('2024-06-01'),
    promotionEndDate: new Date('2025-05-31'),
    simExpiryDate: new Date('2026-01-01'),
    simSerial: "AIS666777888",
    notes: "เบอร์ของคุณแม่",
    status: "active",
    tags: ["ครอบครัว", "แม่"],
    lastNotified: null,
    notificationCount: 0,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date(),
    createdBy: ObjectId()
  },
  {
    _id: ObjectId(),
    phoneNumber: "085-678-9012",
    carrier: "dtac",
    category: "ลูกค้า",
    promotion: "Go+ Unlimited",
    promotionStartDate: new Date('2024-08-01'),
    promotionEndDate: new Date('2025-07-31'),
    simExpiryDate: new Date('2025-12-31'),
    simSerial: "DTAC111222333",
    notes: "เบอร์สำหรับติดต่อลูกค้า VIP",
    status: "active",
    tags: ["ลูกค้า", "VIP"],
    lastNotified: null,
    notificationCount: 0,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date(),
    createdBy: ObjectId()
  }
];

try {
  // Don't clear existing phone numbers, just add if not exists
  for (const phoneNumber of samplePhoneNumbers) {
    const existing = db.phone_numbers.findOne({ phoneNumber: phoneNumber.phoneNumber });
    if (!existing) {
      db.phone_numbers.insertOne(phoneNumber);
      print('✅ Inserted phone number:', phoneNumber.phoneNumber);
    } else {
      print('⚠️  Phone number already exists:', phoneNumber.phoneNumber);
    }
  }
} catch (e) {
  print('❌ Error inserting phone numbers:', e.message);
}

// ==========================================
// DEFAULT TELEGRAM SETTINGS
// ==========================================
print('\n📞 Seeding default telegram settings...');

const defaultTelegramSettings = {
  _id: ObjectId(),
  botToken: "",
  chatId: "",
  isEnabled: false,
  notifyPromotion: true,
  notifySim: true,
  daysBeforeExpiry: 7,
  dailyReport: false,
  dailyReportTime: "09:00",
  lastDailyReport: null,
  messageTemplate: {
    promotion: "⚠️ แจ้งเตือนโปรโมชั่นหมดอายุ {{carrier_emoji}}\n\n📱 เบอร์: {{phone_number}}\n📋 หมวดหมู่: {{category}}\n🎯 โปรโมชั่น: {{promotion}}\n📅 วันหมดอายุ: {{expiry_date}}\n⏱️ เหลือเวลา: {{time_remaining}}",
    sim: "🚨 แจ้งเตือนซิมหมดอายุ {{carrier_emoji}}\n\n📱 เบอร์: {{phone_number}}\n📋 หมวดหมู่: {{category}}\n📅 วันหมดอายุซิม: {{expiry_date}}\n⏱️ เหลือเวลา: {{time_remaining}}",
    dailyReport: "📊 รายงานประจำวัน - ระบบจัดการเบอร์มือถือ\n\n{{expiring_section}}{{expired_section}}\n📅 {{current_date}}"
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

try {
  const existing = db.telegram_settings.findOne({});
  if (!existing) {
    db.telegram_settings.insertOne(defaultTelegramSettings);
    print('✅ Inserted default telegram settings');
  } else {
    print('⚠️  Telegram settings already exist');
  }
} catch (e) {
  print('❌ Error inserting telegram settings:', e.message);
}

// ==========================================
// SAMPLE NOTIFICATION LOGS
// ==========================================
print('\n🔔 Seeding sample notification logs...');

const sampleNotificationLogs = [
  {
    _id: ObjectId(),
    phoneNumberId: samplePhoneNumbers[2]._id, // TRUE number
    phoneNumber: "083-456-7890",
    notificationType: "promotion",
    message: "⚠️ แจ้งเตือนโปรโมชั่นหมดอายุ 🔴\n\n📱 เบอร์: 083-456-7890\n📋 หมวดหมู่: ธุรกิจ\n🎯 โปรโมชั่น: Super Internet 50GB\n📅 วันหมดอายุ: 25/09/2025\n⏱️ เหลือเวลา: อีก 7 วัน",
    status: "sent",
    errorMessage: "",
    sentAt: new Date('2024-09-18T14:30:00'),
    scheduledAt: new Date('2024-09-18T14:30:00'),
    createdAt: new Date('2024-09-18T14:30:00'),
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
  },
  {
    _id: ObjectId(),
    phoneNumberId: samplePhoneNumbers[2]._id, // TRUE number
    phoneNumber: "083-456-7890",
    notificationType: "sim",
    message: "🚨 แจ้งเตือนซิมหมดอายุ 🔴\n\n📱 เบอร์: 083-456-7890\n📋 หมวดหมู่: ธุรกิจ\n📅 วันหมดอายุซิม: 31/03/2025\n⏱️ เหลือเวลา: หมดอายุแล้ว 172 วัน",
    status: "sent",
    errorMessage: "",
    sentAt: new Date('2024-09-15T09:00:00'),
    scheduledAt: new Date('2024-09-15T09:00:00'),
    createdAt: new Date('2024-09-15T09:00:00'),
    ipAddress: "127.0.0.1",
    userAgent: "System/Cron"
  }
];

try {
  db.notification_logs.deleteMany({}); // Clear existing logs for demo
  db.notification_logs.insertMany(sampleNotificationLogs);
  print('✅ Inserted', sampleNotificationLogs.length, 'notification logs');
} catch (e) {
  print('❌ Error inserting notification logs:', e.message);
}

// ==========================================
// SUMMARY
// ==========================================
print('\n📊 Data seeding summary:');

const collections = [
  'carriers',
  'categories',
  'promotions',
  'phone_numbers',
  'telegram_settings',
  'notification_logs'
];

collections.forEach(collectionName => {
  try {
    const count = db[collectionName].countDocuments();
    print(`📋 ${collectionName}: ${count} documents`);
  } catch (e) {
    print(`⚠️  Could not count ${collectionName}:`, e.message);
  }
});

print('\n🎉 Data seeding completed!');

print('\n💡 What\'s next:');
print('1. Access the application at http://localhost:3000');
print('2. Configure Telegram Bot in settings');
print('3. Test notifications with sample data');
print('4. Add your own phone numbers');
print('5. Set up automated daily reports');

print('\n🔍 Sample data includes:');
print('- 3 carriers (AIS, DTAC, TRUE)');
print('- 5 categories (ส่วนตัว, งาน, ธุรกิจ, ครอบครัว, ลูกค้า)');
print('- 6 promotions across all carriers');
print('- 5 sample phone numbers with different expiry dates');
print('- 2 sample notification logs');
print('- Default telegram settings (disabled)');