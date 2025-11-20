# Local Storage Deployment Guide

This guide explains how to deploy the application with local filesystem storage instead of S3 (for self-hosted installations).

## Prerequisites

- Node.js 22.x or higher
- Application deployed to `/var/www/html/fieldpulsego/`
- Web server (Apache/Nginx) configured
- Write permissions for the application directory

## Setup Steps

### 1. Create Upload Directories

```bash
# Navigate to application root
cd /var/www/html/fieldpulsego/

# Create uploads directory structure
mkdir -p uploads/media uploads/comments uploads/temp

# Set correct permissions
# Replace 'www-data' with your web server user if different
sudo chown -R www-data:www-data uploads/
sudo chmod -R 755 uploads/
```

### 2. Configure Environment Variables

Add this line to your `.env` file:

```bash
USE_LOCAL_STORAGE=true
```

**Complete .env example for self-hosted:**

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/fieldpulse

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here

# Local Storage
USE_LOCAL_STORAGE=true

# Application
NODE_ENV=production
PORT=3000

# Stripe (if using billing features)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Build and Start Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start application
npm run start

# Or use PM2 for process management
pm2 start npm --name "fieldpulse" -- start
pm2 save
pm2 startup
```

### 4. Configure Web Server

#### Apache Configuration

Add to your virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName field-pulse.karrdserviceuae.com
    
    # Proxy to Node.js application
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Allow uploads directory
    <Directory /var/www/html/fieldpulsego/uploads>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
    
    # Optional: Serve uploads directly (bypass Node.js)
    Alias /uploads /var/www/html/fieldpulsego/uploads
</VirtualHost>
```

Enable required modules:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name field-pulse.karrdserviceuae.com;
    
    # Proxy to Node.js application
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

## Verification

### 1. Check Directory Permissions

```bash
ls -la /var/www/html/fieldpulsego/uploads/
# Should show: drwxr-xr-x www-data www-data
```

### 2. Test File Upload

1. Login to admin dashboard
2. Create a job with file attachment
3. Check if file appears in `/var/www/html/fieldpulsego/uploads/media/`
4. Verify file is accessible via browser: `http://your-domain.com/uploads/media/filename.jpg`

### 3. Check Application Logs

```bash
# If using PM2
pm2 logs fieldpulse

# Should see:
# [Storage] Using LOCAL FILESYSTEM storage
# [Storage] Local upload directories initialized
# [Storage] Serving uploads from: /var/www/html/fieldpulsego/uploads
```

## Backup Strategy

### Daily Backup Script

Create `/var/www/html/fieldpulsego/backup-uploads.sh`:

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

Make executable and add to crontab:

```bash
chmod +x /var/www/html/fieldpulsego/backup-uploads.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /var/www/html/fieldpulsego/backup-uploads.sh
```

## Troubleshooting

### Files Not Uploading

1. Check directory permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/fieldpulsego/uploads/
   sudo chmod -R 755 /var/www/html/fieldpulsego/uploads/
   ```

2. Check disk space:
   ```bash
   df -h
   ```

3. Check application logs for errors

### Files Not Accessible via Browser

1. Verify web server configuration
2. Check if `/uploads` route is properly configured
3. Test direct file access: `curl http://localhost:3000/uploads/test.txt`

### Permission Denied Errors

```bash
# Check SELinux (if enabled)
sudo setenforce 0  # Temporary disable
sudo setsebool -P httpd_can_network_connect 1

# Check AppArmor (Ubuntu)
sudo aa-complain /usr/sbin/apache2
```

## Storage Limits

Monitor disk usage:

```bash
# Check uploads directory size
du -sh /var/www/html/fieldpulsego/uploads/

# Set up disk usage alert (optional)
# Add to crontab:
# 0 * * * * [ $(du -s /var/www/html/fieldpulsego/uploads | cut -f1) -gt 10000000 ] && echo "Uploads directory exceeds 10GB" | mail -s "Disk Alert" admin@example.com
```

## Migration from S3

If migrating from S3 to local storage:

1. Download all files from S3 bucket
2. Organize into `uploads/media/`, `uploads/comments/` directories
3. Update database URLs from S3 URLs to `/uploads/*` paths
4. Set `USE_LOCAL_STORAGE=true`
5. Restart application

## Security Considerations

1. **File Type Validation** - Application validates file types before upload
2. **File Size Limits** - Set in application (default: 50MB)
3. **Directory Listing** - Disabled in web server configuration
4. **Antivirus Scanning** - Consider adding ClamAV for uploaded files
5. **Regular Backups** - Automated daily backups recommended

## Performance Optimization

For high-traffic sites:

1. **CDN** - Use CloudFlare or similar to cache `/uploads/*`
2. **Compression** - Enable gzip in web server for text files
3. **Separate Storage Server** - Mount NFS/GlusterFS for multi-server deployments
4. **Image Optimization** - Use ImageMagick/Sharp to resize on upload

## Support

For issues specific to local storage implementation, check:
- Application logs: `pm2 logs fieldpulse`
- Web server logs: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`
- System logs: `journalctl -u fieldpulse`

