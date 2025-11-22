# Trial & Account Suspension System

## Overview

The system implements a 14-day free trial with automatic account suspension for expired trials and cancelled subscriptions. Users can self-reactivate by upgrading to a paid plan.

---

## Trial Flow

### 1. New Organization Creation

When a new organization is created:
- `trialEndsAt` is set to **14 days from creation**
- `subscriptionStatus` = `'trial'`
- `planTier` = `'trial'`
- `monthlyJobLimit` = 50
- `maxAdminUsers` = 1
- `isActive` = `true`

### 2. During Trial Period

**Days 14-8 remaining:** No banner shown

**Days 7-1 remaining:** Trial countdown banner appears at top of dashboard
- Shows days remaining
- "Upgrade Now" button links to billing page
- Banner becomes red/urgent when ≤3 days remaining

**Day 0 (Expiry Day):** Banner shows "Your trial expires today!"

### 3. After Trial Expiry

**Automatic Process (runs daily):**
- Cron job checks for `trialEndsAt < now` AND `subscriptionStatus = 'trial'` AND `isActive = true`
- Sets `isActive = false`
- Sets `subscriptionStatus = 'expired'`

**User Experience:**
- User can still login
- All content is greyed out and blurred
- Disabled account overlay appears with upgrade options
- User can click "Choose Scale" or "Choose Professional" to upgrade
- Upon successful payment, account is automatically reactivated

---

## Account Suspension (Cancelled Subscriptions)

### When User Cancels Subscription

1. **Immediate Effect:**
   - `cancelAtPeriodEnd` = `true`
   - Account remains active until billing period ends
   - UI shows "Cancels [date]" badge

2. **After Billing Period Ends:**
   - Stripe fires `subscription.deleted` webhook
   - `isActive` = `false`
   - `subscriptionStatus` = `'cancelled'`
   - `monthlyJobLimit` = 0
   - `maxAdminUsers` = 0

3. **User Experience:**
   - Same as expired trial: greyed out content + upgrade overlay
   - User can self-reactivate by choosing a plan

---

## Self-Service Reactivation

### How It Works

1. **User logs into disabled account**
2. **Sees disabled overlay** with two plan options:
   - Scale Plan ($99/mo): 100 jobs, 3 admins
   - Professional Plan ($399/mo): Unlimited

3. **Clicks "Choose [Plan]"**
   - Creates Stripe checkout session
   - Redirects to Stripe payment page

4. **After successful payment:**
   - Stripe fires `subscription.created` webhook
   - Webhook handler calls `updateOrganizationSubscription` with `isActive: true`
   - Account is immediately reactivated
   - User gains full access

---

## Technical Implementation

### Backend Components

**`server/trial-manager.ts`**
- `isTrialExpired(organizationId)` - Check if trial has expired
- `getTrialDaysRemaining(organizationId)` - Calculate days left
- `disableExpiredTrials()` - Disable all expired trials (cron job)
- `getTrialStatus(organizationId)` - Get complete trial status

**`server/cron/disable-expired-trials.ts`**
- Daily cron job that calls `disableExpiredTrials()`
- Should be scheduled to run at midnight UTC

**`server/routers.ts`**
- `subscription.getStatus` - Returns trial status + account active state
- Includes `trial.isOnTrial`, `trial.daysRemaining`, `trial.isExpired`, `isActive`

**`server/stripe-webhook.ts`**
- `handleSubscriptionCreated` - Sets `isActive: true` on new subscription
- `handleSubscriptionDeleted` - Sets `isActive: false` on cancellation

### Frontend Components

**`client/src/components/AccountStatusWrapper.tsx`**
- Wraps entire app
- Checks account status on every page load
- Shows trial banner OR disabled overlay based on status

**`client/src/components/TrialCountdownBanner.tsx`**
- Sticky banner at top of page
- Shows days remaining when ≤7 days
- Becomes urgent (red) when ≤3 days

