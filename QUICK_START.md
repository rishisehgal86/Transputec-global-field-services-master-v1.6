# Transputec Field Services - Quick Start Guide

Get your Transputec Field Services application running in minutes!

## 🚀 Fastest Deployment (Docker)

```bash
# 1. Clone or extract the application
cd Transputec-global-field-services-master-v1.6

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your MySQL password
nano .env  # Set MYSQL_PASSWORD=your_secure_password

# 4. Start with Docker Compose
docker-compose up -d

# 5. Access the application
open http://localhost:5000
```

**Default Admin Login:**
- Email: admin@transputec.com
- Password: Admin@123

---

## 📦 What's Included

- ✅ Modern, responsive UI with deep navy design
- ✅ Client service request portal
- ✅ Real-time job tracking
- ✅ Engineer portal with job acceptance
- ✅ Admin dashboard for job management
- ✅ Video conference link integration
- ✅ Local authentication system
- ✅ MySQL database with auto-initialization

---

## 🌐 Production Deployment Options

### Option 1: Railway (Free Hosting)
```bash
npm install -g @railway/cli
railway login
railway init
railway add mysql
railway up
```

### Option 2: Your Own VPS
```bash
# Install dependencies
pnpm install

# Build application
pnpm build

# Start with PM2
pm2 start dist/index.js --name transputec
```

### Option 3: Docker on Any Server
```bash
# Build and deploy
docker-compose up -d
```

---

## 📱 Features

### For Clients
- Submit service requests online
- Track engineer progress in real-time
- Add/edit video conference links
- View job status and updates
- Receive unique tracking links

### For Engineers
- Receive job assignments via secure link
- Accept or decline jobs
- View site details and contact information
- Access video conference links
- Update job status (En Route, Arrived, Completed)

### For Admins
- Review and approve service requests
- Assign engineers to jobs
- Monitor all active jobs
- View job history and analytics
- Manage user accounts

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file:

```env
# Database
DATABASE_URL=mysql://root:password@localhost:3306/transputec_dispatch

# Application
NODE_ENV=production
PORT=5000

# Your Domain (for production)
VITE_API_URL=https://your-domain.com
```

### Database

The application automatically creates all necessary tables on first run. No manual database setup required!

---

## 📚 Documentation

- **Full Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **UI Redesign Details**: See `UI_REDESIGN_COMPLETE.md`
- **Mobile Optimization**: See `MOBILE_RESPONSIVE_COMPLETE.md`
- **Video Conference Feature**: See `VIDEO_CONFERENCE_FEATURE.md`

---

## 🆘 Troubleshooting

### Application won't start?
```bash
# Check logs
docker-compose logs app
```

### Can't connect to database?
- Verify MySQL is running
- Check DATABASE_URL in .env
- Ensure port 3306 is not blocked

### Port 5000 already in use?
```bash
# Change port in .env
PORT=3000

# Or kill existing process
lsof -i :5000
kill -9 <PID>
```

---

## 🔐 Security

**Important: Change default admin password after first login!**

1. Login to admin dashboard
2. Navigate to settings
3. Update password
4. Use strong, unique password

---

## 📞 Support

For deployment assistance or questions:
- Review the comprehensive `DEPLOYMENT_GUIDE.md`
- Check application logs for errors
- Verify all environment variables are set correctly

---

## ✨ What's New

### Latest Updates (October 2025)
- ✅ Complete UI redesign with modern navy theme
- ✅ Mobile-first responsive design
- ✅ Video conference link feature
- ✅ Local authentication system
- ✅ Docker deployment support
- ✅ Production-ready configuration

---

**Ready to deploy? Follow the steps above and your field service platform will be live in minutes!**

