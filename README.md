# ระบบบันทึกข้อมูลเบอร์มือถือ

ระบบจัดการข้อมูลเบอร์มือถือพร้อมฟีเจอร์ตรวจสอบวันหมดอายุ

## ฟีเจอร์หลัก

- **บันทึกข้อมูลเบอร์มือถือ** - เบอร์, ค่าย (AIS/DTAC/TRUE), หมวดหมู่การใช้งาน
- **จัดการโปรโมชั่น** - ชื่อโปร, วันสมัคร, วันหมดอายุ
- **ตรวจสอบวันหมดอายุ** - ทั้งโปรโมชั่นและซิม
- **ค้นหาและกรองข้อมูล** - ตามค่าย, หมวดหมู่, วันหมดอายุ
- **แก้ไขข้อมูล** - แก้ไขข้อมูลเบอร์ที่มีอยู่
- **สถิติ** - สรุปตามค่าย

## โครงสร้างข้อมูล

### ข้อมูลเบอร์มือถือ
- เบอร์มือถือ
- ค่าย (ais, dtac, true)
- หมวดหมู่การใช้งาน (ส่วนตัว, งาน, ธุรกิจ, ฯลฯ)
- โปรโมชั่นที่สมัคร
- วันสมัครโปร
- วันโปรหมดอายุ
- วันหมดอายุซิม
- หมายเหตุ

## เทคโนโลยีที่ใช้

### Backend
- **Golang** - ภาษาโปรแกรม
- **Fiber Framework** - Web framework
- **MongoDB** - ฐานข้อมูล

### Frontend
- **Nuxt.js** - Vue.js framework
- **Tailwind CSS** - CSS framework
- **Heroicons** - ไอคอน

### Infrastructure
- **Docker & Docker Compose** - สำหรับ deployment

## วิธีการรันโปรแกรม

### 1. ใช้ Docker Compose (แนะนำ)

```bash
# Clone โปรเจค
git clone <repository-url>
cd "number check"

# รันระบบทั้งหมด
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps
```

**URL สำหรับเข้าใช้งาน:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

### 2. รันแยกส่วน (Development)

#### Backend
```bash
cd backend
go mod tidy
go run main.go
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### MongoDB
```bash
# ใช้ Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

## API Endpoints

### Phone Numbers
- `GET /api/v1/phone-numbers` - ดูรายการเบอร์ทั้งหมด
- `POST /api/v1/phone-numbers` - เพิ่มเบอร์ใหม่
- `GET /api/v1/phone-numbers/:id` - ดูข้อมูลเบอร์
- `PUT /api/v1/phone-numbers/:id` - แก้ไขข้อมูลเบอร์
- `DELETE /api/v1/phone-numbers/:id` - ลบเบอร์
- `GET /api/v1/phone-numbers/search?q=query` - ค้นหาเบอร์
- `GET /api/v1/phone-numbers/expiring?type=promotion&days=30` - เบอร์ที่ใกล้หมดอายุ
- `GET /api/v1/phone-numbers/carriers` - สถิติแยกตามค่าย

### ตัวอย่าง Request Body

#### เพิ่มเบอร์ใหม่
```json
{
  "phoneNumber": "081-234-5678",
  "carrier": "ais",
  "category": "ส่วนตัว",
  "promotion": "เน็ตไม่อั้น 30GB",
  "promotionStartDate": "2024-01-01T00:00:00Z",
  "promotionEndDate": "2024-12-31T00:00:00Z",
  "simExpiryDate": "2025-12-31T00:00:00Z",
  "notes": "เบอร์หลัก"
}
```

## ฟีเจอร์การกรองและค้นหา

### 1. ค้นหาทั่วไป
- ค้นหาตามเบอร์มือถือ
- ค้นหาตามค่าย
- ค้นหาตามหมวดหมู่
- ค้นหาตามชื่อโปรโมชั่น

### 2. กรองตามวันหมดอายุ
- เบอร์ที่หมดอายุแล้ว
- เบอร์ที่จะหมดอายุใน 7, 15, 30, 60, 90 วัน
- แยกการกรองระหว่างโปรโมชั่นและซิม

### 3. กรองตามค่าย
- AIS
- DTAC
- TRUE

## การแสดงผลสถานะ

### สีสถานะวันหมดอายุ
- 🔴 **แดง**: หมดอายุแล้ว
- 🟠 **ส้ม**: ใกล้หมดอายุ (≤ 7 วัน)
- 🟡 **เหลือง**: เตือน (≤ 30 วัน)
- 🟢 **เขียว**: ปกติ (> 30 วัน)

### สีค่าย
- 🟢 **AIS**: เขียว
- 🔵 **DTAC**: น้ำเงิน
- 🔴 **TRUE**: แดง

## Environment Variables

### Backend
```env
MONGODB_URI=mongodb://admin:password123@mongodb:27017/phone_management?authSource=admin
DB_NAME=phone_management
```

### Frontend
```env
API_BASE_URL=http://localhost:8080/api/v1
```

## การ Backup และ Restore

### Backup
```bash
docker exec phone_management_mongodb mongodump --db phone_management --out /backup
docker cp phone_management_mongodb:/backup ./backup
```

### Restore
```bash
docker cp ./backup phone_management_mongodb:/backup
docker exec phone_management_mongodb mongorestore --db phone_management /backup/phone_management
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Backend ไม่สามารถเชื่อมต่อ MongoDB**
   - ตรวจสอบว่า MongoDB รันอยู่
   - ตรวจสอบ connection string

2. **Frontend ไม่สามารถเชื่อมต่อ Backend**
   - ตรวจสอบ API_BASE_URL
   - ตรวจสอบว่า Backend รันอยู่

3. **ข้อมูลไม่แสดง**
   - ตรวจสอบ Network logs ใน Browser
   - ตรวจสอบ Backend logs

### การดู Logs
```bash
# Backend logs
docker logs phone_management_backend

# Frontend logs
docker logs phone_management_frontend

# MongoDB logs
docker logs phone_management_mongodb
```

## การพัฒนาต่อ

### เพิ่มฟีเจอร์ใหม่
1. การแจ้งเตือนทาง Email/LINE
2. Export ข้อมูลเป็น Excel
3. Dashboard แสดงกราฟ
4. ระบบ User authentication
5. API สำหรับ Mobile App

### การปรับปรุง
1. เพิ่ม Validation ข้อมูล
2. เพิ่ม Unit Tests
3. เพิ่ม Error Handling
4. ปรับปรุง UI/UX

## License

MIT License