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
  updateJobStatus, 
  addJobLocation, 
  getJobLocations,
  getLatestJobLocation,
  addJobStatusHistory,
  getJobStatusHistory
} from "./db";
import { randomBytes } from "crypto";
import { geocodeAddress, calculateDistance, calculateETA, searchAddresses } from "./geocoding";
import { sendNewTicketNotification, sendClientConfirmation, sendSVREmail } from "./email";
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
          status: "pending_approval",
          coveredByCOI: true,
          createdBy: null,
        });
        
        console.log('✅ [CreateRequest] Job created with ID:', job?.id);
        
        // Send email notification to admin
        const adminEmail = 'rishi@karrdservicesuae.com';
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
        if (input.clientEmail && job) {
          try {
            await sendClientConfirmation({
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
            console.log('[Notification] Client confirmation email sent for ticket #', job.id);
          } catch (error) {
            console.error('[Notification] Failed to send client confirmation:', error);
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

    // Get all jobs (admin only)
    list: protectedProcedure.query(async () => {
      return await getAllJobs();
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
          const { sendJobAssignmentNotification } = await import('./email');
          await sendJobAssignmentNotification({
            engineerEmail: input.engineerEmail,
            engineerName: input.engineerName,
            siteName: job.siteName,
            siteAddress: job.siteAddress || 'N/A',
            scheduledDateTime: job.scheduledDateTime || undefined,
            incidentDetails: job.incidentDetails || 'N/A',
            jobToken: job.jobToken,
            baseUrl,
          });
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
          const adminEmail = 'rishi@karrdservicesuae.com';
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
        const adminEmail = 'rishi@karrdservicesuae.com';
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
  }),
});

export type AppRouter = typeof appRouter;

