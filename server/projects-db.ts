import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { projects, type InsertProject, type Project } from "../drizzle/schema";

/**
 * Create a new project
 */
export async function createProject(project: InsertProject): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [newProject] = await db.insert(projects).values(project).$returningId();
  
  // Fetch and return the created project
  const [created] = await db.select().from(projects).where(eq(projects.id, newProject.id));
  return created;
}

/**
 * Get all projects for an organization
 */
export async function getProjectsByOrganization(organizationId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(projects)
    .where(eq(projects.organizationId, organizationId))
    .orderBy(projects.createdAt);
}

/**
 * Get project by projectId (unique identifier)
 */
export async function getProjectByProjectId(projectId: string): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [project] = await db.select().from(projects)
    .where(eq(projects.projectId, projectId))
    .limit(1);
  
  return project;
}

/**
 * Verify project exists and belongs to organization
 */
export async function verifyProject(projectId: string, organizationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [project] = await db.select().from(projects)
    .where(and(
      eq(projects.projectId, projectId),
      eq(projects.organizationId, organizationId),
      eq(projects.isActive, true)
    ))
    .limit(1);
  
  return !!project;
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<InsertProject, 'projectId' | 'organizationId'>>
): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projects.projectId, projectId));
  
  return await getProjectByProjectId(projectId);
}

/**
 * Toggle project active status
 */
export async function toggleProjectStatus(projectId: string, isActive: boolean): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projects)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(projects.projectId, projectId));
  
  return true;
}

/**
 * Delete project (hard delete - permanently removes from database)
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(projects)
    .where(eq(projects.projectId, projectId));
  
  return true;
}

/**
 * Get project statistics
 */
export async function getProjectStats(projectId: string): Promise<{
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // This will be implemented when we add job queries with project filtering
  return {
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
  };
}

