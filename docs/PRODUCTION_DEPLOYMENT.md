# 🚀 Production Deployment Guide - LearnNest LMS

## Overview

This guide covers deploying LearnNest LMS to a production environment with all security measures in place.

---

## 📋 Pre-Deployment Checklist

### 1. Security Configuration

- [ ] Generate strong JWT_SECRET (min 32 characters random string)
- [ ] Set strong SuperAdmin password
- [ ] Configure production MongoDB URI
- [ ] Set up SSL/TLS certificates for HTTPS
- [ ] Review and update CORS settings
- [ ] Enable rate limiting (already configured)

### 2. Environment Setup

- [ ] Create production `.env` file (copy from `.env.example`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set production CLIENT_URL

### 3. Code Review

- [ ] Remove all debug logs
- [ ] Test all API endpoints
- [ ] Verify authentication flows
- [ ] Test role-based access control

---

## 🔧 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# PRODUCTION CONFIGURATION
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/LearnNestDB

# Security
JWT_SECRET=your-32-char-random-secret-key-here
JWT_EXPIRES_IN=1d

# Admin
SUPERADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_PASSWORD=YourVeryStrongPassword123!

# CORS
CLIENT_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_LIMIT_MAX_ATTEMPTS=5
```

---

## 🏗️ Deployment Options

### Option 1: Deploy to Heroku

#### Backend (Server):

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create new app
cd server
heroku create learnnest-api

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-here
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set SUPERADMIN_EMAIL=admin@yourdomain.com
heroku config:set SUPERADMIN_PASSWORD=your-password
heroku config:set CLIENT_URL=https://your-frontend.vercel.app

# 5. Deploy
git push heroku main

# 6. Check logs
heroku logs --tail
```

#### Frontend (Client):

```bash
# Deploy to Vercel
cd client

# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variable
# In Vercel dashboard: VITE_API_URL=https://learnnest-api.herokuapp.com
```

---

### Option 2: Deploy to DigitalOcean/AWS/VPS

#### 1. Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install -y nginx
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/LearnNest.git
cd LearnNest/server

# Install dependencies
npm install --production

# Create .env file
nano .env
# (Paste your production environment variables)

# Start with PM2
pm2 start server.js --name learnnest-api
pm2 save
pm2 startup
```

#### 3. Configure Nginx

```bash
nano /etc/nginx/sites-available/learnnest
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/learnnest /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 4. Setup SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

---

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create new cluster
   - Choose cloud provider and region

2. **Configure Security**:
   - Add IP whitelist (0.0.0.0/0 for now, restrict in production)
   - Create database user with strong password
   - Save connection string

3. **Connect**:
   - Copy connection string
   - Replace `<password>` with your database password
   - Add to `.env` as `MONGODB_URI`

---

## 🔒 Security Best Practices

### 1. HTTPS Only
- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use SSL/TLS certificates

### 2. Environment Variables
- Never commit `.env` to Git
- Use different secrets for dev/prod
- Rotate secrets regularly

### 3. Database Security
- Use MongoDB Atlas with authentication
- Restrict IP whitelist
- Use strong passwords
- Regular backups

### 4. API Security
- Rate limiting enabled (100 req/15min)
- Auth rate limiting (5 attempts/15min)
- Helmet.js for security headers
- NoSQL injection protection

### 5. Password Security
- Bcrypt hashing with salt rounds
- Never store plain text passwords
- Force strong passwords

---

## 📊 Monitoring & Logs

### Production Monitoring

```bash
# View PM2 logs
pm2 logs learnnest-api

# Monitor resources
pm2 monit

# View detailed info
pm2 info learnnest-api
```

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for performance monitoring

---

## 🔄 Updating Production

```bash
# 1. SSH to server
ssh root@your-server-ip

# 2. Pull latest code
cd LearnNest
git pull origin main

# 3. Install dependencies
cd server
npm install --production

# 4. Restart application
pm2 restart learnnest-api

# 5. Check logs
pm2 logs learnnest-api --lines 50
```

---

## 📥 Admin Data Export

### Export All Admins

The SuperAdmin can export admin details from the Manage Admins page.

**Security Notes**:
- Passwords are never exported (they're hashed)
- CSV includes: name, email, username, institution
- Download button available in Manage Admins page
- Files exported as CSV format

**API Endpoint**:
```
GET /api/auth/export/admins
Authorization: Bearer <superadmin-token>
```

**Response includes**:
- Institution details
- Admin information
- Creation dates
- Password notes (not actual passwords)

---

## 🆘 Troubleshooting

### Server won't start

```bash
# Check logs
pm2 logs learnnest-api

# Check environment variables
pm2 env 0

# Restart
pm2 restart learnnest-api
```

### Database connection errors

- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas
- Verify database user credentials
- Check network connectivity

### CORS errors

- Verify CLIENT_URL in .env
- Check CORS configuration in server.js
- Ensure https:// protocol in production

---

## 📞 Support

For issues or questions:
- Check logs first
- Review security guide: `SECURITY_GUIDE.md`
- Check environment variables
- Verify database connection

---

## 📝 Maintenance Schedule

### Daily
- Monitor error logs
- Check server resources
- Review failed authentication attempts

### Weekly
- Database backup
- Security log review
- Performance monitoring

### Monthly
- Update dependencies
- Security audit
- Backup verification

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Maintained by**: Sushanka lamichhane 
