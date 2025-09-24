# 🌐 Netlify Environment Variables Configuration

## 📋 Required Environment Variables

ไปที่ Netlify Dashboard → Site settings → Environment variables และเพิ่มตัวแปรเหล่านี้:

### 🔗 API Configuration
```
NUXT_PUBLIC_API_BASE=https://your-backend-api.herokuapp.com/api/v1
```
หรือ (ถ้าใช้ Railway)
```
NUXT_PUBLIC_API_BASE=https://your-backend-api.up.railway.app/api/v1
```

### 🏢 Application Settings
```
NUXT_PUBLIC_APP_NAME=Phone Number Management System
NUXT_PUBLIC_DOMAIN=yourdomain.com
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
NUXT_PUBLIC_SITE_NAME=ระบบจัดการเบอร์มือถือ
NUXT_PUBLIC_SITE_DESCRIPTION=ระบบจัดการข้อมูลเบอร์มือถือและการแจ้งเตือนผ่าน Telegram
```

### 🏗️ Build Configuration
```
NODE_VERSION=20
NPM_VERSION=10
NODE_ENV=production
```

## 📝 Netlify Site Settings

### Build Settings
- **Build command:** `npm install && npm run build`
- **Publish directory:** `.output/public`
- **Base directory:** `frontend`

### Deploy Settings
- **Branch to deploy:** `main`
- **Auto-publishing:** Enabled

## 🎯 Backend Options

### Option 1: Heroku (Recommended)
```bash
# Deploy backend to Heroku
heroku create your-app-backend
git subtree push --prefix=backend heroku main
```

### Option 2: Railway
```bash
# Deploy backend to Railway
railway login
railway new
railway deploy
```

### Option 3: Vercel (Serverless)
```bash
# Deploy backend to Vercel
vercel --prod
```

## 🔧 Netlify Deployment Steps

### 1. Connect Repository
1. ไปที่ https://app.netlify.com/
2. คลิก "New site from Git"
3. เชื่อมต่อ GitHub repository
4. เลือก repository ของคุณ

### 2. Configure Build Settings
```
Build command: npm install && npm run build
Publish directory: .output/public
Base directory: frontend
```

### 3. Set Environment Variables
ไปที่ Site settings → Environment variables และเพิ่ม:

| Key | Value | Description |
|-----|-------|-------------|
| `NUXT_PUBLIC_API_BASE` | `https://your-backend.herokuapp.com/api/v1` | Backend API URL |
| `NUXT_PUBLIC_APP_NAME` | `Phone Number Management System` | App name |
| `NUXT_PUBLIC_DOMAIN` | `yourdomain.com` | Your domain |
| `NUXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Site URL |
| `NODE_VERSION` | `20` | Node.js version |
| `NPM_VERSION` | `10` | NPM version |

### 4. Custom Domain (Optional)
1. ไปที่ Site settings → Domain management
2. คลิก "Add custom domain"
3. ใส่ domain ของคุณ
4. ตั้งค่า DNS records:
   ```
   CNAME    www    your-site.netlify.app
   A        @      104.198.14.52
   ```

### 5. SSL Certificate
- Netlify จะสร้าง SSL certificate ให้อัตโนมัติ
- รอประมาณ 24 ชั่วโมงสำหรับ DNS propagation

## 🚀 Quick Deploy Commands

### First Time Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy to production
netlify deploy --prod
```

### Update Deployment
```bash
# Deploy latest changes
git push origin main
# Netlify จะ build และ deploy อัตโนมัติ
```

## 🔍 Troubleshooting

### Build Fails
1. ตรวจสอบ Node.js version ใน Environment variables
2. ตรวจสอบ dependencies ใน package.json
3. ดู build logs ใน Netlify dashboard

### API Connection Issues
1. ตรวจสอบ `NUXT_PUBLIC_API_BASE` URL
2. ตรวจสอบ CORS settings ใน backend
3. ตรวจสอบ backend deployment status

### Custom Domain Issues
1. ตรวจสอบ DNS records
2. รอ DNS propagation (24 ชั่วโมง)
3. ตรวจสอบ SSL certificate status

## 📱 Mobile Optimization

Netlify จะทำการ optimize เว็บไซต์ให้อัตโนมัติ:
- Image compression
- Asset minification
- CDN distribution
- Progressive Web App features

## 📊 Analytics

เปิดใช้งาน Netlify Analytics:
1. ไปที่ Site overview
2. คลิก "Enable Analytics"
3. ดู traffic และ performance metrics