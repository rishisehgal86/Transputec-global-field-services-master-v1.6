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
    
    console.log('[getProjectSites] ===== FETCHING SITES =====');
    console.log('[getProjectSites] ProjectId parameter:', projectId);
    console.log('[getProjectSites] ProjectId type:', typeof projectId);
    console.log('[getProjectSites] ProjectId length:', projectId?.length);
    
    const sites = await db
      .select()
      .from(projectSites)
      .where(and(
        eq(projectSites.projectId, projectId),
        eq(projectSites.isActive, true)
      ));
    
    console.log('[getProjectSites] Query completed');
    console.log('[getProjectSites] Found sites:', sites.length);
    console.log('[getProjectSites] Requested projectId:', projectId);
    if (sites.length > 0) {
      const uniqueProjectIds = Array.from(new Set(sites.map(s => s.projectId)));
      console.log('[getProjectSites] UNIQUE projectIds in results:', uniqueProjectIds.join(', '));
      console.log('[getProjectSites] First 3 site projectIds:', sites.slice(0, 3).map(s => s.projectId).join(', '));
      console.log('[getProjectSites] First 3 site names:', sites.slice(0, 3).map(s => s.siteName).join(', '));
      
      // Check if ANY site has wrong projectId
      const wrongSites = sites.filter(s => s.projectId !== projectId);
      if (wrongSites.length > 0) {
        console.error('[getProjectSites] BUG FOUND! Query returned sites from WRONG projects!');
        console.error('[getProjectSites] Expected:', projectId);
        console.error('[getProjectSites] Got sites from:', uniqueProjectIds.join(', '));
      }
    }
    
    // BUGFIX: Manual filter to ensure we only return sites for the requested project
    // The Drizzle WHERE clause seems to not be working correctly
    const filteredSites = sites.filter(site => site.projectId === projectId);
    console.log('[getProjectSites] After manual filter:', filteredSites.length, 'sites');
    if (filteredSites.length !== sites.length) {
      console.error('[getProjectSites] WARNING: Drizzle query returned wrong sites!');
      console.error('[getProjectSites] Expected projectId:', projectId);
      console.error('[getProjectSites] Got sites from projects:', Array.from(new Set(sites.map(s => s.projectId))).join(', '));
    }
    
    return filteredSites;
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
  
  await db.insert(projectSites).values(sites);
  
  // Drizzle doesn't reliably return affectedRows, so return the input length
  // since we know all inserts succeeded if no error was thrown
  return sites.length;
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
  
  return (result[0]?.affectedRows || 0) > 0;
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
  
  return result[0]?.affectedRows || 0;
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
      latitude: latitude.toString(),
      longitude: longitude.toString()
    })
    .where(eq(projectSites.id, siteId));
  
  return true; // Update successful if no error thrown
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

