# Transputec Field Services - Deployment Guide

This guide provides multiple options for deploying the Transputec Field Services application permanently.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option 1: Docker Deployment (Recommended)](#option-1-docker-deployment-recommended)
3. [Option 2: Railway Deployment](#option-2-railway-deployment)
4. [Option 3: VPS Deployment](#option-3-vps-deployment)
5. [Option 4: Cloud Platform Deployment](#option-4-cloud-platform-deployment)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Post-Deployment](#post-deployment)

---

## Prerequisites

- Node.js 22.x or higher
- pnpm package manager
- MySQL 8.0 or higher
- Git

---

## Option 1: Docker Deployment (Recommended)

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Transputec-global-field-services-master-v1.6
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env file** with your configuration:
   ```env
   MYSQL_PASSWORD=your_secure_password
   OAUTH_CLIENT_ID=your_oauth_client_id
   OAUTH_SERVER_URL=https://oauth.manus.space
   ```

4. **Build and start containers**
   ```bash
   docker-compose up -d
   ```

5. **Initialize database**
   ```bash
   docker-compose exec app node -e "require('./dist/index.js')"
   ```

6. **Access the application**
   - Open http://localhost:5000
   - Default admin: admin@transputec.com / Admin@123

### Docker Commands

```bash
# View logs
docker-compose logs -f app

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build
```

---

## Option 2: Railway Deployment

Railway offers free hosting with automatic deployments from Git.

### Steps:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize project**
   ```bash
   cd Transputec-global-field-services-master-v1.6
   railway init
   ```

4. **Add MySQL database**
   ```bash
   railway add mysql
   ```

5. **Set environment variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set VITE_API_URL=https://your-app.railway.app
   railway variables set VITE_OAUTH_CLIENT_ID=your_client_id
   railway variables set VITE_OAUTH_SERVER_URL=https://oauth.manus.space
   ```

6. **Deploy**
   ```bash
   railway up
   ```

7. **Get your URL**
   ```bash
   railway domain
   ```

### Railway Configuration

Create `railway.json` in project root:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Option 3: VPS Deployment

Deploy to any VPS (DigitalOcean, Linode, AWS EC2, etc.)

### Steps:

1. **SSH into your VPS**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js 22
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install pnpm
   npm install -g pnpm

   # Install MySQL
   sudo apt-get install -y mysql-server
   ```

3. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Transputec-global-field-services-master-v1.6
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your settings
   ```

6. **Setup MySQL database**
   ```bash
   sudo mysql -e "CREATE DATABASE transputec_dispatch;"
   sudo mysql -e "CREATE USER 'transputec'@'localhost' IDENTIFIED BY 'your_password';"
   sudo mysql -e "GRANT ALL PRIVILEGES ON transputec_dispatch.* TO 'transputec'@'localhost';"
   sudo mysql -e "FLUSH PRIVILEGES;"
   ```

7. **Build application**
   ```bash
   pnpm build
   ```

8. **Setup PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name transputec-app
   pm2 save
   pm2 startup
   ```

9. **Setup Nginx reverse proxy**
   ```bash
   sudo apt-get install -y nginx
   ```

   Create `/etc/nginx/sites-available/transputec`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/transputec /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt-get install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## Option 4: Cloud Platform Deployment

### Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure:
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Environment**: Node
5. Add environment variables
6. Add MySQL database from Render dashboard
7. Deploy

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create transputec-app`
4. Add MySQL: `heroku addons:create jawsdb:kitefin`
5. Set buildpack: `heroku buildpacks:set heroku/nodejs`
6. Deploy: `git push heroku main`

### DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `pnpm install && pnpm build`
   - **Run Command**: `pnpm start`
5. Add MySQL database component
6. Set environment variables
7. Deploy

---

## Environment Variables

Required environment variables for production:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Application
NODE_ENV=production
PORT=5000

# OAuth (Optional - for Manus OAuth integration)
VITE_OAUTH_CLIENT_ID=your_client_id
VITE_OAUTH_SERVER_URL=https://oauth.manus.space

# API URL (Your production domain)
VITE_API_URL=https://your-domain.com
```

---

## Database Setup

The application will automatically create the necessary tables on first run. However, you can manually initialize:

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE transputec_dispatch;

# The application will create tables automatically
# Or run the initialization script if provided
```

---

## Post-Deployment

### 1. Verify Deployment

- Access your application URL
- Test the request form
- Login to admin dashboard (admin@transputec.com / Admin@123)
- Create a test job and verify tracking

### 2. Change Default Admin Password

1. Login to admin dashboard
2. Go to settings (if available) or update via database:
   ```sql
   UPDATE users SET password = 'new_hashed_password' WHERE email = 'admin@transputec.com';
   ```

### 3. Setup Monitoring

- Setup uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)
- Setup log aggregation

### 4. Backup Strategy

- Setup automated database backups
- Configure backup retention policy
- Test restore procedures

### 5. Performance Optimization

- Enable gzip compression
- Setup CDN for static assets
- Configure caching headers
- Monitor application performance

---

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs app
# or
pm2 logs transputec-app
```

### Database connection issues

- Verify DATABASE_URL is correct
- Check MySQL is running
- Verify firewall rules
- Test connection manually:
  ```bash
  mysql -h host -u user -p database
  ```

### Port already in use

```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

---

## Support

For issues or questions:
- Check application logs
- Review environment variables
- Verify database connectivity
- Check firewall/security group settings

---

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong MySQL password
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor application logs
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly

---

**Deployment completed successfully? Access your application and start managing field services!**

