# 📁 โครงสร้างโปรเจค - ระบบจัดการเบอร์โทรศัพท์

## 🗂️ **ไฟล์หลักของโปรเจค**

### **📄 Documentation**
- `FINAL_SETUP_GUIDE.md` - คู่มือการติดตั้งและใช้งานสำคัญ
- `NETLIFY_DEPLOYMENT_GUIDE.md` - คู่มือการ deploy ไปยัง Netlify
- `NETLIFY_ENV_VARIABLES.md` - คู่มือการตั้งค่า environment variables
- `README.md` - ข้อมูลโปรเจคทั่วไป
- `PROJECT_STRUCTURE.md` - ไฟล์นี้ (โครงสร้างโปรเจค)

### **🗄️ Database Scripts**
- `SUPABASE_FIX_SCHEMA.sql` - สร้างฐานข้อมูลและตารางหลัก
- `UPDATE_PHONE_NUMBER_LENGTH.sql` - อัปเดตความยาวของ phone_number field

### **💻 Frontend Code**
```
frontend/
├── 📱 **Pages (หน้าเว็บ)**
│   ├── index.vue          # หน้าหลัก
│   ├── phones.vue         # หน้าจัดการเบอร์โทรศัพท์
│   ├── reports.vue        # หน้ารายงานและสถิติ
│   └── settings.vue       # หน้าตั้งค่า
├── 🔧 **Composables (Logic)**
│   └── usePhones.js       # ฟังก์ชัน CRUD สำหรับเบอร์โทรศัพท์
├── 🔌 **Plugins**
│   └── supabase.client.js # การเชื่อมต่อ Supabase
├── ⚙️ **Configuration**
│   ├── nuxt.config.ts     # การตั้งค่า Nuxt.js
│   ├── package.json       # Dependencies
│   ├── .env.local         # Environment variables (local)
│   └── app.vue            # Root component
```

### **🔧 Configuration Files**
- `frontend/.env.local` - ตัวแปรสำหรับการพัฒนา (Supabase credentials)
- `frontend/nuxt.config.ts` - การตั้งค่า Nuxt.js
- `frontend/package.json` - Dependencies และ scripts

## 🎯 **ไฟล์ที่สำคัญที่สุด**

### **1. 🔥 Frontend Logic**
- `frontend/composables/usePhones.js` - **หัวใจหลัก** ของระบบ CRUD
- `frontend/plugins/supabase.client.js` - การเชื่อมต่อฐานข้อมูล

### **2. 🖼️ User Interface**
- `frontend/pages/phones.vue` - หน้าจัดการเบอร์ (เพิ่ม/แก้ไข/ลบ)
- `frontend/pages/reports.vue` - หน้ารายงานและสถิติ

### **3. 🗄️ Database**
- `SUPABASE_FIX_SCHEMA.sql` - สร้างฐานข้อมูล
- `UPDATE_PHONE_NUMBER_LENGTH.sql` - แก้ไขปัญหาความยาวเบอร์โทร

### **4. 📖 Documentation**
- `FINAL_SETUP_GUIDE.md` - **คู่มือใช้งานหลัก**

## 🚫 **ไฟล์ที่ไม่ต้องสนใจ**

### **Build Artifacts (สร้างอัตโนมัติ)**
- `frontend/.nuxt/` - ไฟล์ build ของ Nuxt.js
- `frontend/.output/` - ไฟล์ output สำหรับ production
- `frontend/node_modules/` - Dependencies ที่ติดตั้ง

### **Git และ IDE**
- `.git/` - Git repository data
- `.claude/` - Claude Code settings

## 🔍 **ข้อมูลเพิ่มเติม**

### **Technology Stack**
- **Frontend:** Nuxt.js 3 + Vue 3
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Netlify
- **Styling:** Custom CSS

### **Key Features**
- ✅ เพิ่ม/แก้ไข/ลบเบอร์โทรศัพท์
- ✅ รายงานและสถิติ
- ✅ ระบบค้นหาและกรองข้อมูล
- ✅ Export ข้อมูล (JSON, CSV)
- ✅ Responsive design
- ✅ Real-time data sync with Supabase

### **Database Schema**
```sql
phone_numbers (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20),     -- เบอร์โทรศัพท์
  carrier VARCHAR(10),          -- ค่ายเครือข่าย
  category VARCHAR(50),         -- หมวดหมู่ใช้งาน
  promotion VARCHAR(100),       -- โปรโมชั่น
  promotion_start_date DATE,    -- วันเริ่มโปร
  promotion_end_date DATE,      -- วันหมดอายุโปร
  sim_expiry_date DATE,         -- วันหมดอายุซิม
  notes TEXT,                   -- หมายเหตุ
  status VARCHAR(20),           -- สถานะ
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```