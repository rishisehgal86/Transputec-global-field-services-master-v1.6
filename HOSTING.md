# Hosting Configuration Guide

This document explains how to properly host the FieldPulse Go Field Engineer Dispatch Transputec Field Engineer Dispatch & Tracking Tracking application on various platforms.

## Important: Single Page Application (SPA) Routing

This is a React Single Page Application that uses client-side routing. **All routes must be redirected to `index.html`** so the React router can handle them.

---

## Quick Fix for Login Redirect Issue

If you're experiencing issues where login redirects to a 404 page, your hosting platform needs to be configured to handle SPA routing.

---

## Hosting Platform Configurations

### 1. **Netlify**

Netlify automatically detects the `_redirects` file in the `client/public` directory.

**File:** `client/public/_redirects` (already included)
```
/*    /index.html   200
```

**Deploy Command:**
```bash
pnpm build
```

**Publish Directory:** `client/dist`

---

### 2. **Vercel**

Vercel uses `vercel.json` for configuration (already included in root).

**File:** `vercel.json` (already included)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Deploy:** Connect your GitHub repository to Vercel, it will auto-detect the configuration.

---

### 3. **Apache Server**

For Apache hosting (cPanel, shared hosting, VPS with Apache), use the `.htaccess` file.

**File:** `client/public/.htaccess` (already included)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**Important:** Make sure `mod_rewrite` is enabled on your Apache server.

---

### 4. **Nginx**

Add this to your Nginx configuration file (usually in `/etc/nginx/sites-available/your-site`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if backend is on different port)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 5. **Node.js/Express Server**

If you're running the full-stack app with the included Express server:

**The server is already configured correctly** in `server/_core/index.ts` to serve the React app and handle SPA routing.

Just run:
```bash
pnpm build
pnpm start
```

The server will:
1. Serve API endpoints at `/api/*`
2. Serve static files from `client/dist`
3. Redirect all other requests to `index.html`

---

### 6. **Docker**

Example `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build frontend
RUN pnpm build

# Expose port
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
```

---

## Environment Variables

Make sure these are set on your hosting platform:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-here

# Super Admin
SUPER_ADMIN_EMAIL=admin@transputec.com
SUPER_ADMIN_PASSWORD=Admin@123

# Email
ADMIN_EMAIL=admin@transputec.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Branding
VITE_APP_TITLE=FieldPulse Go Field Engineer Dispatch Transputec Field Engineer Dispatch & Tracking Tracking
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

---

## Testing the Fix

After configuring your hosting platform:

1. **Clear browser cache** or test in incognito mode
2. Go to `/login`
3. Enter credentials: `admin@transputec.com` / `Admin@123`
4. Click "Sign In"
5. You should be redirected to `/admin` (Admin Dashboard)

If you still see a 404 page, check your server logs and ensure the SPA routing configuration is active.

---

## Common Issues

### Issue: "Cannot GET /admin" or 404 after login

**Cause:** Server is not configured to handle SPA routing

**Solution:** Apply the appropriate configuration file for your hosting platform (see above)

### Issue: API calls failing

**Cause:** CORS or proxy configuration

**Solution:** 
- For separate frontend/backend deployments, configure CORS in `server/_core/index.ts`
- For same-domain deployment, ensure API proxy is configured correctly

### Issue: Environment variables not loading

**Cause:** Variables not set in hosting platform

**Solution:** Add all required environment variables in your hosting platform's dashboard

---

## Support

For hosting-specific issues, please refer to your hosting provider's documentation:
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [AWS Amplify](https://docs.amplify.aws/)

