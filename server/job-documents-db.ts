import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { jobDocuments, type InsertJobDocument } from "../drizzle/schema";

export async function createJobDocument(document: InsertJobDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(jobDocuments).values(document);
  return result;
}

export async function getJobDocuments(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(jobDocuments)
    .where(eq(jobDocuments.jobId, jobId))
    .orderBy(jobDocuments.createdAt);
}

export async function deleteJobDocument(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(jobDocuments).where(eq(jobDocuments.id, documentId));
}

