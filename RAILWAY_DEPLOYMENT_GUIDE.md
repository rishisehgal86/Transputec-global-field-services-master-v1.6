# Railway Deployment Guide - Complete Step-by-Step

This guide will walk you through deploying your Transputec Field Engineer Dispatch application to Railway.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ A Railway account (sign up at https://railway.app)
2. ✅ Git installed on your local machine
3. ✅ Railway CLI installed (optional, but recommended)
4. ✅ Your project code ready

---

## 🚀 Deployment Steps

### Step 1: Create Railway Account & Project

1. **Sign up for Railway:**
   - Go to https://railway.app
   - Click "Login" and sign up with GitHub (recommended)
   - Verify your email address

2. **Create a new project:**
   - Click "New Project" on Railway dashboard
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub account
   - Select your repository: `transputec-dispatch`

### Step 2: Add MySQL Database

1. **Add database service:**
   - In your Railway project, click "+ New"
   - Select "Database" → "Add MySQL"
   - Railway will automatically provision a MySQL database

2. **Note the connection details:**
   - Click on the MySQL service
   - Go to "Variables" tab
   - You'll see: `MYSQL_URL`, `MYSQL_HOST`, `MYSQL_PORT`, etc.
   - Railway automatically injects these as environment variables

### Step 3: Configure Environment Variables

1. **Click on your application service** (not the database)

2. **Go to "Variables" tab**

3. **Add the following variables** (click "+ New Variable" for each):

#### Required System Variables

```
DATABASE_URL=${{MySQL.DATABASE_URL}}
```
*Note: Railway auto-references the MySQL service*

#### JWT & Authentication
```
JWT_SECRET=<generate-a-random-32-character-string>
```
*Generate with: `openssl rand -base64 32`*

#### Manus OAuth (if using Manus auth)
```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=<your-manus-app-id>
OWNER_OPEN_ID=<your-owner-openid>
OWNER_NAME=<your-name>
```

#### Application Settings
```
VITE_APP_TITLE=Transputec Dispatch
VITE_APP_LOGO=<your-logo-url>
NODE_ENV=production
PORT=3000
```

#### Stripe (if using Stripe)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

#### Google Places API (if using)
```
GOOGLE_PLACES_API_KEY=<your-google-api-key>
```

#### Email (if using SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
SMTP_FROM=<from-email>
```

#### Admin Contact
```
ADMIN_EMAIL=<your-admin-email>
```

### Step 4: Configure Build Settings

Railway will automatically detect your `railway.json` and `Dockerfile`. Verify the configuration:

1. **Check Build Settings:**
   - Go to "Settings" tab
   - Under "Build", verify:
     - Builder: **Dockerfile**
     - Dockerfile Path: **Dockerfile**

2. **Check Deploy Settings:**
   - Start Command: **pnpm start**
   - Restart Policy: **ON_FAILURE**
   - Max Retries: **10**

### Step 5: Deploy

1. **Trigger deployment:**
   - Railway automatically deploys on push to main branch
   - Or click "Deploy" button manually

2. **Monitor the build:**
   - Click on "Deployments" tab
   - Watch the build logs in real-time
   - Build takes ~3-5 minutes

3. **Check for errors:**
   - If build fails, check the logs
   - Common issues:
     - Missing environment variables
     - Database connection errors
     - Build timeouts (increase in Settings)

### Step 6: Get Your Domain

1. **Generate Railway domain:**
   - Go to "Settings" tab
   - Under "Networking", click "Generate Domain"
   - You'll get: `your-app-name.up.railway.app`

2. **Or add custom domain:**
   - Click "Add Custom Domain"
   - Enter your domain: `dispatch.yourdomain.com`
   - Add the CNAME record to your DNS:
     ```
     CNAME dispatch.yourdomain.com -> your-app.up.railway.app
     ```

### Step 7: Run Database Migrations

After first deployment, you need to run migrations:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run pnpm db:push
```

**Option B: Using Railway Dashboard**
1. Go to your service
2. Click "..." menu → "Shell"
3. Run: `pnpm db:push`

### Step 8: Verify Deployment

1. **Open your application:**
   - Click the generated domain URL
   - Your app should load

2. **Test key features:**
   - ✅ Homepage loads
   - ✅ Login works
   - ✅ Database connection works
   - ✅ API endpoints respond

3. **Check logs:**
   - Go to "Deployments" → "View Logs"
   - Verify no errors in production logs

---

## 🔧 Post-Deployment Configuration

### Configure Stripe Webhooks

If using Stripe, update your webhook endpoint:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.up.railway.app/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret
5. Update `STRIPE_WEBHOOK_SECRET` in Railway

### Configure OAuth Redirect URLs

If using Manus OAuth:

1. Go to Manus Dashboard
2. Update redirect URLs:
   - Add: `https://your-app.up.railway.app/api/oauth/callback`
3. Update allowed origins:
   - Add: `https://your-app.up.railway.app`

### Set Up Monitoring

1. **Enable Railway metrics:**
   - Go to "Observability" tab
   - View CPU, Memory, Network usage

2. **Set up alerts (optional):**
   - Install Railway CLI
   - Configure alert webhooks

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your main branch:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically:
# 1. Detects the push
# 2. Builds the Docker image
# 3. Runs tests (if configured)
# 4. Deploys to production
# 5. Switches traffic to new version
```

---

## 📊 Scaling & Performance

### Vertical Scaling (More Resources)

1. Go to "Settings" → "Resources"
2. Adjust:
   - **Memory:** 512MB to 8GB
   - **CPU:** Shared to Dedicated
   - **Replicas:** 1 to 10+

### Horizontal Scaling (More Instances)

1. Go to "Settings" → "Scaling"
2. Increase replica count
3. Railway automatically load balances

### Recommended Settings for Production

```
Memory: 1GB (start) → 2GB (growth)
CPU: Shared (start) → 2 vCPU (growth)
Replicas: 1 (start) → 2-3 (high availability)
```

---

## 💰 Pricing

### Free Tier
- $5 credit per month
- Shared resources
- Perfect for testing

### Paid Plans
- **Developer:** $20/month
  - $20 credit included
  - Additional usage: $0.000231/GB-hour
- **Team:** $20/user/month
  - Collaboration features
  - Priority support

### Estimated Costs

| Usage Level | Monthly Cost |
|------------|--------------|
| Development/Testing | $0 (free tier) |
| Small Production (1GB, 1 replica) | ~$10-15 |
| Medium Production (2GB, 2 replicas) | ~$30-40 |
| Large Production (4GB, 3 replicas) | ~$80-100 |

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Killed" or "Out of memory"**
- Solution: Increase build memory in Settings → Resources
- Or optimize build (already done in your project)

**Error: "Module not found"**
- Solution: Verify `pnpm-lock.yaml` is committed
- Run: `pnpm install` locally and commit lockfile

### Runtime Errors

**Error: "Cannot connect to database"**
- Check: `DATABASE_URL` environment variable
- Verify: MySQL service is running
- Check: Database migrations ran successfully

**Error: "Port already in use"**
- Railway automatically sets `PORT` env var
- Your app should use: `process.env.PORT || 3000`
- Already configured in your project

### Performance Issues

**Slow response times:**
- Check: Railway metrics for CPU/Memory usage
- Consider: Vertical scaling (more resources)
- Consider: Horizontal scaling (more replicas)

**Database slow:**
- Check: Database connection pooling
- Consider: Upgrading MySQL plan
- Consider: Adding Redis cache

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Railway's variable management
- ✅ Rotate secrets regularly
- ✅ Use different keys for dev/prod

### Database
- ✅ Use Railway's managed MySQL (automatic backups)
- ✅ Enable SSL connections (automatic)
- ✅ Restrict database access to Railway network

### Application
- ✅ Keep dependencies updated
- ✅ Enable HTTPS (automatic on Railway)
- ✅ Set secure session cookies
- ✅ Implement rate limiting

---

## 📚 Additional Resources

### Railway Documentation
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Your Project Files
- `Dockerfile` - Container configuration
- `railway.json` - Deployment settings
- `package.json` - Build scripts
- `.env.example` - Environment template

### Support
- Railway Discord: Best for deployment questions
- GitHub Issues: For code-related issues
- Email: For billing/account questions

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Stripe webhooks configured (if using)
- [ ] OAuth redirect URLs updated (if using)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Team members invited (if applicable)
- [ ] Production testing completed

---

## 🎉 Success!

Your application is now deployed on Railway with:

✅ Automatic HTTPS  
✅ Automatic deployments  
✅ Managed database  
✅ Scalable infrastructure  
✅ 99.9% uptime SLA  

**Next Steps:**
1. Test all features in production
2. Monitor logs and metrics
3. Set up custom domain
4. Configure backups
5. Invite team members

**Need help?** Join Railway Discord or check the docs!

---

## 📝 Quick Reference Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run command in production
railway run <command>

# Open dashboard
railway open

# Deploy manually
railway up

# Check status
railway status

# List services
railway service

# Environment variables
railway variables
```

---

**Deployment Guide Version:** 1.0  
**Last Updated:** November 21, 2025  
**Project:** Transputec Field Engineer Dispatch & Tracking

