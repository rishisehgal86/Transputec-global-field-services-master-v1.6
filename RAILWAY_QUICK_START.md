# Railway Deployment - Quick Start Checklist

Use this checklist to deploy your application to Railway in under 15 minutes.

---

## ⚡ 5-Minute Setup

### 1. Create Railway Account (2 min)
- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] Verify email

### 2. Create Project (1 min)
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `transputec-dispatch`

### 3. Add Database (1 min)
- [ ] Click "+ New"
- [ ] Select "Database" → "MySQL"
- [ ] Wait for provisioning (~30 seconds)

### 4. Configure Environment Variables (1 min)
- [ ] Click on your app service (not database)
- [ ] Go to "Variables" tab
- [ ] Add these REQUIRED variables:

```
DATABASE_URL=${{MySQL.DATABASE_URL}}
JWT_SECRET=<run: openssl rand -base64 32>
NODE_ENV=production
```

**Optional but recommended:**
```
VITE_APP_TITLE=Transputec Dispatch
ADMIN_EMAIL=your-email@domain.com
```

---

## 🚀 Deploy (5 min)

### 5. Trigger Deployment
- [ ] Railway auto-deploys on project creation
- [ ] Go to "Deployments" tab
- [ ] Watch build logs (takes ~3-5 minutes)

### 6. Get Your URL
- [ ] Go to "Settings" → "Networking"
- [ ] Click "Generate Domain"
- [ ] Copy the URL: `your-app.up.railway.app`

### 7. Run Database Migrations

**Option A: Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link
railway run pnpm db:push
```

**Option B: Railway Dashboard**
- [ ] Click "..." menu → "Shell"
- [ ] Run: `pnpm db:push`

---

## ✅ Verify (2 min)

### 8. Test Your Deployment
- [ ] Open your Railway URL
- [ ] Homepage loads ✅
- [ ] Login works ✅
- [ ] No errors in logs ✅

---

## 🎉 Done!

Your application is live at: `https://your-app.up.railway.app`

---

## 📋 Full Configuration (Optional)

For production deployment with all features, add these variables:

### Stripe (if using payments)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Google Places API (if using)
```
GOOGLE_PLACES_API_KEY=...
```

### Manus OAuth (if using)
```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=...
OWNER_OPEN_ID=...
OWNER_NAME=...
```

### Email/SMTP (if using)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

---

## 🔧 Post-Deployment Tasks

### Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.up.railway.app/api/stripe/webhook`
3. Copy webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` in Railway

### Configure OAuth Redirects
1. Go to your OAuth provider dashboard
2. Add redirect URL: `https://your-app.up.railway.app/api/oauth/callback`
3. Add allowed origin: `https://your-app.up.railway.app`

### Set Up Custom Domain (Optional)
1. Railway Settings → Networking
2. Click "Add Custom Domain"
3. Enter: `dispatch.yourdomain.com`
4. Add CNAME record to your DNS

---

## 💡 Tips

**Monitoring:**
- Check logs: Deployments → View Logs
- Check metrics: Observability tab

**Scaling:**
- Settings → Resources
- Increase memory/CPU as needed
- Start with 1GB RAM

**Costs:**
- Free: $5/month credit
- Typical usage: $10-20/month
- Monitor: Dashboard shows usage

---

## 🆘 Common Issues

**Build fails:**
- Check build logs for errors
- Verify all dependencies in package.json
- Increase build memory in Settings

**App crashes:**
- Check runtime logs
- Verify DATABASE_URL is set
- Verify JWT_SECRET is set
- Run migrations: `railway run pnpm db:push`

**Can't connect to database:**
- Verify MySQL service is running
- Check DATABASE_URL format
- Restart both services

---

## 📚 Need More Help?

- **Full Guide:** See `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Environment Template:** See `.env.railway.template`
- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway

---

**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy  
**Cost:** Free (with $5 credit)

