import * as cron from 'node-cron';
import { getJobsByDateRange } from './db';
import { sendExportEmail } from './email-export';

interface ScheduledExportConfig {
  id: string;
  organizationId: number;
  schedule: 'daily' | 'weekly' | 'monthly';
  cronExpression: string;
  recipientEmail: string;
  recipientName?: string;
  format: 'csv' | 'excel';
  status?: string;
  isActive: boolean;
}

// In-memory storage for scheduled exports (in production, this should be in database)
const scheduledExports: Map<string, { config: ScheduledExportConfig; task: cron.ScheduledTask }> = new Map();

/**
 * Get cron expression for schedule type
 */
function getCronExpression(schedule: 'daily' | 'weekly' | 'monthly'): string {
  switch (schedule) {
    case 'daily':
      return '0 8 * * *'; // Every day at 8 AM
    case 'weekly':
      return '0 8 * * 1'; // Every Monday at 8 AM
    case 'monthly':
      return '0 8 1 * *'; // First day of month at 8 AM
    default:
      return '0 8 * * *';
  }
}

/**
 * Get date range for scheduled export
 */
function getDateRange(schedule: 'daily' | 'weekly' | 'monthly'): { start: Date; end: Date } {
  const now = new Date();
  let end = new Date(now);
  let start = new Date(now);
  
  switch (schedule) {
    case 'daily':
      // Yesterday
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      // Last 7 days
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      // Last month
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
  }
  
  return { start, end };
}

/**
 * Execute scheduled export
 */
async function executeScheduledExport(config: ScheduledExportConfig): Promise<void> {
  try {
    console.log(`[Scheduled Export] Running export for ${config.recipientEmail}`);
    
    const { start, end } = getDateRange(config.schedule);
    
    // Fetch jobs
    const jobs = await getJobsByDateRange(start, end, config.organizationId, config.status);
    
    // Format jobs for export
    const exportData = jobs.map(job => ({
      'Job ID': job.id,
      'Site Name': job.siteName,
      'Site Address': job.siteAddress || '',
      'Client Name': job.clientName || '',
      'Contact Number': job.siteContactNumber || '',
      'Status': job.status,
      'Engineer': job.engineerName || 'Unassigned',
      'Scheduled': job.scheduledDateTime ? new Date(job.scheduledDateTime).toLocaleDateString() : '',
      'Created': new Date(job.createdAt).toLocaleDateString(),
      'Completed': job.completedAt ? new Date(job.completedAt).toLocaleDateString() : '',
    }));
    
    // Send email
    const success = await sendExportEmail({
      recipientEmail: config.recipientEmail,
      recipientName: config.recipientName,
      exportData,
      format: config.format,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      status: config.status,
    });
    
    if (success) {
      console.log(`[Scheduled Export] Successfully sent ${config.schedule} export to ${config.recipientEmail}`);
    } else {
      console.error(`[Scheduled Export] Failed to send export to ${config.recipientEmail}`);
    }
  } catch (error) {
    console.error('[Scheduled Export] Error executing scheduled export:', error);
  }
}

/**
 * Add or update a scheduled export
 */
export function scheduleExport(config: ScheduledExportConfig): boolean {
  try {
    // Stop existing task if it exists
    if (scheduledExports.has(config.id)) {
      const existing = scheduledExports.get(config.id);
      existing?.task.stop();
      scheduledExports.delete(config.id);
    }
    
    if (!config.isActive) {
      console.log(`[Scheduled Export] Deactivated export ${config.id}`);
      return true;
    }
    
    // Create new cron task
    const cronExpression = config.cronExpression || getCronExpression(config.schedule);
    
    const task = cron.schedule(cronExpression, () => {
      executeScheduledExport(config);
    });
    
    scheduledExports.set(config.id, { config, task });
    
    console.log(`[Scheduled Export] Scheduled ${config.schedule} export for ${config.recipientEmail} (${cronExpression})`);
    return true;
  } catch (error) {
    console.error('[Scheduled Export] Error scheduling export:', error);
    return false;
  }
}

/**
 * Remove a scheduled export
 */
export function removeScheduledExport(id: string): boolean {
  try {
    const existing = scheduledExports.get(id);
    if (existing) {
      existing.task.stop();
      scheduledExports.delete(id);
      console.log(`[Scheduled Export] Removed export ${id}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Scheduled Export] Error removing export:', error);
    return false;
  }
}

/**
 * Get all scheduled exports
 */
export function getScheduledExports(): ScheduledExportConfig[] {
  return Array.from(scheduledExports.values()).map(item => item.config);
}

/**
 * Get scheduled export by ID
 */
export function getScheduledExport(id: string): ScheduledExportConfig | undefined {
  return scheduledExports.get(id)?.config;
}

