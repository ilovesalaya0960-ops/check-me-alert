# Database Design - ระบบจัดการเบอร์มือถือ

## Overview
ระบบใช้ **MongoDB** เป็น NoSQL Database เพื่อความยืดหยุ่นในการจัดเก็บข้อมูลและรองรับการขยายระบบ

---

## 📊 Database Schema

### Database: `phone_management`

#### Collections:
1. **phone_numbers** - ข้อมูลเบอร์มือถือหลัก
2. **telegram_settings** - การตั้งค่า Telegram Bot
3. **notification_logs** - ประวัติการส่งแจ้งเตือน
4. **users** - ข้อมูลผู้ใช้ (สำหรับอนาคต)
5. **categories** - หมวดหมู่การใช้งาน
6. **carriers** - ข้อมูลค่ายโทรศัพท์
7. **promotions** - ข้อมูลโปรโมชั่น

---

## 🗃️ Collection Structures

### 1. phone_numbers
```javascript
{
  _id: ObjectId,
  phoneNumber: String,        // "081-234-5678" (Unique)
  carrier: String,           // "ais", "dtac", "true"
  category: String,          // "ส่วนตัว", "งาน", "ธุรกิจ"

  // Promotion Data
  promotion: String,         // ชื่อโปรโมชั่น
  promotionStartDate: Date,  // วันเริ่มโปร
  promotionEndDate: Date,    // วันหมดอายุโปร

  // SIM Data
  simExpiryDate: Date,       // วันหมดอายุซิม
  simSerial: String,         // หมายเลขซีเรียลซิม

  // Additional Info
  notes: String,             // หมายเหตุ
  status: String,            // "active", "inactive", "expired"

  // Metadata
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,       // Reference to users collection
  tags: [String],            // แท็กสำหรับจัดกลุ่ม

  // Analytics
  lastNotified: Date,        // ครั้งสุดท้ายที่ส่งแจ้งเตือน
  notificationCount: Number, // จำนวนครั้งที่ส่งแจ้งเตือน
}
```

### 2. telegram_settings
```javascript
{
  _id: ObjectId,
  botToken: String,          // Telegram Bot Token (encrypted)
  chatId: String,            // Chat ID สำหรับส่งข้อความ
  isEnabled: Boolean,        // เปิด/ปิดการแจ้งเตือน

  // Notification Preferences
  notifyPromotion: Boolean,  // แจ้งเตือนโปรโมชั่น
  notifySim: Boolean,        // แจ้งเตือนซิม
  daysBeforeExpiry: Number,  // จำนวนวันแจ้งเตือนล่วงหน้า

  // Daily Report
  dailyReport: Boolean,      // เปิด/ปิดรายงานประจำวัน
  dailyReportTime: String,   // เวลาส่งรายงาน "09:00"
  lastDailyReport: Date,     // ครั้งสุดท้ายที่ส่งรายงาน

  // Advanced Settings
  messageTemplate: {
    promotion: String,       // Template ข้อความโปรโมชั่น
    sim: String,            // Template ข้อความซิม
    dailyReport: String     // Template รายงานประจำวัน
  },

  createdAt: Date,
  updatedAt: Date,
}
```

### 3. notification_logs
```javascript
{
  _id: ObjectId,
  phoneNumberId: ObjectId,   // Reference to phone_numbers
  phoneNumber: String,       // เบอร์มือถือ (denormalized)

  // Notification Details
  notificationType: String,  // "promotion", "sim", "daily_report"
  message: String,           // ข้อความที่ส่ง

  // Status
  status: String,            // "sent", "failed", "pending"
  errorMessage: String,      // ข้อผิดพลาด (ถ้ามี)

  // Timing
  sentAt: Date,              // เวลาที่ส่ง
  scheduledAt: Date,         // เวลาที่กำหนดส่ง

  // Metadata
  createdAt: Date,
  ipAddress: String,         // IP ที่ส่งคำสั่ง
  userAgent: String,         // Browser/App ที่ใช้
}
```

### 4. users (Future Enhancement)
```javascript
{
  _id: ObjectId,
  username: String,          // Username (unique)
  email: String,            // Email (unique)
  passwordHash: String,     // Hashed password

  // Profile
  firstName: String,
  lastName: String,
  role: String,             // "admin", "user", "viewer"

  // Preferences
  timezone: String,         // "Asia/Bangkok"
  language: String,         // "th", "en"
  theme: String,           // "light", "dark"

  // Status
  isActive: Boolean,
  lastLogin: Date,
  emailVerified: Boolean,

  createdAt: Date,
  updatedAt: Date,
}
```

