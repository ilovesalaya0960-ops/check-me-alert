# 🗄️ Supabase Integration Guide

## เปลี่ยนจาก localStorage เป็น Supabase Database

ระบบ Phone Management ถูกอัปเกรดให้ใช้ **Supabase** เป็น cloud database แทน localStorage

### ✨ **ข้อดีใหม่:**
- ✅ **Sync ข้อมูลระหว่างอุปกรณ์** - ใช้ได้ทุกที่ทุกเครื่อง
- ✅ **Real-time Updates** - ข้อมูลอัปเดตทันที
- ✅ **Backup อัตโนมัติ** - ข้อมูลปลอดภัยบน cloud
- ✅ **Multi-user Support** - พร้อมสำหรับทีมงาน
- ✅ **Advanced Queries** - ค้นหาและกรองข้อมูลได้ดีกว่า

---

## 🚀 **ขั้นตอนการตั้งค่า Supabase**

### 1. สร้างโปรเจกต์ Supabase

1. ไปที่ **https://supabase.com**
2. สมัครสมาชิกด้วย GitHub account
3. คลิก **"New Project"**
4. ตั้งชื่อโปรเจกต์: `phone-management`
5. เลือก region: Singapore (ใกล้ที่สุด)
6. ตั้ง database password (จำไว้ด้วย!)
7. รอ 2-3 นาทีให้โปรเจกต์ถูกสร้าง

### 2. รัน SQL สำหรับสร้าง Database Tables

1. ใน Supabase Dashboard → **SQL Editor**
2. คัดลอกโค้ด SQL จากไฟล์ \`SUPABASE_SETUP.sql\`
3. วาง (paste) ในช่อง SQL Editor
4. คลิก **"RUN"**
5. ตรวจสอบใน **Table Editor** ว่าตาราง \`phone_numbers\` ถูกสร้างแล้ว

### 3. ได้ข้อมูล API Keys

1. ไปที่ **Settings** → **API**
2. คัดลอกข้อมูลเหล่านี้:
   - **Project URL**: \`https://xxxxx.supabase.co\`
   - **anon public key**: \`eyJhbGci...\` (ยาวมาก)

### 4. ตั้งค่า Environment Variables

#### สำหรับ Local Development:

สร้างไฟล์ \`.env.local\` ในโฟลเดอร์ \`frontend/\`:

\`\`\`bash
# frontend/.env.local
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

#### สำหรับ Netlify Production:

1. ไปที่ **Netlify Dashboard**
2. เลือก site ของคุณ
3. **Site settings** → **Environment variables**
4. **Add new variable** สำหรับแต่ละตัว:

| Variable Name | Value |
|---------------|-------|
| \`SUPABASE_URL\` | \`https://xxxxx.supabase.co\` |
| \`SUPABASE_ANON_KEY\` | \`eyJhbGciOiJIUzI1NiIs...\` |

---

## 🔧 **ทดสอบการทำงาน**

### Local Development:

\`\`\`bash
cd frontend
npm run dev
\`\`\`

เปิด **http://localhost:3000** และทดสอบ:
- ➕ เพิ่มเบอร์ใหม่
- ✏️ แก้ไขเบอร์
- 🗑️ ลบเบอร์
- 🔍 ค้นหาเบอร์

### Production Deploy:

\`\`\`bash
git add .
git commit -m "Add Supabase integration"
git push origin main
\`\`\`

Netlify จะ build และ deploy อัตโนมัติ

---

## 📊 **โครงสร้าง Database**

### ตาราง: \`phone_numbers\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary Key (สร้างอัตโนมัติ) |
| \`phone_number\` | VARCHAR(15) | เบอร์โทรศัพท์ |
| \`carrier\` | VARCHAR(10) | ค่ายเครือข่าย (AIS, DTAC, TRUE, NT) |
| \`usage_category\` | VARCHAR(50) | หมวดหมู่ใช้งาน |
| \`package_name\` | VARCHAR(100) | ชื่อแพ็กเกจ/โปร |
| \`monthly_cost\` | DECIMAL(10,2) | ค่าใช้จ่ายต่อเดือน |
| \`package_start_date\` | DATE | วันที่สมัครโปร |
| \`package_expiry_date\` | DATE | วันที่โปรหมดอายุ (คำนวณอัตโนมัติ) |
| \`sim_expiry_date\` | DATE | วันที่ซิมหมดอายุ |
| \`status\` | VARCHAR(20) | สถานะ (active, inactive, expired) |
| \`notes\` | TEXT | หมายเหตุ |
| \`created_at\` | TIMESTAMP | วันเวลาที่สร้าง (อัตโนมัติ) |
| \`updated_at\` | TIMESTAMP | วันเวลาที่แก้ไขล่าสุด (อัตโนมัติ) |

---

## 🔄 **การอพยพข้อมูลจาก localStorage**

### ถ้าคุณมีข้อมูลเก่าใน localStorage:

1. **Export ข้อมูลเก่า** ก่อนที่จะสวิตช์ไป Supabase:
   - ไปหน้า **จัดการเบอร์**
   - คลิก **"💾 Export"**
   - ดาวน์โหลดไฟล์ JSON

2. **หลังจากตั้งค่า Supabase เสร็จ**:
   - คลิก **"📁 Import"**
   - เลือกไฟล์ JSON ที่ export ไว้
   - ข้อมูลจะถูกนำเข้าสู่ database

---

## 🛠️ **การจัดการข้อมูลใน Supabase Dashboard**

### Table Editor:
- ดูข้อมูลทั้งหมดแบบ spreadsheet
- แก้ไขข้อมูลโดยตรง
- เพิ่ม/ลบแถวได้

### SQL Editor:
- รันคำสั่ง SQL เพื่อวิเคราะห์ข้อมูล
- สร้าง reports ขั้นสูง
- Backup/Restore database

### Authentication (ถ้าต้องการในอนาคต):
- เพิ่มระบบ login/register
- จำกัดการเข้าถึงข้อมูล
- สร้าง user roles

---

## 🚨 **Troubleshooting**

### ปัญหา: ไม่สามารถเชื่อมต่อ Supabase
**แก้ไข:**
- ตรวจสอบ SUPABASE_URL และ SUPABASE_ANON_KEY ใน environment variables
- ทดสอบ API keys ใน Supabase Dashboard
- ตรวจสอบ Row Level Security policies

### ปัญหา: Build ล้มเหลวใน Netlify
**แก้ไข:**
- ตรวจสอบว่าตั้ง environment variables ใน Netlify แล้ว
- ทดสอบ build locally ด้วย \`npm run generate\`
- ดู build logs ใน Netlify

### ปัญหา: ข้อมูลไม่แสดงบนหน้าเว็บ
**แก้ไข:**
- เปิด Browser DevTools (F12) → Console
- ดูว่ามี error messages หรือไม่
- ตรวจสอบ Network tab ว่า API calls สำเร็จหรือไม่

---

## 🎉 **เสร็จสิ้น!**

ตอนนี้ระบบ Phone Management ของคุณ:

- 🌐 **ใช้งานได้จากทุกอุปกรณ์** ที่เข้า internet
- 💾 **ข้อมูลปลอดภัยบน cloud** ไม่หายถ้าเครื่องเสีย
- ⚡ **ประสิทธิภาพสูง** ด้วย Supabase's edge network
- 🔮 **พร้อมขยายในอนาคต** เพิ่มฟีเจอร์ authentication, multi-user

**Happy Managing! 📱✨**