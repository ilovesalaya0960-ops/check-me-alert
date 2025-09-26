# 🔧 Netlify + Supabase Configuration

## ❗ URGENT: ปัญหาที่พบ

เว็บไซต์ production ยังดึงข้อมูลไม่ได้ เพราะ **ยังไม่ได้ตั้งค่า Supabase environment variables ใน Netlify!**

## 🛠️ แก้ไขด่วน

### 1. ไปที่ Netlify Dashboard
1. เข้า https://app.netlify.com/
2. เลือก site: **check-me-alert**
3. ไปที่ **Site settings** → **Environment variables**

### 2. เพิ่ม Environment Variables

ลบ variables เก่าและเพิ่มใหม่:

```
SUPABASE_URL=https://shglsckgjpfjqbvythzz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ2xzY2tnanBmanFidnl0aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4Mzk3NjQsImV4cCI6MjA0MjQxNTc2NH0.pEHlQDl7yTbF-GktJ0uEe2vP8Jpp2LxV6PO1U7SFLps
```

### 3. Update Build Settings

**Build command:** `npm install && npm run generate`
**Publish directory:** `.output/public`
**Base directory:** `frontend`

### 4. Trigger Rebuild

1. ไปที่ **Deploys** tab
2. คลิก **Trigger deploy** → **Deploy site**
3. รอ build เสร็จ (2-3 นาที)

## 🔍 ตรวจสอบการทำงาน

หลังจาก deploy เสร็จ ให้ทดสอบ:

1. **หน้าหลัก**: https://check-me-alert.netlify.app/
2. **หน้า reports**: https://check-me-alert.netlify.app/reports/
3. **จัดการเบอร์**: https://check-me-alert.netlify.app/phones/

## 🚨 Debug ถ้ายังไม่ได้

1. **เปิด Browser Console** (F12)
2. ดู error messages
3. ตรวจสอบ Network tab ว่า Supabase API calls สำเร็จหรือไม่
4. ดู Build logs ใน Netlify

## ✅ เมื่อใช้งานได้แล้ว

ระบบจะ:
- แสดงข้อมูลเบอร์จาก Supabase database
- Reports page แสดงสถิติถูกต้อง
- เพิ่ม/แก้ไข/ลบเบอร์ได้ปกติ
- Sync ข้อมูลแบบ real-time

**🎯 ทำตามขั้นตอนนี้แล้วจะใช้งานได้ทันที!**