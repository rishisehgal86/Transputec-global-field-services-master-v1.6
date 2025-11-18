# Deployment Guide - FieldPulse Go

## Environment Variables Required for Production

When deploying to your own server or private domain, you **must** set these environment variables for the application to work correctly.

### Critical Environment Variables

#### 1. **GOOGLE_PLACES_API_KEY** (Required for Geocoding)
**Purpose:** Enables accurate address geocoding and location services  
**Current Value:** `AIzaSyDK33z9lKkEhGdDhKpORJpU8jZAEdFrjzs`  
**How to Get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Places API" and "Geocoding API"
4. Create API credentials → API Key
5. Restrict the key to your domain for security

**Set in your deployment:**
```bash
GOOGLE_PLACES_API_KEY=your_google_api_key_here
```

**Without this:** Address geocoding will fall back to OpenStreetMap (less accurate, no typo correction)

---

#### 2. **DATABASE_URL** (Required)
**Purpose:** MySQL/TiDB database connection  
**Format:** `mysql://username:password@host:port/database`

**Example:**
```bash
DATABASE_URL=mysql://user:pass@localhost:3306/fieldpulse
```

---

#### 3. **JWT_SECRET** (Required for Authentication)
**Purpose:** Signs session tokens for user authentication  
**Generate:** Use a strong random string (32+ characters)

**Example:**
```bash
JWT_SECRET=your_very_long_random_secret_key_here_32chars_minimum
```

**Generate with:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

#### 4. **Email Configuration** (Required for Notifications)
**Current Setup:** Gmail SMTP (hardcoded in `server/email.ts`)

**Hardcoded Values (you may want to change):**
- Email: `admin@field-pulse.io`
- App Password: `mtcglnmbucshoyev`

**To use your own email:**
1. Open `server/email.ts`
2. Update `EMAIL_CONFIG` object:
```typescript
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@yourdomain.com',
    pass: 'your-app-password',
  },
};
```

**Gmail App Password Setup:**
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App Passwords
3. Generate an app password for "Mail"
4. Use that password in the config

**Production Recommendation:** Use SendGrid or AWS SES instead of Gmail for better deliverability.

---

#### 5. **SUPER_ADMIN_EMAIL & SUPER_ADMIN_PASSWORD** (Optional)
**Purpose:** Default super admin account credentials  
**Default Values:**
- Email: `admin@transputec.com`
- Password: `Admin@123`

**Set custom values:**
```bash
SUPER_ADMIN_EMAIL=your-admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
```

**Note:** These are only used when creating the **first** super admin account. If users already exist in the database, these are ignored.

---

### Optional Environment Variables

#### 6. **PUBLIC_URL** (Recommended for Production)
**Purpose:** Base URL for email links and redirects  
**Default:** `https://transputec-dispatch.manus.space`

**Set to your domain:**
```bash
PUBLIC_URL=https://yourdomain.com
```

---

#### 7. **NODE_ENV** (Recommended)
**Purpose:** Determines production vs development mode  
**Values:** `production` or `development`

```bash
NODE_ENV=production
```

---

## Deployment Checklist

### Before Deploying

- [ ] Set `GOOGLE_PLACES_API_KEY` environment variable
- [ ] Set `DATABASE_URL` with your database credentials
- [ ] Generate and set `JWT_SECRET`
- [ ] Update email configuration in `server/email.ts`
- [ ] Set `PUBLIC_URL` to your domain
- [ ] Set `NODE_ENV=production`
- [ ] (Optional) Set custom `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`

### After Deploying

- [ ] Test geocoding by creating a service request
- [ ] Verify email notifications are being sent
- [ ] Test super admin login
- [ ] Check database connection
- [ ] Verify all features work on your domain

---

## Common Issues

### Issue: "Geocoding failed" or addresses not found
**Solution:** Ensure `GOOGLE_PLACES_API_KEY` is set correctly and the API is enabled in Google Cloud Console.

### Issue: Emails not sending
**Solution:** 
1. Check email configuration in `server/email.ts`
2. Verify Gmail app password is correct
3. Check if Gmail is blocking the login (check security settings)
4. Consider switching to SendGrid/AWS SES for production

### Issue: "Database not available"
**Solution:** Verify `DATABASE_URL` is correct and database server is accessible from your deployment server.

### Issue: Can't login as super admin
**Solution:** 
1. Check if `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` match what you're entering
2. Remember: These only work for the FIRST account created
3. If database already has users, use existing credentials or reset via database

---

## GitHub Repository

**Repository:** https://github.com/rishisehgal86/fieldpulsego-version-.git  
**Branch:** `feature/multi-tenancy-complete`

**Important:** Environment variables are **NOT** stored in GitHub for security. You must set them manually in your deployment environment.

---

## Security Best Practices

1. **Never commit `.env` files to GitHub**
2. **Use strong, random JWT_SECRET** (32+ characters)
3. **Restrict Google API key** to your domain only
4. **Use app passwords** for Gmail, not your actual password
5. **Enable SSL/TLS** for your domain (HTTPS)
6. **Rotate secrets regularly** (every 90 days recommended)
7. **Use environment-specific configs** (dev, staging, production)

---

## Support

If you encounter issues during deployment, check:
1. Server logs for error messages
2. Database connection status
3. API key validity (Google Cloud Console)
4. Email service status (Gmail/SendGrid)

For Manus-specific deployment questions, visit: https://help.manus.im

