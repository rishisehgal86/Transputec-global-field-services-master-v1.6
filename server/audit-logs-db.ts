import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { auditLogs, type InsertAuditLog } from "../drizzle/schema";

export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[AuditLog] Database not available, skipping audit log");
    return;
  }
  
  try {
    await db.insert(auditLogs).values(log);
  } catch (error) {
    console.error("[AuditLog] Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main flow
  }
}

export async function getAuditLogs(organizationId: number, entityType?: string, entityId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.organizationId, organizationId));
  
  if (entityType && entityId) {
    query = query.where(
      and(
        eq(auditLogs.entityType, entityType),
        eq(auditLogs.entityId, entityId)
      )
    );
  }
  
  return await query.orderBy(desc(auditLogs.timestamp)).limit(100);
}

export async function getJobAuditLogs(jobId: number, organizationId: number) {
  return await getAuditLogs(organizationId, "job", jobId);
}

