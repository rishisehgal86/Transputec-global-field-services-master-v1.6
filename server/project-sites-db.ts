import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { projectSites, InsertProjectSite, ProjectSite } from "../drizzle/schema";

/**
 * Get all sites for a project
 */
export async function getProjectSites(projectId: string): Promise<ProjectSite[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[getProjectSites] Database not available');
      return [];
    }
    
    console.log('[getProjectSites] Fetching sites for project:', projectId);
    
    const sites = await db
      .select()
      .from(projectSites)
      .where(and(
        eq(projectSites.projectId, projectId),
        eq(projectSites.isActive, true)
      ));
    
    console.log('[getProjectSites] Found sites:', sites.length);
    
    return sites;
  } catch (error) {
    console.error('[getProjectSites] Error fetching sites:', error);
    return [];
  }
}

/**
 * Get a single site by ID
 */
export async function getProjectSiteById(siteId: number): Promise<ProjectSite | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(projectSites)
    .where(eq(projectSites.id, siteId))
    .limit(1);
  
  return result[0];
}

/**
 * Create a new project site
 */
export async function createProjectSite(site: InsertProjectSite): Promise<ProjectSite> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projectSites).values(site);
  
  // Query back the created site by unique combination of projectId, siteName, and siteAddress
  // This is more reliable than relying on insertId which may not be returned consistently
  const created = await db
    .select()
    .from(projectSites)
    .where(
      and(
        eq(projectSites.projectId, site.projectId),
        eq(projectSites.siteName, site.siteName),
        eq(projectSites.siteAddress, site.siteAddress)
      )
    )
    .orderBy(desc(projectSites.createdAt))
    .limit(1);
  
  if (!created[0]) {
    throw new Error("Failed to retrieve created site");
  }
  
  return created[0];
}

/**
 * Bulk create project sites
 */
export async function bulkCreateProjectSites(sites: InsertProjectSite[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (sites.length === 0) return 0;
  
  const result = await db.insert(projectSites).values(sites);
  
  return result.affectedRows || 0;
}

/**
 * Delete a project site (soft delete by setting isActive to false)
 */
export async function deleteProjectSite(siteId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .update(projectSites)
    .set({ isActive: false })
    .where(eq(projectSites.id, siteId));
  
  return (result.affectedRows || 0) > 0;
}

/**
 * Delete all sites for a project
 */
export async function deleteAllProjectSites(projectId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .update(projectSites)
    .set({ isActive: false })
    .where(eq(projectSites.projectId, projectId));
  
  return result.affectedRows || 0;
}

/**
 * Count sites for a project
 */
export async function countProjectSites(projectId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const sites = await db
    .select()
    .from(projectSites)
    .where(and(
      eq(projectSites.projectId, projectId),
      eq(projectSites.isActive, true)
    ));
  
  return sites.length;
}


/**
 * Update site location coordinates
 */
export async function updateProjectSiteLocation(siteId: number, latitude: number, longitude: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .update(projectSites)
    .set({ 
      latitude,
      longitude,
      updatedAt: new Date()
    })
    .where(eq(projectSites.id, siteId));
  
  return (result.affectedRows || 0) > 0;
}



/**
 * Update a project site
 */
export async function updateProjectSite(siteId: number, updates: Partial<InsertProjectSite>): Promise<ProjectSite> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(projectSites)
    .set(updates)
    .where(eq(projectSites.id, siteId));
  
  // Fetch the updated site
  const updated = await db
    .select()
    .from(projectSites)
    .where(eq(projectSites.id, siteId))
    .limit(1);
  
  if (!updated[0]) {
    throw new Error("Failed to retrieve updated site");
  }
  
  return updated[0];
}

