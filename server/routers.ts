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

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const jobToken = randomBytes(32).toString('hex');
        
        const job = await createJob({
          ...input,
          jobToken,
          status: "pending_approval",
          coveredByCOI: true,
          createdBy: null,
        });
        
        // Send email notification to admin
        const adminEmail = process.env.ADMIN_EMAIL;
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

    // Accept job (engineer via link)
    accept: publicProcedure
      .input(z.object({
        token: z.string(),
        engineerName: z.string(),
        engineerEmail: z.string().optional(),
        engineerPhone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
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
      .mutation(async ({ input }) => {
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

        return { success: true };
      }),

    // Add location update
    addLocation: publicProcedure
      .input(z.object({
        token: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        accuracy: z.string().optional(),
        trackingType: z.enum(["en_route", "on_site"]),
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
      .mutation(async ({ input }) => {
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
});

export type AppRouter = typeof appRouter;

