import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { organizations } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  isTrialExpired,
  getTrialDaysRemaining,
  disableExpiredTrials,
  getTrialStatus,
} from './trial-manager';

describe('Trial System', () => {
  let testOrgId: number;
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    // Initialize database
    db = await getDb();
    if (!db) {
      throw new Error('Database not available for testing');
    }

    // Create a test organization
    const result = await db.insert(organizations).values({
      name: 'Test Trial Org',
      slug: `test-trial-${Date.now()}`,
      isActive: true,
      subscriptionStatus: 'trial',
      planTier: 'trial',
      monthlyJobLimit: 50,
      maxAdminUsers: 1,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    testOrgId = Number(result[0].insertId);
  });

  afterAll(async () => {
    // Cleanup
    if (testOrgId) {
      await db.delete(organizations).where(eq(organizations.id, testOrgId));
    }
  });

  it('should calculate trial days remaining correctly', async () => {
    const daysRemaining = await getTrialDaysRemaining(testOrgId);
    expect(daysRemaining).toBe(7);
  });

  it('should detect trial is not expired', async () => {
    const expired = await isTrialExpired(testOrgId);
    expect(expired).toBe(false);
  });

  it('should return correct trial status', async () => {
    const status = await getTrialStatus(testOrgId);
    expect(status.isOnTrial).toBe(true);
    expect(status.daysRemaining).toBe(7);
    expect(status.isExpired).toBe(false);
    expect(status.trialEndsAt).toBeTruthy();
  });

  it('should detect expired trial', async () => {
    // Set trial to expired
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await db
      .update(organizations)
      .set({ trialEndsAt: yesterday })
      .where(eq(organizations.id, testOrgId));

    const expired = await isTrialExpired(testOrgId);
    expect(expired).toBe(true);

    const status = await getTrialStatus(testOrgId);
    expect(status.isExpired).toBe(true);
    expect(status.daysRemaining).toBeLessThan(0);
  });

  it('should disable expired trial accounts', async () => {
    // Ensure trial is expired and active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await db
      .update(organizations)
      .set({
        trialEndsAt: yesterday,
        isActive: true,
        subscriptionStatus: 'trial',
      })
      .where(eq(organizations.id, testOrgId));

    // Run the disable function
    const result = await disableExpiredTrials();
    expect(result.disabled).toBeGreaterThan(0);

    // Verify the account is disabled
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, testOrgId));

    expect(org.isActive).toBe(false);
    expect(org.subscriptionStatus).toBe('expired');
  });

  it('should not disable active subscriptions', async () => {
    // Create an org with active subscription
    const activeOrgResult = await db.insert(organizations).values({
      name: 'Active Subscription Org',
      slug: `active-sub-${Date.now()}`,
      isActive: true,
      subscriptionStatus: 'active',
      planTier: 'starter',
      monthlyJobLimit: 100,
      maxAdminUsers: 3,
      trialEndsAt: null,
    });

    const activeOrgId = Number(activeOrgResult[0].insertId);

    // Run disable function
    await disableExpiredTrials();

    // Verify active subscription is still active
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, activeOrgId));

    expect(org.isActive).toBe(true);
    expect(org.subscriptionStatus).toBe('active');

    // Cleanup
    await db.delete(organizations).where(eq(organizations.id, activeOrgId));
  });

  it('should handle reactivation on subscription creation', async () => {
    // Set up a disabled account
    await db
      .update(organizations)
      .set({
        isActive: false,
        subscriptionStatus: 'expired',
      })
      .where(eq(organizations.id, testOrgId));

    // Simulate subscription creation (reactivation)
    const { updateOrganizationSubscription } = await import('./db');
    await updateOrganizationSubscription({
      organizationId: testOrgId,
      subscriptionStatus: 'active',
      planTier: 'starter',
      monthlyJobLimit: 100,
      maxAdminUsers: 3,
      isActive: true, // Reactivate
    });

    // Verify account is reactivated
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, testOrgId));

    expect(org.isActive).toBe(true);
    expect(org.subscriptionStatus).toBe('active');
    expect(org.planTier).toBe('starter');
  });
});

