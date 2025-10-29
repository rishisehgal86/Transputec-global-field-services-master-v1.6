# Permanent Deployment Guide
## Transputec Field Services Application

This guide provides step-by-step instructions for deploying the Transputec Field Services application permanently to production hosting platforms.

## Current Application Status

**GitHub Repository:** https://github.com/rishisehgal86/Transputec-global-field-services-master-v1.6  
**Branch:** v2.0-production-ready  
**Features:**
- Modern responsive UI with navy blue theme
- Video conference link functionality
- Robust local authentication system
- User management for superuser
- Admin dashboard with job management
- Client and engineer portals

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway provides the simplest deployment experience with automatic builds and database provisioning.

**Steps:**

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `rishisehgal86/Transputec-global-field-services-master-v1.6`
   - Branch: `v2.0-production-ready`

3. **Add MySQL Database**
   - In your project, click "New"
   - Select "Database" → "MySQL"
   - Railway will automatically create and configure the database

4. **Configure Environment Variables**
   - Click on your service → "Variables"
   - Add the following:
   ```
   DATABASE_URL=mysql://root:${MYSQL_ROOT_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}
   MYSQL_HOST=mysql.railway.internal
   MYSQL_PORT=3306
   MYSQL_DATABASE=transputec_dispatch
   MYSQL_USER=root
   MYSQL_PASSWORD=${MYSQL_ROOT_PASSWORD}
   NODE_ENV=production
   PORT=5000
   OAUTH_CLIENT_ID=transputec-field-services
   OAUTH_CLIENT_SECRET=your-secret-key
   OAUTH_SERVER_URL=https://oauth.manus.space
   VITE_OAUTH_CLIENT_ID=transputec-field-services
   VITE_OAUTH_SERVER_URL=https://oauth.manus.space
   ```

5. **Deploy**
   - Railway will automatically build and deploy
   - Your app will be available at: `https://your-app.up.railway.app`

6. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

**Cost:** Free tier includes $5/month credit, then pay-as-you-go

---

### Option 2: Render

Render offers a generous free tier and automatic SSL certificates.

**Steps:**

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select: `rishisehgal86/Transputec-global-field-services-master-v1.6`
   - Branch: `v2.0-production-ready`

3. **Configure Service**
   - Name: `transputec-field-services`
   - Environment: `Node`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

4. **Add MySQL Database**
   - Click "New +" → "PostgreSQL" (or use external MySQL)
   - For MySQL, use a service like PlanetScale or external provider

5. **Set Environment Variables**
   - Add all variables from the Railway section above
   - Update database connection details

6. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

**Cost:** Free tier available (with limitations), paid plans from $7/month

---

### Option 3: Docker + VPS (Most Control)

Deploy using Docker on any VPS provider (DigitalOcean, Linode, AWS EC2, etc.)

**Steps:**

1. **Set up VPS**
   - Create a Ubuntu 22.04 server
   - SSH into your server

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt-get install docker-compose-plugin
   ```

3. **Clone Repository**
   ```bash
   git clone -b v2.0-production-ready https://github.com/rishisehgal86/Transputec-global-field-services-master-v1.6.git
   cd Transputec-global-field-services-master-v1.6
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   # Update all environment variables
   ```

5. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

6. **Set up Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/transputec
   ```
   
   Add configuration:
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

7. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

**Cost:** VPS from $5-10/month (DigitalOcean, Linode, Vultr)

---

### Option 4: DigitalOcean App Platform

**Steps:**

1. **Sign up for DigitalOcean**
   - Go to https://www.digitalocean.com
   - Create an account

2. **Create App**
   - Go to Apps → Create App
   - Choose GitHub
   - Select repository and branch

3. **Configure**
   - App name: `transputec-field-services`
   - Build command: `pnpm install && pnpm build`
   - Run command: `pnpm start`

4. **Add Database**
   - Add MySQL database component
   - Configure connection

5. **Deploy**
   - Review and create
   - App will be deployed automatically

**Cost:** From $5/month for basic tier

---

## Post-Deployment Checklist

After deploying to any platform:

1. **Change Default Password**
   - Login as: rishis@transputec.com / Admin@123
   - Go to Settings → Change Password
   - Update to a secure password

2. **Test All Features**
   - Create a test service request
   - Test video conference link
   - Test user management
   - Test payment flow (if configured)

3. **Configure Custom Domain**
   - Point your domain to the deployment
   - Update DNS records
   - Enable SSL/HTTPS

4. **Set up Monitoring**
   - Configure uptime monitoring
   - Set up error tracking (Sentry, LogRocket)
   - Enable analytics

5. **Backup Strategy**
   - Configure automated database backups
   - Set up backup retention policy

6. **Security Hardening**
   - Enable firewall rules
   - Configure rate limiting
   - Set up security headers

## Support

For deployment issues or questions:
- Email: rishis@transputec.com
- GitHub Issues: https://github.com/rishisehgal86/Transputec-global-field-services-master-v1.6/issues

## Next Steps

Once deployed, consider:
1. Implementing the SaaS marketplace features from the transformation plan
2. Adding analytics and reporting
3. Integrating payment gateways (Stripe, PayPal)
4. Expanding to mobile apps
5. Adding advanced features like AI-powered dispatch

---

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Author:** Manus AI

