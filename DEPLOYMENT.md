# 🚀 Phone Number Management System - Production Deployment Guide

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended
- **Network**: Public IP address with open ports 80, 443

### Required Software
- Docker 20.10+
- Docker Compose v2.0+
- Git
- Nginx (if not using Docker)

## 🛠️ Quick Start Deployment

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
```

### 2. Clone Repository

```bash
git clone <your-repository-url>
cd phone-number-management
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.production.template .env.production

# Edit environment variables
nano .env.production
```

**Required Environment Variables:**
```bash
# Replace with your actual domain
DOMAIN=yourdomain.com

# Generate secure passwords
MONGO_ROOT_PASSWORD=your_super_secure_mongodb_password
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyZ
TELEGRAM_CHAT_ID=-1001234567890

# SSL Email for Let's Encrypt
SSL_EMAIL=admin@yourdomain.com
```

### 4. DNS Configuration

Point your domain to your server's IP address:

```
A     yourdomain.com        → YOUR_SERVER_IP
A     www.yourdomain.com    → YOUR_SERVER_IP
A     api.yourdomain.com    → YOUR_SERVER_IP
```

### 5. SSL Certificate Setup

```bash
# For production with real domain
sudo ./setup-ssl.sh yourdomain.com admin@yourdomain.com

# For development (self-signed)
sudo ./setup-ssl.sh yourdomain.com
```

### 6. Deploy Application

```bash
# Deploy with your domain
./deploy.sh yourdomain.com production
```

## 🔧 Manual Deployment Steps

### 1. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d
```

### 2. Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Health checks
curl -f http://localhost:8080/     # Backend
curl -f http://localhost:3000/     # Frontend
```

## 🌐 Domain Structure

After successful deployment:

- **Main Site**: `https://yourdomain.com`
- **API**: `https://api.yourdomain.com`
- **Admin Panel**: `https://yourdomain.com/admin` (if implemented)

## 📊 Monitoring & Maintenance

### Check Service Status

```bash
# View running containers
docker ps

# Check resource usage
docker stats

# View logs
docker-compose -f docker-compose.production.yml logs [service_name]
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.production.yml exec mongodb mongodump --out /backup

# Restore backup
docker-compose -f docker-compose.production.yml exec mongodb mongorestore /backup
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./deploy.sh yourdomain.com production
```

## 🔐 Security Checklist

- ✅ SSL certificates configured
- ✅ Firewall configured (ports 80, 443, 22 only)
- ✅ Strong passwords for all services
- ✅ MongoDB authentication enabled
- ✅ Regular security updates
- ✅ Backup strategy implemented

## 🚨 Troubleshooting

### Common Issues

**1. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run
```

**2. Container Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs [service]

# Check environment variables
docker-compose -f docker-compose.production.yml config
```

**3. Database Connection Issues**
```bash
# Check MongoDB status
docker-compose -f docker-compose.production.yml exec mongodb mongosh

# Test connection from backend
docker-compose -f docker-compose.production.yml exec backend ping mongodb
```

**4. Nginx Configuration Issues**
```bash
# Test nginx configuration
docker-compose -f docker-compose.production.yml exec nginx nginx -t

# Reload nginx
docker-compose -f docker-compose.production.yml exec nginx nginx -s reload
```

### Performance Tuning

**MongoDB Optimization**
```bash
# Enable MongoDB profiling
docker-compose -f docker-compose.production.yml exec mongodb mongosh --eval "db.setProfilingLevel(1, {slowms: 100})"
```

**Nginx Optimization**
- Adjust worker processes in `nginx/nginx.conf`
- Configure appropriate buffer sizes
- Enable compression for static assets

## 📞 Support

### Logs Location
- **Application Logs**: `./logs/`
- **Nginx Logs**: `./logs/nginx/`
- **Docker Logs**: `docker-compose logs`

### Useful Commands

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# Stop services
docker-compose -f docker-compose.production.yml down

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service]

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale backend=2

# View resource usage
docker-compose -f docker-compose.production.yml top
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /path/to/phone-number-management
          git pull origin main
          ./deploy.sh ${{ secrets.DOMAIN }} production
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your domain name | `yourdomain.com` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `SecurePassword123!` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | `1234567890:ABC...` |
| `TELEGRAM_CHAT_ID` | Telegram chat/group ID | `-1001234567890` |
| `JWT_SECRET` | JWT signing secret | `super_secret_32_chars_minimum` |
| `SSL_EMAIL` | Email for SSL certificates | `admin@yourdomain.com` |

---

## 🎉 Congratulations!

Your Phone Number Management System is now deployed and ready for production use!

- **Frontend**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Telegram Notifications**: Every day at 00:10

Remember to:
1. Configure your Telegram Bot settings
2. Add your phone numbers to the system
3. Test the notification system
4. Set up monitoring and backups