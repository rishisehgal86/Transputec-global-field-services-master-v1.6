# Account Lifecycle & Deletion Policy

## Core Principle

**Accounts are NEVER automatically deleted. They are only suspended.**

Deletion is a manual, super-admin-only action with strict safeguards.

---

## Account States

### 1. Active
- `isActive = true`
- `subscriptionStatus = 'trial' | 'active'`
- Full access to all features
- Can create jobs, manage users, access all functionality

### 2. Suspended
- `isActive = false`
- `subscriptionStatus = 'expired' | 'cancelled'`
- Can login but cannot use features
- Sees greyed-out UI with upgrade overlay
- Can self-reactivate via subscription purchase

### 3. Deleted
- Record removed from database
- **PERMANENT** - cannot be undone
- All associated data deleted (users, jobs, projects)
- Only possible via super admin panel

---

## Suspension Triggers

### Automatic Suspension (No Deletion)

**1. Trial Expiry**
- **When:** 14 days after account creation
- **How:** Daily cron job (`disableExpiredTrials()`)
- **Action:** Sets `isActive = false`, `subscriptionStatus = 'expired'`
- **User Experience:** Login allowed, features blocked, upgrade overlay shown

**2. Subscription Cancellation**
- **When:** Billing period ends after user cancels
- **How:** Stripe `subscription.deleted` webhook
- **Action:** Sets `isActive = false`, `subscriptionStatus = 'cancelled'`, limits to 0
- **User Experience:** Login allowed, features blocked, upgrade overlay shown

**3. Payment Failure (Future)**
- **When:** Payment fails after retry attempts
- **How:** Stripe `invoice.payment_failed` webhook
- **Action:** Sets `isActive = false`, `subscriptionStatus = 'past_due'`
- **User Experience:** Login allowed, features blocked, payment update prompt

### Manual Suspension

**Super Admin Panel:**
- Navigate to `/admin/tenants`
- Click suspend icon (🚫) next to tenant
- Confirm suspension
- Sets `isActive = false` immediately

**Use Cases:**
- Policy violations
- Fraud detection
- Non-payment (manual intervention)
- Account under investigation

---

## Reactivation

### Self-Service Reactivation

**For Expired Trials & Cancelled Subscriptions:**
1. User logs into suspended account
2. Sees `DisabledAccountOverlay` with pricing cards
3. Clicks "Choose Scale" or "Choose Professional"
4. Completes Stripe checkout
5. `subscription.created` webhook fires
6. Sets `isActive = true` automatically
7. Full access restored immediately

**For Payment Failures:**
1. User logs in
2. Sees payment update prompt
3. Updates payment method in Stripe portal
4. Payment succeeds
5. Account reactivated automatically

### Admin Reactivation

**Super Admin Panel:**
- Navigate to `/admin/tenants`
- Click activate icon (✅) next to suspended tenant
- Account reactivated immediately
- User regains access

**Use Cases:**
- Resolving disputes
- Manual payment processing
- Policy violation resolved
- Investigation completed

---

## Deletion Policy

### Who Can Delete

**ONLY Super Admins**
- Role: `super_admin`
- Access: `/admin/tenants` page
- Verification: Must type tenant name to confirm

### Deletion Process

1. **Navigate to Tenant Management**
   - URL: `/admin/tenants`
   - Requires `super_admin` role

2. **Click Delete Button**
   - Red trash icon (🗑️) next to tenant
   - Opens confirmation dialog

3. **Confirmation Dialog**
   - Shows warning: "This action cannot be undone"
   - Displays tenant name in red
   - Requires typing exact tenant name
   - Shows tip: "Consider suspending instead"
   - Delete button disabled until name matches

4. **Permanent Deletion**
   - Removes organization record
   - Cascading deletes:
     - All users in organization
     - All jobs/projects
     - All organization data
   - **Cannot be undone**

### When to Delete vs Suspend

**Suspend (Recommended):**
- ✅ Trial expired
- ✅ Subscription cancelled
- ✅ Payment failed
- ✅ Policy violation (temporary)
- ✅ Under investigation
- ✅ Fraud suspected (pending review)
- ✅ User requested account pause

**Delete (Use Sparingly):**
- ❌ User explicitly requests deletion (GDPR)
- ❌ Confirmed fraud (after investigation)
- ❌ Duplicate/test accounts
- ❌ Legal requirement
- ❌ Account dormant for 2+ years (after notification)

**Default Action: SUSPEND**

When in doubt, suspend. Deletion is permanent.

---

## Code Safeguards

### No Automatic Deletion

