# 🔧 การแก้ไข Environment Variables ใน Netlify

## ปัญหา
```
🔧 Supabase URL:
🔧 Supabase Key: Key loaded ✅
⚠️ Supabase credentials not found
```

## วิธีแก้ไข

### 1. ไปที่ Netlify Dashboard
- เปิด https://app.netlify.com/
- เลือกไซต์ **check-me-alert**
- ไปที่ **Site settings** → **Environment variables**

### 2. ลบตัวแปรเก่าทั้งหมด
- ลบ `NUXT_PUBLIC_SUPABASE_URL` (หากมี)
- ลบ `NUXT_PUBLIC_SUPABASE_ANON_KEY` (หากมี)
- ลบตัวแปรอื่นๆ ที่เกี่ยวข้อง

### 3. เพิ่มตัวแปรใหม่ที่ถูกต้อง
```
SUPABASE_URL=https://shglsckgjpfjqbvythzz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ2xzY2tnanBmanFidnl0aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODQ4NzcsImV4cCI6MjA3NDM2MDg3N30.lRh2BCMvL68KCmNp4ZvXutIWFtGsYpLv8rcjlEhDWsQ
```

### 4. Trigger New Deployment
- ไปที่ **Deploys** tab
- คลิก **Trigger deploy** → **Deploy site**

### 5. ตรวจสอบผลลัพธ์
หลัง deploy เสร็จ ควรเห็น:
```
🔧 Supabase URL: https://shglsckgjpfjqbvythzz.supabase.co
🔧 Supabase Key: Key loaded ✅
✅ Supabase client initialized successfully
```

## หมายเหตุ
- Environment variables ต้องไม่มี prefix `NUXT_PUBLIC_`
- ใช้ชื่อตัวแปรตรงตาม `nuxt.config.ts`
- หลังเซ็ตเสร็จต้อง deploy ใหม่