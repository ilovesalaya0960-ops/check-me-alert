#!/bin/bash

# Phone Number Management System - Production Deployment Script
# Usage: ./deploy.sh [domain] [environment]
# Example: ./deploy.sh yourdomain.com production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"yourdomain.com"}
ENVIRONMENT=${2:-"production"}
PROJECT_NAME="phone-management"

echo -e "${BLUE}🚀 Starting deployment for ${PROJECT_NAME}${NC}"
echo -e "${BLUE}📧 Domain: ${DOMAIN}${NC}"
echo -e "${BLUE}🌍 Environment: ${ENVIRONMENT}${NC}"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo -e "${YELLOW}Please create .env.production with your environment variables${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)
export DOMAIN=${DOMAIN}

echo -e "${YELLOW}📦 Building Docker images...${NC}"

# Build backend
echo -e "${BLUE}🔨 Building backend...${NC}"
docker build -f backend/Dockerfile.production -t ${PROJECT_NAME}-backend:latest ./backend

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
docker build -f frontend/Dockerfile.production -t ${PROJECT_NAME}-frontend:latest ./frontend

echo -e "${YELLOW}🧹 Cleaning up old containers...${NC}"
docker-compose -f docker-compose.production.yml down --remove-orphans

echo -e "${YELLOW}🏗️ Starting production services...${NC}"
docker-compose -f docker-compose.production.yml up -d

echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"

# Check backend health
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose -f docker-compose.production.yml logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose -f docker-compose.production.yml logs frontend
    exit 1
fi

# Check MongoDB health
if docker-compose -f docker-compose.production.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
else
    echo -e "${RED}❌ MongoDB health check failed${NC}"
    docker-compose -f docker-compose.production.yml logs mongodb
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📱 Your application is now running at:${NC}"
echo -e "${GREEN}   🌐 Frontend: https://${DOMAIN}${NC}"
echo -e "${GREEN}   🔌 API: https://api.${DOMAIN}${NC}"
echo -e "${GREEN}   📊 MongoDB: localhost:27017${NC}"

echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Configure your DNS to point to this server"
echo -e "   2. Set up SSL certificates (Let's Encrypt recommended)"
echo -e "   3. Configure your Telegram Bot settings"
echo -e "   4. Test the application thoroughly"

echo -e "${BLUE}📝 To view logs: docker-compose -f docker-compose.production.yml logs -f${NC}"
echo -e "${BLUE}🛑 To stop: docker-compose -f docker-compose.production.yml down${NC}"