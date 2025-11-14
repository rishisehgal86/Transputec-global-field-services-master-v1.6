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

