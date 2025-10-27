import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { siteVisitReports, type InsertSiteVisitReport } from "../drizzle/schema";

/**
 * Create a new Site Visit Report
 */
export async function createSiteVisitReport(svr: InsertSiteVisitReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(siteVisitReports).values(svr);
  const insertId = Number(result[0].insertId);
  
  // Fetch and return the created SVR
  const createdSVR = await getSiteVisitReportById(insertId);
  return createdSVR;
}

/**
 * Get Site Visit Report by ID
 */
export async function getSiteVisitReportById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(siteVisitReports).where(eq(siteVisitReports.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Get Site Visit Report by Job ID
 */
export async function getSiteVisitReportByJobId(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(siteVisitReports).where(eq(siteVisitReports.jobId, jobId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Update Site Visit Report
 */
export async function updateSiteVisitReport(id: number, updates: Partial<InsertSiteVisitReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(siteVisitReports).set(updates).where(eq(siteVisitReports.id, id));
  return await getSiteVisitReportById(id);
}

