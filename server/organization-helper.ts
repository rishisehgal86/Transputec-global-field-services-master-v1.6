import { getDb } from "./db";
import { organizations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Get organization ID from authenticated user
 * For public endpoints (service requests), returns the default organization
 */
export async function getOrganizationId(user: any | null): Promise<number> {
  // If user is authenticated, use their organization
  if (user && user.organizationId) {
    return user.organizationId;
  }
  
  // For public requests, use the default organization (FieldPulse)
  // In production with SSO, public requests won't exist - all will be authenticated
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const defaultOrg = await db.select()
    .from(organizations)
    .where(eq(organizations.slug, 'fieldpulse'))
    .limit(1);
  
  if (defaultOrg.length === 0) {
    throw new Error("Default organization not found");
  }
  
  return defaultOrg[0].id;
}