### 5. categories
```javascript
{
  _id: ObjectId,
  name: String,             // "ส่วนตัว", "งาน", "ธุรกิจ"
  description: String,      // คำอธิบาย
  color: String,           // สีสำหรับแสดงผล "#FF0000"
  icon: String,            // ไอคอน
  isActive: Boolean,
  sortOrder: Number,       // ลำดับการแสดงผล

  createdAt: Date,
  updatedAt: Date,
}
```

### 6. carriers
```javascript
{
  _id: ObjectId,
  code: String,            // "ais", "dtac", "true"
  name: String,            // "AIS", "DTAC", "TRUE"
  fullName: String,        // "Advanced Info Service"
  color: String,           // สีประจำค่าย
  logo: String,            // URL โลโก้

  // Contact Info
  customerService: String,  // เบอร์บริการลูกค้า
  website: String,         // เว็บไซต์

  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

### 7. promotions
```javascript
{
  _id: ObjectId,
  name: String,            // "เน็ตไม่อั้น 30GB"
  carrierId: ObjectId,     // Reference to carriers

  // Details
  description: String,     // รายละเอียดโปร
  price: Number,          // ราคา
  validity: Number,       // ระยะเวลา (วัน)

  // Benefits
  data: Number,           // ข้อมูล (GB)
  voice: Number,          // นาทีโทร
  sms: Number,           // SMS

  // Status
  isActive: Boolean,
  startDate: Date,       // วันเริ่มใช้โปร
  endDate: Date,         // วันหยุดใช้โปร

  createdAt: Date,
  updatedAt: Date,
}
```

---

## 🔍 Indexes Design

### phone_numbers Collection
```javascript
// Primary Indexes
db.phone_numbers.createIndex({ "phoneNumber": 1 }, { unique: true })

// Performance Indexes
db.phone_numbers.createIndex({ "carrier": 1 })
db.phone_numbers.createIndex({ "category": 1 })
db.phone_numbers.createIndex({ "status": 1 })
db.phone_numbers.createIndex({ "createdAt": -1 })

// Expiry Indexes (สำคัญสำหรับแจ้งเตือน)
db.phone_numbers.createIndex({ "promotionEndDate": 1 })
db.phone_numbers.createIndex({ "simExpiryDate": 1 })

// Compound Indexes
db.phone_numbers.createIndex({ "carrier": 1, "status": 1 })
db.phone_numbers.createIndex({ "promotionEndDate": 1, "status": 1 })
db.phone_numbers.createIndex({ "simExpiryDate": 1, "status": 1 })

// Text Search Index
db.phone_numbers.createIndex({
  "phoneNumber": "text",
  "notes": "text",
  "promotion": "text"
})
```

### notification_logs Collection
```javascript
db.notification_logs.createIndex({ "phoneNumberId": 1 })
db.notification_logs.createIndex({ "notificationType": 1 })
db.notification_logs.createIndex({ "status": 1 })
db.notification_logs.createIndex({ "createdAt": -1 })
db.notification_logs.createIndex({ "sentAt": -1 })

