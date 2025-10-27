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
        
        await createJob({
          ...input,
          jobToken,
          status: "pending_approval",
          coveredByCOI: true,
          createdBy: null,
        });
        
        return { 
          success: true,
          message: "Service request submitted for approval",
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
});

export type AppRouter = typeof appRouter;

