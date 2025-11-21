# Railway Deployment Fixes

## Issues Encountered and Resolved

### Issue 1: Static Assets Returning 404
**Problem:** JavaScript and CSS files in `/assets/` were returning 404 errors, causing blank page.

**Root Cause:** The catch-all route `app.use("*", ...)` in `server/_core/vite.ts` was intercepting ALL requests, including static asset requests. When browsers requested `/assets/index-CujJfG4P.js`, they received HTML content (index.html) instead of JavaScript.

**Fix (Commit fb50597):**
Modified the catch-all route to skip asset requests:
```javascript
app.use("*", (req, res, next) => {
  // Don't intercept asset requests
  if (req.path.startsWith('/assets/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  res.sendFile(path.resolve(distPath, "index.html"));
});
```

### Issue 2: Runtime Error - "undefined/app-auth" Cannot Be Parsed as URL
**Problem:** Application showed error page with `TypeError: "undefined/app-auth" cannot be parsed as a URL`.

**Root Cause:** The `getLoginUrl()` function in `client/src/const.ts` was trying to construct an OAuth URL using `VITE_OAUTH_PORTAL_URL` environment variable, which is undefined in Railway. This legacy OAuth code was still present even though the app uses local authentication (email/password).

**Fix (Commit f76c7e1):**
Simplified `getLoginUrl()` to redirect to local login page:
```javascript
export const getLoginUrl = () => {
  return "/login";
};
```

## Deployment Configuration

### Railway Environment Variables Required
The following environment variables must be set in Railway:

**Database:**
- `DATABASE_URL` - MySQL/TiDB connection string

**Authentication:**
- `JWT_SECRET` - Session cookie signing secret

**Email (Gmail SMTP):**
- `SMTP_HOST` - smtp.gmail.com
- `SMTP_PORT` - 587
- `SMTP_USER` - admin@field-pulse.io
- `SMTP_PASS` - Gmail app password

**Stripe (if using subscriptions):**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_ENTERPRISE_PRICE_ID`

**Google Places API (for geocoding):**
- `GOOGLE_PLACES_API_KEY`

**Application Settings:**
- `PORT` - 8080 (Railway sets this automatically)
- `NODE_ENV` - production

### Build Configuration
- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start`
- **Port:** 8080

### Dockerfile
The Dockerfile is configured to:
1. Install pnpm
2. Copy package files and patches directory
3. Install dependencies with `pnpm install --frozen-lockfile`
4. Copy application code
5. Build with `pnpm build`
6. Start with `pnpm start`

## Testing Checklist

After deployment, verify:
- [ ] Application loads without errors
- [ ] Login page displays at `/login`
- [ ] Can log in with super admin credentials
- [ ] Admin dashboard loads
- [ ] Can create jobs
- [ ] Can create projects
- [ ] Email notifications work
- [ ] Maps display correctly
- [ ] File uploads work

## Known Issues

### TypeScript Errors (Non-blocking)
There are 21 TypeScript errors in the codebase, primarily in:
- `server/stripe-webhook.ts`
- `server/test-subscription-update.ts`

These are related to function signature mismatches but do not affect runtime functionality.

### Checkpoint Creation Fails
The `webdev_save_checkpoint` command fails during the Vite build process due to memory constraints. This is a known limitation and does not affect the Railway deployment, which uses its own build process.

## Deployment History

1. **Initial Deployment** - Application deployed but showed blank page
2. **Fix 1 (fb50597)** - Fixed static asset serving
3. **Fix 2 (f76c7e1)** - Fixed getLoginUrl OAuth error
4. **Current Status** - Awaiting verification

## Contact

For issues or questions, contact the development team.

