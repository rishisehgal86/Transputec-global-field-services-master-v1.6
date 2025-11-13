import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createJob, 
  getJobByToken, 
  getJobById, 
  getAllJobs, 
  getJobsByDateRange,
  updateJobStatus, 
  addJobLocation, 
  getJobLocations,
  getLatestJobLocation,
  addJobStatusHistory,
  getJobStatusHistory,
  getFilteredJobs,
  getJobFilterCounts
} from "./db";
import { randomBytes } from "crypto";
import { geocodeAddress, calculateDistance, calculateETA, searchAddresses } from "./geocoding";
import { sendNewTicketNotification, sendClientConfirmation, sendSVREmail, sendCancellationNotification } from "./email";
import { createSiteVisitReport, getSiteVisitReportByJobId } from "./svr";

// Helper function to get base URL from request
function getBaseUrl(req: any): string {
  const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { authenticateUser, generateToken } = await import('./auth');
        const user = await authenticateUser(input.email, input.password);
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  geocoding: router({
    // Search for address suggestions
    search: publicProcedure
      .input(z.object({
        address: z.string(),
        limit: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const results = await searchAddresses(input.address, input.limit);
        return results;
      }),
    
    // Geocode an address to coordinates
    geocode: publicProcedure
      .input(z.object({
        address: z.string(),
      }))
      .mutation(async ({ input }) => {
        const result = await geocodeAddress(input.address);
        return result;
      }),
  }),

  jobs: router({
    // Create a service request (public - no auth required)
    createRequest: publicProcedure
      .input(z.object({
        clientName: z.string(),
        clientEmail: z.string().email(),
        siteName: z.string(),
        siteAddress: z.string(),
        siteLatitude: z.string(),
        siteLongitude: z.string(),
        siteContactName: z.string(),
        siteContactNumber: z.string(),
        incidentDetails: z.string(),
        scheduledDateTime: z.date().optional(),
        hoursRequired: z.string(),
        downTime: z.boolean().optional(),
        // Optional fields
        siteId: z.string().optional(),
        changeNumber: z.string().optional(),
        incidentNumber: z.string().optional(),
        projectName: z.string().optional(),
        toolsRequired: z.string().optional(),
        deviceDetails: z.string().optional(),
        scopeOfWork: z.string().optional(),
        videoConferenceLink: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        console.log('🎫 [CreateRequest] New service request received');
        console.log('📧 [CreateRequest] Client email from form:', input.clientEmail);
        const baseUrl = getBaseUrl(ctx.req);
        
        const jobToken = randomBytes(32).toString('hex');
        
        const job = await createJob({
          ...input,
          jobToken,
          organizationId: 1, // Default organization for public requests
          status: "pending_approval",
          coveredByCOI: true,
          createdBy: null,
        });
        
        console.log('✅ [CreateRequest] Job created with ID:', job?.id);
        
        // Send email notification to admin
        const adminEmail = 'admin@field-pulse.io';
        console.log('📤 [CreateRequest] Preparing to send admin email to:', adminEmail);
        if (adminEmail && job) {
          try {
            await sendNewTicketNotification({
              clientName: input.clientName,
              siteName: input.siteName,
              siteAddress: input.siteAddress,
              scheduledDateTime: input.scheduledDateTime,
              incidentDetails: input.incidentDetails,
              hoursRequired: input.hoursRequired,
              adminEmail,
              ticketId: job.id,
            });
            console.log('[Notification] Admin email notification sent for ticket #', job.id);
          } catch (error) {
            console.error('[Notification] Failed to send admin email:', error);
            // Don't fail the request if email fails
          }
        }
        
        // Send confirmation email to client
        console.log('📤 [CreateRequest] Preparing to send client confirmation to:', input.clientEmail);
        console.log('📤 [CreateRequest] Client email exists?', !!input.clientEmail, 'Job exists?', !!job);
        if (input.clientEmail && job) {
          console.log('📤 [CreateRequest] Calling sendClientConfirmation...');
          try {
            const clientEmailResult = await sendClientConfirmation({
              clientName: input.clientName,
              clientEmail: input.clientEmail,
              siteName: input.siteName,
              siteAddress: input.siteAddress,
              scheduledDateTime: input.scheduledDateTime,
              incidentDetails: input.incidentDetails,
              hoursRequired: input.hoursRequired,
              ticketId: job.id,
              trackingToken: jobToken,
              baseUrl,
            });
            console.log('[Notification] ✅ Client confirmation email sent successfully for ticket #', job.id, 'Result:', clientEmailResult);
          } catch (error) {
            console.error('[Notification] ❌ Failed to send client confirmation:', error);
            console.error('[Notification] ❌ Error stack:', error instanceof Error ? error.stack : error);
            // Don't fail the request if email fails
          }
        }
        
        return { 
          success: true,
          message: "Service request submitted for approval",
          trackingToken: jobToken,
          ticketId: job?.id,
        };
      }),

    // Create a new job (admin only)
    create: protectedProcedure
      .input(z.object({
        siteName: z.string(),
        siteId: z.string().optional(),
        siteLocation: z.string().optional(),
        siteAddress: z.string().optional(),
        siteLatitude: z.string().optional(),
        siteLongitude: z.string().optional(),
        siteContactName: z.string().optional(),
        siteContactNumber: z.string().optional(),
        changeNumber: z.string().optional(),
        incidentNumber: z.string().optional(),
        projectName: z.string().optional(),
        downTime: z.boolean().optional(),
        scheduledDateTime: z.date().optional(),
        hoursRequired: z.string().optional(),
        toolsRequired: z.string().optional(),
        deviceDetails: z.string().optional(),
        incidentDetails: z.string().optional(),
        scopeOfWork: z.string().optional(),
        coveredByCOI: z.boolean().optional(),
        videoConferenceLink: z.string().optional(),
        notes: z.string().optional(),
        clientName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const jobToken = randomBytes(32).toString('hex');
        
        await createJob({
          ...input,
          jobToken,
          organizationId: ctx.user.organizationId,
          status: "created",
          createdBy: ctx.user.id,
        });
        
        return { 
          success: true, 
          jobToken,
          engineerLink: `/engineer/${jobToken}`,
          clientLink: `/track/${jobToken}`,
        };
      }),

    // Duplicate an existing job (admin only)
    duplicate: protectedProcedure
      .input(z.object({
        jobId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const originalJob = await getJobById(input.jobId);
        if (!originalJob) {
          throw new Error('Job not found');
        }
        
        const jobToken = randomBytes(32).toString('hex');
        
        // Create new job with same details but new token and status
        await createJob({
          organizationId: ctx.user.organizationId,
          siteName: originalJob.siteName,
          siteId: originalJob.siteId || undefined,
          siteLocation: originalJob.siteLocation || undefined,
          siteAddress: originalJob.siteAddress || undefined,
          siteLatitude: originalJob.siteLatitude || undefined,
          siteLongitude: originalJob.siteLongitude || undefined,
          siteContactName: originalJob.siteContactName || undefined,
          siteContactNumber: originalJob.siteContactNumber || undefined,
          changeNumber: originalJob.changeNumber || undefined,
          incidentNumber: originalJob.incidentNumber || undefined,
          projectName: originalJob.projectName || undefined,
          downTime: originalJob.downTime || false,
          scheduledDateTime: originalJob.scheduledDateTime || undefined,
          hoursRequired: originalJob.hoursRequired || undefined,
          toolsRequired: originalJob.toolsRequired || undefined,
          deviceDetails: originalJob.deviceDetails || undefined,
          incidentDetails: originalJob.incidentDetails || undefined,
          scopeOfWork: originalJob.scopeOfWork || undefined,
          coveredByCOI: originalJob.coveredByCOI || false,
          videoConferenceLink: originalJob.videoConferenceLink || undefined,
          notes: `Duplicated from job #${originalJob.id}`,
          clientName: originalJob.clientName,
          jobToken,
          status: "created",
          createdBy: ctx.user.id,
        });
        
        return { 
          success: true, 
          jobToken,
          engineerLink: `/engineer/${jobToken}`,
          clientLink: `/track/${jobToken}`,
        };
      }),

    // Cancel a job with reason (admin only)
    cancel: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        reason: z.string(),
        cancelledBy: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const job = await getJobById(input.jobId);
        if (!job) {
          throw new Error('Job not found');
        }
        
        // Update job status to cancelled and add cancellation details
        await updateJobStatus(input.jobId, 'cancelled', {
          cancellationReason: input.reason,
          cancelledBy: input.cancelledBy,
          cancelledAt: new Date(),
        });
        
        // Get base URL for email links
        const baseUrl = getBaseUrl(ctx.req);
        const trackingUrl = `${baseUrl}/track/${job.jobToken}`;
        
        // Send cancellation notifications to all parties
        try {
          await sendCancellationNotification({
            jobId: job.id,
            siteName: job.siteName,
            clientName: job.clientName,
            clientEmail: job.clientEmail || undefined,
            engineerName: job.engineerName || undefined,
            engineerEmail: job.engineerEmail || undefined,
            cancellationReason: input.reason,
            cancelledBy: input.cancelledBy,
            trackingUrl,
            baseUrl,
          });
          console.log(`[CancelJob] Cancellation notifications sent for job #${job.id}`);
        } catch (error) {
          console.error(`[CancelJob] Failed to send cancellation notifications:`, error);
        }
        
        return { success: true };
      }),

    // Reassign job to another engineer (admin only)
    reassign: protectedProcedure
      .input(z.object({
        jobId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const job = await getJobById(input.jobId);
        if (!job) {
          throw new Error('Job not found');
        }
        
        // Generate new job token
        const newJobToken = randomBytes(32).toString('hex');
        
        // Update job with new token and clear engineer details
        await updateJobStatus(input.jobId, 'created', {
          jobToken: newJobToken,
          engineerName: null,
          engineerEmail: null,
          engineerPhone: null,
          acceptedAt: null,
        });
        
        console.log(`[ReassignJob] Job #${job.id} reassigned with new token`);
        
        return { 
          success: true,
          jobToken: newJobToken,
          engineerLink: `/engineer/${newJobToken}`,
        };
      }),

    // Get all jobs (admin only)
    list: protectedProcedure.query(async () => {
      return await getAllJobs();
    }),

    // Get filtered jobs (admin only)
    getFiltered: protectedProcedure
      .input(z.object({
        filter: z.enum(["today", "urgent", "overdue", "pending", "in_progress"])
      }))
      .query(async ({ input }) => {
        return await getFilteredJobs(input.filter);
      }),

    // Get filter counts (admin only)
    getFilterCounts: protectedProcedure.query(async () => {
      return await getJobFilterCounts();
    }),

    // Get job by token (public - for engineer and client access)
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return await getJobByToken(input.token);
      }),

    // Get job by ID (admin only)
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getJobById(input.id);
      }),

    // Send job assignment email to engineer (admin only)
    sendToEngineer: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        engineerEmail: z.string().email(),
        engineerName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const baseUrl = getBaseUrl(ctx.req);
        const job = await getJobById(input.jobId);
        if (!job) throw new Error("Job not found");

        // Update job status to sent_to_engineer
        await updateJobStatus(job.id, "sent_to_engineer");

        // Send email notification to engineer
        try {
          const { generateEngineerAssignmentEmail } = await import('./email-templates');
          const { sendEmail } = await import('./email-sender');
          
          const emailData = generateEngineerAssignmentEmail({
            engineerName: input.engineerName,
            jobId: job.id,
            siteName: job.siteName,
            siteAddress: job.siteAddress || 'Address not provided',
            scheduledDateTime: job.scheduledDateTime || undefined,
            timezone: job.clientTimezone || undefined,
            incidentDetails: job.incidentDetails || undefined,
            engineerLink: `${baseUrl}/engineer/${job.jobToken}`,
          });
          
          const emailSent = await sendEmail({
            to: input.engineerEmail,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          });
          
          if (!emailSent) {
            console.warn(`[Job ${job.id}] Failed to send email to engineer, but job status updated`);
          }
          
          console.log('[Email] Job assignment sent to engineer:', input.engineerEmail);
          return { success: true, message: 'Job assignment email sent successfully' };
        } catch (error) {
          console.error('[Email] Failed to send job assignment:', error);
          throw new Error('Failed to send job assignment email');
        }
      }),

    // Accept job (engineer via link)
    accept: publicProcedure
      .input(z.object({
        token: z.string(),
        engineerName: z.string(),
        engineerEmail: z.string().optional(),
        engineerPhone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const baseUrl = getBaseUrl(ctx.req);
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");
        if (job.status !== "created" && job.status !== "sent_to_engineer") {
          throw new Error("Job already accepted or completed");
        }

        await updateJobStatus(job.id, "accepted", {
          engineerName: input.engineerName,
          engineerEmail: input.engineerEmail,
          engineerPhone: input.engineerPhone,
          acceptedAt: new Date(),
        });

        await addJobStatusHistory({
          jobId: job.id,
          status: "accepted",
          notes: `Accepted by ${input.engineerName}`,
        });

        // Send email notification to client
        if (job.clientEmail) {
          try {
            const { sendStatusUpdateNotification } = await import('./email');
            await sendStatusUpdateNotification(job.clientEmail, {
              siteName: job.siteName,
              status: 'accepted',
              engineerName: input.engineerName,
              jobToken: job.jobToken,
              baseUrl,
            });
            console.log('[Email] Status update sent to client:', job.clientEmail);
          } catch (error) {
            console.error('[Email] Failed to send status update:', error);
          }
        }

        return { success: true };
      }),

    // Decline job (engineer via link)
    decline: publicProcedure
      .input(z.object({
        token: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        await updateJobStatus(job.id, "declined");

        await addJobStatusHistory({
          jobId: job.id,
          status: "declined",
          notes: input.reason || "Declined by engineer",
        });

        return { success: true };
      }),

    // Update job status
    updateStatus: publicProcedure
      .input(z.object({
        token: z.string(),
        status: z.enum(["approved", "rejected", "created", "en_route", "on_site", "completed", "cancelled"]),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const baseUrl = getBaseUrl(ctx.req);
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        const updateFields: any = {};
        
        if (input.status === "en_route") {
          updateFields.enRouteAt = new Date();
        } else if (input.status === "on_site") {
          updateFields.arrivedAt = new Date();
        } else if (input.status === "completed") {
          updateFields.completedAt = new Date();
        }

        await updateJobStatus(job.id, input.status, updateFields);

        await addJobStatusHistory({
          jobId: job.id,
          status: input.status,
          latitude: input.latitude,
          longitude: input.longitude,
          notes: input.notes,
        });

        // Send email notification to client for status changes
        if (job.clientEmail && ['en_route', 'on_site', 'completed'].includes(input.status)) {
          try {
            const { sendStatusUpdateNotification } = await import('./email');
            await sendStatusUpdateNotification(job.clientEmail, {
              siteName: job.siteName,
              status: input.status,
              engineerName: job.engineerName || 'Engineer',
              jobToken: job.jobToken,
              baseUrl,
            });
            console.log('[Email] Status update sent to client:', job.clientEmail);
          } catch (error) {
            console.error('[Email] Failed to send status update:', error);
          }
        }

        return { success: true };
      }),

    // Add comment (from engineer, client, or admin)
    addComment: publicProcedure
      .input(z.object({
        token: z.string(),
        comment: z.string(),
        authorName: z.string(),
        authorType: z.enum(['engineer', 'client', 'admin']),
        authorEmail: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const baseUrl = getBaseUrl(ctx.req);
        const { addJobComment } = await import('./db');
        
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");
        
        await addJobComment({
          jobId: job.id,
          authorName: input.authorName,
          authorType: input.authorType,
          comment: input.comment,
        });
        
        // Send email notifications to all relevant parties
        const { sendCommentNotification } = await import('./email');
        const recipients: string[] = [];
        
        // Add client email if available and not the author
        if (job.clientEmail && input.authorType !== 'client') {
          recipients.push(job.clientEmail);
        }
        
        // Add engineer email if available and not the author
        if (job.engineerEmail && input.authorType !== 'engineer') {
          recipients.push(job.engineerEmail);
        }
        
        // Add admin email if not the author
        if (input.authorType !== 'admin') {
          const adminEmail = 'admin@field-pulse.io';
          if (adminEmail) {
            recipients.push(adminEmail);
          }
        }
        
        // Send notifications to all recipients
        for (const email of recipients) {
          try {
            await sendCommentNotification(email, {
              siteName: job.siteName,
              authorName: input.authorName,
              authorType: input.authorType,
              commentText: input.comment,
              jobToken: job.jobToken,
              baseUrl,
            });
            console.log('[Email] Comment notification sent to:', email);
          } catch (error) {
            console.error('[Email] Failed to send comment notification to', email, ':', error);
          }
        }
        
        return { success: true };
      }),
    
    // Get all comments for a job
    getComments: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { getJobComments } = await import('./db');
        
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");
        
        return await getJobComments(job.id);
      }),

    // Update video conference link
    updateVideoConferenceLink: publicProcedure
      .input(z.object({
        token: z.string(),
        videoConferenceLink: z.string().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { updateJobVideoConferenceLink } = await import('./db');
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        await updateJobVideoConferenceLink(job.id, input.videoConferenceLink);
        return { success: true };
      }),

    // Add location update
    addLocation: publicProcedure
      .input(z.object({
        token: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        accuracy: z.string().optional(),
        trackingType: z.enum(["en_route", "on_site", "milestone"]),
      }))
      .mutation(async ({ input }) => {
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        await addJobLocation({
          jobId: job.id,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          trackingType: input.trackingType,
        });

        return { success: true };
      }),

    // Get location history
    getLocations: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        return await getJobLocations(job.id);
      }),

    // Get latest location
    getLatestLocation: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        return await getLatestJobLocation(job.id);
      }),

    // Get status history
    getStatusHistory: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        return await getJobStatusHistory(job.id);
      }),

    // Export jobs by date range and status
    exportJobs: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
        status: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const jobs = await getJobsByDateRange(
          input.startDate,
          input.endDate,
          ctx.user.organizationId,
          input.status
        );
        
        // Format jobs for export - core fields only
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
        
        return exportData;
      }),

    // Email export to specified recipient
    emailExport: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
        status: z.string().optional(),
        format: z.enum(['csv', 'excel']),
        recipientEmail: z.string().email(),
        recipientName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const jobs = await getJobsByDateRange(
          input.startDate,
          input.endDate,
          ctx.user.organizationId,
          input.status
        );
        
        // Format jobs for export - core fields only
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
        
        // Send email with export
        const { sendExportEmail } = await import('./email-export');
        const success = await sendExportEmail({
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          exportData,
          format: input.format,
          dateRange: {
            start: input.startDate.toISOString().split('T')[0],
            end: input.endDate.toISOString().split('T')[0],
          },
          status: input.status,
        });
        
        return { success, count: exportData.length };
      }),

    // Create or update scheduled export
    scheduleExport: protectedProcedure
      .input(z.object({
        id: z.string().optional(),
        schedule: z.enum(['daily', 'weekly', 'monthly']),
        recipientEmail: z.string().email(),
        recipientName: z.string().optional(),
        format: z.enum(['csv', 'excel']),
        status: z.string().optional(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { scheduleExport } = await import('./scheduled-exports');
        
        const exportId = input.id || `export_${ctx.user.organizationId}_${Date.now()}`;
        const cronExpression = input.schedule === 'daily' ? '0 8 * * *' : 
                              input.schedule === 'weekly' ? '0 8 * * 1' : 
                              '0 8 1 * *';
        
        const success = scheduleExport({
          id: exportId,
          organizationId: ctx.user.organizationId,
          schedule: input.schedule,
          cronExpression,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          format: input.format,
          status: input.status,
          isActive: input.isActive,
        });
        
        return { success, exportId };
      }),

    // Get all scheduled exports for organization
    getScheduledExports: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { getScheduledExports } = await import('./scheduled-exports');
        const allExports = getScheduledExports();
        
        // Filter by organization
        return allExports.filter(exp => exp.organizationId === ctx.user.organizationId);
      }),

    // Remove scheduled export
    removeScheduledExport: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const { removeScheduledExport } = await import('./scheduled-exports');
        const success = removeScheduledExport(input.id);
        return { success };
      }),
  }),

  // Site Visit Reports
  svr: router({
    // Create SVR and complete job
    create: publicProcedure
      .input(z.object({
        token: z.string(),
        visitDate: z.date(),
        ticketNumbers: z.string(),
        engineerName: z.string(),
        onsiteContact: z.string(),
        timeOnsite: z.string(),
        timeLeftSite: z.string(),
        issueFault: z.string(),
        actionsPerformed: z.string(),
        issueResolved: z.boolean(),
        contactAgreed: z.boolean(),
        clientSignatory: z.string(),
        clientSignatureData: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const baseUrl = getBaseUrl(ctx.req);
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");

        // Create SVR
        const svr = await createSiteVisitReport({
          jobId: job.id,
          visitDate: input.visitDate,
          ticketNumbers: input.ticketNumbers,
          engineerName: input.engineerName,
          onsiteContact: input.onsiteContact,
          timeOnsite: input.timeOnsite,
          timeLeftSite: input.timeLeftSite,
          issueFault: input.issueFault,
          actionsPerformed: input.actionsPerformed,
          issueResolved: input.issueResolved,
          contactAgreed: input.contactAgreed,
          clientSignatory: input.clientSignatory,
          clientSignatureData: input.clientSignatureData,
          signedAt: new Date(),
        });

        // Mark job as completed
        await updateJobStatus(job.id, "completed", {
          completedAt: new Date(),
        });

        await addJobStatusHistory({
          jobId: job.id,
          status: "completed",
          notes: "Job completed with Site Visit Report",
        });

        // Send completion notifications to client and admin
        const { sendJobCompletionNotification } = await import('./email');
        
        // Send to client
        if (job.clientEmail) {
          try {
            await sendJobCompletionNotification(job.clientEmail, {
              siteName: job.siteName,
              engineerName: input.engineerName,
              jobToken: job.jobToken,
              baseUrl,
            });
            console.log('[Email] Completion notification sent to client:', job.clientEmail);
          } catch (error) {
            console.error('[Email] Failed to send completion notification to client:', error);
          }
        }
        
        // Send to admin
        const adminEmail = 'admin@field-pulse.io';
        if (adminEmail) {
          try {
            await sendJobCompletionNotification(adminEmail, {
              siteName: job.siteName,
              engineerName: input.engineerName,
              jobToken: job.jobToken,
              baseUrl,
            });
            console.log('[Email] Completion notification sent to admin:', adminEmail);
          } catch (error) {
            console.error('[Email] Failed to send completion notification to admin:', error);
          }
        }

        return { success: true, svr };
      }),

    // Get SVR by job token
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");
        
        return await getSiteVisitReportByJobId(job.id);
      }),

    // Upload media file to SVR
    uploadMedia: publicProcedure
      .input(z.object({
        token: z.string(),
        fileName: z.string(),
        fileType: z.enum(["image", "video"]),
        mimeType: z.string(),
        fileData: z.string(), // Base64 encoded file
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import('./storage');
        const { addSvrMediaFile } = await import('./db');
        
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");
        
        const svr = await getSiteVisitReportByJobId(job.id);
        if (!svr) throw new Error("Site Visit Report not found");
        
        // Decode base64 file data
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileSize = fileBuffer.length;
        
        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (fileSize > maxSize) {
          throw new Error("File size exceeds 50MB limit");
        }
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = randomBytes(8).toString('hex');
        const fileExtension = input.fileName.split('.').pop();
        const fileKey = `svr-media/${svr.id}/${timestamp}-${randomSuffix}.${fileExtension}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
        
        // Save to database
        await addSvrMediaFile({
          svrId: svr.id,
          fileKey,
          fileUrl: url,
          fileName: input.fileName,
          fileType: input.fileType,
          mimeType: input.mimeType,
          fileSize,
        });
        
        return { success: true, url };
      }),
    
    // Get media files for SVR
    getMedia: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { getSvrMediaFiles } = await import('./db');
        
        const job = await getJobByToken(input.token);
        if (!job) throw new Error("Job not found");
        
        const svr = await getSiteVisitReportByJobId(job.id);
        if (!svr) return [];
        
        return await getSvrMediaFiles(svr.id);
      }),

    // Email SVR to specified address (admin only)
    email: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        recipientEmail: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const job = await getJobById(input.jobId);
        if (!job) throw new Error("Job not found");

        const svr = await getSiteVisitReportByJobId(input.jobId);
        if (!svr) throw new Error("Site Visit Report not found");

        try {
          await sendSVREmail({
            recipientEmail: input.recipientEmail,
            job,
            svr,
          });
          return { success: true };
        } catch (error) {
          console.error("Failed to send SVR email:", error);
          throw new Error("Failed to send SVR email");
        }
      }),
  }),

  projects: router({
    // Create new project (admin only)
    create: protectedProcedure
      .input(z.object({
        projectId: z.string().min(1).max(100),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { createProject } = await import('./projects-db');
        const project = await createProject({
          organizationId: ctx.user.organizationId,
          projectId: input.projectId,
          name: input.name,
          description: input.description,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          isActive: true,
        });
        
        return project;
      }),

    // List all projects for organization
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { getProjectsByOrganization } = await import('./projects-db');
        return await getProjectsByOrganization(ctx.user.organizationId);
      }),

    // Get project by ID
    getByProjectId: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { getProjectByProjectId } = await import('./projects-db');
        return await getProjectByProjectId(input.projectId);
      }),

    // Verify project exists and belongs to organization
    verify: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { verifyProject } = await import('./projects-db');
        const isValid = await verifyProject(input.projectId, ctx.user.organizationId);
        return { isValid };
      }),

    // Update project
    update: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { projectId, ...updates } = input;
        const { updateProject } = await import('./projects-db');
        return await updateProject(projectId, updates);
      }),

    // Toggle project status
    toggleStatus: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const { toggleProjectStatus } = await import('./projects-db');
        return await toggleProjectStatus(input.projectId, input.isActive);
      }),

    // Delete project
    delete: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .mutation(async ({ input }) => {
        const { deleteProject } = await import('./projects-db');
        return await deleteProject(input.projectId);
      }),

    // Download site upload template
    downloadSiteTemplate: protectedProcedure
      .mutation(async () => {
        const { generateSiteTemplate } = await import('./site-template');
        const buffer = generateSiteTemplate();
        return {
          data: buffer.toString('base64'),
          filename: 'project-sites-template.xlsx',
        };
      }),

    // Upload and parse site file
    uploadSites: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        fileData: z.string(), // Base64 encoded file
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const { parseSiteUpload } = await import('./site-template');
        const { bulkCreateProjectSites } = await import('./project-sites-db');
        const { geocodeAddress } = await import('./geocoding');
        
        // Decode base64 file
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        
        // Parse Excel file
        const { sites, errors } = parseSiteUpload(fileBuffer);
        
        if (errors.length > 0) {
          return { success: false, errors, imported: 0 };
        }
        
        // Geocode sites that don't have coordinates
        const sitesWithCoords = await Promise.all(
          sites.map(async (site) => {
            let lat = site.latitude;
            let lng = site.longitude;
            
            // If coordinates not provided, geocode the address
            if (!lat || !lng) {
              try {
                const fullAddress = `${site.siteAddress}, ${site.city || ''} ${site.postalCode || ''}`.trim();
                const coords = await geocodeAddress(fullAddress);
                lat = coords.latitude;
                lng = coords.longitude;
              } catch (error) {
                errors.push(`Failed to geocode address for "${site.siteName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
              }
            }
            
            return {
              projectId: input.projectId,
              siteName: site.siteName,
              siteAddress: site.siteAddress,
              city: site.city,
              postalCode: site.postalCode,
              latitude: lat,
              longitude: lng,
              contactName: site.contactName,
              contactPhone: site.contactPhone,
              contactEmail: site.contactEmail,
              notes: site.notes,
              isActive: true,
            };
          })
        );
        
        // Filter out failed geocoding
        const validSites = sitesWithCoords.filter(site => site !== null);
        
        if (validSites.length === 0) {
          return { success: false, errors, imported: 0 };
        }
        
        // Bulk insert sites
        const imported = await bulkCreateProjectSites(validSites as any[]);
        
        return {
          success: true,
          imported,
          errors,
        };
      }),

    // Get sites for a project
    getSites: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        const { getProjectSites } = await import('./project-sites-db');
        return await getProjectSites(input.projectId);
      }),

    // Add single site
    addSite: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        siteName: z.string(),
        siteAddress: z.string(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createProjectSite } = await import('./project-sites-db');
        const { geocodeAddress } = await import('./geocoding');
        
        let lat = input.latitude;
        let lng = input.longitude;
        
        // Geocode if coordinates not provided
        if (!lat || !lng) {
          const fullAddress = `${input.siteAddress}, ${input.city || ''} ${input.postalCode || ''}`.trim();
          const coords = await geocodeAddress(fullAddress);
          lat = coords.latitude;
          lng = coords.longitude;
        }
        
        return await createProjectSite({
          projectId: input.projectId,
          siteName: input.siteName,
          siteAddress: input.siteAddress,
          city: input.city,
          postalCode: input.postalCode,
          latitude: lat,
          longitude: lng,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          notes: input.notes,
          isActive: true,
        });
      }),

    // Delete site
    deleteSite: protectedProcedure
      .input(z.object({ siteId: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteProjectSite } = await import('./project-sites-db');
        return await deleteProjectSite(input.siteId);
      }),
  }),

  users: router({
    // List all users (admin only)
    list: protectedProcedure.query(async () => {
      const { getAllUsers } = await import('./auth');
      return await getAllUsers();
    }),

    // Create a new user (admin only)
    create: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string(),
        password: z.string().min(8),
        role: z.enum(['super_admin', 'admin']).default('admin'),
      }))
      .mutation(async ({ input }) => {
        const { createUser, getUserByEmail } = await import('./auth');
        
        // Check if user already exists
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
        
        const user = await createUser(input.email, input.password, input.name, input.role);
        if (!user) {
          throw new Error('Failed to create user');
        }
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),

    // Change password (authenticated user)
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        const { authenticateUser, updateUserPassword } = await import('./auth');
        
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }
        
        // Verify current password
        const user = await authenticateUser(ctx.user.email, input.currentPassword);
        if (!user) {
          throw new Error('Current password is incorrect');
        }
        
        // Update password
        const success = await updateUserPassword(ctx.user.id, input.newPassword);
        if (!success) {
          throw new Error('Failed to update password');
        }
        
        return { success: true };
      }),

    // Toggle user active status (admin only)
    toggleStatus: protectedProcedure
      .input(z.object({
        userId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateUserStatus } = await import('./auth');
        
        // Prevent users from deactivating themselves
        if (ctx.user && input.userId === ctx.user.id) {
          throw new Error('Cannot deactivate your own account');
        }
        
        const success = await updateUserStatus(input.userId, input.isActive);
        if (!success) {
          throw new Error('Failed to update user status');
        }
        
        return { success: true, isActive: input.isActive };
      }),

    // Upload document for a job
    uploadDocument: publicProcedure
      .input(z.object({
        jobId: z.number(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        uploadedBy: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { addJobDocument } = await import('./job-documents-db');
        return await addJobDocument(input);
      }),

    // Get documents for a job
    getDocuments: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const { getJobDocuments } = await import('./job-documents-db');
        return await getJobDocuments(input.jobId);
      }),

    // Delete a document
    deleteDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteJobDocument } = await import('./job-documents-db');
        await deleteJobDocument(input.documentId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

