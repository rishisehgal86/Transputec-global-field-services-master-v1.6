import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, jobs, jobLocations, jobStatusHistory, InsertJob, InsertJobLocation, InsertJobStatusHistory, svrMediaFiles, InsertSvrMediaFile, jobComments, InsertJobComment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

// User management functions moved to server/auth.ts

// Job Management Functions

export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(jobs).values(job);
  const insertId = Number(result[0].insertId);
  
  // Fetch and return the created job
  const createdJob = await getJobById(insertId);
  return createdJob;
}

export async function getJobByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(jobs).where(eq(jobs.jobToken, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllJobs() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
}

export async function updateJobStatus(jobId: number, status: string, additionalFields?: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status, ...additionalFields };
  
  await db.update(jobs).set(updateData).where(eq(jobs.id, jobId));
}

export async function addJobLocation(location: InsertJobLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(jobLocations).values(location);
}

export async function getJobLocations(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(jobLocations).where(eq(jobLocations.jobId, jobId)).orderBy(desc(jobLocations.timestamp));
}

export async function getLatestJobLocation(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(jobLocations).where(eq(jobLocations.jobId, jobId)).orderBy(desc(jobLocations.timestamp)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function addJobStatusHistory(history: InsertJobStatusHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(jobStatusHistory).values(history);
}

export async function getJobStatusHistory(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(jobStatusHistory).where(eq(jobStatusHistory.jobId, jobId)).orderBy(desc(jobStatusHistory.timestamp));
}

export async function updateJobVideoConferenceLink(jobId: number, videoConferenceLink: string | null): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot update video conference link: database not available');
    return;
  }

  try {
    await db.update(jobs)
      .set({ videoConferenceLink })
      .where(eq(jobs.id, jobId));
  } catch (error) {
    console.error('[Database] Failed to update video conference link:', error);
    throw error;
  }
}



// SVR Media File Functions

export async function addSvrMediaFile(mediaFile: InsertSvrMediaFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(svrMediaFiles).values(mediaFile);
}

export async function getSvrMediaFiles(svrId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(svrMediaFiles).where(eq(svrMediaFiles.svrId, svrId)).orderBy(desc(svrMediaFiles.createdAt));
}

export async function deleteSvrMediaFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(svrMediaFiles).where(eq(svrMediaFiles.id, id)).limit(1);
  if (result.length === 0) return null;
  
  await db.delete(svrMediaFiles).where(eq(svrMediaFiles.id, id));
  return result[0];
}



// Job Comments Functions

export async function addJobComment(comment: InsertJobComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(jobComments).values(comment);
}

export async function getJobComments(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(jobComments).where(eq(jobComments.jobId, jobId)).orderBy(jobComments.createdAt);
}

