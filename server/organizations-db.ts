import { eq } from "drizzle-orm";
import { organizations, type InsertOrganization } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Generate a URL-friendly slug from organization name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
}

/**
 * Create a new organization
 */
export async function createOrganization(data: { name: string }): Promise<{ id: number; name: string; slug: string }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const slug = generateSlug(data.name);
    
    const result = await db.insert(organizations).values({
      name: data.name,
      slug,
      isActive: true,
      projectsEnabled: true,
    });

    const organizationId = Number(result[0].insertId);
    
    return {
      id: organizationId,
      name: data.name,
      slug,
    };
  } catch (error) {
    console.error('[Organizations] Create organization error:', error);
    throw new Error('Failed to create organization');
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('[Organizations] Get organization error:', error);
    return null;
  }
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('[Organizations] Get organization by slug error:', error);
    return null;
  }
}

/**
 * Get all organizations
 */
export async function getAllOrganizations() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    return await db.select().from(organizations);
  } catch (error) {
    console.error('[Organizations] Get all organizations error:', error);
    return [];
  }
}

/**
 * Get organizations by user's organization ID
 */
export async function getProjectsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('[Organizations] Get organization error:', error);
    return null;
  }
}


/**
 * Suspend organization (super admin only)
 */
export async function suspendOrganization(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(organizations)
      .set({ isActive: false })
      .where(eq(organizations.id, id));
    return { success: true };
  } catch (error) {
    console.error('[Organizations] Suspend organization error:', error);
    throw new Error('Failed to suspend organization');
  }
}

/**
 * Unsuspend organization (super admin only)
 */
export async function unsuspendOrganization(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(organizations)
      .set({ isActive: true })
      .where(eq(organizations.id, id));
    return { success: true };
  } catch (error) {
    console.error('[Organizations] Unsuspend organization error:', error);
    throw new Error('Failed to unsuspend organization');
  }
}

/**
 * Delete organization (super admin only)
 */
export async function deleteOrganization(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(organizations).where(eq(organizations.id, id));
    return { success: true };
  } catch (error) {
    console.error('[Organizations] Delete organization error:', error);
    throw new Error('Failed to delete organization');
  }
}



/**
 * Update organization's lastUsedAt timestamp
 */
export async function updateOrganizationLastUsed(organizationId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    return; // Silently fail - don't block user actions
  }

  try {
    await db
      .update(organizations)
      .set({ lastUsedAt: new Date() })
      .where(eq(organizations.id, organizationId));
  } catch (error) {
    console.error('[Organizations] Update lastUsedAt error:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Get all organizations with primary admin email and project count
 */
export async function getAllOrganizationsWithAdmins() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const { users, projects } = await import('../drizzle/schema');
    const { count } = await import('drizzle-orm');
    const orgs = await db.select().from(organizations);
    
    // For each organization, find the first admin user and count projects
    const orgsWithAdmins = await Promise.all(
      orgs.map(async (org) => {
        const adminUsers = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.organizationId, org.id))
          .limit(1);
        
        const projectCount = await db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.organizationId, org.id));
        
        return {
          ...org,
          primaryAdminEmail: adminUsers[0]?.email || null,
          projectCount: projectCount[0]?.count || 0,
        };
      })
    );
    
    return orgsWithAdmins;
  } catch (error) {
    console.error('[Organizations] Get all organizations with admins error:', error);
    return [];
  }
}

