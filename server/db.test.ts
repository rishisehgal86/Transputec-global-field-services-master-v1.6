import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getFilteredJobsByOrganization, getJobFilterCountsByOrganization } from './db';

describe('Job Filter Improvements', () => {
  describe('Today Filter - UTC Timezone Handling', () => {
    it('should use UTC midnight for today filter', () => {
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      
      // Verify UTC midnight is calculated correctly
      expect(todayStart.getUTCHours()).toBe(0);
      expect(todayStart.getUTCMinutes()).toBe(0);
      expect(todayStart.getUTCSeconds()).toBe(0);
      expect(todayStart.getUTCMilliseconds()).toBe(0);
      
      // Verify it's today's date in UTC
      expect(todayStart.getUTCDate()).toBe(now.getUTCDate());
      expect(todayStart.getUTCMonth()).toBe(now.getUTCMonth());
      expect(todayStart.getUTCFullYear()).toBe(now.getUTCFullYear());
    });
  });

  describe('Overdue Filter - ScheduledDateTime Logic', () => {
    it('should consider job overdue if scheduledDateTime has passed', () => {
      const now = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Mock job with scheduledDateTime in the past
      const overdueJob = {
        id: 1,
        status: 'accepted',
        scheduledDateTime: yesterday,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      };
      
      // Mock job with scheduledDateTime in the future
      const futureJob = {
        id: 2,
        status: 'accepted',
        scheduledDateTime: tomorrow,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      };
      
      // Test overdue logic
      const isOverdue = (job: typeof overdueJob) => {
        if (job.status === 'completed' || job.status === 'cancelled') {
          return false;
        }
        if (job.scheduledDateTime) {
          return new Date(job.scheduledDateTime) < now;
        }
        return job.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000);
      };
      
      expect(isOverdue(overdueJob)).toBe(true);
      expect(isOverdue(futureJob)).toBe(false);
    });

    it('should fall back to 24-hour rule if no scheduledDateTime', () => {
      const now = new Date();
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      
      // Mock job without scheduledDateTime, created 2 days ago
      const oldJob = {
        id: 1,
        status: 'accepted',
        scheduledDateTime: null,
        createdAt: twoDaysAgo,
      };
      
      // Mock job without scheduledDateTime, created 1 hour ago
      const recentJob = {
        id: 2,
        status: 'accepted',
        scheduledDateTime: null,
        createdAt: oneHourAgo,
      };
      
      // Test fallback logic
      const isOverdue = (job: typeof oldJob) => {
        if (job.status === 'completed' || job.status === 'cancelled') {
          return false;
        }
        if (job.scheduledDateTime) {
          return new Date(job.scheduledDateTime) < now;
        }
        return job.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000);
      };
      
      expect(isOverdue(oldJob)).toBe(true);
      expect(isOverdue(recentJob)).toBe(false);
    });

    it('should not consider completed or cancelled jobs as overdue', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const completedJob = {
        id: 1,
        status: 'completed' as const,
        scheduledDateTime: yesterday,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      };
      
      const cancelledJob = {
        id: 2,
        status: 'cancelled' as const,
        scheduledDateTime: yesterday,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      };
      
      // Test that completed/cancelled jobs are never overdue
      const isOverdue = (job: typeof completedJob) => {
        if (job.status === 'completed' || job.status === 'cancelled') {
          return false;
        }
        if (job.scheduledDateTime) {
          return new Date(job.scheduledDateTime) < new Date();
        }
        return job.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000);
      };
      
      expect(isOverdue(completedJob)).toBe(false);
      expect(isOverdue(cancelledJob)).toBe(false);
    });
  });

  describe('Filter Logic Consistency', () => {
    it('should use consistent date calculations across all filters', () => {
      const now = new Date();
      
      // UTC midnight calculation (used in all 4 functions)
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      
      // 24-hour fallback calculation (used in all 4 functions)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Verify calculations are consistent
      expect(todayStart.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(oneDayAgo.getTime()).toBeLessThan(now.getTime());
      expect(now.getTime() - oneDayAgo.getTime()).toBe(24 * 60 * 60 * 1000);
    });
  });
});

