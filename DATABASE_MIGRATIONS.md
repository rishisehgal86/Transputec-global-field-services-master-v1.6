# Database Migrations

## ⚠️ CRITICAL: Database Safety

This project has **TWO** database scripts with very different purposes:

### 🟢 SAFE: `pnpm db:migrate` (Production-Safe)

**Script:** `scripts/migrate-safe.mjs`

**Purpose:** Add missing columns to existing tables WITHOUT dropping data

**Safe for:** ✅ Production, ✅ Development, ✅ Testing

**What it does:**
- Checks if columns already exist before adding them
- Uses `ALTER TABLE ADD COLUMN` commands
- **NEVER drops tables or deletes data**
- Idempotent (safe to run multiple times)

**When to use:**
- Adding new columns to existing tables
- Running migrations on production
- Updating schema without data loss

**Example:**
```bash
pnpm db:migrate
```

---

### 🔴 DESTRUCTIVE: `pnpm db:reset` (NEVER USE ON PRODUCTION!)

**Script:** `scripts/create-tables.mjs`

**Purpose:** Drop ALL tables and recreate from scratch

**Safe for:** ❌ Production, ✅ Local development only

**What it does:**
- **DROPS ALL TABLES** (lines 220-246)
- **DELETES ALL DATA**
- Recreates tables from scratch
- Used for initial setup or complete reset

**When to use:**
- Initial local development setup
- Resetting local test database
- **NEVER on production or staging**

**Example:**
```bash
# ⚠️ WARNING: This will DELETE ALL DATA!
pnpm db:reset
```

---

## Migration History

### 2025-11-22: Add cancelAtPeriodEnd column

**Migration:** `migrate-safe.mjs`

**Changes:**
- Added `cancelAtPeriodEnd BOOLEAN NOT NULL DEFAULT FALSE` to `organizations` table
- Tracks Stripe's `cancel_at_period_end` flag for subscription cancellations

**Reason:**
- Support subscription cancellation tracking
- Show users when their subscription will end
- Properly handle account closure after billing period

---

## How to Add New Migrations

1. **Edit `scripts/migrate-safe.mjs`**
2. **Add a new migration object to the `migrations` array:**

```javascript
{
  name: 'Add yourColumn to yourTable',
  check: async (connection) => {
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM yourTable LIKE 'yourColumn'"
    );
    return columns.length > 0;
  },
  migrate: async (connection) => {
    await connection.execute(
      'ALTER TABLE yourTable ADD COLUMN yourColumn VARCHAR(255) NULL'
    );
  },
},
```

3. **Test locally first:**
```bash
pnpm db:migrate
```

4. **Deploy to production** (Railway will run migrations automatically)

---

## Production Deployment Checklist

Before deploying schema changes:

- [ ] Test migration locally
- [ ] Verify migration is idempotent (can run multiple times safely)
- [ ] Update `drizzle/schema.ts` to match new schema
- [ ] Add migration to `scripts/migrate-safe.mjs`
- [ ] Commit both schema and migration script
- [ ] Deploy to production
- [ ] Verify migration ran successfully in Railway logs

---

## Emergency Rollback

If a migration fails in production:

1. **Check Railway logs** for the specific error
2. **DO NOT run `db:reset`** - it will delete all data
3. **Fix the migration script** to handle the error case
4. **Redeploy** with the fixed migration
5. **Or manually fix** using Railway's database console

---

## Database Schema Source of Truth

**Primary:** `drizzle/schema.ts`

**Migration Scripts:** `scripts/migrate-safe.mjs`

Always keep both in sync!

