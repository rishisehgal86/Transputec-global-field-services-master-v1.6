import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { jobDocuments, InsertJobDocument, JobDocument } from "../drizzle/schema";

/**
 * Add a document to a job
 */
export async function addJobDocument(document: InsertJobDocument): Promise<JobDocument> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(jobDocuments).values(document).$returningId();
  const [doc] = await db.select().from(jobDocuments).where(eq(jobDocuments.id, result.id));
  return doc;
}

/**
 * Get all documents for a job
 */
export async function getJobDocuments(jobId: number): Promise<JobDocument[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(jobDocuments).where(eq(jobDocuments.jobId, jobId));
}

/**
 * Delete a document
 */
export async function deleteJobDocument(documentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(jobDocuments).where(eq(jobDocuments.id, documentId));
}

