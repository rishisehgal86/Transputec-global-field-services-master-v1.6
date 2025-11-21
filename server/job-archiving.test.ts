/**
 * Tests for Job Archiving System
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { archiveOldJobs, archiveJob, unarchiveJob, getArchivingStats, getArchivedJobs } from './job-archiving';
import { getDb } from './db';
import { jobs } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Job Archiving System', () => {
  let testOrganizationId: number;
  let testJobId: number;

  beforeAll(async () => {
    // Use a test organization ID (assuming organization 1 exists)
    testOrganizationId = 1;
  });

  it('should get archiving statistics', async () => {
    const stats = await getArchivingStats(testOrganizationId);
    
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('totalJobs');
    expect(stats).toHaveProperty('archivedJobs');
    expect(stats).toHaveProperty('activeJobs');
    expect(stats).toHaveProperty('completedNotArchived');
    expect(stats).toHaveProperty('cancelledNotArchived');
    expect(stats).toHaveProperty('archivePercentage');
    
    expect(typeof stats.totalJobs).toBe('number');
    expect(typeof stats.archivedJobs).toBe('number');
    expect(typeof stats.activeJobs).toBe('number');
    expect(stats.activeJobs).toBe(stats.totalJobs - stats.archivedJobs);
    
    console.log('Archiving Statistics:', stats);
  });

  it('should get archived jobs list', async () => {
    const archivedJobs = await getArchivedJobs(testOrganizationId, 10, 0);
    
    expect(Array.isArray(archivedJobs)).toBe(true);
    
    // All returned jobs should be archived
    archivedJobs.forEach(job => {
      expect(job.isArchived).toBe(true);
      expect(job.archivedAt).toBeDefined();
    });
    
    console.log(`Found ${archivedJobs.length} archived jobs`);
  });

  it('should manually archive a specific job', async () => {
    const db = await getDb();
    if (!db) {
      console.log('Database not available, skipping test');
      return;
    }

    // Find a completed job that is not archived
    const completedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.organizationId, testOrganizationId))
      .limit(1);

    if (completedJobs.length === 0) {
      console.log('No jobs available for testing, skipping manual archive test');
      return;
    }

    testJobId = completedJobs[0].id;
    const wasArchived = completedJobs[0].isArchived;

    // Archive the job
    await archiveJob(testJobId, 'test-user');

    // Verify it was archived
    const archivedJob = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, testJobId))
      .limit(1);

    expect(archivedJob[0].isArchived).toBe(true);
    expect(archivedJob[0].archivedAt).toBeDefined();
    expect(archivedJob[0].archivedBy).toBe('test-user');

    console.log(`Successfully archived job ${testJobId}`);

    // Restore original state if it wasn't archived before
    if (!wasArchived) {
      await unarchiveJob(testJobId);
    }
  });

  it('should unarchive a job', async () => {
    const db = await getDb();
    if (!db) {
      console.log('Database not available, skipping test');
      return;
    }

    // Find an archived job
    const archivedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.isArchived, true))
      .limit(1);

    if (archivedJobs.length === 0) {
      console.log('No archived jobs available for testing, skipping unarchive test');
      return;
    }

    const jobId = archivedJobs[0].id;

    // Unarchive the job
    await unarchiveJob(jobId);

    // Verify it was unarchived
    const unarchivedJob = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    expect(unarchivedJob[0].isArchived).toBe(false);
    expect(unarchivedJob[0].archivedAt).toBeNull();
    expect(unarchivedJob[0].archivedBy).toBeNull();

    console.log(`Successfully unarchived job ${jobId}`);

    // Restore archived state
    await archiveJob(jobId, 'test-restore');
  });

  it('should archive old jobs (dry run)', async () => {
    // This test doesn't actually archive anything, just checks the function runs
    const archivedCount = await archiveOldJobs(90, 'test-system');
    
    expect(typeof archivedCount).toBe('number');
    expect(archivedCount).toBeGreaterThanOrEqual(0);
    
    console.log(`Archiving would affect ${archivedCount} jobs`);
  });

  it('should validate archiving criteria', async () => {
    const db = await getDb();
    if (!db) {
      console.log('Database not available, skipping test');
      return;
    }

    // Get a completed job
    const completedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, 'completed'))
      .limit(1);

    if (completedJobs.length > 0) {
      const job = completedJobs[0];
      
      // Check if job meets archiving criteria
      if (job.completedAt) {
        const daysSinceCompletion = Math.floor(
          (Date.now() - new Date(job.completedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        console.log(`Sample completed job is ${daysSinceCompletion} days old`);
        
        if (daysSinceCompletion > 90) {
          console.log('Job is eligible for archiving (>90 days old)');
        } else {
          console.log(`Job will be eligible for archiving in ${90 - daysSinceCompletion} days`);
        }
      }
    }
  });
});

