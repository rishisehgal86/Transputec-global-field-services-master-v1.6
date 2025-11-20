# Step-by-Step Deployment Guide for External Hosting

Complete guide to deploy local filesystem storage on your server at `field-pulse.karrdserviceuae.com` (`/var/www/html/fieldpulsego/`)

---

## Prerequisites

- SSH access to your server
- Root or sudo privileges
- Application already deployed at `/var/www/html/fieldpulsego/`
- Node.js 22.x installed
- PM2 or similar process manager (recommended)

---

## Step 1: Backup Current Installation

```bash
# SSH into your server
ssh user@field-pulse.karrdserviceuae.com

# Create backup
cd /var/www/html
sudo tar -czf fieldpulsego-backup-$(date +%Y%m%d).tar.gz fieldpulsego/

# Verify backup
ls -lh fieldpulsego-backup-*.tar.gz
```

---

## Step 2: Stop the Application

```bash
# If using PM2
pm2 stop fieldpulse
pm2 list

# If using systemd
sudo systemctl stop fieldpulse

# If running directly
# Find and kill the process
ps aux | grep node
sudo kill <PID>
```

---

## Step 3: Apply Code Changes

### Option A: Manual File Editing (Recommended for small changes)

#### 3.1. Create new file: `server/storage-local.ts`

```bash
cd /var/www/html/fieldpulsego
sudo nano server/storage-local.ts
```

Copy the entire content from `EXTERNAL-DEPLOYMENT-CHANGES.md` section "server/storage-local.ts"

Save and exit (Ctrl+X, Y, Enter)

#### 3.2. Update `server/storage.ts`

```bash
sudo nano server/storage.ts
```

Replace entire file content with the code from `EXTERNAL-DEPLOYMENT-CHANGES.md` section "server/storage.ts"

Save and exit

#### 3.3. Update `server/_core/index.ts`

```bash
sudo nano server/_core/index.ts
```

1. Add `import path from 'path';` at the top (around line 5)
2. Find the line with `registerOAuthRoutes(app);` (around line 50)
3. Add the local storage initialization code BEFORE that line (see EXTERNAL-DEPLOYMENT-CHANGES.md)

Save and exit

### Option B: Git Pull (If using version control)

```bash
cd /var/www/html/fieldpulsego

# Pull latest changes
git pull origin main

# Or checkout specific commit
git checkout 0ce5270d
```

---

## Step 4: Create Upload Directories

```bash
cd /var/www/html/fieldpulsego

# Create directory structure
sudo mkdir -p uploads/media uploads/comments uploads/temp

# Set ownership (replace www-data with your web server user if different)
sudo chown -R www-data:www-data uploads/

# Set permissions
sudo chmod -R 755 uploads/

# Verify
ls -la uploads/
# Should show: drwxr-xr-x www-data www-data
```

---

## Step 5: Update Environment Variables

```bash
cd /var/www/html/fieldpulsego

# Edit .env file
sudo nano .env
```

Add this line:
```
USE_LOCAL_STORAGE=true
```

**Complete .env example:**
```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/fieldpulse

# JWT Secret
JWT_SECRET=your-secret-key-here

# Local Storage (ADD THIS LINE)
USE_LOCAL_STORAGE=true

# Application
NODE_ENV=production
PORT=3000

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Save and exit (Ctrl+X, Y, Enter)

---

## Step 6: Rebuild Application (if using TypeScript)

```bash
cd /var/www/html/fieldpulsego

# Install dependencies (if new packages added)
npm install

# Rebuild
npm run build
```

---

## Step 7: Start the Application

```bash
# If using PM2
pm2 start npm --name "fieldpulse" -- start
pm2 save

# If using systemd
sudo systemctl start fieldpulse

# If running directly
npm start &
```

---

## Step 8: Verify Installation

### 8.1. Check Application Logs

```bash
# PM2
pm2 logs fieldpulse --lines 50

# Look for these messages:
# [Storage] Using LOCAL FILESYSTEM storage
# [Storage] Local upload directories initialized
# [Storage] Serving uploads from: /var/www/html/fieldpulsego/uploads
```

### 8.2. Check Upload Directories

```bash
ls -la /var/www/html/fieldpulsego/uploads/
# Should see: media/, comments/, temp/ directories
```

### 8.3. Test File Upload

1. Open browser: `https://field-pulse.karrdserviceuae.com`
2. Login to admin dashboard
3. Create a job with file attachment
4. Check if file appears in uploads directory:

```bash
ls -la /var/www/html/fieldpulsego/uploads/media/
# Should see uploaded file
```

5. Verify file is accessible in browser:
   - Right-click the uploaded file in the job
   - Copy image address
   - Should be: `https://field-pulse.karrdserviceuae.com/uploads/media/filename.jpg`
   - Open in new tab - should display the file

