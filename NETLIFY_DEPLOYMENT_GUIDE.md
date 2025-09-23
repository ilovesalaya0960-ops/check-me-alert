# 🌐 Netlify Deployment Guide - Phone Number Management System

## 📋 Overview

คู่มือนี้จะแนะนำการ deploy ระบบจัดการเบอร์มือถือไปยัง Netlify สำหรับ Frontend และ Cloud platforms สำหรับ Backend

## 🎯 Architecture

```
Frontend (Nuxt.js)     →  Netlify
Backend (Go)           →  Heroku/Railway/Vercel
Database (MongoDB)     →  MongoDB Atlas
```

## 🚀 Step 1: เตรียม Repository

### 1.1 Push Code to GitHub

```bash
# Initialize git (ถ้ายังไม่ได้ทำ)
git init
git add .
git commit -m "Initial commit: Phone Management System"

# Create GitHub repository และ push
git branch -M main
git remote add origin https://github.com/yourusername/phone-management.git
git push -u origin main
```

## 📱 Step 2: Deploy Frontend ไปยัง Netlify

### 2.1 Connect Repository

1. ไปที่ https://app.netlify.com/
2. คลิก **"New site from Git"**
3. เลือก **GitHub** และให้สิทธิ์เข้าถึง
4. เลือก repository `phone-management`

### 2.2 Configure Build Settings

**Build Settings:**
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/.output/public
```

**Advanced Build Settings:**
```
Node version: 18
```

### 2.3 Environment Variables

ไปที่ **Site settings** → **Environment variables** และเพิ่ม:

| Variable | Value | Description |
|----------|-------|-------------|
| `NUXT_PUBLIC_API_BASE` | `https://your-backend.herokuapp.com/api/v1` | Backend API URL |
| `NUXT_PUBLIC_APP_NAME` | `Phone Number Management System` | App name |
| `NUXT_PUBLIC_DOMAIN` | `yourdomain.com` | Your domain |
| `NUXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Site URL |
| `NODE_VERSION` | `18` | Node.js version |

### 2.4 Deploy

คลิก **"Deploy site"** - Netlify จะ build และ deploy อัตโนมัติ

---

## ⚙️ Step 3: Deploy Backend

### Option A: Heroku (แนะนำ)

#### 3.1 Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 3.2 Create Heroku App
```bash
# Login to Heroku
heroku login

# Create app (in backend directory)
cd backend
heroku create your-app-backend

# Set buildpack for Go
heroku buildpacks:set heroku/go
```

#### 3.3 Set Environment Variables
```bash
# Database
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/phone_management"
heroku config:set DB_NAME="phone_management"

# Telegram
heroku config:set TELEGRAM_BOT_TOKEN="your_bot_token"
heroku config:set TELEGRAM_CHAT_ID="your_chat_id"

# CORS (for Netlify frontend)
heroku config:set ALLOWED_ORIGINS="https://your-netlify-site.netlify.app,https://yourdomain.com"

# Other settings
heroku config:set GO_ENV="production"
```

#### 3.4 Deploy Backend
```bash
# Deploy backend only
git subtree push --prefix=backend heroku main

# Or if you have separate backend repo
git push heroku main
```

### Option B: Railway

#### 3.1 Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 3.2 Deploy to Railway
```bash
cd backend
railway new
railway up
```

### Option C: Render

1. ไปที่ https://render.com/
2. Connect GitHub repository
3. เลือก "Web Service"
4. Configure:
   - **Build Command:** `go build -o main .`
   - **Start Command:** `./main`
   - **Environment:** Go

---

## 🗄️ Step 4: Setup MongoDB Atlas

### 4.1 Create Cluster

1. ไปที่ https://cloud.mongodb.com/
2. สร้าง Free Cluster
3. เลือก region ใกล้เคียง
4. สร้าง database user
5. Add IP address (0.0.0.0/0 สำหรับการพัฒนา)

### 4.2 Get Connection String

1. คลิก **"Connect"** → **"Connect your application"**
2. Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/phone_management
   ```

---

## 🔗 Step 5: Update API URL

### 5.1 Update Netlify Environment Variables

