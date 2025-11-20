# Local Storage Deployment Package

This package contains everything you need to enable local filesystem storage on your externally hosted server.

## Package Contents

1. **storage-local.ts** - New file to add to your server
2. **EXTERNAL-DEPLOYMENT-CHANGES.md** - Complete code changes documentation
3. **EXTERNAL-DEPLOYMENT-GUIDE.md** - Step-by-step deployment instructions
4. **DEPLOYMENT-LOCAL-STORAGE.md** - Technical reference and troubleshooting
5. **README.md** - This file

## Quick Start

### For Your Server: field-pulse.karrdserviceuae.com

**Location:** `/var/www/html/fieldpulsego/`

### 3-Step Deployment

1. **Read the guide**
   ```bash
   # Open EXTERNAL-DEPLOYMENT-GUIDE.md
   # Follow steps 1-10 carefully
   ```

2. **Apply code changes**
   ```bash
   # Copy storage-local.ts to server/
   # Update server/storage.ts
   # Update server/_core/index.ts
   # See EXTERNAL-DEPLOYMENT-CHANGES.md for exact code
   ```

3. **Configure and restart**
   ```bash
   # Add USE_LOCAL_STORAGE=true to .env
   # Create uploads directory
   # Restart application
   ```

## File Transfer to Your Server

### Option 1: SCP (Secure Copy)

```bash
# From your local machine
scp -r deployment-package/ user@field-pulse.karrdserviceuae.com:/tmp/

# Then SSH and move files
ssh user@field-pulse.karrdserviceuae.com
sudo cp /tmp/deployment-package/storage-local.ts /var/www/html/fieldpulsego/server/
```

### Option 2: Git

```bash
# Commit these files to your repository
git add deployment-package/
git commit -m "Add local storage implementation"
git push

# Then pull on server
ssh user@field-pulse.karrdserviceuae.com
cd /var/www/html/fieldpulsego
git pull
```

### Option 3: Manual Copy-Paste

1. Open `storage-local.ts` in this package
2. SSH to your server
3. Create file: `sudo nano /var/www/html/fieldpulsego/server/storage-local.ts`
4. Paste content
5. Save and exit

Repeat for other file modifications listed in EXTERNAL-DEPLOYMENT-CHANGES.md

## What This Fixes

**Problem:** 
```
TRPCClientError: Storage proxy credentials missing: 
set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY
```

**Solution:**
Uses local filesystem instead of S3/Manus Forge API

**Result:**
- Files stored in `/var/www/html/fieldpulsego/uploads/`
- No S3 configuration needed
- No external API dependencies
- Works on any server

## Deployment Checklist

Before starting:
- [ ] Backup current installation
- [ ] Have SSH access
- [ ] Have sudo privileges
- [ ] Know your web server user (usually www-data)

During deployment:
- [ ] Stop application
- [ ] Apply code changes
- [ ] Create uploads directory
- [ ] Set permissions (755, www-data:www-data)
- [ ] Add USE_LOCAL_STORAGE=true to .env
- [ ] Restart application

After deployment:
- [ ] Check logs for "Using LOCAL FILESYSTEM storage"
- [ ] Test file upload
- [ ] Verify file accessible via browser
- [ ] Set up automated backups

## Support Documents

- **EXTERNAL-DEPLOYMENT-GUIDE.md** - Complete step-by-step instructions
- **EXTERNAL-DEPLOYMENT-CHANGES.md** - Exact code changes needed
- **DEPLOYMENT-LOCAL-STORAGE.md** - Technical details and troubleshooting

## Estimated Time

- **Code changes:** 15-20 minutes
- **Directory setup:** 5 minutes
- **Testing:** 10 minutes
- **Total:** ~30-40 minutes

## Need Help?

1. Check EXTERNAL-DEPLOYMENT-GUIDE.md "Troubleshooting" section
2. Verify all steps in deployment checklist
3. Check application logs: `pm2 logs fieldpulse`
4. Check web server logs: `/var/log/nginx/error.log`

## Important Notes

- This is a **one-way change** - once deployed, files are stored locally
- Ensure adequate disk space in `/var/www/html/fieldpulsego/`
- Set up regular backups of `/uploads` directory
- For multi-server deployments, use shared storage (NFS/GlusterFS)

## Version Compatibility

- Works with current codebase (checkpoint: 0ce5270d)
- Compatible with both Manus-hosted and self-hosted deployments
- Feature flag allows switching between S3 and local storage

---

**Ready to deploy?** Start with `EXTERNAL-DEPLOYMENT-GUIDE.md` Step 1.

