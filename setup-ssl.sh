#!/bin/bash

# SSL Certificate Setup Script for Phone Management System
# Usage: ./setup-ssl.sh [domain] [email]
# Example: ./setup-ssl.sh yourdomain.com admin@yourdomain.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"yourdomain.com"}
EMAIL=${2:-"admin@${DOMAIN}"}

echo -e "${BLUE}🔒 Setting up SSL certificates for ${DOMAIN}${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run this script as root (use sudo)${NC}"
    exit 1
fi

# Install certbot if not exists
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing certbot...${NC}"

    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        yum install -y certbot python3-certbot-nginx
    # Amazon Linux
    elif command -v amazon-linux-extras &> /dev/null; then
        amazon-linux-extras install -y epel
        yum install -y certbot python3-certbot-nginx
    else
        echo -e "${RED}❌ Unsupported OS. Please install certbot manually.${NC}"
        exit 1
    fi
fi

# Create directories
echo -e "${YELLOW}📁 Creating SSL directories...${NC}"
mkdir -p /etc/nginx/ssl
mkdir -p /var/www/certbot

# Generate SSL certificates
echo -e "${YELLOW}🔑 Generating SSL certificates...${NC}"

# For production with real domain
if [ "${DOMAIN}" != "yourdomain.com" ]; then
    # Stop nginx temporarily
    systemctl stop nginx 2>/dev/null || docker-compose -f docker-compose.production.yml stop nginx 2>/dev/null || true

    # Get certificates
    certbot certonly \
        --standalone \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email \
        -d ${DOMAIN} \
        -d www.${DOMAIN} \
        -d api.${DOMAIN}

    # Copy certificates to nginx directory
    cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /etc/nginx/ssl/${DOMAIN}.crt
    cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /etc/nginx/ssl/${DOMAIN}.key

    # Set proper permissions
    chown root:root /etc/nginx/ssl/${DOMAIN}.*
    chmod 600 /etc/nginx/ssl/${DOMAIN}.key
    chmod 644 /etc/nginx/ssl/${DOMAIN}.crt

    echo -e "${GREEN}✅ SSL certificates generated successfully!${NC}"

else
    # For development/testing with self-signed certificates
    echo -e "${YELLOW}⚠️  Generating self-signed certificates for development...${NC}"

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/${DOMAIN}.key \
        -out /etc/nginx/ssl/${DOMAIN}.crt \
        -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Development/OU=IT/CN=${DOMAIN}/emailAddress=${EMAIL}"

    # Set proper permissions
    chown root:root /etc/nginx/ssl/${DOMAIN}.*
    chmod 600 /etc/nginx/ssl/${DOMAIN}.key
    chmod 644 /etc/nginx/ssl/${DOMAIN}.crt

    echo -e "${YELLOW}⚠️  Self-signed certificates generated. Not suitable for production!${NC}"
fi

# Setup auto-renewal for Let's Encrypt
if [ "${DOMAIN}" != "yourdomain.com" ]; then
    echo -e "${YELLOW}🔄 Setting up auto-renewal...${NC}"

    # Create renewal script
    cat > /etc/cron.daily/certbot-renew << 'EOF'
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx || docker-compose -f /path/to/docker-compose.production.yml restart nginx"
EOF

    chmod +x /etc/cron.daily/certbot-renew

    echo -e "${GREEN}✅ Auto-renewal configured${NC}"
fi

# Update nginx configuration
echo -e "${YELLOW}🔧 Updating nginx configuration...${NC}"
sed -i "s/yourdomain.com/${DOMAIN}/g" nginx/conf.d/phone-management.conf

echo -e "${GREEN}🎉 SSL setup completed!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "   1. Start your application: ./deploy.sh ${DOMAIN}"
echo -e "   2. Test SSL: https://${DOMAIN}"
echo -e "   3. Check SSL rating: https://www.ssllabs.com/ssltest/"

if [ "${DOMAIN}" != "yourdomain.com" ]; then
    echo -e "${BLUE}🔄 Certificate renewal:${NC}"
    echo -e "   • Automatic renewal is configured"
    echo -e "   • Test renewal: certbot renew --dry-run"
fi