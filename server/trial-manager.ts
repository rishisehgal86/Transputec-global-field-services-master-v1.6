import { lt, eq, and } from "drizzle-orm";
import { organizations } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Check if an organization's trial has expired
 */
export async function isTrialExpired(organizationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org) {
      return false;
    }

    // If not on trial, return false
    if (org.subscriptionStatus !== 'trial') {
      return false;
    }

    // If no trial end date set, return false
    if (!org.trialEndsAt) {
      return false;
    }

    // Check if trial has expired
    return new Date() > new Date(org.trialEndsAt);
  } catch (error) {
    console.error('[Trial] Error checking trial expiry:', error);
    return false;
  }
}

/**
 * Get days remaining in trial
 * Returns null if not on trial or no trial end date
 */
export async function getTrialDaysRemaining(organizationId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org || org.subscriptionStatus !== 'trial' || !org.trialEndsAt) {
      return null;
    }

    const now = new Date();
    const trialEnd = new Date(org.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('[Trial] Error calculating trial days:', error);
    return null;
  }
}

/**
 * Disable all expired trial accounts
 * This should be run periodically (e.g., daily cron job)
 */
export async function disableExpiredTrials(): Promise<{ disabled: number; errors: number }> {
  const db = await getDb();
  if (!db) {
    return { disabled: 0, errors: 0 };
  }

  try {
    console.log('[Trial] Checking for expired trials...');

    // Find all trial accounts where trial has expired and account is still active
    const expiredTrials = await db
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.subscriptionStatus, 'trial'),
          eq(organizations.isActive, true),
          lt(organizations.trialEndsAt, new Date())
        )
      );

    console.log(`[Trial] Found ${expiredTrials.length} expired trial accounts`);

    let disabled = 0;
    let errors = 0;

    for (const org of expiredTrials) {
      try {
        await db
          .update(organizations)
          .set({
            isActive: false,
            subscriptionStatus: 'expired',
          })
          .where(eq(organizations.id, org.id));

        console.log(`[Trial] Disabled expired trial account: ${org.name} (ID: ${org.id})`);
        disabled++;
      } catch (error) {
        console.error(`[Trial] Error disabling account ${org.id}:`, error);
        errors++;
      }
    }

    console.log(`[Trial] Disabled ${disabled} accounts, ${errors} errors`);
    return { disabled, errors };
  } catch (error) {
    console.error('[Trial] Error in disableExpiredTrials:', error);
    return { disabled: 0, errors: 1 };
  }
}

/**
 * Get trial status for an organization
 */
export async function getTrialStatus(organizationId: number): Promise<{
  isOnTrial: boolean;
  daysRemaining: number | null;
  isExpired: boolean;
  trialEndsAt: Date | null;
}> {
  const db = await getDb();
  if (!db) {
    return {
      isOnTrial: false,
      daysRemaining: null,
      isExpired: false,
      trialEndsAt: null,
    };
  }

  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org) {
      return {
        isOnTrial: false,
        daysRemaining: null,
        isExpired: false,
        trialEndsAt: null,
      };
    }

    const isOnTrial = org.subscriptionStatus === 'trial' || org.subscriptionStatus === 'expired';
    const trialEndsAt = org.trialEndsAt ? new Date(org.trialEndsAt) : null;
    
    let daysRemaining: number | null = null;
    let isExpired = false;

    if (isOnTrial && trialEndsAt) {
      const now = new Date();
      const diffTime = trialEndsAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isExpired = daysRemaining <= 0;
    }

    return {
      isOnTrial,
      daysRemaining,
      isExpired,
      trialEndsAt,
    };
  } catch (error) {
    console.error('[Trial] Error getting trial status:', error);
    return {
      isOnTrial: false,
      daysRemaining: null,
      isExpired: false,
      trialEndsAt: null,
    };
  }
}