1. ไปยัง Netlify Dashboard
2. Site settings → Environment variables
3. Update `NUXT_PUBLIC_API_BASE` เป็น URL ของ backend ที่ deploy แล้ว:
   ```
   https://your-backend.herokuapp.com/api/v1
   ```

### 5.2 Redeploy

1. ไปที่ Deploys tab
2. คลิก **"Trigger deploy"** → **"Deploy site"**

---

## 🌍 Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain to Netlify

1. Site settings → Domain management
2. Add custom domain: `yourdomain.com`
3. Configure DNS records:

```
Type    Name    Value
CNAME   www     your-site.netlify.app
A       @       75.2.60.5
```

### 6.2 SSL Certificate

Netlify จะสร้าง SSL certificate อัตโนมัติภายใน 24 ชั่วโมง

---

## ✅ Step 7: Verification & Testing

### 7.1 Test Frontend

1. เปิด https://your-site.netlify.app
2. ตรวจสอบการโหลดหน้าเว็บ
3. ทดสอบการเชื่อมต่อกับ API

### 7.2 Test Backend

1. เปิด https://your-backend.herokuapp.com
2. ควรเห็นข้อความ: `"Phone Number Management API is running!"`

### 7.3 Test Full System

1. เพิ่มเบอร์มือถือใหม่
2. ตั้งค่า Telegram Bot
3. ทดสอบการแจ้งเตือน

---

## 🔧 Maintenance & Updates

### Update Frontend

```bash
# Make changes to frontend
git add .
git commit -m "Update frontend"
git push origin main
# Netlify จะ auto-deploy
```

### Update Backend

```bash
# Make changes to backend
git add .
git commit -m "Update backend"

# For Heroku
git subtree push --prefix=backend heroku main

# For Railway
cd backend && railway up
```

---

## 🚨 Troubleshooting

### Frontend Issues

**Build Failures:**
- ตรวจสอบ Node.js version ใน Environment variables
- ตรวจสอบ dependencies ใน package.json
- ดู build logs ใน Netlify

**API Connection Issues:**
- ตรวจสอบ `NUXT_PUBLIC_API_BASE` URL
- ตรวจสอบ CORS settings ใน backend
- ตรวจสอบ network requests ใน browser dev tools

### Backend Issues

**Deployment Failures:**
- ตรวจสอบ buildpack (Go)
- ตรวจสอบ environment variables
- ดู application logs

**Database Connection:**
- ตรวจสอบ MongoDB Atlas IP whitelist
- ตรวจสอบ connection string
- ตรวจสอบ database credentials

---

## 📊 Monitoring

### Netlify Analytics
- Site overview → Enable Analytics
- Monitor traffic, performance, และ errors

### Backend Monitoring
- **Heroku:** Heroku Dashboard → Metrics
- **Railway:** Railway Dashboard → Observability
- **Render:** Render Dashboard → Events

### Database Monitoring
- MongoDB Atlas → Monitoring
- ติดตามการใช้งาน storage และ connections

---

## 🔐 Security Checklist

- ✅ HTTPS enabled (Netlify SSL)
- ✅ Environment variables secured
- ✅ Database authentication configured
- ✅ CORS properly set
- ✅ No sensitive data in repository
- ✅ API rate limiting (ถ้ามี)

---

## 🎉 You're Live!

เมื่อทำตามขั้นตอนทั้งหมดแล้ว ระบบของคุณจะ online:

- **Frontend:** https://your-site.netlify.app
- **Backend API:** https://your-backend.herokuapp.com
- **Custom Domain:** https://yourdomain.com (ถ้าตั้งค่า)

**Features ที่ใช้งานได้:**
- 📱 จัดการเบอร์มือถือ
- 🤖 Telegram แจ้งเตือนอัตโนมัติ (ทุกวัน 00:10)
- 🔍 ค้นหาและกรองข้อมูล
- 📊 รายงานเบอร์ที่หมดอายุ

---

## 💡 Next Steps

1. **Security Enhancement:** เพิ่ม authentication/authorization
2. **Performance:** ติดตั้ง caching และ CDN
3. **Monitoring:** เพิ่ม error tracking (Sentry)
4. **Backup:** ตั้งค่า automated database backup
5. **CI/CD:** สร้าง automated testing pipeline