// Compound Index
db.notification_logs.createIndex({ "phoneNumberId": 1, "createdAt": -1 })
```

### users Collection
```javascript
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "isActive": 1 })
db.users.createIndex({ "lastLogin": -1 })
```

---

## 📈 Data Relationships

### Relationship Diagram
```
users (1) ──→ (N) phone_numbers
carriers (1) ──→ (N) phone_numbers
categories (1) ──→ (N) phone_numbers
promotions (1) ──→ (N) phone_numbers
phone_numbers (1) ──→ (N) notification_logs
carriers (1) ──→ (N) promotions
```

### Aggregation Pipelines

#### 1. Dashboard Statistics
```javascript
// รวมข้อมูลตามค่าย
db.phone_numbers.aggregate([
  { $match: { status: "active" } },
  { $group: {
    _id: "$carrier",
    count: { $sum: 1 },
    expiringSoon: {
      $sum: {
        $cond: [
          { $lt: ["$promotionEndDate", new Date(Date.now() + 7*24*60*60*1000)] },
          1, 0
        ]
      }
    }
  }}
])
```

#### 2. Expiry Report
```javascript
// เบอร์ที่จะหมดอายุในช่วงเวลาที่กำหนด
db.phone_numbers.aggregate([
  { $match: {
    status: "active",
    $or: [
      { promotionEndDate: { $gte: new Date(), $lte: futureDate } },
      { simExpiryDate: { $gte: new Date(), $lte: futureDate } }
    ]
  }},
  { $sort: { promotionEndDate: 1 } }
])
```

---

## 🔐 Security & Privacy

### Data Encryption
```javascript
// Sensitive fields ที่ต้อง encrypt
const encryptedFields = [
  "telegram_settings.botToken",
  "users.passwordHash",
  "phone_numbers.notes" // หากมีข้อมูลส่วนตัว
]
```

### Access Control
```javascript
// Role-based permissions
const permissions = {
  admin: ["create", "read", "update", "delete"],
  user: ["create", "read", "update"],
  viewer: ["read"]
}
```

---

## 🚀 Performance Optimization

### 1. Query Optimization
- ใช้ Index ที่เหมาะสม
- หลีกเลี่ยง Full Collection Scan
- ใช้ Projection เพื่อดึงเฉพาะ fields ที่ต้องการ

### 2. Caching Strategy
```javascript
// Cache frequently accessed data
const cacheKeys = {
  carriers: "carriers:all",
  categories: "categories:active",
  settings: "telegram:settings"
}
```

### 3. Data Archiving
```javascript
// Archive old notification logs
const archiveOldLogs = async () => {
  const cutoffDate = new Date(Date.now() - 365*24*60*60*1000) // 1 year ago

  // Move to archive collection
  await db.notification_logs_archive.insertMany(
    await db.notification_logs.find({ createdAt: { $lt: cutoffDate } }).toArray()
  )

  // Remove from main collection
  await db.notification_logs.deleteMany({ createdAt: { $lt: cutoffDate } })
}
```

---

## 📊 Monitoring & Analytics

### 1. Database Metrics
- Collection sizes
- Index usage
- Query performance
- Connection count

### 2. Application Metrics
- API response times
- Error rates
- Notification success rates
- User activity

### 3. Business Metrics
- จำนวนเบอร์ทั้งหมด
- เบอร์ที่จะหมดอายุ
- การส่งแจ้งเตือนสำเร็จ
- ค่ายที่ได้รับความนิยม

---

## 🔄 Backup & Recovery

### 1. Backup Strategy
```bash
# Daily backup
mongodump --db phone_management --out /backup/$(date +%Y%m%d)

# Incremental backup (oplog)
mongodump --db phone_management --oplog --out /backup/incremental
```

### 2. Restore Strategy
```bash
# Full restore
mongorestore --db phone_management /backup/20241225/phone_management

# Point-in-time restore
mongorestore --db phone_management --oplogReplay /backup/incremental
```

### 3. Backup Retention
- Daily backups: เก็บ 30 วัน
- Weekly backups: เก็บ 12 สัปดาห์
- Monthly backups: เก็บ 12 เดือน
- Yearly backups: เก็บ 3 ปี

---

## 🔧 Migration Scripts

### Version Control
- ใช้ semantic versioning (v1.0.0)
- เก็บ migration scripts ใน `/migrations` folder
- ตั้งชื่อ format: `YYYYMMDD_HHMMSS_description.js`

### Example Migration
```javascript
// 20241225_120000_add_tags_to_phone_numbers.js
db.phone_numbers.updateMany(
  { tags: { $exists: false } },
  { $set: { tags: [] } }
)
```

---

## 📝 Data Validation Rules

### Phone Numbers
```javascript
const phoneNumberSchema = {
  phoneNumber: {
    type: String,
    required: true,
    match: /^0[6-9]\d-\d{3}-\d{4}$/,
    unique: true
  },
  carrier: {
    type: String,
    required: true,
    enum: ["ais", "dtac", "true"]
  }
}
```

---

## 🎯 Future Enhancements

### Phase 2 Features
1. **Multi-tenant support** - รองรับหลาย organization
2. **Advanced analytics** - Dashboard แบบ real-time
3. **API rate limiting** - ป้องกันการใช้งานเกินขีดจำกัด
4. **Audit logs** - บันทึกการเปลี่ยนแปลงทั้งหมด
5. **Data export/import** - CSV, Excel support
6. **Advanced search** - Full-text search with filters

### Phase 3 Features
1. **Machine learning** - ทำนายพฤติกรรมการใช้งาน
2. **Real-time notifications** - WebSocket support
3. **Mobile app** - iOS/Android
4. **Integration APIs** - เชื่อมต่อระบบภายนอก