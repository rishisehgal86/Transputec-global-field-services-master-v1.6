# Railway Deployment Guide for FieldPulse Go

This guide will walk you through deploying your FieldPulse Go application to Railway.

## Why Railway?

Railway is perfect for your full-stack Express + tRPC application because:
- ✅ Supports long-running Node.js servers (no serverless limitations)
- ✅ Includes MySQL database hosting
- ✅ $5/month free credit (enough for testing and small production)
- ✅ No code refactoring required
- ✅ Simple deployment process
- ✅ Automatic HTTPS and custom domains

---

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app) (free)
3. **Environment Variables** - You'll need the values from `vercel-env-variables.txt`

---

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. Authorize Railway to access your repositories

---

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `fieldpulsegoSAAS` (or whatever you named it)
4. Select the `main` branch

Railway will automatically detect the Dockerfile and start building.

---

## Step 3: Add MySQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"MySQL"**
4. Railway will provision a MySQL database and generate connection details

---

## Step 4: Configure Environment Variables

### Get Database URL

1. Click on the **MySQL service** in your Railway project
2. Go to the **"Variables"** tab
3. Copy the `DATABASE_URL` value (looks like: `mysql://user:password@host:port/database`)

### Add All Environment Variables

Click on your **web service** (not the database), go to **"Variables"** tab, and add these:

#### Required Variables

```
DATABASE_URL=<copy from MySQL service>
JWT_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=production
PORT=3000
```

#### Manus OAuth (if using Manus auth)

```
VITE_APP_ID=<your app ID>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=<your owner open ID>
OWNER_NAME=<your name>
BUILT_IN_FORGE_API_URL=<your forge API URL>
BUILT_IN_FORGE_API_KEY=<your forge API key>
VITE_FRONTEND_FORGE_API_KEY=<your frontend forge key>
```

#### Stripe Configuration

```
STRIPE_SECRET_KEY=<your Stripe secret key>
STRIPE_PUBLISHABLE_KEY=<your Stripe publishable key>
VITE_STRIPE_PUBLISHABLE_KEY=<your Stripe publishable key>
STRIPE_WEBHOOK_SECRET=<your Stripe webhook secret>
STRIPE_STARTER_PRICE_ID=<your starter plan price ID>
STRIPE_ENTERPRISE_PRICE_ID=<your enterprise plan price ID>
```

#### Email Configuration (Gmail SMTP)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your Gmail address>
SMTP_PASS=<your Gmail app password>
ADMIN_EMAIL=<admin email address>
```

#### Optional: Google Places API

```
GOOGLE_PLACES_API_KEY=<your Google Places API key>
```

#### Application Branding

```
VITE_APP_TITLE=FieldPulse Go
VITE_APP_LOGO=<your logo URL>
```

---

## Step 5: Deploy

1. After adding all environment variables, Railway will automatically redeploy
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, Railway will provide a public URL like: `https://your-app.up.railway.app`

---

## Step 6: Run Database Migrations

After first deployment, you need to create the database tables:

### Option A: Using Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run pnpm db:push
   ```

### Option B: Using Railway Dashboard

1. Go to your web service in Railway dashboard
2. Click on **"Deployments"** tab
3. Find the latest deployment
4. Click **"View Logs"**
5. Click **"Run Command"**
6. Enter: `pnpm db:push`

---

## Step 7: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your Railway URL + `/api/stripe/webhook`:
   ```
   https://your-app.up.railway.app/api/stripe/webhook
   ```
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret**
6. Add it to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Step 8: Test Your Deployment

1. Visit your Railway URL: `https://your-app.up.railway.app`
2. Test login functionality
3. Create a test job
4. Verify Stripe billing works
5. Check email notifications

---

## Step 9: Add Custom Domain (Optional)

1. In Railway dashboard, go to your web service
2. Click **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"** for a free Railway subdomain
5. Or click **"Custom Domain"** to add your own domain

---

## Monitoring and Logs

### View Logs
1. Go to your web service in Railway
2. Click **"Deployments"** tab
3. Click on any deployment to see logs

### Monitor Resources
1. Click **"Metrics"** tab to see:
   - CPU usage
   - Memory usage
   - Network traffic

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Make sure all dependencies are in `package.json`
- Run: `pnpm install` locally to verify

**Error: "TypeScript errors"**
- Solution: These are warnings, build should still succeed
- Or fix TypeScript errors in code

### Database Connection Fails

**Error: "ECONNREFUSED" or "Access denied"**
- Solution: Check `DATABASE_URL` is correctly copied from MySQL service
- Make sure MySQL service is running

### Application Crashes

**Error: "Port already in use"**
- Solution: Railway sets `PORT` automatically, make sure your app uses `process.env.PORT`

**Error: "Missing environment variable"**
- Solution: Check all required variables are set in Railway dashboard

---

## Cost Estimate

Railway pricing (as of 2024):
- **Free tier**: $5/month credit
- **Usage-based**: ~$0.000463/GB-hour for compute
- **MySQL database**: ~$0.50-2/month for small database

**Estimated monthly cost for small production app:**
- Web service: ~$3-5/month
- MySQL database: ~$1-2/month
- **Total: ~$4-7/month** (covered by free $5 credit for testing)

---

## Scaling

As your app grows:

1. **Vertical Scaling** (more resources per instance)
   - Go to Settings → Change instance size

2. **Horizontal Scaling** (multiple instances)
   - Railway Pro plan required ($20/month)
   - Add replicas in Settings

3. **Database Scaling**
   - Upgrade MySQL instance size
   - Or migrate to external database (PlanetScale, AWS RDS)

---

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Status**: [status.railway.app](https://status.railway.app)

---

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring/alerts
3. ✅ Configure backup strategy for database
4. ✅ Add custom domain
5. ✅ Set up CI/CD for automatic deployments
6. ✅ Review security settings
7. ✅ Enable SSL/HTTPS (automatic on Railway)

---

## Quick Reference Commands

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
```

---

**Your app is now live on Railway! 🚀**

Visit your deployment URL and start using FieldPulse Go in production.