**Webhooks (stripe-webhook.ts):**
```typescript
// ✅ CORRECT: Suspension only
async function handleSubscriptionDeleted(subscription) {
  await db.update(organizations).set({
    isActive: false,  // Suspend, don't delete
    subscriptionStatus: 'cancelled',
  });
}

// ❌ WRONG: Never do this
await db.delete(organizations).where(...);
```

**Cron Jobs (trial-manager.ts):**
```typescript
// ✅ CORRECT: Suspension only
export async function disableExpiredTrials() {
  await db.update(organizations).set({
    isActive: false,  // Suspend, don't delete
    subscriptionStatus: 'expired',
  });
}

// ❌ WRONG: Never do this
await db.delete(organizations).where(...);
```

### Manual Deletion Protection

**Backend (routers.ts):**
```typescript
delete: protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx }) => {
    // ✅ Role check
    if (ctx.user.role !== 'super_admin') {
      throw new Error('Unauthorized: Super admin access required');
    }
    
    const { deleteOrganization } = await import('./organizations-db');
    return await deleteOrganization(input.id);
  }),
```

**Frontend (TenantManagement.tsx):**
```typescript
// ✅ Name confirmation required
const confirmDelete = () => {
  if (deleteConfirmText !== deleteConfirmation.name) {
    toast.error("Tenant name does not match. Deletion cancelled.");
    return;
  }
  deleteMutation.mutate({ id: deleteConfirmation.id });
};
```

---

## Audit Trail

### Logging Deletions

**Current Implementation:**
```typescript
export async function deleteOrganization(id: number) {
  try {
    await db.delete(organizations).where(eq(organizations.id, id));
    console.log('[Organizations] Deleted organization:', id);
    return { success: true };
  } catch (error) {
    console.error('[Organizations] Delete organization error:', error);
    throw error;
  }
}
```

**Future Enhancement:**
- Log deletion to audit table
- Record: who deleted, when, reason
- Store snapshot of deleted data (for recovery)
- Send notification to platform owner

---

## Recovery Options

### Suspended Accounts
- ✅ Self-service reactivation (via subscription)
- ✅ Admin reactivation (instant)
- ✅ Data intact
- ✅ Users can login

### Deleted Accounts
- ❌ No recovery possible
- ❌ Data permanently lost
- ❌ Must create new account
- ❌ Cannot restore users/jobs

**This is why suspension is preferred.**

---

## Testing Checklist

### Suspension Tests
- [ ] Trial expiry → account suspended (not deleted)
- [ ] Subscription cancelled → account suspended (not deleted)
- [ ] Suspended account can login
- [ ] Suspended account sees upgrade overlay
- [ ] Self-service reactivation works
- [ ] Admin can manually suspend
- [ ] Admin can manually reactivate

### Deletion Tests
- [ ] Non-admin cannot access tenant management
- [ ] Non-admin cannot delete accounts
- [ ] Delete button requires name confirmation
- [ ] Delete button disabled until name matches
- [ ] Deletion is permanent (record removed)
- [ ] Deletion cascades to related data

### Safeguard Tests
- [ ] No automatic deletion in webhooks
- [ ] No automatic deletion in cron jobs
- [ ] Deletion requires super_admin role
- [ ] Deletion requires exact name match
- [ ] Warning shown before deletion

---

## User Communication

### Suspension Notifications

**Trial Expiry:**
> Your 14-day trial has expired. Your account is now suspended. To regain access, please upgrade to a paid plan.

**Subscription Cancelled:**
> Your subscription was cancelled and your account is now suspended. To regain access, please subscribe to a plan.

**Manual Suspension:**
> Your account has been suspended by an administrator. Please contact support for more information.

### Deletion Notifications

**Before Deletion (if dormant):**
> Your account has been inactive for 2 years. If you don't log in within 30 days, your account and all data will be permanently deleted.

**After Deletion:**
> Your account has been permanently deleted as requested. All data has been removed and cannot be recovered.

---

## GDPR Compliance

### Right to Erasure

Users can request account deletion:
1. User submits deletion request via support
2. Super admin reviews request
3. Super admin deletes account via tenant management panel
4. Confirmation sent to user
5. Data removed within 30 days

### Data Retention

- **Active accounts:** Indefinite
- **Suspended accounts:** Indefinite (can be reactivated)
- **Deleted accounts:** 0 days (immediate removal)
- **Backups:** 30 days (then purged)

---

## Summary

| Action | Automatic | Manual | Reversible | Data Retained |
|--------|-----------|--------|------------|---------------|
| **Suspend** | ✅ (trial/cancel) | ✅ (admin) | ✅ | ✅ |
| **Delete** | ❌ Never | ✅ (super admin only) | ❌ | ❌ |

**Default: Suspend. Delete only when absolutely necessary.**

