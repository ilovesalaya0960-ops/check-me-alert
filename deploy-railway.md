# 🚀 Deploy ระบบบน Railway.app (Free)

## ขั้นตอนการ Deploy แบบ Step-by-Step

### 1. Setup MongoDB Atlas (Free)
1. สมัคร [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. สร้าง Cluster ใหม่ (เลือก Free M0)
3. สร้าง Database User
4. เก็บ Connection String: `mongodb+srv://username:password@cluster.mongodb.net/phone_management`

### 2. Deploy Backend บน Railway
1. สมัคร [Railway.app](https://railway.app)
2. เชื่อม GitHub account
3. Push โค้ดขึ้น GitHub repository
4. ใน Railway: New Project → Deploy from GitHub repo
5. เลือก backend folder
6. ตั้งค่า :Environment Variables
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phone_management?retryWrites=true&w=majority
   DB_NAME=phone_management
   PORT=8080
   ```
  

### 3. Deploy Frontend บน Vercel
1. สมัคร [Vercel.com](https://vercel.com)
2. เชื่อม GitHub account
3. Import project → เลือก frontend folder
4. ตั้งค่า Environment Variables:
   ```
   API_BASE_URL=https://your-backend.railway.app/api/v1
   ```

### 4. ตั้งค่า Domain
- **Backend**: https://your-project-name.railway.app
- **Frontend**: https://your-project-name.vercel.app

### 5. Initialize Database
```bash
# รัน scripts ผ่าน MongoDB Compass หรือ Atlas UI
# หรือใช้ MongoDB Shell online
```

## ⚙️ Production Configuration

### Backend Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phone_management?retryWrites=true&w=majority
DB_NAME=phone_management
PORT=8080
TELEGRAM_BOT_TOKEN=your_bot_token
ENVIRONMENT=production
```

### Frontend Environment Variables
```env
API_BASE_URL=https://your-backend.railway.app/api/v1
```

## 📱 Alternative: Deploy ทั้งหมดบน Railway

### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "./main",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Dockerfile สำหรับ Full-stack
```dockerfile
# Multi-stage build
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM golang:1.21-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=backend-builder /app/backend/main .
COPY --from=frontend-builder /app/frontend/.output/public ./public
EXPOSE 8080
CMD ["./main"]
```

## 🔧 Commands สำหรับ Deploy

```bash
# 1. Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy บน Railway
railway login
railway link
railway up

# 3. Set environment variables
railway variables set MONGODB_URI="your_connection_string"
railway variables set DB_NAME="phone_management"
```

## 📊 Resource Limits (Free Tier)

### Railway
- **RAM**: 512MB
- **CPU**: Shared
- **Bandwidth**: Unlimited
- **Build Time**: 500 hours/month
- **Sleep**: หลัง 30 นาทีไม่มีใครใช้

### MongoDB Atlas
- **Storage**: 512MB
- **Connections**: 500
- **RAM**: Shared cluster

### Vercel
- **Bandwidth**: 100GB/month
- **Function Execution**: 100GB-Hrs
- **Build Minutes**: 6000/month

## 🎯 URL ตัวอย่างหลัง Deploy สำเร็จ

- **Frontend**: https://phone-management-frontend.vercel.app
- **Backend API**: https://phone-management-backend.railway.app
- **Health Check**: https://phone-management-backend.railway.app/api/v1/health