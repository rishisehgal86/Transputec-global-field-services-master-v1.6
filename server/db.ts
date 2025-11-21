import { eq, desc, gte, lte, lt, and, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, jobs, jobLocations, jobStatusHistory, InsertJob, InsertJobLocation, InsertJobStatusHistory, svrMediaFiles, InsertSvrMediaFile, jobComments, InsertJobComment, organizations } from "../drizzle/schema";
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
  
  console.log('[DB] createJob called with:', JSON.stringify(job, null, 2));
  
  // Use raw MySQL query to bypass Drizzle's "default" bug
  const mysql = await import('mysql2/promise');
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    // Build the INSERT query dynamically based on provided fields
    const fields: string[] = [];
    const placeholders: string[] = [];
    const values: any[] = [];
    
    // Add each field that has a value
    Object.entries(job).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'default') {
        fields.push(`\`${key}\``);
        placeholders.push('?');
        values.push(value);
      }
    });
    
    const query = `INSERT INTO jobs (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    console.log('[DB] Executing query:', query);
    console.log('[DB] With values:', values);
    
    const [result] = await connection.execute(query, values) as any;
    const insertId = result.insertId;
    
    console.log('[DB] Job created with ID:', insertId);
    
    await connection.end();
    
    // Fetch and return the created job using Drizzle (SELECT is safe)
    const createdJob = await getJobById(insertId);
    return createdJob;
  } catch (error) {
    await connection.end();
    console.error('[DB] Raw MySQL insert failed:', error);
    throw error;
  }
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

export async function getJobsByDateRange(
  startDate: Date, 
  endDate: Date, 
  organizationId: number,
  status?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [
    eq(jobs.organizationId, organizationId),
    gte(jobs.createdAt, startDate),
    lte(jobs.createdAt, endDate)
  ];
  
  // Add status filter if provided
  if (status && status !== 'all') {
    conditions.push(sql`${jobs.status} = ${status}`);
  }
  
  const result = await db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .orderBy(desc(jobs.createdAt));
  
  return result;
}

export async function getAllJobs() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
}

export async function getJobsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(jobs)
    .where(eq(jobs.organizationId, organizationId))
    .orderBy(desc(jobs.createdAt));
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
  
  // Filter out undefined values to prevent "default" string insertion
  // Keep null values as they are valid for nullable fields
  const cleanedComment = Object.fromEntries(
    Object.entries(comment).filter(([_, value]) => value !== undefined)
  ) as InsertJobComment;
  
  await db.insert(jobComments).values(cleanedComment);
}

export async function getJobComments(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(jobComments).where(eq(jobComments.jobId, jobId)).orderBy(jobComments.createdAt);
}




// Filtered Job Queries

export async function getFilteredJobs(filter: "today" | "urgent" | "overdue" | "pending" | "in_progress") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case "today":
      // Jobs created today
      return await db.select().from(jobs)
        .where(gte(jobs.createdAt, todayStart))
        .orderBy(desc(jobs.createdAt));
    
    case "urgent":
      // Jobs with downTime=true (urgent)
      return await db.select().from(jobs)
        .where(eq(jobs.downTime, true))
        .orderBy(desc(jobs.createdAt));
    
    case "overdue":
      // Jobs that are older than 24 hours and not completed/cancelled
      const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
      return allJobs.filter(job => 
        job.status !== "completed" && 
        job.status !== "cancelled" &&
        job.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
    
    case "pending":
      // Jobs with status "pending_approval" or "created"
      const pendingJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
      return pendingJobs.filter(job => 
        job.status === "pending_approval" || job.status === "created"
      );
    
    case "in_progress":
      // Jobs with status "sent_to_engineer", "accepted", "en_route", or "on_site"
      const activeJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
      return activeJobs.filter(job => 
        job.status === "sent_to_engineer" ||
        job.status === "accepted" ||
        job.status === "en_route" ||
        job.status === "on_site"
      );
    
    default:
      return await getAllJobs();
  }
}

export async function getFilteredJobsByOrganization(filter: "today" | "urgent" | "overdue" | "pending" | "in_progress", organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case "today":
      // Jobs created today for this organization
      return await db.select().from(jobs)
        .where(and(eq(jobs.organizationId, organizationId), gte(jobs.createdAt, todayStart)))
        .orderBy(desc(jobs.createdAt));
    
    case "urgent":
      // Jobs with downTime=true (urgent) for this organization
      return await db.select().from(jobs)
        .where(and(eq(jobs.organizationId, organizationId), eq(jobs.downTime, true)))
        .orderBy(desc(jobs.createdAt));
    
    case "overdue":
      // Jobs that are older than 24 hours and not completed/cancelled for this organization
      const allJobs = await db.select().from(jobs)
        .where(eq(jobs.organizationId, organizationId))
        .orderBy(desc(jobs.createdAt));
      return allJobs.filter(job => 
        job.status !== "completed" && 
        job.status !== "cancelled" &&
        job.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
    
    case "pending":
      // Jobs with status "pending_approval" or "created" for this organization
      const pendingJobs = await db.select().from(jobs)
        .where(eq(jobs.organizationId, organizationId))
        .orderBy(desc(jobs.createdAt));
      return pendingJobs.filter(job => 
        job.status === "pending_approval" || job.status === "created"
      );
    
    case "in_progress":
      // Jobs with status "sent_to_engineer", "accepted", "en_route", or "on_site" for this organization
      const activeJobs = await db.select().from(jobs)
        .where(eq(jobs.organizationId, organizationId))
        .orderBy(desc(jobs.createdAt));
      return activeJobs.filter(job => 
        job.status === "sent_to_engineer" ||
        job.status === "accepted" ||
        job.status === "en_route" ||
        job.status === "on_site"
      );
    
    default:
      return await getJobsByOrganization(organizationId);
  }
}

export async function getJobFilterCounts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Get all jobs and filter in memory
  const allJobs = await db.select().from(jobs);
  
  return {
    today: allJobs.filter(job => job.createdAt >= todayStart).length,
    urgent: allJobs.filter(job => job.downTime === true).length,
    overdue: allJobs.filter(job => 
      job.status !== "completed" && 
      job.status !== "cancelled" &&
      job.createdAt < oneDayAgo
    ).length,
    pending: allJobs.filter(job => 
      job.status === "pending_approval" || job.status === "created"
    ).length,
    in_progress: allJobs.filter(job => 
      job.status === "sent_to_engineer" ||
      job.status === "accepted" ||
      job.status === "en_route" ||
      job.status === "on_site"
    ).length,
  };
}

export async function getJobFilterCountsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Get all jobs for this organization and filter in memory
  const allJobs = await db.select().from(jobs)
    .where(eq(jobs.organizationId, organizationId));
  
  return {
    today: allJobs.filter(job => job.createdAt >= todayStart).length,
    urgent: allJobs.filter(job => job.downTime === true).length,
    overdue: allJobs.filter(job => 
      job.status !== "completed" && 
      job.status !== "cancelled" &&
      job.createdAt < oneDayAgo
    ).length,
    pending: allJobs.filter(job => 
      job.status === "pending_approval" || job.status === "created"
    ).length,
    in_progress: allJobs.filter(job => 
      job.status === "sent_to_engineer" ||
      job.status === "accepted" ||
      job.status === "en_route" ||
      job.status === "on_site"
    ).length,
  };
}




// Subscription Management Functions

export async function updateOrganizationSubscription(params: {
  organizationId: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planTier?: 'trial' | 'starter' | 'enterprise' | 'free_enterprise';
  subscriptionStatus?: string;
  monthlyJobLimit?: number | null;
  maxAdminUsers?: number;
  billingCycleStart?: Date;
  billingCycleEnd?: Date;
  currentMonthJobCount?: number;
  trialEndsAt?: Date | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { organizationId, ...updates } = params;
  
  // Filter out undefined values
  const cleanedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );
  
  await db.update(organizations)
    .set(cleanedUpdates)
    .where(eq(organizations.id, organizationId));
  
  console.log(`[DB] Updated subscription for org ${organizationId}`);
}

export async function getOrganizationSubscription(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function incrementJobCount(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(organizations)
    .set({ currentMonthJobCount: sql`${organizations.currentMonthJobCount} + 1` })
    .where(eq(organizations.id, organizationId));
}

export async function resetMonthlyJobCount(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(organizations)
    .set({ currentMonthJobCount: 0 })
    .where(eq(organizations.id, organizationId));
}