**`client/src/components/DisabledAccountOverlay.tsx`**
- Full-screen modal overlay
- Greys out and blurs background content
- Shows pricing cards with upgrade buttons
- Handles checkout session creation

---

## Cron Job Setup

### Railway Deployment

Add to `railway.toml`:

```toml
[[services]]
name = "disable-expired-trials"
schedule = "0 0 * * *"  # Run daily at midnight UTC
command = "npx tsx server/cron/disable-expired-trials.ts"
```

### Manual Testing

```bash
# Run the cron job manually
npx tsx server/cron/disable-expired-trials.ts
```

---

## Database Schema

### Organizations Table

```sql
trialEndsAt TIMESTAMP NULL          -- When trial expires (14 days from creation)
subscriptionStatus ENUM             -- 'trial', 'active', 'past_due', 'cancelled', 'expired'
isActive BOOLEAN NOT NULL           -- false = account disabled
planTier ENUM                       -- 'trial', 'starter', 'enterprise'
monthlyJobLimit INT                 -- 50 for trial, 100 for starter, -1 for enterprise
maxAdminUsers INT                   -- 1 for trial, 3 for starter, -1 for enterprise
cancelAtPeriodEnd BOOLEAN           -- true when user cancels (before period ends)
```

---

## Testing Checklist

### Trial Expiry Flow

- [ ] Create new organization → verify `trialEndsAt` is 14 days out
- [ ] Manually set `trialEndsAt` to 7 days from now → verify banner appears
- [ ] Set `trialEndsAt` to yesterday → run cron job → verify account disabled
- [ ] Login to disabled account → verify greyed out overlay
- [ ] Click upgrade → complete payment → verify account reactivated

### Cancellation Flow

- [ ] Active subscription → cancel → verify `cancelAtPeriodEnd = true`
- [ ] Manually trigger `subscription.deleted` webhook → verify account disabled
- [ ] Login to disabled account → verify overlay shows
- [ ] Upgrade → verify account reactivated

### Edge Cases

- [ ] User with active subscription doesn't see trial banner
- [ ] Trial countdown only shows when ≤7 days remaining
- [ ] Disabled account can still login (not locked out completely)
- [ ] Reactivation works for both expired trials AND cancelled subscriptions

---

## Monitoring

### Key Metrics to Track

1. **Trial Conversion Rate**
   - % of trials that convert to paid within 14 days

2. **Trial Expiry Rate**
   - % of trials that expire without converting

3. **Reactivation Rate**
   - % of disabled accounts that self-reactivate

4. **Time to Reactivation**
   - How long after disabling do users reactivate

### Database Queries

```sql
-- Count active trials
SELECT COUNT(*) FROM organizations 
WHERE subscriptionStatus = 'trial' AND isActive = true;

-- Count expired trials (disabled)
SELECT COUNT(*) FROM organizations 
WHERE subscriptionStatus = 'expired' AND isActive = false;

-- Count cancelled accounts (disabled)
SELECT COUNT(*) FROM organizations 
WHERE subscriptionStatus = 'cancelled' AND isActive = false;

-- Find trials expiring in next 7 days
SELECT * FROM organizations 
WHERE subscriptionStatus = 'trial' 
AND isActive = true 
AND trialEndsAt BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);
```

---

## Future Enhancements

1. **Email Notifications**
   - Send email at 7 days, 3 days, 1 day, and expiry
   - Include upgrade link in email

2. **Grace Period**
   - Allow 3-day grace period after expiry before disabling
   - Show "Grace period: X days remaining" banner

3. **Trial Extension**
   - Admin ability to extend trial for specific organizations
   - Add `trialExtensionDays` field

4. **Reactivation Incentives**
   - Offer discount for immediate reactivation
   - Track "days since disabled" and show urgency

5. **Usage-Based Trials**
   - End trial early if user hits job limit
   - Encourage upgrade before time limit

