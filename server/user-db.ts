import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Get the count of admin users in an organization
 * @param organizationId - The organization ID
 * @returns The number of admin users (both 'admin' and 'super_admin' roles)
 */
export async function getAdminUserCount(organizationId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin user count: database not available");
    return 0;
  }

  try {
    const adminUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.organizationId, organizationId),
          eq(users.isActive, true)
        )
      );
    
    return adminUsers.length;
  } catch (error) {
    console.error("[Database] Failed to get admin user count:", error);
    return 0;
  }
}