---

## Step 9: Configure Web Server (Apache/Nginx)

### For Apache

Edit your virtual host configuration:

```bash
sudo nano /etc/apache2/sites-available/field-pulse.conf
```

Add uploads directory configuration:

```apache
<VirtualHost *:80>
    ServerName field-pulse.karrdserviceuae.com
    
    # Proxy to Node.js
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Allow uploads directory
    <Directory /var/www/html/fieldpulsego/uploads>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
    
    # Optional: Serve uploads directly (bypass Node.js for better performance)
    Alias /uploads /var/www/html/fieldpulsego/uploads
</VirtualHost>
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

### For Nginx

Edit your site configuration:

```bash
sudo nano /etc/nginx/sites-available/field-pulse
```

Add uploads location:

```nginx
server {
    listen 80;
    server_name field-pulse.karrdserviceuae.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Optional: Serve uploads directly (bypass Node.js)
    location /uploads/ {
        alias /var/www/html/fieldpulsego/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## Step 10: Set Up Automated Backups

Create backup script:

```bash
sudo nano /var/www/html/fieldpulsego/backup-uploads.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/fieldpulse"
DATE=$(date +%Y%m%d)
UPLOAD_DIR="/var/www/html/fieldpulsego/uploads"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup uploads
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz -C /var/www/html/fieldpulsego uploads/

# Keep only last 30 days
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete

echo "Backup completed: uploads-$DATE.tar.gz"
```

Make executable:
```bash
sudo chmod +x /var/www/html/fieldpulsego/backup-uploads.sh
```

Add to crontab (daily at 2 AM):
```bash
sudo crontab -e

# Add this line:
0 2 * * * /var/www/html/fieldpulsego/backup-uploads.sh
```

---

## Troubleshooting

### Issue: Files not uploading

**Solution:**
```bash
# Check permissions
sudo chown -R www-data:www-data /var/www/html/fieldpulsego/uploads/
sudo chmod -R 755 /var/www/html/fieldpulsego/uploads/

# Check disk space
df -h

# Check application logs
pm2 logs fieldpulse
```

### Issue: Files upload but can't be accessed via browser

**Solution:**
```bash
# Test direct access
curl http://localhost:3000/uploads/media/test.jpg

# Check web server configuration
sudo nginx -t  # for Nginx
sudo apachectl configtest  # for Apache

# Restart web server
sudo systemctl restart nginx  # or apache2
```

### Issue: "Storage proxy credentials missing" error still appears

**Solution:**
```bash
# Verify .env file
cat /var/www/html/fieldpulsego/.env | grep USE_LOCAL_STORAGE
# Should output: USE_LOCAL_STORAGE=true

# Restart application
pm2 restart fieldpulse

# Check logs for confirmation
pm2 logs fieldpulse | grep Storage
# Should see: [Storage] Using LOCAL FILESYSTEM storage
```

### Issue: Permission denied errors

**Solution:**
```bash
# Check SELinux (CentOS/RHEL)
sudo setenforce 0  # Temporary disable
sudo setsebool -P httpd_can_network_connect 1

# Check AppArmor (Ubuntu)
sudo aa-complain /usr/sbin/apache2

# Or set correct ownership
sudo chown -R www-data:www-data /var/www/html/fieldpulsego/
```

---

## Verification Checklist

- [ ] Application starts without errors
- [ ] Logs show "Using LOCAL FILESYSTEM storage"
- [ ] Upload directories exist with correct permissions
- [ ] Can upload files through admin interface
- [ ] Uploaded files appear in /uploads/media/ directory
- [ ] Files are accessible via browser URL
- [ ] No "Storage proxy credentials missing" errors
- [ ] Backup script is scheduled in crontab

---

## Rollback Procedure

If something goes wrong:

```bash
# Stop application
pm2 stop fieldpulse

# Restore from backup
cd /var/www/html
sudo rm -rf fieldpulsego/
sudo tar -xzf fieldpulsego-backup-YYYYMMDD.tar.gz

# Start application
cd fieldpulsego
pm2 start npm --name "fieldpulse" -- start
```

---

## Next Steps

1. **Monitor disk usage** - Set up alerts when uploads directory exceeds certain size
2. **Implement file cleanup** - Remove old temporary files periodically
3. **Add CDN** - Use CloudFlare or similar to cache /uploads/* for better performance
4. **Security scan** - Add ClamAV to scan uploaded files for malware

---

## Support

For issues:
1. Check application logs: `pm2 logs fieldpulse`
2. Check web server logs: `/var/log/nginx/error.log` or `/var/log/apache2/error.log`
3. Verify file permissions: `ls -la /var/www/html/fieldpulsego/uploads/`
4. Test storage directly: `curl http://localhost:3000/uploads/test.txt`

