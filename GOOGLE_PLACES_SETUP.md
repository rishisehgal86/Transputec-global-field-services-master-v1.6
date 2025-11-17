# Google Places API Setup Guide

This application uses **Google Places API** for high-accuracy geocoding and address search. If the API key is not configured, the system automatically falls back to the free OpenStreetMap Nominatim service.

## Why Use Google Places API?

**Benefits:**
- **Better accuracy** - Same quality as Google Maps
- **More address options** - Comprehensive global coverage
- **Faster results** - Lower latency than OpenStreetMap
- **Better international support** - Handles non-English addresses better

**Costs:**
- **Free tier**: $200 credit per month (~11,700 geocoding requests)
- **Pricing**: $0.017 per geocoding request after free tier
- Most small-to-medium deployments stay within free tier

## Setup Instructions

### Step 1: Create Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Accept the terms of service

### Step 2: Create a New Project

1. Click the project dropdown at the top
2. Click "New Project"
3. Enter project name (e.g., "Transputec Dispatch")
4. Click "Create"

### Step 3: Enable Billing

1. Go to **Billing** in the left menu
2. Click "Link a billing account"
3. Follow the prompts to add a credit card
   - **Note**: You won't be charged unless you exceed the $200/month free tier
   - Set up billing alerts to avoid unexpected charges

### Step 4: Enable Geocoding API

1. Go to **APIs & Services** → **Library**
2. Search for "Geocoding API"
3. Click on "Geocoding API"
4. Click "Enable"

### Step 5: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "API Key"
3. Copy the API key (it will look like: `AIzaSyB1234567890abcdefghijklmnopqrstu`)

### Step 6: Restrict API Key (Recommended)

For security, restrict the API key:

1. Click on the API key you just created
2. Under "API restrictions":
   - Select "Restrict key"
   - Check only "Geocoding API"
3. Under "Application restrictions":
   - Select "IP addresses"
   - Add your server's IP address
4. Click "Save"

### Step 7: Add API Key to Your Project

#### Option A: Via Management UI (Recommended)

1. Log in to your Transputec Dispatch application
2. Go to **Settings** → **Secrets** (in the Management UI panel)
3. Click "Add Secret"
4. Enter:
   - **Key**: `GOOGLE_PLACES_API_KEY`
   - **Value**: Your API key from Step 5
5. Click "Save"

#### Option B: Via Environment Variable

If you're self-hosting or developing locally:

```bash
# Add to your .env file
GOOGLE_PLACES_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstu
```

### Step 8: Verify It's Working

1. Go to **Projects** → Select a project → **Sites**
2. Try uploading a site or manually adding a site
3. The geocoding should now use Google Places API
4. Check the browser console - you should see fewer "falling back to OpenStreetMap" warnings

## Monitoring Usage

### Check API Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Dashboard**
4. Click on "Geocoding API"
5. View request counts and quotas

### Set Up Billing Alerts

1. Go to **Billing** → **Budgets & alerts**
2. Click "Create Budget"
3. Set budget amount (e.g., $50/month)
4. Set alert threshold (e.g., 50%, 90%, 100%)
5. Add your email for notifications

## Troubleshooting

### "Google Places API failed, falling back to OpenStreetMap"

**Possible causes:**
1. **API key not set** - Add the key via Settings → Secrets
2. **API not enabled** - Enable "Geocoding API" in Google Cloud Console
3. **Billing not enabled** - Link a billing account
4. **API key restricted** - Check IP restrictions in Google Cloud Console
5. **Quota exceeded** - Check usage in Google Cloud Console

### Check if Google Places is Active

Look for these log messages in the server console:

```
✅ Using Google Places API for geocoding
❌ Google Places API failed, falling back to OpenStreetMap
```

### Still Using OpenStreetMap?

If the system is still using OpenStreetMap:

1. Verify the API key is set: Check Settings → Secrets for `GOOGLE_PLACES_API_KEY`
2. Restart the application after adding the key
3. Check server logs for error messages
4. Verify the API key works by testing it directly:

```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY"
```

## Cost Optimization

### Tips to Stay Within Free Tier

1. **Cache results** - The system already caches site coordinates in the database
2. **Batch uploads** - Upload multiple sites at once via Excel instead of one-by-one
3. **Use existing sites** - Reuse sites across multiple jobs instead of creating duplicates
4. **Manual coordinates** - For frequently-used sites, manually set coordinates via map

### Estimated Usage

- **10 sites/day** = ~300 requests/month = **FREE**
- **50 sites/day** = ~1,500 requests/month = **FREE**
- **100 sites/day** = ~3,000 requests/month = **FREE**
- **400 sites/day** = ~12,000 requests/month = **~$4/month**

## Fallback Behavior

If Google Places API is unavailable (no API key, quota exceeded, or API error), the system automatically falls back to **OpenStreetMap Nominatim** (free, no API key required).

**Fallback limitations:**
- Less accurate for some addresses
- Slower response times
- Fewer international results
- Rate limited (1 request/second)

## Support

For issues with:
- **Google Cloud billing/setup**: Contact Google Cloud Support
- **Application integration**: Submit a ticket at https://help.manus.im
- **Geocoding accuracy**: Try both Google Places and OpenStreetMap to compare results

---

**Last Updated**: November 2025

