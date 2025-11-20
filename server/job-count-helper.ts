import { and, eq, gte, sql } from "drizzle-orm";
import { jobs, organizations } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get the current billing month job count for an organization
 * This counts actual jobs created within the current billing cycle
 * and is always accurate, eliminating sync issues with stored counters
 */
export async function getCurrentMonthJobCount(organizationId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get organization to find billing cycle start date
  const orgResult = await db
    .select({
      billingCycleStart: organizations.billingCycleStart,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (orgResult.length === 0) {
    throw new Error("Organization not found");
  }

  const org = orgResult[0];
  
  // Use billing cycle start, or default to start of current month if not set
  let startDate: Date;
  if (org.billingCycleStart) {
    startDate = new Date(org.billingCycleStart);
  } else {
    // Default to start of current calendar month
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  // Count jobs created since billing cycle start
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(jobs)
    .where(
      and(
        eq(jobs.organizationId, organizationId),
        gte(jobs.createdAt, startDate)
      )
    );

  return Number(countResult[0]?.count || 0);
}

/**
 * Check if organization has exceeded their job limit
 * Returns true if limit is exceeded, false otherwise
 */
export async function isJobLimitExceeded(organizationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get organization limits
  const orgResult = await db
    .select({
      monthlyJobLimit: organizations.monthlyJobLimit,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (orgResult.length === 0) {
    throw new Error("Organization not found");
  }

  const org = orgResult[0];
  const limit = org.monthlyJobLimit || 0;

  // Unlimited plan
  if (limit === -1) {
    return false;
  }

  // Get current month count
  const currentCount = await getCurrentMonthJobCount(organizationId);

  // Check if exceeded
  return currentCount >= limit;
}

