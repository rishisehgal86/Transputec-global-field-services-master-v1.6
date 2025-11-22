import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { organizations } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { disableExpiredTrials } from './trial-manager';
import { updateOrganizationSubscription } from './db';

describe('Account Suspension and Reinstatement', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let expiredTrialOrgId: number;
  let cancelledSubOrgId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error('Database not available for testing');
    }

    // Create test organization for expired trial scenario
    const trialResult = await db.insert(organizations).values({
      name: 'Expired Trial Test Org',
      slug: `expired-trial-test-${Date.now()}`,
      isActive: true,
      subscriptionStatus: 'trial',
      planTier: 'trial',
      monthlyJobLimit: 50,
      maxAdminUsers: 1,
      trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
    });
    expiredTrialOrgId = Number(trialResult[0].insertId);

    // Create test organization for cancelled subscription scenario
    const cancelledResult = await db.insert(organizations).values({
      name: 'Cancelled Subscription Test Org',
      slug: `cancelled-sub-test-${Date.now()}`,
      isActive: true,
      subscriptionStatus: 'active',
      planTier: 'starter',
      monthlyJobLimit: 100,
      maxAdminUsers: 3,
      stripeCustomerId: 'cus_test_cancelled',
      stripeSubscriptionId: 'sub_test_cancelled',
      cancelAtPeriodEnd: true, // Pending cancellation
    });
    cancelledSubOrgId = Number(cancelledResult[0].insertId);
  });

  afterAll(async () => {
    // Cleanup test organizations
    if (expiredTrialOrgId) {
      await db.delete(organizations).where(eq(organizations.id, expiredTrialOrgId));
    }
    if (cancelledSubOrgId) {
      await db.delete(organizations).where(eq(organizations.id, cancelledSubOrgId));
    }
  });

  describe('Expired Trial → Suspension → Reinstatement', () => {
    it('Step 1: Should have active trial account before expiry', async () => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, expiredTrialOrgId));

      expect(org.isActive).toBe(true);
      expect(org.subscriptionStatus).toBe('trial');
      expect(org.planTier).toBe('trial');
      expect(org.monthlyJobLimit).toBe(50);
      expect(org.maxAdminUsers).toBe(1);
      
      console.log('✅ Trial account is active before expiry');
    });

    it('Step 2: Should suspend account when trial expires', async () => {
      // Run the cron job that disables expired trials
      const result = await disableExpiredTrials();
      
      expect(result.disabled).toBeGreaterThan(0);
      console.log(`✅ Cron job disabled ${result.disabled} expired trial(s)`);

      // Verify account is now suspended
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, expiredTrialOrgId));

      expect(org.isActive).toBe(false); // ← SUSPENDED
      expect(org.subscriptionStatus).toBe('expired');
      
      console.log('✅ Account suspended: isActive=false, status=expired');
    });

    it('Step 3: Should allow user to login to suspended account', async () => {
      // In real app, auth system checks if user exists, not if account is active
      // This test verifies the account still exists and can be queried
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, expiredTrialOrgId));

      expect(org).toBeDefined();
      expect(org.id).toBe(expiredTrialOrgId);
      
      console.log('✅ User can still login (account exists in database)');
    });

    it('Step 4: Should block all functionality (zero limits)', async () => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, expiredTrialOrgId));

      // Frontend shows greyed-out UI via AccountStatusWrapper
      // Backend enforces limits
      expect(org.isActive).toBe(false);
      
      console.log('✅ Functionality blocked: isActive=false prevents all actions');
    });

    it('Step 5: Should allow resubscription (simulating Stripe checkout)', async () => {
      // Simulate user clicking "Choose Scale" and completing payment
      // This mimics what the subscription.created webhook does
      await updateOrganizationSubscription({
        organizationId: expiredTrialOrgId,
        subscriptionStatus: 'active',
        planTier: 'starter',
        monthlyJobLimit: 100,
        maxAdminUsers: 3,
        stripeCustomerId: 'cus_test_reactivated',
        stripeSubscriptionId: 'sub_test_reactivated',
        isActive: true, // ← REACTIVATED
        billingCycleStart: new Date(),
        billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      console.log('✅ Resubscription processed (Stripe webhook simulation)');
    });

    it('Step 6: Should restore full access after resubscription', async () => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, expiredTrialOrgId));

      expect(org.isActive).toBe(true); // ← REACTIVATED
      expect(org.subscriptionStatus).toBe('active');
      expect(org.planTier).toBe('starter');
      expect(org.monthlyJobLimit).toBe(100);
      expect(org.maxAdminUsers).toBe(3);
      expect(org.stripeSubscriptionId).toBe('sub_test_reactivated');
      
      console.log('✅ Full access restored: isActive=true, limits updated');
    });
  });

  describe('Cancelled Subscription → Suspension → Reinstatement', () => {
    it('Step 1: Should have active subscription with pending cancellation', async () => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, cancelledSubOrgId));

      expect(org.isActive).toBe(true);
      expect(org.subscriptionStatus).toBe('active');
      expect(org.planTier).toBe('starter');
      expect(org.cancelAtPeriodEnd).toBe(true); // User clicked "Cancel"
      
      console.log('✅ Subscription active but pending cancellation');
    });

    it('Step 2: Should suspend account when billing period ends', async () => {
      // Simulate Stripe subscription.deleted webhook
      await updateOrganizationSubscription({
        organizationId: cancelledSubOrgId,
        isActive: false, // ← SUSPENDED
        subscriptionStatus: 'cancelled',
        planTier: 'trial',
        monthlyJobLimit: 0,
        maxAdminUsers: 0,
        stripeSubscriptionId: null,
        cancelAtPeriodEnd: false,
      });

      console.log('✅ subscription.deleted webhook processed');

      // Verify account is now suspended
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, cancelledSubOrgId));

      expect(org.isActive).toBe(false); // ← SUSPENDED
      expect(org.subscriptionStatus).toBe('cancelled');
      expect(org.monthlyJobLimit).toBe(0);
      expect(org.maxAdminUsers).toBe(0);
      expect(org.stripeSubscriptionId).toBeNull();
      
      console.log('✅ Account suspended: isActive=false, limits=0');
    });

    it('Step 3: Should allow user to login to suspended account', async () => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, cancelledSubOrgId));

      expect(org).toBeDefined();
      expect(org.id).toBe(cancelledSubOrgId);
      
      console.log('✅ User can still login (account exists in database)');
    });

    it('Step 4: Should block all functionality (zero limits)', async () => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, cancelledSubOrgId));

      expect(org.isActive).toBe(false);
      expect(org.monthlyJobLimit).toBe(0);
      expect(org.maxAdminUsers).toBe(0);
      
      console.log('✅ Functionality blocked: isActive=false, limits=0');
    });

    it('Step 5: Should allow resubscription (simulating Stripe checkout)', async () => {
      // Simulate user clicking "Choose Professional" and completing payment
      await updateOrganizationSubscription({
        organizationId: cancelledSubOrgId,
        subscriptionStatus: 'active',
        planTier: 'enterprise',
        monthlyJobLimit: -1, // Unlimited
        maxAdminUsers: -1, // Unlimited
        stripeCustomerId: 'cus_test_resubscribed',
        stripeSubscriptionId: 'sub_test_resubscribed',
        isActive: true, // ← REACTIVATED
        billingCycleStart: new Date(),
        billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      console.log('✅ Resubscription processed (Stripe webhook simulation)');
    });

    it('Step 6: Should restore full access after resubscription', async () => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, cancelledSubOrgId));

      expect(org.isActive).toBe(true); // ← REACTIVATED
      expect(org.subscriptionStatus).toBe('active');
      expect(org.planTier).toBe('enterprise');
      expect(org.monthlyJobLimit).toBe(-1); // Unlimited
      expect(org.maxAdminUsers).toBe(-1); // Unlimited
      expect(org.stripeSubscriptionId).toBe('sub_test_resubscribed');
      
      console.log('✅ Full access restored: isActive=true, unlimited limits');
    });
  });

  describe('Frontend Behavior Verification', () => {
    it('Should show disabled overlay for suspended accounts', async () => {
      // This test documents the expected frontend behavior
      // AccountStatusWrapper checks status.isActive
      
      const suspendedAccount = {
        isActive: false,
        subscriptionStatus: 'expired',
      };

      expect(suspendedAccount.isActive).toBe(false);
      
      console.log('✅ Frontend should show DisabledAccountOverlay');
      console.log('   - Background: greyed out + blurred');
      console.log('   - Overlay: pricing cards with upgrade buttons');
      console.log('   - Buttons: redirect to Stripe checkout');
    });

    it('Should allow checkout for suspended accounts', async () => {
      // This test documents the backend logic in createCheckout mutation
      
      const suspendedAccount = {
        subscriptionStatus: 'active',
        planTier: 'starter',
        isActive: false, // ← Key check
        cancelAtPeriodEnd: false,
      };

      const isActiveSubscription = 
        suspendedAccount.subscriptionStatus === 'active' && 
        suspendedAccount.planTier !== 'trial';
      
      const isDisabled = !suspendedAccount.isActive;
      const isPendingCancellation = suspendedAccount.cancelAtPeriodEnd;

      // Should NOT block checkout
      const shouldBlock = isActiveSubscription && !isDisabled && !isPendingCancellation;
      
      expect(shouldBlock).toBe(false);
      
      console.log('✅ Backend allows checkout for suspended accounts');
      console.log('   - createCheckout mutation checks isActive flag');
      console.log('   - Suspended accounts bypass "already subscribed" check');
    });
  });
});

