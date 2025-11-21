var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      jwtSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      superAdminEmail: process.env.SUPER_ADMIN_EMAIL ?? "admin@transputec.com",
      superAdminPassword: process.env.SUPER_ADMIN_PASSWORD ?? "Admin@123",
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? ""
      // Optional: for better geocoding accuracy
    };
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  jobComments: () => jobComments,
  jobLocations: () => jobLocations,
  jobStatusHistory: () => jobStatusHistory,
  jobs: () => jobs,
  organizations: () => organizations,
  passwordResetTokens: () => passwordResetTokens,
  projectSites: () => projectSites,
  projects: () => projects,
  siteVisitReports: () => siteVisitReports,
  svrMediaFiles: () => svrMediaFiles,
  users: () => users
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
var organizations, projects, projectSites, users, jobs, jobLocations, jobStatusHistory, siteVisitReports, svrMediaFiles, jobComments, passwordResetTokens;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    organizations = mysqlTable("organizations", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      // URL-friendly identifier
      // Trial and Subscription
      trialEndsAt: timestamp("trialEndsAt"),
      subscriptionStatus: mysqlEnum("subscriptionStatus", ["trial", "active", "past_due", "cancelled", "expired"]).default("trial").notNull(),
      subscriptionPlan: mysqlEnum("subscriptionPlan", ["go_only", "core_only", "both"]),
      // null during trial
      // Stripe Integration
      stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
      stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
      planTier: mysqlEnum("planTier", ["trial", "starter", "enterprise", "free_enterprise"]).default("trial"),
      monthlyJobLimit: int("monthlyJobLimit").default(50),
      // 50 for trial, 100 for starter, NULL for enterprise
      currentMonthJobCount: int("currentMonthJobCount").default(0).notNull(),
      maxAdminUsers: int("maxAdminUsers").default(999).notNull(),
      // 3 for starter, 999 for others
      billingCycleStart: timestamp("billingCycleStart"),
      billingCycleEnd: timestamp("billingCycleEnd"),
      // Settings
      isActive: boolean("isActive").default(true).notNull(),
      projectsEnabled: boolean("projectsEnabled").default(false).notNull(),
      // Enable/disable multi-project feature
      lastUsedAt: timestamp("lastUsedAt"),
      // Track when organization was last active
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    projects = mysqlTable("projects", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull().references(() => organizations.id),
      // Project identification
      projectId: varchar("projectId", { length: 100 }).notNull().unique(),
      // Unique identifier (e.g., "PROJ-001")
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      // Client information
      clientName: varchar("clientName", { length: 255 }),
      clientEmail: varchar("clientEmail", { length: 320 }),
      clientPhone: varchar("clientPhone", { length: 50 }),
      // Status
      isActive: boolean("isActive").default(true).notNull(),
      // Site restriction
      restrictToSites: boolean("restrictToSites").default(false).notNull(),
      // If true, only predefined sites can be selected
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    projectSites = mysqlTable("project_sites", {
      id: int("id").autoincrement().primaryKey(),
      projectId: varchar("projectId", { length: 100 }).notNull().references(() => projects.projectId, { onDelete: "cascade" }),
      // Site information
      siteName: varchar("siteName", { length: 255 }).notNull(),
      siteAddress: text("siteAddress").notNull(),
      city: varchar("city", { length: 150 }),
      postalCode: varchar("postalCode", { length: 50 }),
      country: varchar("country", { length: 100 }),
      // Geocoding (optional - will be geocoded from address if not provided)
      latitude: varchar("latitude", { length: 50 }),
      longitude: varchar("longitude", { length: 50 }),
      // Contact information
      contactName: varchar("contactName", { length: 255 }),
      contactPhone: varchar("contactPhone", { length: 50 }),
      contactEmail: varchar("contactEmail", { length: 320 }),
      // Additional info
      notes: text("notes"),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull().references(() => organizations.id),
      email: varchar("email", { length: 320 }).notNull().unique(),
      passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
      name: text("name").notNull(),
      role: mysqlEnum("role", ["super_admin", "admin"]).default("admin").notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      isPrimaryAdmin: boolean("isPrimaryAdmin").default(false).notNull(),
      // First admin who created the organization
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastLogin: timestamp("lastLogin")
    });
    jobs = mysqlTable("jobs", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull().references(() => organizations.id),
      projectId: varchar("projectId", { length: 100 }).references(() => projects.projectId),
      // Optional project assignment
      // Unique identifier for shareable links
      jobToken: varchar("jobToken", { length: 64 }).notNull().unique(),
      // Site Information
      siteName: varchar("siteName", { length: 255 }).notNull(),
      siteId: varchar("siteId", { length: 100 }),
      siteLocation: varchar("siteLocation", { length: 255 }),
      siteAddress: text("siteAddress"),
      siteLatitude: varchar("siteLatitude", { length: 50 }),
      siteLongitude: varchar("siteLongitude", { length: 50 }),
      // Contact Information
      siteContactName: varchar("siteContactName", { length: 255 }),
      siteContactNumber: varchar("siteContactNumber", { length: 50 }),
      // Job Details
      changeNumber: varchar("changeNumber", { length: 100 }),
      incidentNumber: varchar("incidentNumber", { length: 100 }),
      projectName: varchar("projectName", { length: 255 }),
      downTime: boolean("downTime").default(false),
      scheduledDateTime: timestamp("scheduledDateTime"),
      hoursRequired: varchar("hoursRequired", { length: 100 }),
      // Booking Type and Duration
      bookingType: mysqlEnum("bookingType", ["full_day", "hourly", "multi_day"]),
      estimatedHours: int("estimatedHours"),
      // For hourly bookings
      estimatedDays: int("estimatedDays"),
      // For multi-day bookings
      // Time Scheduling and Negotiation
      requestedStartDate: timestamp("requestedStartDate"),
      requestedStartTime: varchar("requestedStartTime", { length: 10 }),
      // HH:MM format
      proposedStartDate: timestamp("proposedStartDate"),
      // Admin/Engineer counter-proposal
      proposedStartTime: varchar("proposedStartTime", { length: 10 }),
      confirmedStartDate: timestamp("confirmedStartDate"),
      // Final confirmed schedule
      confirmedStartTime: varchar("confirmedStartTime", { length: 10 }),
      timeNegotiationNotes: text("timeNegotiationNotes"),
      // Technical Requirements
      toolsRequired: text("toolsRequired"),
      deviceDetails: text("deviceDetails"),
      incidentDetails: text("incidentDetails"),
      scopeOfWork: text("scopeOfWork"),
      // Additional Information
      coveredByCOI: boolean("coveredByCOI").default(true),
      notes: text("notes"),
      videoConferenceLink: varchar("videoConferenceLink", { length: 500 }),
      // Job Status
      status: mysqlEnum("status", [
        "pending_approval",
        "approved",
        "rejected",
        "created",
        "sent_to_engineer",
        "accepted",
        "declined",
        "en_route",
        "on_site",
        "completed",
        "cancelled"
      ]).default("pending_approval").notNull(),
      // Engineer Information
      engineerName: varchar("engineerName", { length: 255 }),
      engineerEmail: varchar("engineerEmail", { length: 320 }),
      engineerPhone: varchar("engineerPhone", { length: 50 }),
      // Timezone - IANA timezone identifier (e.g., 'America/New_York', 'Asia/Dubai')
      timezone: varchar("timezone", { length: 100 }),
      // Timestamps
      acceptedAt: timestamp("acceptedAt"),
      enRouteAt: timestamp("enRouteAt"),
      arrivedAt: timestamp("arrivedAt"),
      completedAt: timestamp("completedAt"),
      cancelledAt: timestamp("cancelledAt"),
      // Cancellation tracking
      cancellationReason: varchar("cancellationReason", { length: 500 }),
      cancelledBy: varchar("cancelledBy", { length: 255 }),
      // Name of person who cancelled
      // Client Information
      clientName: varchar("clientName", { length: 255 }).notNull(),
      clientEmail: varchar("clientEmail", { length: 320 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      createdBy: int("createdBy").references(() => users.id)
    });
    jobLocations = mysqlTable("jobLocations", {
      id: int("id").autoincrement().primaryKey(),
      jobId: int("jobId").notNull().references(() => jobs.id),
      // GPS Coordinates
      latitude: varchar("latitude", { length: 50 }).notNull(),
      longitude: varchar("longitude", { length: 50 }).notNull(),
      accuracy: varchar("accuracy", { length: 50 }),
      // in meters
      // Tracking context
      trackingType: mysqlEnum("trackingType", ["en_route", "on_site", "milestone"]).notNull(),
      timestamp: timestamp("timestamp").defaultNow().notNull()
    });
    jobStatusHistory = mysqlTable("jobStatusHistory", {
      id: int("id").autoincrement().primaryKey(),
      jobId: int("jobId").notNull().references(() => jobs.id),
      status: varchar("status", { length: 50 }).notNull(),
      notes: text("notes"),
      // Location at time of status change (optional)
      latitude: varchar("latitude", { length: 50 }),
      longitude: varchar("longitude", { length: 50 }),
      timestamp: timestamp("timestamp").defaultNow().notNull()
    });
    siteVisitReports = mysqlTable("siteVisitReports", {
      id: int("id").autoincrement().primaryKey(),
      jobId: int("jobId").notNull().unique().references(() => jobs.id),
      // Visit Details
      visitDate: timestamp("visitDate").notNull(),
      ticketNumbers: text("ticketNumbers"),
      engineerName: varchar("engineerName", { length: 255 }).notNull(),
      onsiteContact: varchar("onsiteContact", { length: 255 }),
      timeOnsite: varchar("timeOnsite", { length: 50 }),
      timeLeftSite: varchar("timeLeftSite", { length: 50 }),
      // Work Details
      issueFault: text("issueFault"),
      actionsPerformed: text("actionsPerformed"),
      issueResolved: boolean("issueResolved").default(false),
      contactAgreed: boolean("contactAgreed").default(false),
      // Client Sign-off
      clientSignatory: varchar("clientSignatory", { length: 255 }),
      clientSignatureData: text("clientSignatureData"),
      // Base64 signature image
      signedAt: timestamp("signedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    svrMediaFiles = mysqlTable("svrMediaFiles", {
      id: int("id").autoincrement().primaryKey(),
      svrId: int("svrId").notNull().references(() => siteVisitReports.id),
      // File Information
      fileKey: varchar("fileKey", { length: 500 }).notNull(),
      // S3 key
      fileUrl: varchar("fileUrl", { length: 1e3 }).notNull(),
      // S3 URL
      fileName: varchar("fileName", { length: 255 }).notNull(),
      fileType: mysqlEnum("fileType", ["image", "video"]).notNull(),
      mimeType: varchar("mimeType", { length: 100 }).notNull(),
      fileSize: int("fileSize").notNull(),
      // in bytes
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    jobComments = mysqlTable("jobComments", {
      id: int("id").autoincrement().primaryKey(),
      jobId: int("jobId").notNull().references(() => jobs.id),
      // Comment Information
      authorName: varchar("authorName", { length: 255 }).notNull(),
      authorType: mysqlEnum("authorType", ["engineer", "client", "admin"]).notNull(),
      comment: text("comment").notNull(),
      // Media Attachments (JSON array of {url: string, type: 'image'|'video', filename: string, size: number})
      attachments: text("attachments"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    passwordResetTokens = mysqlTable("passwordResetTokens", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: varchar("token", { length: 255 }).notNull().unique(),
      expiresAt: timestamp("expiresAt").notNull(),
      used: boolean("used").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addJobComment: () => addJobComment,
  addJobLocation: () => addJobLocation,
  addJobStatusHistory: () => addJobStatusHistory,
  addSvrMediaFile: () => addSvrMediaFile,
  createJob: () => createJob,
  deleteSvrMediaFile: () => deleteSvrMediaFile,
  getAllJobs: () => getAllJobs,
  getDb: () => getDb,
  getFilteredJobs: () => getFilteredJobs,
  getFilteredJobsByOrganization: () => getFilteredJobsByOrganization,
  getJobById: () => getJobById,
  getJobByToken: () => getJobByToken,
  getJobComments: () => getJobComments,
  getJobFilterCounts: () => getJobFilterCounts,
  getJobFilterCountsByOrganization: () => getJobFilterCountsByOrganization,
  getJobLocations: () => getJobLocations,
  getJobStatusHistory: () => getJobStatusHistory,
  getJobsByDateRange: () => getJobsByDateRange,
  getJobsByOrganization: () => getJobsByOrganization,
  getLatestJobLocation: () => getLatestJobLocation,
  getOrganizationSubscription: () => getOrganizationSubscription,
  getSvrMediaFiles: () => getSvrMediaFiles,
  incrementJobCount: () => incrementJobCount,
  resetMonthlyJobCount: () => resetMonthlyJobCount,
  updateJobStatus: () => updateJobStatus,
  updateJobVideoConferenceLink: () => updateJobVideoConferenceLink,
  updateOrganizationSubscription: () => updateOrganizationSubscription
});
import { eq, desc, gte, lte, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
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
async function createJob(job) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const cleanedJob = Object.fromEntries(
    Object.entries(job).filter(([_, value]) => value !== void 0)
  );
  const result = await db.insert(jobs).values(cleanedJob);
  const insertId = Number(result[0].insertId);
  const createdJob = await getJobById(insertId);
  return createdJob;
}
async function getJobByToken(token) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(jobs).where(eq(jobs.jobToken, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getJobById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getJobsByDateRange(startDate, endDate, organizationId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [
    eq(jobs.organizationId, organizationId),
    gte(jobs.createdAt, startDate),
    lte(jobs.createdAt, endDate)
  ];
  if (status && status !== "all") {
    conditions.push(sql`${jobs.status} = ${status}`);
  }
  const result = await db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.createdAt));
  return result;
}
async function getAllJobs() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
}
async function getJobsByOrganization(organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(jobs).where(eq(jobs.organizationId, organizationId)).orderBy(desc(jobs.createdAt));
}
async function updateJobStatus(jobId, status, additionalFields) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status, ...additionalFields };
  await db.update(jobs).set(updateData).where(eq(jobs.id, jobId));
}
async function addJobLocation(location) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobLocations).values(location);
}
async function getJobLocations(jobId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(jobLocations).where(eq(jobLocations.jobId, jobId)).orderBy(desc(jobLocations.timestamp));
}
async function getLatestJobLocation(jobId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(jobLocations).where(eq(jobLocations.jobId, jobId)).orderBy(desc(jobLocations.timestamp)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function addJobStatusHistory(history) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobStatusHistory).values(history);
}
async function getJobStatusHistory(jobId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(jobStatusHistory).where(eq(jobStatusHistory.jobId, jobId)).orderBy(desc(jobStatusHistory.timestamp));
}
async function updateJobVideoConferenceLink(jobId, videoConferenceLink) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update video conference link: database not available");
    return;
  }
  try {
    await db.update(jobs).set({ videoConferenceLink }).where(eq(jobs.id, jobId));
  } catch (error) {
    console.error("[Database] Failed to update video conference link:", error);
    throw error;
  }
}
async function addSvrMediaFile(mediaFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(svrMediaFiles).values(mediaFile);
}
async function getSvrMediaFiles(svrId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(svrMediaFiles).where(eq(svrMediaFiles.svrId, svrId)).orderBy(desc(svrMediaFiles.createdAt));
}
async function deleteSvrMediaFile(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(svrMediaFiles).where(eq(svrMediaFiles.id, id)).limit(1);
  if (result.length === 0) return null;
  await db.delete(svrMediaFiles).where(eq(svrMediaFiles.id, id));
  return result[0];
}
async function addJobComment(comment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const cleanedComment = Object.fromEntries(
    Object.entries(comment).filter(([_, value]) => value !== void 0)
  );
  await db.insert(jobComments).values(cleanedComment);
}
async function getJobComments(jobId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(jobComments).where(eq(jobComments.jobId, jobId)).orderBy(jobComments.createdAt);
}
async function getFilteredJobs(filter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = /* @__PURE__ */ new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (filter) {
    case "today":
      return await db.select().from(jobs).where(gte(jobs.createdAt, todayStart)).orderBy(desc(jobs.createdAt));
    case "urgent":
      return await db.select().from(jobs).where(eq(jobs.downTime, true)).orderBy(desc(jobs.createdAt));
    case "overdue":
      const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
      return allJobs.filter(
        (job) => job.status !== "completed" && job.status !== "cancelled" && job.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1e3)
      );
    case "pending":
      const pendingJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
      return pendingJobs.filter(
        (job) => job.status === "pending_approval" || job.status === "created"
      );
    case "in_progress":
      const activeJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
      return activeJobs.filter(
        (job) => job.status === "sent_to_engineer" || job.status === "accepted" || job.status === "en_route" || job.status === "on_site"
      );
    default:
      return await getAllJobs();
  }
}
async function getFilteredJobsByOrganization(filter, organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = /* @__PURE__ */ new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (filter) {
    case "today":
      return await db.select().from(jobs).where(and(eq(jobs.organizationId, organizationId), gte(jobs.createdAt, todayStart))).orderBy(desc(jobs.createdAt));
    case "urgent":
      return await db.select().from(jobs).where(and(eq(jobs.organizationId, organizationId), eq(jobs.downTime, true))).orderBy(desc(jobs.createdAt));
    case "overdue":
      const allJobs = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId)).orderBy(desc(jobs.createdAt));
      return allJobs.filter(
        (job) => job.status !== "completed" && job.status !== "cancelled" && job.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1e3)
      );
    case "pending":
      const pendingJobs = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId)).orderBy(desc(jobs.createdAt));
      return pendingJobs.filter(
        (job) => job.status === "pending_approval" || job.status === "created"
      );
    case "in_progress":
      const activeJobs = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId)).orderBy(desc(jobs.createdAt));
      return activeJobs.filter(
        (job) => job.status === "sent_to_engineer" || job.status === "accepted" || job.status === "en_route" || job.status === "on_site"
      );
    default:
      return await getJobsByOrganization(organizationId);
  }
}
async function getJobFilterCounts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = /* @__PURE__ */ new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const allJobs = await db.select().from(jobs);
  return {
    today: allJobs.filter((job) => job.createdAt >= todayStart).length,
    urgent: allJobs.filter((job) => job.downTime === true).length,
    overdue: allJobs.filter(
      (job) => job.status !== "completed" && job.status !== "cancelled" && job.createdAt < oneDayAgo
    ).length,
    pending: allJobs.filter(
      (job) => job.status === "pending_approval" || job.status === "created"
    ).length,
    in_progress: allJobs.filter(
      (job) => job.status === "sent_to_engineer" || job.status === "accepted" || job.status === "en_route" || job.status === "on_site"
    ).length
  };
}
async function getJobFilterCountsByOrganization(organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = /* @__PURE__ */ new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const allJobs = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId));
  return {
    today: allJobs.filter((job) => job.createdAt >= todayStart).length,
    urgent: allJobs.filter((job) => job.downTime === true).length,
    overdue: allJobs.filter(
      (job) => job.status !== "completed" && job.status !== "cancelled" && job.createdAt < oneDayAgo
    ).length,
    pending: allJobs.filter(
      (job) => job.status === "pending_approval" || job.status === "created"
    ).length,
    in_progress: allJobs.filter(
      (job) => job.status === "sent_to_engineer" || job.status === "accepted" || job.status === "en_route" || job.status === "on_site"
    ).length
  };
}
async function updateOrganizationSubscription(params) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { organizationId, ...updates } = params;
  const cleanedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== void 0)
  );
  await db.update(organizations).set(cleanedUpdates).where(eq(organizations.id, organizationId));
  console.log(`[DB] Updated subscription for org ${organizationId}`);
}
async function getOrganizationSubscription(organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function incrementJobCount(organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(organizations).set({ currentMonthJobCount: sql`${organizations.currentMonthJobCount} + 1` }).where(eq(organizations.id, organizationId));
}
async function resetMonthlyJobCount(organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(organizations).set({ currentMonthJobCount: 0 }).where(eq(organizations.id, organizationId));
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    _db = null;
  }
});

// server/organizations-db.ts
var organizations_db_exports = {};
__export(organizations_db_exports, {
  createOrganization: () => createOrganization,
  deleteOrganization: () => deleteOrganization,
  getAllOrganizations: () => getAllOrganizations,
  getAllOrganizationsWithAdmins: () => getAllOrganizationsWithAdmins,
  getOrganizationById: () => getOrganizationById,
  getOrganizationBySlug: () => getOrganizationBySlug,
  getProjectsByOrganization: () => getProjectsByOrganization,
  suspendOrganization: () => suspendOrganization,
  unsuspendOrganization: () => unsuspendOrganization,
  updateOrganizationLastUsed: () => updateOrganizationLastUsed
});
import { eq as eq2 } from "drizzle-orm";
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now();
}
async function createOrganization(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const slug = generateSlug(data.name);
    const result = await db.insert(organizations).values({
      name: data.name,
      slug,
      isActive: true,
      projectsEnabled: true
    });
    const organizationId = Number(result[0].insertId);
    return {
      id: organizationId,
      name: data.name,
      slug
    };
  } catch (error) {
    console.error("[Organizations] Create organization error:", error);
    throw new Error("Failed to create organization");
  }
}
async function getOrganizationById(id) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.select().from(organizations).where(eq2(organizations.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Organizations] Get organization error:", error);
    return null;
  }
}
async function getOrganizationBySlug(slug) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.select().from(organizations).where(eq2(organizations.slug, slug)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Organizations] Get organization by slug error:", error);
    return null;
  }
}
async function getAllOrganizations() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    return await db.select().from(organizations);
  } catch (error) {
    console.error("[Organizations] Get all organizations error:", error);
    return [];
  }
}
async function getProjectsByOrganization(organizationId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.select().from(organizations).where(eq2(organizations.id, organizationId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Organizations] Get organization error:", error);
    return null;
  }
}
async function suspendOrganization(id) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.update(organizations).set({ isActive: false }).where(eq2(organizations.id, id));
    return { success: true };
  } catch (error) {
    console.error("[Organizations] Suspend organization error:", error);
    throw new Error("Failed to suspend organization");
  }
}
async function unsuspendOrganization(id) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.update(organizations).set({ isActive: true }).where(eq2(organizations.id, id));
    return { success: true };
  } catch (error) {
    console.error("[Organizations] Unsuspend organization error:", error);
    throw new Error("Failed to unsuspend organization");
  }
}
async function deleteOrganization(id) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.delete(organizations).where(eq2(organizations.id, id));
    return { success: true };
  } catch (error) {
    console.error("[Organizations] Delete organization error:", error);
    throw new Error("Failed to delete organization");
  }
}
async function updateOrganizationLastUsed(organizationId) {
  const db = await getDb();
  if (!db) {
    return;
  }
  try {
    await db.update(organizations).set({ lastUsedAt: /* @__PURE__ */ new Date() }).where(eq2(organizations.id, organizationId));
  } catch (error) {
    console.error("[Organizations] Update lastUsedAt error:", error);
  }
}
async function getAllOrganizationsWithAdmins() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const { users: users3, projects: projects2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { count } = await import("drizzle-orm");
    const orgs = await db.select().from(organizations);
    const orgsWithAdmins = await Promise.all(
      orgs.map(async (org) => {
        const adminUsers = await db.select({ email: users3.email }).from(users3).where(eq2(users3.organizationId, org.id)).limit(1);
        const projectCount = await db.select({ count: count() }).from(projects2).where(eq2(projects2.organizationId, org.id));
        return {
          ...org,
          primaryAdminEmail: adminUsers[0]?.email || null,
          projectCount: projectCount[0]?.count || 0
        };
      })
    );
    return orgsWithAdmins;
  } catch (error) {
    console.error("[Organizations] Get all organizations with admins error:", error);
    return [];
  }
}
var init_organizations_db = __esm({
  "server/organizations-db.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authenticateUser: () => authenticateUser,
  createUser: () => createUser,
  createUserInOrganization: () => createUserInOrganization,
  generatePasswordResetToken: () => generatePasswordResetToken,
  generateToken: () => generateToken,
  getAllUsers: () => getAllUsers,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getUsersByOrganization: () => getUsersByOrganization,
  hashPassword: () => hashPassword,
  initializeSuperAdmin: () => initializeSuperAdmin,
  updatePassword: () => updatePassword,
  updateUserPassword: () => updateUserPassword,
  updateUserStatus: () => updateUserStatus,
  validatePasswordResetToken: () => validatePasswordResetToken,
  verifyPassword: () => verifyPassword,
  verifyToken: () => verifyToken
});
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq as eq3 } from "drizzle-orm";
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
async function authenticateUser(email, password) {
  const db = await getDb();
  if (!db) {
    console.warn("[Auth] Database not available");
    return null;
  }
  try {
    const result = await db.select().from(users).where(eq3(users.email, email)).limit(1);
    if (result.length === 0) {
      return null;
    }
    const user = result[0];
    if (!user.isActive) {
      return null;
    }
    const { getOrganizationById: getOrganizationById2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
    const organization = await getOrganizationById2(user.organizationId);
    if (!organization || !organization.isActive) {
      throw new Error("Your organization has been suspended. Please contact support.");
    }
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }
    await db.update(users).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq3(users.id, user.id));
    return user;
  } catch (error) {
    console.error("[Auth] Authentication error:", error);
    return null;
  }
}
async function createUser(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Auth] Database not available");
    return null;
  }
  try {
    const userData = {
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role,
      organizationId: data.organizationId,
      isPrimaryAdmin: data.isPrimaryAdmin || false,
      isActive: true
    };
    const result = await db.insert(users).values(userData);
    const userId = Number(result[0].insertId);
    const createdUser = await db.select().from(users).where(eq3(users.id, userId)).limit(1);
    return createdUser[0] || null;
  } catch (error) {
    console.error("[Auth] User creation error:", error);
    return null;
  }
}
async function getUserById(userId) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  try {
    const result = await db.select().from(users).where(eq3(users.id, userId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    return null;
  }
}
async function createUserInOrganization(email, password, name, role, organizationId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Auth] Database not available");
    return null;
  }
  try {
    const passwordHash = await hashPassword(password);
    const userData = {
      email,
      passwordHash,
      name,
      role,
      organizationId,
      isActive: true
    };
    const result = await db.insert(users).values(userData);
    const userId = Number(result[0].insertId);
    const createdUser = await db.select().from(users).where(eq3(users.id, userId)).limit(1);
    return createdUser[0] || null;
  } catch (error) {
    console.error("[Auth] User creation error:", error);
    return null;
  }
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  try {
    const result = await db.select().from(users).where(eq3(users.email, email)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    return null;
  }
}
async function initializeSuperAdmin() {
  const db = await getDb();
  if (!db) {
    console.warn("[Auth] Database not available for super admin initialization");
    return;
  }
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      const { createOrganization: createOrganization2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      const systemOrg = await createOrganization2({
        name: "System Administration"
      });
      if (!systemOrg) {
        throw new Error("Failed to create system organization");
      }
      const defaultEmail = ENV.superAdminEmail || "admin@transputec.com";
      const defaultPassword = ENV.superAdminPassword || "Admin@123";
      const passwordHash = await hashPassword(defaultPassword);
      await createUser({
        email: defaultEmail,
        passwordHash,
        name: "Super Admin",
        role: "super_admin",
        organizationId: systemOrg.id,
        isPrimaryAdmin: true
      });
      console.log("[Auth] Super admin created:", defaultEmail);
      console.log("[Auth] IMPORTANT: Change the default password immediately!");
    }
  } catch (error) {
    console.error("[Auth] Super admin initialization error:", error);
  }
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error("[Auth] Get all users error:", error);
    return [];
  }
}
async function getUsersByOrganization(organizationId) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  try {
    const result = await db.select().from(users).where(eq3(users.organizationId, organizationId));
    return result;
  } catch (error) {
    console.error("[Auth] Get users by organization error:", error);
    return [];
  }
}
async function updateUserPassword(userId, newPassword) {
  const db = await getDb();
  if (!db) {
    return false;
  }
  try {
    const passwordHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash }).where(eq3(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Auth] Update password error:", error);
    return false;
  }
}
async function updateUserStatus(userId, isActive) {
  const db = await getDb();
  if (!db) {
    return false;
  }
  try {
    await db.update(users).set({ isActive }).where(eq3(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Auth] Update user status error:", error);
    return false;
  }
}
async function updatePassword(userId, newPassword) {
  const success = await updateUserPassword(userId, newPassword);
  if (!success) {
    throw new Error("Failed to update password");
  }
}
async function generatePasswordResetToken(userId) {
  const token = jwt.sign(
    { userId, type: "password_reset" },
    JWT_SECRET,
    { expiresIn: "1h" }
    // Token valid for 1 hour
  );
  passwordResetTokens2.set(token, {
    userId,
    expiresAt: Date.now() + 60 * 60 * 1e3
    // 1 hour
  });
  return token;
}
async function validatePasswordResetToken(token) {
  try {
    const tokenData = passwordResetTokens2.get(token);
    if (!tokenData) {
      return null;
    }
    if (Date.now() > tokenData.expiresAt) {
      passwordResetTokens2.delete(token);
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== "password_reset") {
      return null;
    }
    passwordResetTokens2.delete(token);
    return decoded.userId;
  } catch (error) {
    console.error("[Auth] Token validation error:", error);
    return null;
  }
}
var SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN, passwordResetTokens2;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_env();
    SALT_ROUNDS = 10;
    JWT_SECRET = ENV.jwtSecret;
    JWT_EXPIRES_IN = "7d";
    passwordResetTokens2 = /* @__PURE__ */ new Map();
  }
});

// server/storage-local.ts
var storage_local_exports = {};
__export(storage_local_exports, {
  initializeUploadDirectories: () => initializeUploadDirectories,
  storageDelete: () => storageDelete,
  storageExists: () => storageExists,
  storageGet: () => storageGet,
  storagePut: () => storagePut
});
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
async function initializeUploadDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(MEDIA_DIR, { recursive: true });
    await fs.mkdir(COMMENTS_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
    console.log("[Storage] Local upload directories initialized");
  } catch (error) {
    console.error("[Storage] Failed to initialize upload directories:", error);
    throw error;
  }
}
function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName);
  const basename = path.basename(originalName, ext);
  const timestamp2 = Date.now();
  const random = randomBytes(8).toString("hex");
  return `${basename}-${timestamp2}-${random}${ext}`;
}
function getSubdirectory(relKey) {
  if (relKey.includes("comment") || relKey.includes("attachment")) {
    return COMMENTS_DIR;
  }
  if (relKey.includes("temp")) {
    return TEMP_DIR;
  }
  return MEDIA_DIR;
}
async function storagePut(relKey, data, contentType) {
  try {
    const subdir = getSubdirectory(relKey);
    const filename = generateUniqueFilename(relKey);
    const filePath = path.join(subdir, filename);
    const buffer = Buffer.isBuffer(data) ? data : data instanceof Uint8Array ? Buffer.from(data) : Buffer.from(data, "utf-8");
    await fs.writeFile(filePath, buffer);
    const relativePath = path.relative(UPLOAD_DIR, filePath);
    const url = `/uploads/${relativePath.replace(/\\/g, "/")}`;
    console.log("[Storage] File saved locally:", filename);
    return {
      key: filename,
      url
    };
  } catch (error) {
    console.error("[Storage] Failed to save file locally:", error);
    throw new Error("Failed to upload file");
  }
}
async function storageGet(relKey, expiresIn) {
  const url = `/uploads/${relKey}`;
  return {
    key: relKey,
    url
  };
}
async function storageDelete(relKey) {
  try {
    const subdir = getSubdirectory(relKey);
    const filePath = path.join(subdir, relKey);
    await fs.unlink(filePath);
    console.log("[Storage] File deleted:", relKey);
  } catch (error) {
    console.error("[Storage] Failed to delete file:", error);
  }
}
async function storageExists(relKey) {
  try {
    const subdir = getSubdirectory(relKey);
    const filePath = path.join(subdir, relKey);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
var UPLOAD_DIR, MEDIA_DIR, COMMENTS_DIR, TEMP_DIR;
var init_storage_local = __esm({
  "server/storage-local.ts"() {
    "use strict";
    UPLOAD_DIR = path.join(process.cwd(), "uploads");
    MEDIA_DIR = path.join(UPLOAD_DIR, "media");
    COMMENTS_DIR = path.join(UPLOAD_DIR, "comments");
    TEMP_DIR = path.join(UPLOAD_DIR, "temp");
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet2,
  storagePut: () => storagePut2
});
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
async function buildDownloadUrl(baseUrl, relKey, apiKey) {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey)
  });
  return (await response.json()).url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePutS3(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
async function storageGetS3(relKey) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey)
  };
}
var USE_LOCAL_STORAGE, storagePut2, storageGet2;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
    init_storage_local();
    USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === "true";
    storagePut2 = USE_LOCAL_STORAGE ? (() => {
      console.log("[Storage] Using LOCAL FILESYSTEM storage");
      return storagePut;
    })() : (() => {
      console.log("[Storage] Using MANUS FORGE API (S3) storage");
      return storagePutS3;
    })();
    storageGet2 = USE_LOCAL_STORAGE ? storageGet : storageGetS3;
  }
});

// server/media-upload.ts
var media_upload_exports = {};
__export(media_upload_exports, {
  parseAttachments: () => parseAttachments,
  serializeAttachments: () => serializeAttachments,
  uploadMediaFile: () => uploadMediaFile,
  validateMediaFile: () => validateMediaFile
});
import { randomBytes as randomBytes2 } from "crypto";
function validateMediaFile(mimeType, size) {
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: "Invalid file type. Allowed: JPG, PNG, GIF, WEBP, MP4, MOV, AVI, WEBM"
    };
  }
  if (isImage && size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image file too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    };
  }
  if (isVideo && size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video file too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`
    };
  }
  return { valid: true };
}
async function uploadMediaFile(fileBuffer, filename, mimeType, jobId) {
  const validation = validateMediaFile(mimeType, fileBuffer.length);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const ext = filename.split(".").pop() || "bin";
  const randomSuffix = randomBytes2(8).toString("hex");
  const fileKey = `job-${jobId}/comments/${randomSuffix}.${ext}`;
  const { url } = await storagePut2(fileKey, fileBuffer, mimeType);
  const type = ALLOWED_IMAGE_TYPES.includes(mimeType) ? "image" : "video";
  return {
    url,
    type,
    filename,
    size: fileBuffer.length,
    mimeType
  };
}
function parseAttachments(attachmentsJson) {
  if (!attachmentsJson) return [];
  try {
    const parsed = JSON.parse(attachmentsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[Media] Failed to parse attachments JSON:", error);
    return [];
  }
}
function serializeAttachments(attachments) {
  return JSON.stringify(attachments);
}
var ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE;
var init_media_upload = __esm({
  "server/media-upload.ts"() {
    "use strict";
    init_storage();
    ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    MAX_VIDEO_SIZE = 100 * 1024 * 1024;
  }
});

// server/project-sites-db.ts
var project_sites_db_exports = {};
__export(project_sites_db_exports, {
  bulkCreateProjectSites: () => bulkCreateProjectSites,
  countProjectSites: () => countProjectSites,
  createProjectSite: () => createProjectSite,
  deleteAllProjectSites: () => deleteAllProjectSites,
  deleteProjectSite: () => deleteProjectSite,
  getProjectSiteById: () => getProjectSiteById,
  getProjectSites: () => getProjectSites,
  updateProjectSite: () => updateProjectSite,
  updateProjectSiteLocation: () => updateProjectSiteLocation
});
import { eq as eq4, and as and2, desc as desc2 } from "drizzle-orm";
async function getProjectSites(projectId) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[getProjectSites] Database not available");
      return [];
    }
    console.log("[getProjectSites] ===== FETCHING SITES =====");
    console.log("[getProjectSites] ProjectId parameter:", projectId);
    console.log("[getProjectSites] ProjectId type:", typeof projectId);
    console.log("[getProjectSites] ProjectId length:", projectId?.length);
    const sites = await db.select().from(projectSites).where(and2(
      eq4(projectSites.projectId, projectId),
      eq4(projectSites.isActive, true)
    ));
    console.log("[getProjectSites] Query completed");
    console.log("[getProjectSites] Found sites:", sites.length);
    console.log("[getProjectSites] Requested projectId:", projectId);
    if (sites.length > 0) {
      const uniqueProjectIds = Array.from(new Set(sites.map((s) => s.projectId)));
      console.log("[getProjectSites] UNIQUE projectIds in results:", uniqueProjectIds.join(", "));
      console.log("[getProjectSites] First 3 site projectIds:", sites.slice(0, 3).map((s) => s.projectId).join(", "));
      console.log("[getProjectSites] First 3 site names:", sites.slice(0, 3).map((s) => s.siteName).join(", "));
      const wrongSites = sites.filter((s) => s.projectId !== projectId);
      if (wrongSites.length > 0) {
        console.error("[getProjectSites] BUG FOUND! Query returned sites from WRONG projects!");
        console.error("[getProjectSites] Expected:", projectId);
        console.error("[getProjectSites] Got sites from:", uniqueProjectIds.join(", "));
      }
    }
    const filteredSites = sites.filter((site) => site.projectId === projectId);
    console.log("[getProjectSites] After manual filter:", filteredSites.length, "sites");
    if (filteredSites.length !== sites.length) {
      console.error("[getProjectSites] WARNING: Drizzle query returned wrong sites!");
      console.error("[getProjectSites] Expected projectId:", projectId);
      console.error("[getProjectSites] Got sites from projects:", Array.from(new Set(sites.map((s) => s.projectId))).join(", "));
    }
    return filteredSites;
  } catch (error) {
    console.error("[getProjectSites] Error fetching sites:", error);
    return [];
  }
}
async function getProjectSiteById(siteId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(projectSites).where(eq4(projectSites.id, siteId)).limit(1);
  return result[0];
}
async function createProjectSite(site) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(projectSites).values(site);
  const created = await db.select().from(projectSites).where(
    and2(
      eq4(projectSites.projectId, site.projectId),
      eq4(projectSites.siteName, site.siteName),
      eq4(projectSites.siteAddress, site.siteAddress)
    )
  ).orderBy(desc2(projectSites.createdAt)).limit(1);
  if (!created[0]) {
    throw new Error("Failed to retrieve created site");
  }
  return created[0];
}
async function bulkCreateProjectSites(sites) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (sites.length === 0) return 0;
  await db.insert(projectSites).values(sites);
  return sites.length;
}
async function deleteProjectSite(siteId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(projectSites).set({ isActive: false }).where(eq4(projectSites.id, siteId));
  return (result[0]?.affectedRows || 0) > 0;
}
async function deleteAllProjectSites(projectId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.update(projectSites).set({ isActive: false }).where(eq4(projectSites.projectId, projectId));
  return result[0]?.affectedRows || 0;
}
async function countProjectSites(projectId) {
  const db = await getDb();
  if (!db) return 0;
  const sites = await db.select().from(projectSites).where(and2(
    eq4(projectSites.projectId, projectId),
    eq4(projectSites.isActive, true)
  ));
  return sites.length;
}
async function updateProjectSiteLocation(siteId, latitude, longitude) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(projectSites).set({
    latitude: latitude.toString(),
    longitude: longitude.toString()
  }).where(eq4(projectSites.id, siteId));
  return true;
}
async function updateProjectSite(siteId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projectSites).set(updates).where(eq4(projectSites.id, siteId));
  const updated = await db.select().from(projectSites).where(eq4(projectSites.id, siteId)).limit(1);
  if (!updated[0]) {
    throw new Error("Failed to retrieve updated site");
  }
  return updated[0];
}
var init_project_sites_db = __esm({
  "server/project-sites-db.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/projects-db.ts
var projects_db_exports = {};
__export(projects_db_exports, {
  createProject: () => createProject,
  deleteProject: () => deleteProject,
  getProjectByProjectId: () => getProjectByProjectId,
  getProjectForValidation: () => getProjectForValidation,
  getProjectStats: () => getProjectStats,
  getProjectsByOrganization: () => getProjectsByOrganization2,
  toggleProjectStatus: () => toggleProjectStatus,
  updateProject: () => updateProject,
  verifyProject: () => verifyProject
});
import { eq as eq5, and as and3 } from "drizzle-orm";
async function createProject(project) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [newProject] = await db.insert(projects).values(project).$returningId();
  const [created] = await db.select().from(projects).where(eq5(projects.id, newProject.id));
  return created;
}
async function getProjectsByOrganization2(organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(projects).where(eq5(projects.organizationId, organizationId)).orderBy(projects.createdAt);
}
async function getProjectByProjectId(projectId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [project] = await db.select().from(projects).where(eq5(projects.projectId, projectId)).limit(1);
  return project;
}
async function verifyProject(projectId, organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [project] = await db.select().from(projects).where(and3(
    eq5(projects.projectId, projectId),
    eq5(projects.organizationId, organizationId)
  )).limit(1);
  return !!project;
}
async function getProjectForValidation(projectId, organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [project] = await db.select().from(projects).where(and3(
    eq5(projects.projectId, projectId),
    eq5(projects.organizationId, organizationId)
  )).limit(1);
  return project;
}
async function updateProject(projectId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(projects.projectId, projectId));
  return await getProjectByProjectId(projectId);
}
async function toggleProjectStatus(projectId, isActive) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(projects.projectId, projectId));
  return true;
}
async function deleteProject(projectId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(eq5(projects.projectId, projectId));
  return true;
}
async function getProjectStats(projectId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return {
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0
  };
}
var init_projects_db = __esm({
  "server/projects-db.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/geocoding.ts
var geocoding_exports = {};
__export(geocoding_exports, {
  calculateDistance: () => calculateDistance,
  calculateETA: () => calculateETA,
  geocodeAddress: () => geocodeAddress,
  searchAddresses: () => searchAddresses
});
async function searchAddresses(address, limit = 5) {
  if (ENV.googlePlacesApiKey) {
    try {
      return await searchAddressesGoogle(address, limit);
    } catch (error) {
      console.warn("Google Places API failed, falling back to OpenStreetMap:", error);
    }
  }
  return await searchAddressesOSM(address, limit);
}
async function searchAddressesGoogle(address, limit) {
  if (!address || address.trim().length === 0) {
    return [];
  }
  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${ENV.googlePlacesApiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Places API returned ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return [];
    }
    return data.results.slice(0, limit).map((result) => ({
      latitude: result.geometry.location.lat.toString(),
      longitude: result.geometry.location.lng.toString(),
      displayName: result.formatted_address,
      type: result.types?.[0] || "unknown",
      importance: result.geometry.location_type === "ROOFTOP" ? 1 : 0.8
    }));
  } catch (error) {
    console.error("Google Places search error:", error);
    throw error;
  }
}
async function searchAddressesOSM(address, limit) {
  if (!address || address.trim().length === 0) {
    return [];
  }
  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=${limit}&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FieldPulse-Go-App/2.0"
      }
    });
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((result) => ({
      latitude: result.lat,
      longitude: result.lon,
      displayName: result.display_name,
      type: result.type || "unknown",
      importance: result.importance || 0
    }));
  } catch (error) {
    console.error("Address search error:", error);
    return [];
  }
}
async function geocodeAddress(address) {
  if (ENV.googlePlacesApiKey) {
    console.log("[Geocoding] Using Google Places API for address:", address.substring(0, 50));
    try {
      const result2 = await geocodeAddressGoogle(address);
      console.log("[Geocoding] Google API success:", result2.success);
      return result2;
    } catch (error) {
      console.warn("[Geocoding] Google Places API failed, falling back to OpenStreetMap:", error);
    }
  }
  console.log("[Geocoding] No Google API key, using OpenStreetMap fallback for address:", address.substring(0, 50));
  const result = await geocodeAddressOSM(address);
  console.log("[Geocoding] OpenStreetMap result:", result.success);
  return result;
}
async function geocodeAddressGoogle(address) {
  if (!address || address.trim().length === 0) {
    return {
      latitude: "",
      longitude: "",
      displayName: "",
      success: false,
      error: "Address is required"
    };
  }
  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${ENV.googlePlacesApiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Places API returned ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return {
        latitude: "",
        longitude: "",
        displayName: "",
        success: false,
        error: "Address not found"
      };
    }
    const result = data.results[0];
    return {
      latitude: result.geometry.location.lat.toString(),
      longitude: result.geometry.location.lng.toString(),
      displayName: result.formatted_address,
      success: true
    };
  } catch (error) {
    console.error("Google Places geocoding error:", error);
    throw error;
  }
}
async function geocodeAddressOSM(address) {
  if (!address || address.trim().length === 0) {
    return {
      latitude: "",
      longitude: "",
      displayName: "",
      success: false,
      error: "Address is required"
    };
  }
  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FieldPulse-Go-App/1.0"
      }
    });
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      return {
        latitude: "",
        longitude: "",
        displayName: "",
        success: false,
        error: "Address not found"
      };
    }
    const result = data[0];
    return {
      latitude: result.lat,
      longitude: result.lon,
      displayName: result.display_name,
      success: true
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      latitude: "",
      longitude: "",
      displayName: "",
      success: false,
      error: error instanceof Error ? error.message : "Geocoding failed"
    };
  }
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
function toRad(degrees) {
  return degrees * Math.PI / 180;
}
function calculateETA(distanceKm, mode = "driving") {
  const speeds = {
    driving: 40,
    // km/h average in urban areas
    walking: 5,
    // km/h
    cycling: 15
    // km/h
  };
  const speed = speeds[mode];
  const hours = distanceKm / speed;
  const minutes = Math.round(hours * 60);
  return minutes;
}
var init_geocoding = __esm({
  "server/geocoding.ts"() {
    "use strict";
    init_env();
  }
});

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendCancellationNotification: () => sendCancellationNotification,
  sendClientConfirmation: () => sendClientConfirmation,
  sendClientTimeChangeNotification: () => sendClientTimeChangeNotification,
  sendCommentNotification: () => sendCommentNotification,
  sendEmail: () => sendEmail,
  sendEngineerAcceptanceNotification: () => sendEngineerAcceptanceNotification,
  sendEngineerDeclineNotification: () => sendEngineerDeclineNotification,
  sendEngineerTimeChangeApprovalNotification: () => sendEngineerTimeChangeApprovalNotification,
  sendJobApprovalNotification: () => sendJobApprovalNotification,
  sendJobAssignmentNotification: () => sendJobAssignmentNotification,
  sendJobCompletionNotification: () => sendJobCompletionNotification,
  sendJobRejectionNotification: () => sendJobRejectionNotification,
  sendNewTicketNotification: () => sendNewTicketNotification,
  sendNewUserEmail: () => sendNewUserEmail,
  sendSVREmail: () => sendSVREmail,
  sendSiteVisitReport: () => sendSiteVisitReport,
  sendStatusUpdateNotification: () => sendStatusUpdateNotification,
  sendTimeAdjustmentNotification: () => sendTimeAdjustmentNotification,
  sendTimeCounterProposalNotification: () => sendTimeCounterProposalNotification
});
import nodemailer from "nodemailer";
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
}
async function sendEmail(options) {
  console.log(`[Email] \u{1F4E4} Attempting to send email to: ${options.to}`);
  console.log(`[Email] \u{1F4E7} Subject: ${options.subject}`);
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    console.log(`[Email] \u2705 Successfully sent to ${options.to}`);
    console.log(`[Email] \u{1F4EC} Message ID: ${info.messageId}`);
    console.log(`[Email] \u{1F4CA} Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error("[Email] \u274C Failed to send email to:", options.to);
    console.error("[Email] \u274C Error details:", error);
    return false;
  }
}
async function sendNewTicketNotification(ticketData) {
  const subject = `New Service Request: ${ticketData.siteName} - ${ticketData.clientName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .urgent { background-color: #fef2f2; border-left: 4px solid #ef4444; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u{1F514} New Service Request Submitted</h2>
        </div>
        <div class="content">
          <p>A new field service request has been submitted and requires your review.</p>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${ticketData.clientName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${ticketData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${ticketData.siteAddress}</div>
          </div>
          
          ${ticketData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${ticketData.scheduledDateTime.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          ` : ""}
          
          <div class="detail-row">
            <div class="label">Estimated Hours:</div>
            <div class="value">${ticketData.hoursRequired}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Issue Description:</div>
            <div class="value">${ticketData.incidentDetails}</div>
          </div>
          
          <a href="/admin/job/${ticketData.ticketId}" class="button">
            Review Request \u2192
          </a>
          
          <div class="footer">
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
            <p>Please log in to the admin dashboard to approve or reject this request.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
New Service Request Submitted

Client: ${ticketData.clientName}
Site Name: ${ticketData.siteName}
Site Address: ${ticketData.siteAddress}
${ticketData.scheduledDateTime ? `Scheduled: ${ticketData.scheduledDateTime.toLocaleString()}` : ""}
Estimated Hours: ${ticketData.hoursRequired}
Issue: ${ticketData.incidentDetails}

Please review this request in the admin dashboard.
  `.trim();
  return await sendEmail({
    to: ticketData.adminEmail,
    subject,
    html,
    text: text2
  });
}
async function sendClientConfirmation(ticketData) {
  const subject = `Service Request Confirmation - ${ticketData.siteName}`;
  const base = ticketData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const trackingUrl = `${base}/track/${ticketData.trackingToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .highlight { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u2705 Service Request Received</h2>
        </div>
        <div class="content">
          <p>Dear ${ticketData.clientName},</p>
          <p>Thank you for submitting your service request. We have received your request and it is currently being reviewed by our team.</p>
          
          <div class="highlight">
            <strong>\u{1F4CD} Track Your Request</strong><br>
            You can track the status of your service request and view engineer location in real-time using the link below.
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${ticketData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${ticketData.siteAddress}</div>
          </div>
          
          ${ticketData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${ticketData.scheduledDateTime.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          ` : ""}
          
          <div class="detail-row">
            <div class="label">Estimated Hours:</div>
            <div class="value">${ticketData.hoursRequired}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Issue Description:</div>
            <div class="value">${ticketData.incidentDetails}</div>
          </div>
          
          <a href="${trackingUrl}" class="button">
            Track Your Request \u2192
          </a>
          
          <div class="footer">
            <p><strong>What happens next?</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Our team will review your request</li>
              <li>Once approved, an engineer will be assigned</li>
              <li>You'll be able to track the engineer's location in real-time</li>
              <li>After completion, you'll receive a Site Visit Report</li>
            </ol>
            <p>This is an automated confirmation from FieldPulse Go Dispatch System.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Service Request Confirmation

Dear ${ticketData.clientName},

Thank you for submitting your service request. We have received your request and it is currently being reviewed by our team.

Site Name: ${ticketData.siteName}
Site Address: ${ticketData.siteAddress}
${ticketData.scheduledDateTime ? `Scheduled: ${ticketData.scheduledDateTime.toLocaleString()}` : ""}
Estimated Hours: ${ticketData.hoursRequired}
Issue: ${ticketData.incidentDetails}

Track your request: ${trackingUrl}

What happens next?
1. Our team will review your request
2. Once approved, an engineer will be assigned
3. You'll be able to track the engineer's location in real-time
4. After completion, you'll receive a Site Visit Report

This is an automated confirmation from FieldPulse Go Dispatch System.
  `.trim();
  return await sendEmail({
    to: ticketData.clientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendSiteVisitReport(reportData) {
  const subject = `Site Visit Report - ${reportData.siteName} - ${reportData.visitDate.toLocaleDateString()}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1f2937; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
        .content { background-color: white; padding: 30px; border: 1px solid #e5e7eb; }
        .section { margin: 20px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #3b82f6; }
        .section-title { font-weight: bold; color: #1f2937; font-size: 16px; margin-bottom: 10px; }
        .detail-row { margin: 8px 0; }
        .label { font-weight: 600; color: #4b5563; display: inline-block; min-width: 150px; }
        .value { color: #1f2937; }
        .status-yes { color: #10b981; font-weight: bold; }
        .status-no { color: #ef4444; font-weight: bold; }
        .signature { margin-top: 20px; padding: 15px; background-color: #fef3c7; border: 2px dashed #f59e0b; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">SITE VISIT REPORT</h1>
          <p style="margin: 10px 0 0 0;">FieldPulse Go Field Services</p>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-title">Visit Information</div>
            <div class="detail-row">
              <span class="label">Date of Visit:</span>
              <span class="value">${reportData.visitDate.toLocaleDateString("en-GB", { dateStyle: "full" })}</span>
            </div>
            <div class="detail-row">
              <span class="label">Engineer Name:</span>
              <span class="value">${reportData.engineerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Site Name:</span>
              <span class="value">${reportData.siteName}</span>
            </div>
            ${reportData.onsiteContact ? `
            <div class="detail-row">
              <span class="label">Onsite Contact:</span>
              <span class="value">${reportData.onsiteContact}</span>
            </div>
            ` : ""}
            ${reportData.timeOnsite ? `
            <div class="detail-row">
              <span class="label">Time Arrived Onsite:</span>
              <span class="value">${reportData.timeOnsite}</span>
            </div>
            ` : ""}
            ${reportData.timeLeftSite ? `
            <div class="detail-row">
              <span class="label">Time Left Site:</span>
              <span class="value">${reportData.timeLeftSite}</span>
            </div>
            ` : ""}
          </div>

          <div class="section">
            <div class="section-title">Work Performed</div>
            ${reportData.issueFault ? `
            <div class="detail-row">
              <span class="label">Issue/Fault:</span>
              <div class="value" style="margin-top: 5px;">${reportData.issueFault}</div>
            </div>
            ` : ""}
            ${reportData.actionsPerformed ? `
            <div class="detail-row" style="margin-top: 15px;">
              <span class="label">Actions Performed:</span>
              <div class="value" style="margin-top: 5px;">${reportData.actionsPerformed}</div>
            </div>
            ` : ""}
          </div>

          <div class="section">
            <div class="section-title">Resolution Status</div>
            <div class="detail-row">
              <span class="label">Was the issue resolved?</span>
              <span class="${reportData.issueResolved ? "status-yes" : "status-no"}">
                ${reportData.issueResolved ? "\u2713 YES" : "\u2717 NO"}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Did onsite contact agree?</span>
              <span class="${reportData.contactAgreed ? "status-yes" : "status-no"}">
                ${reportData.contactAgreed ? "\u2713 YES" : "\u2717 NO"}
              </span>
            </div>
          </div>

          ${reportData.clientSignatory ? `
          <div class="signature">
            <div class="section-title">Client Sign-off</div>
            <div class="detail-row">
              <span class="label">Signed by:</span>
              <span class="value">${reportData.clientSignatory}</span>
            </div>
            <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
              Digital signature captured on-site
            </p>
          </div>
          ` : ""}

          <div class="footer">
            <p><strong>Transputec</strong> - Global IT Service Provider</p>
            <p>This is an automated report from the Field Engineer Dispatch System.</p>
            <p>Generated on ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
SITE VISIT REPORT
FieldPulse Go Field Services

Visit Information:
- Date of Visit: ${reportData.visitDate.toLocaleDateString()}
- Engineer Name: ${reportData.engineerName}
- Site Name: ${reportData.siteName}
${reportData.onsiteContact ? `- Onsite Contact: ${reportData.onsiteContact}` : ""}
${reportData.timeOnsite ? `- Time Arrived: ${reportData.timeOnsite}` : ""}
${reportData.timeLeftSite ? `- Time Left: ${reportData.timeLeftSite}` : ""}

Work Performed:
${reportData.issueFault ? `Issue/Fault: ${reportData.issueFault}` : ""}
${reportData.actionsPerformed ? `Actions Performed: ${reportData.actionsPerformed}` : ""}

Resolution Status:
- Was the issue resolved? ${reportData.issueResolved ? "YES" : "NO"}
- Did onsite contact agree? ${reportData.contactAgreed ? "YES" : "NO"}

${reportData.clientSignatory ? `Client Sign-off: ${reportData.clientSignatory}` : ""}

---
Transputec - Global IT Service Provider
Generated on ${(/* @__PURE__ */ new Date()).toLocaleString()}
  `.trim();
  return await sendEmail({
    to: reportData.recipientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendSVREmail(data) {
  const subject = `Site Visit Report - ${data.job.siteName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin: 20px 0; padding: 15px; background-color: white; border-radius: 5px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .detail-row { margin: 8px 0; display: flex; }
        .label { font-weight: bold; color: #4b5563; min-width: 180px; }
        .value { color: #1f2937; flex: 1; }
        .signature { margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px; }
        .signature img { max-width: 300px; border: 1px solid #d1d5db; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Site Visit Report</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">FieldPulse Go Field Services</p>
        </div>
        <div class="content">
          
          <div class="section">
            <div class="section-title">Visit Information</div>
            <div class="detail-row">
              <div class="label">Visit Date:</div>
              <div class="value">${new Date(data.svr.visitDate).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}</div>
            </div>
            <div class="detail-row">
              <div class="label">Engineer:</div>
              <div class="value">${data.svr.engineerName}</div>
            </div>
            <div class="detail-row">
              <div class="label">Site Name:</div>
              <div class="value">${data.job.siteName}</div>
            </div>
            <div class="detail-row">
              <div class="label">Site Address:</div>
              <div class="value">${data.job.siteAddress || "N/A"}</div>
            </div>
            ${data.svr.ticketNumbers ? `
            <div class="detail-row">
              <div class="label">Ticket Numbers:</div>
              <div class="value">${data.svr.ticketNumbers}</div>
            </div>
            ` : ""}
            ${data.svr.onsiteContact ? `
            <div class="detail-row">
              <div class="label">Onsite Contact:</div>
              <div class="value">${data.svr.onsiteContact}</div>
            </div>
            ` : ""}
            <div class="detail-row">
              <div class="label">Time Arrived:</div>
              <div class="value">${data.svr.timeOnsite}</div>
            </div>
            ${data.svr.timeLeftSite ? `
            <div class="detail-row">
              <div class="label">Time Left Site:</div>
              <div class="value">${data.svr.timeLeftSite}</div>
            </div>
            ` : ""}
          </div>

          <div class="section">
            <div class="section-title">Work Details</div>
            <div class="detail-row">
              <div class="label">Issue/Fault:</div>
              <div class="value">${data.svr.issueFault}</div>
            </div>
            <div class="detail-row">
              <div class="label">Actions Performed:</div>
              <div class="value">${data.svr.actionsPerformed}</div>
            </div>
            <div class="detail-row">
              <div class="label">Issue Resolved:</div>
              <div class="value">${data.svr.issueResolved ? "\u2705 Yes" : "\u274C No"}</div>
            </div>
            <div class="detail-row">
              <div class="label">Contact Agreed:</div>
              <div class="value">${data.svr.contactAgreed ? "\u2705 Yes" : "\u274C No"}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Client Sign-off</div>
            <div class="detail-row">
              <div class="label">Signed By:</div>
              <div class="value">${data.svr.clientSignatory}</div>
            </div>
            <div class="detail-row">
              <div class="label">Signed At:</div>
              <div class="value">${new Date(data.svr.signedAt).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}</div>
            </div>
            <div class="signature">
              <div style="font-weight: bold; margin-bottom: 10px;">Client Signature:</div>
              <img src="${data.svr.clientSignatureData}" alt="Client Signature" />
            </div>
          </div>

          <div class="footer">
            <p>This Site Visit Report was generated by FieldPulse Go Dispatch System.</p>
            <p>For any questions or concerns, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
SITE VISIT REPORT
FieldPulse Go Field Services

VISIT INFORMATION
Visit Date: ${new Date(data.svr.visitDate).toLocaleString()}
Engineer: ${data.svr.engineerName}
Site Name: ${data.job.siteName}
Site Address: ${data.job.siteAddress || "N/A"}
${data.svr.ticketNumbers ? `Ticket Numbers: ${data.svr.ticketNumbers}` : ""}
${data.svr.onsiteContact ? `Onsite Contact: ${data.svr.onsiteContact}` : ""}
Time Arrived: ${data.svr.timeOnsite}
${data.svr.timeLeftSite ? `Time Left Site: ${data.svr.timeLeftSite}` : ""}

WORK DETAILS
Issue/Fault: ${data.svr.issueFault}
Actions Performed: ${data.svr.actionsPerformed}
Issue Resolved: ${data.svr.issueResolved ? "Yes" : "No"}
Contact Agreed: ${data.svr.contactAgreed ? "Yes" : "No"}

CLIENT SIGN-OFF
Signed By: ${data.svr.clientSignatory}
Signed At: ${new Date(data.svr.signedAt).toLocaleString()}

This Site Visit Report was generated by FieldPulse Go Dispatch System.
  `.trim();
  return await sendEmail({
    to: data.recipientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendJobAssignmentNotification(engineerData) {
  const subject = `New Job Assignment: ${engineerData.siteName}`;
  const base = engineerData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const jobUrl = `${base}/engineer/${engineerData.jobToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .highlight { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u{1F527} New Job Assignment</h2>
        </div>
        <div class="content">
          <p>Dear ${engineerData.engineerName},</p>
          <p>You have been assigned a new field service job. Please review the details below and accept or decline the assignment.</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${engineerData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${engineerData.siteAddress}</div>
          </div>
          
          ${engineerData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${engineerData.scheduledDateTime.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          ` : ""}
          
          <div class="detail-row">
            <div class="label">Issue Description:</div>
            <div class="value">${engineerData.incidentDetails}</div>
          </div>
          
          <div class="highlight">
            <strong>\u26A1 Action Required</strong><br>
            Please click the button below to view the full job details and accept or decline this assignment.
          </div>
          
          <a href="${jobUrl}" class="button">
            View Job Details \u2192
          </a>
          
          <div class="footer">
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
            <p>Please respond to this assignment as soon as possible.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
New Job Assignment

Dear ${engineerData.engineerName},

You have been assigned a new field service job.

Site Name: ${engineerData.siteName}
Site Address: ${engineerData.siteAddress}
${engineerData.scheduledDateTime ? `Scheduled: ${engineerData.scheduledDateTime.toLocaleString()}` : ""}
Issue: ${engineerData.incidentDetails}

View job details and respond: ${jobUrl}

This is an automated notification from FieldPulse Go Dispatch System.
  `.trim();
  return await sendEmail({
    to: engineerData.engineerEmail,
    subject,
    html,
    text: text2
  });
}
async function sendStatusUpdateNotification(clientEmail, statusData) {
  const statusMessages = {
    "accepted": {
      title: "Job Accepted",
      message: "Your service request has been accepted by our engineer.",
      color: "#10b981"
    },
    "en_route": {
      title: "Engineer En Route",
      message: "Our engineer is on the way to your location.",
      color: "#3b82f6"
    },
    "on_site": {
      title: "Engineer On Site",
      message: "Our engineer has arrived at your location and is working on the issue.",
      color: "#8b5cf6"
    },
    "completed": {
      title: "Job Completed",
      message: "The service visit has been completed. Please check the Site Visit Report for details.",
      color: "#10b981"
    }
  };
  const statusInfo = statusMessages[statusData.status] || {
    title: "Status Update",
    message: "Your service request status has been updated.",
    color: "#6b7280"
  };
  const subject = `${statusInfo.title}: ${statusData.siteName}`;
  const base = statusData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const trackingUrl = `${base}/track/${statusData.jobToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${statusInfo.color}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .button { display: inline-block; padding: 12px 24px; background-color: ${statusInfo.color}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u{1F4CD} ${statusInfo.title}</h2>
        </div>
        <div class="content">
          <p>${statusInfo.message}</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${statusData.siteName}</div>
          </div>
          
          ${statusData.engineerName ? `
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${statusData.engineerName}</div>
          </div>
          ` : ""}
          
          ${statusData.eta ? `
          <div class="detail-row">
            <div class="label">Estimated Arrival:</div>
            <div class="value">${statusData.eta}</div>
          </div>
          ` : ""}
          
          <a href="${trackingUrl}" class="button">
            Track Service Request \u2192
          </a>
          
          <div class="footer">
            <p>You can track your service request in real-time using the link above.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
${statusInfo.title}: ${statusData.siteName}

${statusInfo.message}

Site Name: ${statusData.siteName}
${statusData.engineerName ? `Engineer: ${statusData.engineerName}` : ""}
${statusData.eta ? `Estimated Arrival: ${statusData.eta}` : ""}

Track your request: ${trackingUrl}

This is an automated notification from FieldPulse Go Dispatch System.
  `.trim();
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendCommentNotification(recipientEmail, commentData) {
  const authorLabels = {
    engineer: "\u{1F527} Engineer",
    client: "\u{1F464} Client",
    admin: "\u2699\uFE0F Admin"
  };
  const subject = `New Comment on ${commentData.siteName}`;
  const base = commentData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const trackingUrl = `${base}/track/${commentData.jobToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6366f1; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .comment-box { margin: 20px 0; padding: 15px; background-color: white; border-left: 4px solid #6366f1; border-radius: 3px; }
        .author { font-weight: bold; color: #4b5563; margin-bottom: 10px; }
        .comment-text { color: #1f2937; }
        .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u{1F4AC} New Comment</h2>
        </div>
        <div class="content">
          <p>A new comment has been posted on your service request: <strong>${commentData.siteName}</strong></p>
          
          <div class="comment-box">
            <div class="author">${authorLabels[commentData.authorType]} ${commentData.authorName}</div>
            <div class="comment-text">${commentData.commentText}</div>
          </div>
          
          <a href="${trackingUrl}" class="button">
            View Full Conversation \u2192
          </a>
          
          <div class="footer">
            <p>You can view all comments and reply using the link above.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
New Comment on ${commentData.siteName}

${authorLabels[commentData.authorType]} ${commentData.authorName} wrote:
"${commentData.commentText}"

View full conversation: ${trackingUrl}

This is an automated notification from FieldPulse Go Dispatch System.
  `.trim();
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendJobCompletionNotification(recipientEmail, completionData) {
  const subject = `Job Completed: ${completionData.siteName}`;
  const base = completionData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const trackingUrl = `${base}/track/${completionData.jobToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .highlight { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u2705 Job Completed</h2>
        </div>
        <div class="content">
          <p>The field service job has been successfully completed.</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${completionData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${completionData.engineerName}</div>
          </div>
          
          <div class="highlight">
            <strong>\u{1F4C4} Site Visit Report Available</strong><br>
            A detailed Site Visit Report has been generated and is now available for your review.
          </div>
          
          <a href="${trackingUrl}" class="button">
            View Site Visit Report \u2192
          </a>
          
          <div class="footer">
            <p>Thank you for using FieldPulse Go Field Services.</p>
            <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Job Completed: ${completionData.siteName}

The field service job has been successfully completed.

Site Name: ${completionData.siteName}
Engineer: ${completionData.engineerName}

A detailed Site Visit Report is now available for your review.

View report: ${trackingUrl}

Thank you for using FieldPulse Go Field Services.
  `.trim();
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendCancellationNotification(data) {
  const {
    jobId,
    siteName,
    clientName,
    clientEmail,
    engineerName,
    engineerEmail,
    cancellationReason,
    cancelledBy,
    trackingUrl,
    baseUrl
  } = data;
  const adminEmail = "rishi@karrdservicesuae.com";
  const emailTemplate = (recipientType) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .info-box { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u26A0\uFE0F Job Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientType},</p>
          
          <p>This is to inform you that the following service request has been <strong>cancelled</strong>:</p>
          
          <div class="info-box">
            <p><strong>Job ID:</strong> #${jobId}</p>
            <p><strong>Site:</strong> ${siteName}</p>
            <p><strong>Client:</strong> ${clientName}</p>
            ${engineerName ? `<p><strong>Engineer:</strong> ${engineerName}</p>` : ""}
          </div>

          <div class="info-box">
            <p><strong>Cancelled By:</strong> ${cancelledBy}</p>
            <p><strong>Reason:</strong> ${cancellationReason}</p>
            <p><strong>Cancelled At:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
          </div>

          ${recipientType === "Client" ? `
            <p>We apologize for any inconvenience this may cause. If you have any questions or would like to reschedule, please contact us.</p>
            <a href="${trackingUrl}" class="button">View Job Details</a>
          ` : ""}

          ${recipientType === "Engineer" ? `
            <p>You are no longer required to attend this service call. Please disregard any previous notifications for this job.</p>
          ` : ""}

          ${recipientType === "Admin" ? `
            <p>The job has been cancelled and all parties have been notified.</p>
            <a href="${baseUrl}/admin/job/${jobId}" class="button">View Job Details</a>
          ` : ""}
        </div>
        <div class="footer">
          <p>\xA9 2025 FieldPulse Go. Instant Coverage. Always in Sync..</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const results = [];
  try {
    console.log(`[Email] \u{1F4E4} Attempting to send cancellation notification to admin: ${adminEmail}`);
    await sendEmail({
      to: adminEmail,
      subject: `Job Cancelled: ${siteName} - ${clientName}`,
      html: emailTemplate("Admin")
    });
    console.log(`[Email] \u2705 Successfully sent cancellation notification to admin: ${adminEmail}`);
    results.push(true);
  } catch (error) {
    console.error(`[Email] \u2717 Failed to send cancellation notification to admin:`, error);
    results.push(false);
  }
  if (clientEmail) {
    try {
      console.log(`[Email] \u{1F4E4} Attempting to send cancellation notification to client: ${clientEmail}`);
      await sendEmail({
        to: clientEmail,
        subject: `Service Request Cancelled - ${siteName}`,
        html: emailTemplate("Client")
      });
      console.log(`[Email] \u2705 Successfully sent cancellation notification to client: ${clientEmail}`);
      results.push(true);
    } catch (error) {
      console.error(`[Email] \u2717 Failed to send cancellation notification to client:`, error);
      results.push(false);
    }
  }
  if (engineerEmail) {
    try {
      console.log(`[Email] \u{1F4E4} Attempting to send cancellation notification to engineer: ${engineerEmail}`);
      await sendEmail({
        to: engineerEmail,
        subject: `Job Cancelled - ${siteName}`,
        html: emailTemplate("Engineer")
      });
      console.log(`[Email] \u2705 Successfully sent cancellation notification to engineer: ${engineerEmail}`);
      results.push(true);
    } catch (error) {
      console.error(`[Email] \u2717 Failed to send cancellation notification to engineer:`, error);
      results.push(false);
    }
  }
  return results.some((result) => result);
}
async function sendNewUserEmail(params) {
  const { recipientEmail, recipientName, password, organizationId, baseUrl: providedBaseUrl } = params;
  const { getOrganizationById: getOrganizationById2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
  const organization = await getOrganizationById2(organizationId);
  const orgName = organization?.name || "Your Organization";
  const baseUrl = providedBaseUrl || getBaseUrl();
  const loginUrl = `${baseUrl}/login`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${orgName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${orgName}!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hello <strong>${recipientName}</strong>,
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          An administrator has created an account for you in the <strong>${orgName}</strong> dispatch system.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${recipientEmail}</p>
          <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">${password}</code></p>
        </div>
        
        <p style="font-size: 16px; margin: 20px 0;">
          <strong>\u26A0\uFE0F Important:</strong> Please change your password after your first login for security purposes.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Login Now
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          If you have any questions or need assistance, please contact your administrator.
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          <em>This is an automated message. Please do not reply to this email.</em>
        </p>
      </div>
    </body>
    </html>
  `;
  const textContent = `
Welcome to ${orgName}!

Hello ${recipientName},

An administrator has created an account for you in the ${orgName} dispatch system.

Your Login Credentials:
- Email: ${recipientEmail}
- Temporary Password: ${password}

\u26A0\uFE0F Important: Please change your password after your first login for security purposes.

Login here: ${loginUrl}

If you have any questions or need assistance, please contact your administrator.

This is an automated message. Please do not reply to this email.
  `;
  await sendEmail({
    to: recipientEmail,
    subject: `Welcome to ${orgName} - Your Account Has Been Created`,
    html: htmlContent,
    text: textContent
  });
}
async function sendEngineerAcceptanceNotification(adminEmail, acceptanceData) {
  const subject = `\u2705 Job Accepted: ${acceptanceData.engineerName} - ${acceptanceData.siteName}`;
  const base = acceptanceData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const jobUrl = `${base}/admin/job/${acceptanceData.jobId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u2705 Engineer Accepted Job</h2>
        </div>
        <div class="content">
          <div class="success-box">
            <strong>${acceptanceData.engineerName}</strong> has accepted the job assignment.
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${acceptanceData.engineerName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer Email:</div>
            <div class="value">${acceptanceData.engineerEmail}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${acceptanceData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${acceptanceData.siteAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${acceptanceData.clientName}</div>
          </div>
          
          ${acceptanceData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${acceptanceData.scheduledDateTime.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          ` : ""}
          
          <div class="detail-row">
            <div class="label">Accepted At:</div>
            <div class="value">${acceptanceData.acceptedAt.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          
          <a href="${jobUrl}" class="button">
            View Job Details \u2192
          </a>
          
          <div class="footer">
            <p>The engineer is now preparing for the job. The client has been notified of the acceptance.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Engineer Accepted Job

Engineer: ${acceptanceData.engineerName} (${acceptanceData.engineerEmail})
Site: ${acceptanceData.siteName}
Address: ${acceptanceData.siteAddress}
Client: ${acceptanceData.clientName}
${acceptanceData.scheduledDateTime ? `Scheduled: ${acceptanceData.scheduledDateTime.toLocaleString()}` : ""}
Accepted At: ${acceptanceData.acceptedAt.toLocaleString()}

View job details: ${jobUrl}
  `.trim();
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text: text2
  });
}
async function sendEngineerDeclineNotification(adminEmail, declineData) {
  const subject = `\u274C Job Declined: ${declineData.engineerName} - ${declineData.siteName}`;
  const base = declineData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const jobUrl = `${base}/admin/job/${declineData.jobId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .warning-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u274C Engineer Declined Job</h2>
        </div>
        <div class="content">
          <div class="warning-box">
            <strong>Action Required:</strong> ${declineData.engineerName} has declined the job assignment. You need to reassign this job to another engineer.
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer Who Declined:</div>
            <div class="value">${declineData.engineerName} (${declineData.engineerEmail})</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${declineData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${declineData.siteAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${declineData.clientName}</div>
          </div>
          
          ${declineData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${declineData.scheduledDateTime.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          ` : ""}
          
          <div class="detail-row">
            <div class="label">Declined At:</div>
            <div class="value">${declineData.declinedAt.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          
          <a href="${jobUrl}" class="button">
            Reassign Job \u2192
          </a>
          
          <div class="footer">
            <p><strong>Next Steps:</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Review the job details</li>
              <li>Select another available engineer</li>
              <li>Reassign the job using the "Reassign to Another Engineer" button</li>
            </ol>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Engineer Declined Job - Action Required

Engineer Who Declined: ${declineData.engineerName} (${declineData.engineerEmail})
Site: ${declineData.siteName}
Address: ${declineData.siteAddress}
Client: ${declineData.clientName}
${declineData.scheduledDateTime ? `Scheduled: ${declineData.scheduledDateTime.toLocaleString()}` : ""}
Declined At: ${declineData.declinedAt.toLocaleString()}

You need to reassign this job to another engineer.

View job details and reassign: ${jobUrl}
  `.trim();
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text: text2
  });
}
async function sendJobApprovalNotification(clientEmail, approvalData) {
  const subject = `\u2705 Service Request Approved - ${approvalData.siteName}`;
  const base = approvalData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const trackingUrl = `${base}/track/${approvalData.trackingToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u2705 Service Request Approved</h2>
        </div>
        <div class="content">
          <p>Dear ${approvalData.clientName},</p>
          
          <div class="success-box">
            <strong>Good News!</strong> Your service request has been approved and is now being processed.
          </div>
          
          <p>Our team is now assigning an engineer to your job. You will receive another notification once an engineer has been assigned and accepts the job.</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${approvalData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${approvalData.siteAddress}</div>
          </div>
          
          ${approvalData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${approvalData.scheduledDateTime.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          ` : ""}
          
          <a href="${trackingUrl}" class="button">
            Track Your Request \u2192
          </a>
          
          <div class="footer">
            <p><strong>What happens next?</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>An engineer will be assigned to your job</li>
              <li>The engineer will review and accept the assignment</li>
              <li>You'll receive notifications as the job progresses</li>
              <li>You can track the engineer's location in real-time</li>
              <li>After completion, you'll receive a Site Visit Report</li>
            </ol>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Service Request Approved

Dear ${approvalData.clientName},

Your service request has been approved and is now being processed.

Site: ${approvalData.siteName}
Address: ${approvalData.siteAddress}
${approvalData.scheduledDateTime ? `Scheduled: ${approvalData.scheduledDateTime.toLocaleString()}` : ""}

What happens next:
1. An engineer will be assigned to your job
2. The engineer will review and accept the assignment
3. You'll receive notifications as the job progresses
4. You can track the engineer's location in real-time
5. After completion, you'll receive a Site Visit Report

Track your request: ${trackingUrl}
  `.trim();
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendJobRejectionNotification(clientEmail, rejectionData) {
  const subject = `Service Request Update - ${rejectionData.siteName}`;
  const base = rejectionData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const contactUrl = `${base}/request`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .info-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Service Request Update</h2>
        </div>
        <div class="content">
          <p>Dear ${rejectionData.clientName},</p>
          
          <div class="info-box">
            We regret to inform you that we are unable to proceed with your service request at this time.
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${rejectionData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${rejectionData.siteAddress}</div>
          </div>
          
          ${rejectionData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Requested Date & Time:</div>
            <div class="value">${rejectionData.scheduledDateTime.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short"
  })}</div>
          </div>
          ` : ""}
          
          ${rejectionData.rejectionReason ? `
          <div class="detail-row">
            <div class="label">Reason:</div>
            <div class="value">${rejectionData.rejectionReason}</div>
          </div>
          ` : ""}
          
          <p><strong>What you can do:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Contact our support team for more information</li>
            <li>Submit a new request with updated details</li>
            <li>Discuss alternative solutions with our team</li>
          </ul>
          
          <a href="${contactUrl}" class="button">
            Submit New Request \u2192
          </a>
          
          <div class="footer">
            <p>We apologize for any inconvenience. If you have questions or would like to discuss this further, please contact our support team.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Service Request Update

Dear ${rejectionData.clientName},

We regret to inform you that we are unable to proceed with your service request at this time.

Site: ${rejectionData.siteName}
Address: ${rejectionData.siteAddress}
${rejectionData.scheduledDateTime ? `Requested Date: ${rejectionData.scheduledDateTime.toLocaleString()}` : ""}
${rejectionData.rejectionReason ? `Reason: ${rejectionData.rejectionReason}` : ""}

What you can do:
- Contact our support team for more information
- Submit a new request with updated details
- Discuss alternative solutions with our team

Submit a new request: ${contactUrl}
  `.trim();
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendTimeCounterProposalNotification(adminEmail, proposalData) {
  const subject = `\u23F0 Time Change Request: ${proposalData.engineerName} - ${proposalData.siteName}`;
  const base = proposalData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const jobUrl = `${base}/admin/job/${proposalData.jobId}`;
  const formatDate = (date) => date.toLocaleDateString("en-GB", { dateStyle: "full" });
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .comparison-box { background-color: #e0f2fe; border: 1px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .time-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .time-label { font-weight: bold; color: #0369a1; }
        .old-time { color: #dc2626; text-decoration: line-through; }
        .new-time { color: #16a34a; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u23F0 Engineer Proposed Different Time</h2>
        </div>
        <div class="content">
          <div class="warning-box">
            <strong>${proposalData.engineerName}</strong> has accepted the job but proposed a different start time.
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${proposalData.engineerName} (${proposalData.engineerEmail})</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${proposalData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${proposalData.clientName}</div>
          </div>
          
          <div class="comparison-box">
            <h3 style="margin-top: 0; color: #0369a1;">Time Comparison</h3>
            
            <div class="time-row">
              <span class="time-label">Client Requested:</span>
              <span>${proposalData.requestedStartDate ? formatDate(proposalData.requestedStartDate) : "Not specified"} ${proposalData.requestedStartTime || ""}</span>
            </div>
            
            ${proposalData.proposedStartDate ? `
            <div class="time-row">
              <span class="time-label">Admin Proposed:</span>
              <span>${formatDate(proposalData.proposedStartDate)} ${proposalData.proposedStartTime || ""}</span>
            </div>
            ` : ""}
            
            <div class="time-row" style="border-bottom: none;">
              <span class="time-label">Engineer Counter-Proposal:</span>
              <span class="new-time">${formatDate(proposalData.counterProposedDate)} ${proposalData.counterProposedTime || ""}</span>
            </div>
          </div>
          
          ${proposalData.counterProposalNotes ? `
          <div class="detail-row">
            <div class="label">Engineer's Reason:</div>
            <div class="value" style="font-style: italic;">"${proposalData.counterProposalNotes}"</div>
          </div>
          ` : ""}
          
          <a href="${jobUrl}" class="button">
            Review & Approve Time Change \u2192
          </a>
          
          <div class="footer">
            <p><strong>Action Required:</strong> Please review the engineer's proposed time and either approve it or contact the engineer to discuss alternatives.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Engineer Proposed Different Time

Engineer: ${proposalData.engineerName} (${proposalData.engineerEmail})
Site: ${proposalData.siteName}
Client: ${proposalData.clientName}

TIME COMPARISON:
Client Requested: ${proposalData.requestedStartDate ? formatDate(proposalData.requestedStartDate) : "Not specified"} ${proposalData.requestedStartTime || ""}
${proposalData.proposedStartDate ? `Admin Proposed: ${formatDate(proposalData.proposedStartDate)} ${proposalData.proposedStartTime || ""}` : ""}
Engineer Counter-Proposal: ${formatDate(proposalData.counterProposedDate)} ${proposalData.counterProposedTime || ""}

${proposalData.counterProposalNotes ? `Engineer's Reason: "${proposalData.counterProposalNotes}"` : ""}

Review job details: ${jobUrl}

Action Required: Please review the engineer's proposed time and either approve it or contact the engineer to discuss alternatives.
  `.trim();
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text: text2
  });
}
async function sendTimeAdjustmentNotification(clientEmail, adjustmentData) {
  const subject = `Schedule Adjusted: ${adjustmentData.siteName}`;
  const base = adjustmentData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const trackingUrl = `${base}/track/${adjustmentData.trackingToken}`;
  const formatDate = (date) => date.toLocaleDateString("en-GB", { dateStyle: "full" });
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .info-box { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .comparison-box { background-color: #f0fdf4; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .time-row { padding: 8px 0; }
        .old-time { color: #dc2626; text-decoration: line-through; }
        .new-time { color: #16a34a; font-weight: bold; font-size: 1.1em; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u{1F4C5} Service Schedule Adjusted</h2>
        </div>
        <div class="content">
          <p>Dear ${adjustmentData.clientName},</p>
          
          <div class="info-box">
            We've adjusted the start time for your service request at <strong>${adjustmentData.siteName}</strong> to better coordinate with engineer availability.
          </div>
          
          <div class="comparison-box">
            <h3 style="margin-top: 0; color: #16a34a;">Updated Schedule</h3>
            
            ${adjustmentData.requestedStartDate ? `
            <div class="time-row">
              <div class="label">Originally Requested:</div>
              <div class="old-time">${formatDate(adjustmentData.requestedStartDate)} ${adjustmentData.requestedStartTime || ""}</div>
            </div>
            ` : ""}
            
            <div class="time-row">
              <div class="label">New Scheduled Time:</div>
              <div class="new-time">${formatDate(adjustmentData.proposedStartDate)} ${adjustmentData.proposedStartTime || ""}</div>
            </div>
          </div>
          
          ${adjustmentData.timeNegotiationNotes ? `
          <div class="detail-row">
            <div class="label">Reason for Adjustment:</div>
            <div class="value" style="font-style: italic;">"${adjustmentData.timeNegotiationNotes}"</div>
          </div>
          ` : ""}
          
          <div class="detail-row">
            <div class="label">Site Location:</div>
            <div class="value">${adjustmentData.siteAddress}</div>
          </div>
          
          <a href="${trackingUrl}" class="button">
            Track Your Service Request \u2192
          </a>
          
          <div class="footer">
            <p>If this new time doesn't work for you, please contact us immediately to discuss alternatives.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Service Schedule Adjusted

Dear ${adjustmentData.clientName},

We've adjusted the start time for your service request at ${adjustmentData.siteName}.

${adjustmentData.requestedStartDate ? `Originally Requested: ${formatDate(adjustmentData.requestedStartDate)} ${adjustmentData.requestedStartTime || ""}` : ""}
New Scheduled Time: ${formatDate(adjustmentData.proposedStartDate)} ${adjustmentData.proposedStartTime || ""}

${adjustmentData.timeNegotiationNotes ? `Reason: "${adjustmentData.timeNegotiationNotes}"` : ""}

Site Location: ${adjustmentData.siteAddress}

Track your request: ${trackingUrl}

If this new time doesn't work for you, please contact us immediately to discuss alternatives.
  `.trim();
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendClientTimeChangeNotification(clientEmail, timeChangeData) {
  const subject = `Job Schedule Updated - ${timeChangeData.siteName}`;
  const base = timeChangeData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const trackingUrl = `${base}/track/${timeChangeData.trackingToken}`;
  const formatDate = (date) => date.toLocaleDateString("en-GB", { dateStyle: "full" });
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .comparison-box { background-color: #f0fdf4; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .time-row { padding: 8px 0; }
        .old-time { color: #dc2626; text-decoration: line-through; }
        .new-time { color: #16a34a; font-weight: bold; font-size: 1.1em; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u23F0 Job Schedule Updated</h2>
        </div>
        <div class="content">
          <p>Dear ${timeChangeData.clientName},</p>
          
          <div class="warning-box">
            Your scheduled service for <strong>${timeChangeData.siteName}</strong> has been updated based on engineer availability.
          </div>
          
          <div class="comparison-box">
            <h3 style="margin-top: 0; color: #16a34a;">Updated Schedule</h3>
            
            ${timeChangeData.originalStartDate ? `
            <div class="time-row">
              <div class="label">Original Time:</div>
              <div class="old-time">${formatDate(timeChangeData.originalStartDate)} ${timeChangeData.originalStartTime || ""}</div>
            </div>
            ` : ""}
            
            <div class="time-row">
              <div class="label">New Time:</div>
              <div class="new-time">${formatDate(timeChangeData.newStartDate)} ${timeChangeData.newStartTime || ""}</div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${timeChangeData.engineerName}</div>
          </div>
          
          ${timeChangeData.counterProposalNotes ? `
          <div class="detail-row">
            <div class="label">Reason for Change:</div>
            <div class="value" style="font-style: italic;">"${timeChangeData.counterProposalNotes}"</div>
          </div>
          ` : ""}
          
          <div class="detail-row">
            <div class="label">Site Location:</div>
            <div class="value">${timeChangeData.siteAddress}</div>
          </div>
          
          <a href="${trackingUrl}" class="button">
            Track Your Job \u2192
          </a>
          
          <div class="footer">
            <p><strong>Important:</strong> The engineer has been assigned and will arrive at the new scheduled time.</p>
            <p>If this new time doesn't work for you, please contact us immediately to discuss alternatives.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Job Schedule Updated

Dear ${timeChangeData.clientName},

Your scheduled service for ${timeChangeData.siteName} has been updated.

${timeChangeData.originalStartDate ? `Original Time: ${formatDate(timeChangeData.originalStartDate)} ${timeChangeData.originalStartTime || ""}` : ""}
New Time: ${formatDate(timeChangeData.newStartDate)} ${timeChangeData.newStartTime || ""}

Engineer: ${timeChangeData.engineerName}
${timeChangeData.counterProposalNotes ? `Reason: "${timeChangeData.counterProposalNotes}"` : ""}

Site Location: ${timeChangeData.siteAddress}

Track your job: ${trackingUrl}

If this new time doesn't work for you, please contact us immediately to discuss alternatives.
  `.trim();
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text: text2
  });
}
async function sendEngineerTimeChangeApprovalNotification(engineerEmail, approvalData) {
  const subject = `Time Change Approved - ${approvalData.siteName}`;
  const base = approvalData.baseUrl || process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
  const jobUrl = `${base}/job/${approvalData.jobToken}`;
  const formatDate = (date) => date.toLocaleDateString("en-GB", { dateStyle: "full" });
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .time-box { background-color: #f0fdf4; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .confirmed-time { color: #16a34a; font-weight: bold; font-size: 1.3em; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">\u2705 Time Change Approved</h2>
        </div>
        <div class="content">
          <p>Hi ${approvalData.engineerName},</p>
          
          <div class="success-box">
            Your proposed time change has been <strong>approved</strong> by the admin.
          </div>
          
          <div class="time-box">
            <div class="label" style="margin-bottom: 10px;">Confirmed Time:</div>
            <div class="confirmed-time">${formatDate(approvalData.confirmedStartDate)} ${approvalData.confirmedStartTime || ""}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${approvalData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${approvalData.siteAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${approvalData.clientName}</div>
          </div>
          
          <a href="${jobUrl}" class="button">
            View Job Details \u2192
          </a>
          
          <div class="footer">
            <p><strong>Important:</strong> Please ensure you arrive at the confirmed time.</p>
            <p>The client has been notified of the schedule change.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `
Time Change Approved

Hi ${approvalData.engineerName},

Your proposed time change has been approved by the admin.

Confirmed Time: ${formatDate(approvalData.confirmedStartDate)} ${approvalData.confirmedStartTime || ""}

Site Name: ${approvalData.siteName}
Site Address: ${approvalData.siteAddress}
Client: ${approvalData.clientName}

View job details: ${jobUrl}

Important: Please ensure you arrive at the confirmed time.
The client has been notified of the schedule change.
  `.trim();
  return await sendEmail({
    to: engineerEmail,
    subject,
    html,
    text: text2
  });
}
var getBaseUrl, EMAIL_CONFIG, FROM_EMAIL, FROM_NAME, transporter;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    getBaseUrl = () => {
      if (process.env.NODE_ENV === "production") {
        return process.env.PUBLIC_URL || "https://transputec-dispatch.manus.space";
      }
      return "http://localhost:3000";
    };
    EMAIL_CONFIG = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      // Use TLS
      auth: {
        user: "admin@field-pulse.io",
        pass: "mtcglnmbucshoyev"
        // Gmail App Password
      }
    };
    FROM_EMAIL = "admin@field-pulse.io";
    FROM_NAME = "FieldPulse Go";
    transporter = null;
  }
});

// server/auth-emails.ts
var auth_emails_exports = {};
__export(auth_emails_exports, {
  sendPasswordResetEmail: () => sendPasswordResetEmail,
  sendWelcomeEmail: () => sendWelcomeEmail
});
async function sendPasswordResetEmail(params) {
  const { email, name, resetToken, baseUrl } = params;
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your FieldPulse Go account.</p>
      <p>Click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">${resetLink}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    </div>
    <div class="footer">
      <p>\xA9 2025 FieldPulse Go - On-Demand Field Services Platform</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  try {
    console.log("[AuthEmail] Sending password reset email to:", email);
    console.log("[AuthEmail] Reset link:", resetLink);
    const success = await sendEmail({
      to: email,
      subject: "Password Reset Request - FieldPulse Go",
      html: emailContent,
      text: `Hello ${name},

We received a request to reset your password.

Reset your password here: ${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.`
    });
    if (success) {
      console.log("[AuthEmail] \u2705 Password reset email sent successfully");
    } else {
      console.error("[AuthEmail] \u274C Failed to send password reset email");
    }
  } catch (error) {
    console.error("[AuthEmail] Failed to send password reset email:", error);
  }
}
async function sendWelcomeEmail(params) {
  const { email, name, organizationName, baseUrl } = params;
  const loginLink = `${baseUrl}/login`;
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .feature { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #f97316; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to FieldPulse Go!</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>
      <p>Welcome to FieldPulse Go! Your account for <strong>${organizationName}</strong> has been successfully created.</p>
      
      <p style="text-align: center;">
        <a href="${loginLink}" class="button">Login to Dashboard</a>
      </p>

      <h3>What you can do with FieldPulse Go:</h3>
      
      <div class="feature">
        <strong>\u{1F4CD} Live Dispatch Control</strong><br>
        Assign engineers instantly and track their location in real-time with GPS precision during travel and on-site work.
      </div>
      
      <div class="feature">
        <strong>\u23F1\uFE0F Geo Presence Verification</strong><br>
        Automatic tracking of travel time, arrival timestamps, and on-site duration for accurate billing and SLA compliance.
      </div>
      
      <div class="feature">
        <strong>\u2705 Instant Job Acceptance</strong><br>
        Engineers receive job details via secure link and can accept or decline assignments instantly from any device.
      </div>
      
      <div class="feature">
        <strong>\u{1F441}\uFE0F Client Visibility</strong><br>
        Clients get real-time updates and can track engineer progress via shareable tracking links with live ETA calculations.
      </div>

      <p>Get started by logging into your admin dashboard and creating your first job request!</p>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>\xA9 2025 FieldPulse Go - Instant Coverage. Always in Sync.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  try {
    console.log("[AuthEmail] Sending welcome email to:", email);
    console.log("[AuthEmail] Organization:", organizationName);
    console.log("[AuthEmail] User:", name);
    const success = await sendEmail({
      to: email,
      subject: "Welcome to FieldPulse Go!",
      html: emailContent,
      text: `Hello ${name},

Welcome to FieldPulse Go! Your account for ${organizationName} has been successfully created.

Login here: ${loginLink}

Get started by logging into your admin dashboard and creating your first job request!`
    });
    if (success) {
      console.log("[AuthEmail] \u2705 Welcome email sent successfully");
    } else {
      console.error("[AuthEmail] \u274C Failed to send welcome email");
    }
  } catch (error) {
    console.error("[AuthEmail] Failed to send welcome email:", error);
    console.log("[AuthEmail] Continuing despite email failure");
  }
}
var init_auth_emails = __esm({
  "server/auth-emails.ts"() {
    "use strict";
    init_email();
  }
});

// server/password-reset-db.ts
var password_reset_db_exports = {};
__export(password_reset_db_exports, {
  createPasswordResetToken: () => createPasswordResetToken,
  deleteExpiredTokens: () => deleteExpiredTokens,
  generateResetToken: () => generateResetToken,
  markTokenAsUsed: () => markTokenAsUsed,
  validatePasswordResetToken: () => validatePasswordResetToken2
});
import { eq as eq7, and as and4 } from "drizzle-orm";
import { randomBytes as randomBytes3 } from "crypto";
function generateResetToken() {
  return randomBytes3(32).toString("hex");
}
async function createPasswordResetToken(userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
  try {
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
      used: false
    });
    return token;
  } catch (error) {
    console.error("[PasswordReset] Create token error:", error);
    throw new Error("Failed to create password reset token");
  }
}
async function validatePasswordResetToken2(token) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.select().from(passwordResetTokens).where(
      and4(
        eq7(passwordResetTokens.token, token),
        eq7(passwordResetTokens.used, false)
      )
    ).limit(1);
    if (result.length === 0) {
      return null;
    }
    const resetToken = result[0];
    if (/* @__PURE__ */ new Date() > new Date(resetToken.expiresAt)) {
      return null;
    }
    return resetToken.userId;
  } catch (error) {
    console.error("[PasswordReset] Validate token error:", error);
    return null;
  }
}
async function markTokenAsUsed(token) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.update(passwordResetTokens).set({ used: true }).where(eq7(passwordResetTokens.token, token));
    return true;
  } catch (error) {
    console.error("[PasswordReset] Mark token as used error:", error);
    return false;
  }
}
async function deleteExpiredTokens() {
  const db = await getDb();
  if (!db) {
    return;
  }
  try {
    const now = /* @__PURE__ */ new Date();
    await db.delete(passwordResetTokens).where(eq7(passwordResetTokens.expiresAt, now));
  } catch (error) {
    console.error("[PasswordReset] Delete expired tokens error:", error);
  }
}
var init_password_reset_db = __esm({
  "server/password-reset-db.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/job-count-helper.ts
var job_count_helper_exports = {};
__export(job_count_helper_exports, {
  getCurrentMonthJobCount: () => getCurrentMonthJobCount,
  isJobLimitExceeded: () => isJobLimitExceeded
});
import { and as and5, eq as eq8, gte as gte2, sql as sql2 } from "drizzle-orm";
async function getCurrentMonthJobCount(organizationId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const orgResult = await db.select({
    billingCycleStart: organizations.billingCycleStart
  }).from(organizations).where(eq8(organizations.id, organizationId)).limit(1);
  if (orgResult.length === 0) {
    throw new Error("Organization not found");
  }
  const org = orgResult[0];
  let startDate;
  if (org.billingCycleStart) {
    startDate = new Date(org.billingCycleStart);
  } else {
    const now = /* @__PURE__ */ new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }
  const countResult = await db.select({ count: sql2`COUNT(*)` }).from(jobs).where(
    and5(
      eq8(jobs.organizationId, organizationId),
      gte2(jobs.createdAt, startDate)
    )
  );
  return Number(countResult[0]?.count || 0);
}
async function isJobLimitExceeded(organizationId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const orgResult = await db.select({
    monthlyJobLimit: organizations.monthlyJobLimit
  }).from(organizations).where(eq8(organizations.id, organizationId)).limit(1);
  if (orgResult.length === 0) {
    throw new Error("Organization not found");
  }
  const org = orgResult[0];
  const limit = org.monthlyJobLimit || 0;
  if (limit === -1) {
    return false;
  }
  const currentCount = await getCurrentMonthJobCount(organizationId);
  return currentCount >= limit;
}
var init_job_count_helper = __esm({
  "server/job-count-helper.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// shared/timezone.ts
var timezone_exports = {};
__export(timezone_exports, {
  convertLocalTimeToUTC: () => convertLocalTimeToUTC
});
function convertLocalTimeToUTC(datetimeLocalString, sourceTimezone) {
  const [datePart, timePart] = datetimeLocalString.split("T");
  if (!timePart) {
    const [year2, month2, day2] = datePart.split("-");
    return new Date(parseInt(year2), parseInt(month2) - 1, parseInt(day2));
  }
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  const localDateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`;
  const utcDate = /* @__PURE__ */ new Date(`${localDateStr}Z`);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: sourceTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(utcDate);
  const formattedHour = parseInt(parts.find((p) => p.type === "hour").value);
  const formattedMinute = parseInt(parts.find((p) => p.type === "minute").value);
  const formattedDay = parseInt(parts.find((p) => p.type === "day").value);
  const inputHour = parseInt(hour);
  const inputMinute = parseInt(minute);
  const inputDay = parseInt(day);
  const dayDiff = formattedDay - inputDay;
  const offsetHours = formattedHour - inputHour + dayDiff * 24;
  const offsetMinutes = formattedMinute - inputMinute;
  const correctedUTC = new Date(
    utcDate.getTime() - offsetHours * 60 * 60 * 1e3 - offsetMinutes * 60 * 1e3
  );
  return correctedUTC;
}
var init_timezone = __esm({
  "shared/timezone.ts"() {
    "use strict";
  }
});

// server/excel-export.ts
import * as XLSX from "xlsx";
function generateExcelExport(jobs2, filename) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(jobs2);
  const columnWidths = [
    { wch: 10 },
    // Job ID
    { wch: 30 },
    // Site Name
    { wch: 40 },
    // Site Address
    { wch: 25 },
    // Client Name
    { wch: 18 },
    // Contact Number
    { wch: 18 },
    // Status
    { wch: 25 },
    // Engineer
    { wch: 15 },
    // Scheduled
    { wch: 15 },
    // Created
    { wch: 15 }
    // Completed
  ];
  worksheet["!cols"] = columnWidths;
  XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs Export");
  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return excelBuffer;
}
function generateCSVExport(jobs2) {
  if (jobs2.length === 0) return "";
  const headers = Object.keys(jobs2[0]);
  const csvContent = [
    headers.join(","),
    ...jobs2.map(
      (row) => headers.map((header) => {
        const value = row[header];
        const stringValue = String(value || "");
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(",")
    )
  ].join("\n");
  return csvContent;
}
var init_excel_export = __esm({
  "server/excel-export.ts"() {
    "use strict";
  }
});

// server/email-export.ts
var email_export_exports = {};
__export(email_export_exports, {
  sendExportEmail: () => sendExportEmail
});
async function sendExportEmail(options) {
  const { recipientEmail, recipientName, exportData, format, dateRange, status } = options;
  try {
    let attachment;
    if (format === "excel") {
      const excelBuffer = generateExcelExport(
        exportData,
        `jobs_export_${dateRange.start}_to_${dateRange.end}`
      );
      attachment = {
        filename: `jobs_export_${dateRange.start}_to_${dateRange.end}.xlsx`,
        content: excelBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      };
    } else {
      const csvContent = generateCSVExport(exportData);
      attachment = {
        filename: `jobs_export_${dateRange.start}_to_${dateRange.end}.csv`,
        content: csvContent,
        contentType: "text/csv"
      };
    }
    const statusText = status && status !== "all" ? ` (Status: ${status})` : "";
    const subject = `FieldPulse Go - Jobs Export Report (${dateRange.start} to ${dateRange.end})`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: 600; color: #6b7280; }
          .detail-value { color: #111827; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Jobs Export Report</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">FieldPulse Go Dispatch System</p>
          </div>
          <div class="content">
            <p>Hello${recipientName ? ` ${recipientName}` : ""},</p>
            <p>Your requested jobs export report is ready. Please find the attached file with the following details:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Date Range:</span>
                <span class="detail-value">${dateRange.start} to ${dateRange.end}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status Filter:</span>
                <span class="detail-value">${status && status !== "all" ? status : "All Statuses"}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Format:</span>
                <span class="detail-value">${format.toUpperCase()}</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Total Jobs:</span>
                <span class="detail-value">${exportData.length}</span>
              </div>
            </div>
            
            <p>The export includes the following information for each job:</p>
            <ul>
              <li>Job ID and Site Name</li>
              <li>Site Address and Client Name</li>
              <li>Contact Number and Status</li>
              <li>Assigned Engineer</li>
              <li>Scheduled, Created, and Completed Dates</li>
            </ul>
            
            <p style="margin-top: 30px;">If you have any questions about this export, please contact your administrator.</p>
          </div>
          <div class="footer">
            <p>\xA9 2025 FieldPulse Go. Instant Coverage. Always in Sync.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    await sendEmail2({
      to: recipientEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content
        }
      ]
    });
    console.log(`[Email Export] Sent ${format.toUpperCase()} export to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("[Email Export] Failed to send export email:", error);
    return false;
  }
}
var init_email_export = __esm({
  "server/email-export.ts"() {
    "use strict";
    init_excel_export();
  }
});

// server/scheduled-exports.ts
var scheduled_exports_exports = {};
__export(scheduled_exports_exports, {
  getScheduledExport: () => getScheduledExport,
  getScheduledExports: () => getScheduledExports,
  removeScheduledExport: () => removeScheduledExport,
  scheduleExport: () => scheduleExport
});
import * as cron from "node-cron";
function getCronExpression(schedule2) {
  switch (schedule2) {
    case "daily":
      return "0 8 * * *";
    // Every day at 8 AM
    case "weekly":
      return "0 8 * * 1";
    // Every Monday at 8 AM
    case "monthly":
      return "0 8 1 * *";
    // First day of month at 8 AM
    default:
      return "0 8 * * *";
  }
}
function getDateRange(schedule2) {
  const now = /* @__PURE__ */ new Date();
  let end = new Date(now);
  let start = new Date(now);
  switch (schedule2) {
    case "daily":
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "weekly":
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
  }
  return { start, end };
}
async function executeScheduledExport(config) {
  try {
    console.log(`[Scheduled Export] Running export for ${config.recipientEmail}`);
    const { start, end } = getDateRange(config.schedule);
    const jobs2 = await getJobsByDateRange(start, end, config.organizationId, config.status);
    const exportData = jobs2.map((job) => ({
      "Job ID": job.id,
      "Site Name": job.siteName,
      "Site Address": job.siteAddress || "",
      "Client Name": job.clientName || "",
      "Contact Number": job.siteContactNumber || "",
      "Status": job.status,
      "Engineer": job.engineerName || "Unassigned",
      "Scheduled": job.scheduledDateTime ? new Date(job.scheduledDateTime).toLocaleDateString() : "",
      "Created": new Date(job.createdAt).toLocaleDateString(),
      "Completed": job.completedAt ? new Date(job.completedAt).toLocaleDateString() : ""
    }));
    const success = await sendExportEmail({
      recipientEmail: config.recipientEmail,
      recipientName: config.recipientName,
      exportData,
      format: config.format,
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0]
      },
      status: config.status
    });
    if (success) {
      console.log(`[Scheduled Export] Successfully sent ${config.schedule} export to ${config.recipientEmail}`);
    } else {
      console.error(`[Scheduled Export] Failed to send export to ${config.recipientEmail}`);
    }
  } catch (error) {
    console.error("[Scheduled Export] Error executing scheduled export:", error);
  }
}
function scheduleExport(config) {
  try {
    if (scheduledExports.has(config.id)) {
      const existing = scheduledExports.get(config.id);
      existing?.task.stop();
      scheduledExports.delete(config.id);
    }
    if (!config.isActive) {
      console.log(`[Scheduled Export] Deactivated export ${config.id}`);
      return true;
    }
    const cronExpression = config.cronExpression || getCronExpression(config.schedule);
    const task = cron.schedule(cronExpression, () => {
      executeScheduledExport(config);
    });
    scheduledExports.set(config.id, { config, task });
    console.log(`[Scheduled Export] Scheduled ${config.schedule} export for ${config.recipientEmail} (${cronExpression})`);
    return true;
  } catch (error) {
    console.error("[Scheduled Export] Error scheduling export:", error);
    return false;
  }
}
function removeScheduledExport(id) {
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
    console.error("[Scheduled Export] Error removing export:", error);
    return false;
  }
}
function getScheduledExports() {
  return Array.from(scheduledExports.values()).map((item) => item.config);
}
function getScheduledExport(id) {
  return scheduledExports.get(id)?.config;
}
var scheduledExports;
var init_scheduled_exports = __esm({
  "server/scheduled-exports.ts"() {
    "use strict";
    init_db();
    init_email_export();
    scheduledExports = /* @__PURE__ */ new Map();
  }
});

// server/site-template.ts
var site_template_exports = {};
__export(site_template_exports, {
  generateSiteTemplate: () => generateSiteTemplate,
  parseSiteUpload: () => parseSiteUpload
});
import * as XLSX2 from "xlsx";
function generateSiteTemplate() {
  const wb = XLSX2.utils.book_new();
  const instructions = [
    ["Project Site Upload Template"],
    [""],
    ["Instructions:"],
    ['1. Fill in the site information in the "Sites" sheet'],
    ["2. Site Name and Address are required fields"],
    ["3. Latitude and Longitude are optional - if not provided, the system will geocode the address automatically"],
    ["4. Save the file and upload it in the project management page"],
    [""],
    ["Column Descriptions:"],
    ['- Site Name: Name of the site/location (e.g., "London Branch Office")'],
    ["- Address: Full street address"],
    ["- City: City name"],
    ["- Postal Code: ZIP/Postal code"],
    ['- Country: Country name (e.g., "United Kingdom", "United States", "UAE")'],
    ['- Latitude: GPS latitude coordinate (optional, e.g., "51.5074")'],
    ['- Longitude: GPS longitude coordinate (optional, e.g., "-0.1278")'],
    ["- Contact Name: On-site contact person"],
    ["- Contact Phone: Phone number for site contact"],
    ["- Contact Email: Email address for site contact"],
    ["- Notes: Any additional information about the site"]
  ];
  const wsInstructions = XLSX2.utils.aoa_to_sheet(instructions);
  wsInstructions["!cols"] = [{ wch: 80 }];
  XLSX2.utils.book_append_sheet(wb, wsInstructions, "Instructions");
  const sitesData = [
    [
      "Site Name",
      "Address",
      "City",
      "Postal Code",
      "Country",
      "Latitude",
      "Longitude",
      "Contact Name",
      "Contact Phone",
      "Contact Email",
      "Notes"
    ],
    [
      "Example Site - London HQ",
      "123 Main Street",
      "London",
      "SW1A 1AA",
      "United Kingdom",
      "51.5074",
      "-0.1278",
      "John Smith",
      "+44 20 1234 5678",
      "john.smith@example.com",
      "Main office building"
    ],
    // Empty rows for data entry
    ["", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", ""]
  ];
  const wsSites = XLSX2.utils.aoa_to_sheet(sitesData);
  wsSites["!cols"] = [
    { wch: 25 },
    // Site Name
    { wch: 35 },
    // Address
    { wch: 15 },
    // City
    { wch: 12 },
    // Postal Code
    { wch: 18 },
    // Country
    { wch: 12 },
    // Latitude
    { wch: 12 },
    // Longitude
    { wch: 20 },
    // Contact Name
    { wch: 18 },
    // Contact Phone
    { wch: 25 },
    // Contact Email
    { wch: 30 }
    // Notes
  ];
  XLSX2.utils.book_append_sheet(wb, wsSites, "Sites");
  const buffer = XLSX2.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
}
function parseSiteUpload(fileBuffer) {
  const sites = [];
  const errors = [];
  try {
    const wb = XLSX2.read(fileBuffer, { type: "buffer" });
    const sheetName = wb.SheetNames.find((name) => name.toLowerCase() === "sites") || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = XLSX2.utils.sheet_to_json(ws, { header: 1 });
    if (data.length < 2) {
      errors.push("File must contain at least a header row and one data row");
      return { sites, errors };
    }
    const dataRows = data.slice(2);
    dataRows.forEach((row, index) => {
      const rowNum = index + 3;
      if (!row || row.every((cell) => !cell || cell === "")) {
        return;
      }
      const [
        siteName,
        siteAddress,
        city,
        postalCode,
        country,
        latitude,
        longitude,
        contactName,
        contactPhone,
        contactEmail,
        notes
      ] = row;
      if (!siteName || siteName.toString().trim() === "") {
        errors.push(`Row ${rowNum}: Site Name is required`);
        return;
      }
      if (!siteAddress || siteAddress.toString().trim() === "") {
        errors.push(`Row ${rowNum}: Address is required`);
        return;
      }
      const latStr = latitude ? latitude.toString().trim() : "";
      const lngStr = longitude ? longitude.toString().trim() : "";
      if (latStr && latStr !== "" && isNaN(parseFloat(latStr))) {
        errors.push(`Row ${rowNum}: Invalid latitude format - must be a number (e.g., 51.5074)`);
        return;
      }
      if (lngStr && lngStr !== "" && isNaN(parseFloat(lngStr))) {
        errors.push(`Row ${rowNum}: Invalid longitude format - must be a number (e.g., -0.1278)`);
        return;
      }
      sites.push({
        siteName: siteName.toString().trim(),
        siteAddress: siteAddress.toString().trim(),
        city: city ? city.toString().trim() : void 0,
        postalCode: postalCode ? postalCode.toString().trim() : void 0,
        country: country ? country.toString().trim() : void 0,
        latitude: latStr || void 0,
        longitude: lngStr || void 0,
        contactName: contactName ? contactName.toString().trim() : void 0,
        contactPhone: contactPhone ? contactPhone.toString().trim() : void 0,
        contactEmail: contactEmail ? contactEmail.toString().trim() : void 0,
        notes: notes ? notes.toString().trim() : void 0
      });
    });
  } catch (error) {
    errors.push(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  return { sites, errors };
}
var init_site_template = __esm({
  "server/site-template.ts"() {
    "use strict";
  }
});

// server/stripe-config.ts
import Stripe from "stripe";
function getPlanByTier(tier) {
  return SUBSCRIPTION_PLANS[tier];
}
var STRIPE_CONFIG, SUBSCRIPTION_PLANS, stripe;
var init_stripe_config = __esm({
  "server/stripe-config.ts"() {
    "use strict";
    STRIPE_CONFIG = {
      publishableKey: "pk_test_51SVTpTFQaKsrrJ5lX4WM4HqzWm7x3RoAATGsYiBR06DoOs9cJVkR3hWsVqCBo5sGpyrjuLEoL4Km1F8gxn0wVKdy00MYjBuKOK",
      secretKey: "sk_test_51SVTpTFQaKsrrJ5lrke9ZjzjkC1CvGe9XZQ1IUY7vxdcLBhEHjpdRcMIBhzlOl17QZb4zYPzDPHPw6vfiyo7kFTT00zoZ5qSA2",
      webhookSecret: "whsec_KjapVPVObhhSG7kFpxFU4gFm4xm79oCL"
    };
    SUBSCRIPTION_PLANS = {
      starter: {
        name: "Starter Plan",
        priceId: "price_1SVTqoFQaKsrrJ5ldmjfREtF",
        price: 99,
        currency: "usd",
        interval: "month",
        features: {
          monthlyJobLimit: 100,
          maxAdminUsers: 3,
          description: "100 jobs per month, 3 admin users, all features, email support"
        }
      },
      enterprise: {
        name: "Enterprise Plan",
        priceId: "price_1SVTrGFQaKsrrJ5lGaReOk3D",
        price: 399,
        currency: "usd",
        interval: "month",
        features: {
          monthlyJobLimit: null,
          // unlimited
          maxAdminUsers: 999,
          // unlimited
          description: "Unlimited jobs, unlimited admin users, priority support, all features"
        }
      }
    };
    stripe = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true
    });
  }
});

// server/stripe-helpers.ts
var stripe_helpers_exports = {};
__export(stripe_helpers_exports, {
  cancelSubscription: () => cancelSubscription,
  createCheckoutSession: () => createCheckoutSession,
  createPortalSession: () => createPortalSession,
  getSubscription: () => getSubscription,
  handleSubscriptionCreated: () => handleSubscriptionCreated,
  handleSubscriptionDeleted: () => handleSubscriptionDeleted,
  handleSubscriptionUpdated: () => handleSubscriptionUpdated
});
async function createCheckoutSession(params) {
  const { organizationId, planTier, customerEmail, successUrl, cancelUrl } = params;
  const plan = getPlanByTier(planTier);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1
        }
      ],
      customer_email: customerEmail,
      metadata: {
        organizationId: organizationId.toString(),
        planTier
      },
      subscription_data: {
        metadata: {
          organizationId: organizationId.toString(),
          planTier
        }
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true
    });
    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    console.error("[Stripe] Failed to create checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}
async function createPortalSession(params) {
  const { customerId, returnUrl } = params;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });
    return {
      url: session.url
    };
  } catch (error) {
    console.error("[Stripe] Failed to create portal session:", error);
    throw new Error("Failed to create portal session");
  }
}
async function cancelSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    return subscription;
  } catch (error) {
    console.error("[Stripe] Failed to cancel subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}
async function getSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("[Stripe] Failed to retrieve subscription:", error);
    throw new Error("Failed to retrieve subscription");
  }
}
async function handleSubscriptionCreated(subscription) {
  const organizationId = parseInt(subscription.metadata.organizationId);
  const planTier = subscription.metadata.planTier;
  const plan = getPlanByTier(planTier);
  const billingCycleStart = new Date(subscription.current_period_start * 1e3);
  const billingCycleEnd = new Date(subscription.current_period_end * 1e3);
  await updateOrganizationSubscription({
    organizationId,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    planTier,
    subscriptionStatus: subscription.status,
    monthlyJobLimit: plan.features.monthlyJobLimit,
    maxAdminUsers: plan.features.maxAdminUsers,
    billingCycleStart,
    billingCycleEnd,
    currentMonthJobCount: 0,
    trialEndsAt: null
    // Clear trial when subscription starts
  });
  console.log(`[Stripe] Subscription created for org ${organizationId}: ${planTier}`);
}
async function handleSubscriptionUpdated(subscription) {
  const organizationId = parseInt(subscription.metadata.organizationId);
  const planTier = subscription.metadata.planTier;
  const plan = getPlanByTier(planTier);
  const billingCycleStart = new Date(subscription.current_period_start * 1e3);
  const billingCycleEnd = new Date(subscription.current_period_end * 1e3);
  await updateOrganizationSubscription({
    organizationId,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    planTier,
    subscriptionStatus: subscription.status,
    monthlyJobLimit: plan.features.monthlyJobLimit,
    maxAdminUsers: plan.features.maxAdminUsers,
    billingCycleStart,
    billingCycleEnd
  });
  console.log(`[Stripe] Subscription updated for org ${organizationId}: ${subscription.status}`);
}
async function handleSubscriptionDeleted(subscription) {
  const organizationId = parseInt(subscription.metadata.organizationId);
  await updateOrganizationSubscription({
    organizationId,
    subscriptionStatus: "canceled"
    // Keep the subscription IDs for reference
  });
  console.log(`[Stripe] Subscription canceled for org ${organizationId}`);
}
var init_stripe_helpers = __esm({
  "server/stripe-helpers.ts"() {
    "use strict";
    init_stripe_config();
    init_db();
  }
});

// server/stripe-webhook.ts
import Stripe2 from "stripe";
async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).send("Missing signature");
  }
  let event;
  try {
    event = stripe2.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    const error = err;
    console.error("[Webhook] Signature verification failed:", error.message);
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }
  console.log("[Webhook] Received event:", event.type, "ID:", event.id);
  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated2(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated2(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted2(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.json({ received: true, error: "Processing failed" });
  }
}
async function handleSubscriptionCreated2(subscription) {
  console.log("[Webhook] Processing subscription.created:", subscription.id);
  const customerId = subscription.customer;
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) {
    console.error("[Webhook] Missing organizationId in subscription metadata");
    return;
  }
  const priceId = subscription.items.data[0]?.price.id;
  let planTier = "trial";
  let monthlyJobLimit = 50;
  let maxAdminUsers = 1;
  if (priceId === SUBSCRIPTION_PLANS.starter.priceId) {
    planTier = "starter";
    monthlyJobLimit = 100;
    maxAdminUsers = 3;
  } else if (priceId === SUBSCRIPTION_PLANS.enterprise.priceId) {
    planTier = "enterprise";
    monthlyJobLimit = -1;
    maxAdminUsers = -1;
  }
  const sub = subscription;
  const billingCycleStart = new Date((sub.current_period_start || 0) * 1e3);
  const billingCycleEnd = new Date((sub.current_period_end || 0) * 1e3);
  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    planTier,
    monthlyJobLimit,
    maxAdminUsers,
    billingCycleStart,
    billingCycleEnd
  });
  console.log("[Webhook] Subscription created successfully for org:", organizationId);
}
async function handleSubscriptionUpdated2(subscription) {
  console.log("[Webhook] Processing subscription.updated:", subscription.id);
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) {
    console.error("[Webhook] Missing organizationId in subscription metadata");
    return;
  }
  const priceId = subscription.items.data[0]?.price.id;
  let planTier = "trial";
  let monthlyJobLimit = 50;
  let maxAdminUsers = 1;
  if (priceId === SUBSCRIPTION_PLANS.starter.priceId) {
    planTier = "starter";
    monthlyJobLimit = 100;
    maxAdminUsers = 3;
  } else if (priceId === SUBSCRIPTION_PLANS.enterprise.priceId) {
    planTier = "enterprise";
    monthlyJobLimit = -1;
    maxAdminUsers = -1;
  }
  const sub = subscription;
  const billingCycleStart = new Date((sub.current_period_start || 0) * 1e3);
  const billingCycleEnd = new Date((sub.current_period_end || 0) * 1e3);
  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    subscriptionStatus: subscription.status,
    planTier,
    monthlyJobLimit,
    maxAdminUsers,
    billingCycleStart,
    billingCycleEnd
  });
  console.log("[Webhook] Subscription updated successfully for org:", organizationId);
}
async function handleSubscriptionDeleted2(subscription) {
  console.log("[Webhook] Processing subscription.deleted:", subscription.id);
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) {
    console.error("[Webhook] Missing organizationId in subscription metadata");
    return;
  }
  const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq9 } = await import("drizzle-orm");
  const db = await getDb2();
  if (db) {
    await db.update(organizations2).set({
      isActive: true,
      // Keep organization active
      subscriptionStatus: "canceled",
      planTier: "trial",
      monthlyJobLimit: 50,
      maxAdminUsers: 1,
      stripeSubscriptionId: null
      // Clear Stripe subscription ID
    }).where(eq9(organizations2.id, parseInt(organizationId)));
  }
  console.log("[Webhook] Subscription cancelled, organization reverted to trial:", organizationId);
}
async function handlePaymentSucceeded(invoice) {
  console.log("[Webhook] Processing invoice.payment_succeeded:", invoice.id);
  const inv = invoice;
  const subscriptionId = inv.subscription;
  if (!subscriptionId) {
    console.log("[Webhook] Invoice not associated with subscription");
    return;
  }
  const subscription = await stripe2.subscriptions.retrieve(subscriptionId);
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) {
    console.error("[Webhook] Missing organizationId in subscription metadata");
    return;
  }
  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    subscriptionStatus: "active"
  });
  console.log("[Webhook] Payment succeeded for org:", organizationId);
}
async function handlePaymentFailed(invoice) {
  console.log("[Webhook] Processing invoice.payment_failed:", invoice.id);
  const inv = invoice;
  const subscriptionId = inv.subscription;
  if (!subscriptionId) {
    console.log("[Webhook] Invoice not associated with subscription");
    return;
  }
  const subscription = await stripe2.subscriptions.retrieve(subscriptionId);
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) {
    console.error("[Webhook] Missing organizationId in subscription metadata");
    return;
  }
  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    subscriptionStatus: "past_due"
  });
  console.log("[Webhook] Payment failed for org:", organizationId);
}
var stripe2;
var init_stripe_webhook = __esm({
  "server/stripe-webhook.ts"() {
    "use strict";
    init_stripe_config();
    init_db();
    stripe2 = new Stripe2(STRIPE_CONFIG.secretKey, {
      apiVersion: "2025-11-17.clover"
    });
  }
});

// server/_core/webhook-middleware.ts
var webhook_middleware_exports = {};
__export(webhook_middleware_exports, {
  registerWebhookEndpoint: () => registerWebhookEndpoint
});
function registerWebhookEndpoint(app) {
  app.post(
    "/api/stripe/webhook",
    // Use raw body parser for this specific endpoint
    (req, res, next) => {
      if (req.headers["content-type"] === "application/json") {
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => {
          data += chunk;
        });
        req.on("end", () => {
          req.body = data;
          next();
        });
      } else {
        next();
      }
    },
    handleStripeWebhook
  );
  console.log("[Webhook] Stripe webhook endpoint registered at /api/stripe/webhook");
}
var init_webhook_middleware = __esm({
  "server/_core/webhook-middleware.ts"() {
    "use strict";
    init_stripe_webhook();
  }
});

// server/test-subscription-update.ts
var test_subscription_update_exports = {};
__export(test_subscription_update_exports, {
  registerTestSubscriptionEndpoint: () => registerTestSubscriptionEndpoint
});
function registerTestSubscriptionEndpoint(app) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  app.post("/api/test/update-subscription", async (req, res) => {
    try {
      const { organizationId, planTier } = req.body;
      if (!organizationId || !planTier) {
        return res.status(400).json({
          error: "Missing organizationId or planTier"
        });
      }
      let monthlyJobLimit = 50;
      let maxAdminUsers = 1;
      if (planTier === "starter") {
        monthlyJobLimit = 100;
        maxAdminUsers = 3;
      } else if (planTier === "enterprise") {
        monthlyJobLimit = -1;
        maxAdminUsers = -1;
      }
      const now = /* @__PURE__ */ new Date();
      const billingCycleEnd = new Date(now);
      billingCycleEnd.setMonth(billingCycleEnd.getMonth() + 1);
      await updateOrganizationSubscription({
        organizationId,
        planTier,
        monthlyJobLimit,
        maxAdminUsers,
        subscriptionStatus: "active",
        billingCycleStart: now,
        billingCycleEnd
      });
      res.json({
        success: true,
        message: `Organization ${organizationId} updated to ${planTier} plan`
      });
    } catch (error) {
      console.error("[Test] Failed to update subscription:", error);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });
  console.log("[Test] Subscription update endpoint registered at /api/test/update-subscription");
}
var init_test_subscription_update = __esm({
  "server/test-subscription-update.ts"() {
    "use strict";
    init_db();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import path4 from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const isSecure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // Use 'lax' for local development (http), 'none' for production (https)
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    if (!sessionCookie) {
      throw ForbiddenError("No session cookie");
    }
    const { verifyToken: verifyToken2, getUserById: getUserById2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const decoded = verifyToken2(sessionCookie);
    if (!decoded) {
      throw ForbiddenError("Invalid session token");
    }
    const user = await getUserById2(decoded.userId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    if (!user.isActive) {
      throw ForbiddenError("User account is disabled");
    }
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import SuperJSON from "superjson";
var t = initTRPC.context().create({
  transformer: SuperJSON
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  if (ctx.user?.organizationId) {
    const { getOrganizationById: getOrganizationById2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
    const org = await getOrganizationById2(ctx.user.organizationId);
    if (!org || !org.isActive) {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: "Your organization subscription has been cancelled. Please contact support to reactivate."
      });
    }
    const orgId = ctx.user.organizationId;
    Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports)).then(({ updateOrganizationLastUsed: updateOrganizationLastUsed2 }) => {
      updateOrganizationLastUsed2(orgId).catch((err) => {
        console.error("[Middleware] Failed to update organization lastUsedAt:", err);
      });
    }).catch(() => {
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/upload-router.ts
init_media_upload();
import { z as z2 } from "zod";
var uploadRouter = router({
  // Upload media file (image or video)
  uploadMedia: publicProcedure.input(z2.object({
    jobId: z2.number(),
    filename: z2.string(),
    mimeType: z2.string(),
    base64Data: z2.string()
    // Base64 encoded file data
  })).mutation(async ({ input }) => {
    const fileBuffer = Buffer.from(input.base64Data, "base64");
    const mediaFile = await uploadMediaFile(
      fileBuffer,
      input.filename,
      input.mimeType,
      input.jobId
    );
    return mediaFile;
  })
});

// server/routers.ts
init_db();
init_project_sites_db();
init_projects_db();
init_geocoding();
init_email();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z3 } from "zod";
import { randomBytes as randomBytes4 } from "crypto";

// server/svr.ts
init_db();
init_schema();
import { eq as eq6 } from "drizzle-orm";
async function createSiteVisitReport(svr) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(siteVisitReports).values(svr);
  const insertId = Number(result[0].insertId);
  const createdSVR = await getSiteVisitReportById(insertId);
  return createdSVR;
}
async function getSiteVisitReportById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(siteVisitReports).where(eq6(siteVisitReports.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getSiteVisitReportByJobId(jobId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(siteVisitReports).where(eq6(siteVisitReports.jobId, jobId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// server/routers.ts
function getBaseUrl2(req) {
  const protocol = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${protocol}://${host}`;
}
var appRouter = router({
  system: systemRouter,
  upload: uploadRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure.input(z3.object({
      email: z3.string().email(),
      password: z3.string()
    })).mutation(async ({ input, ctx }) => {
      const { authenticateUser: authenticateUser2, generateToken: generateToken2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const user = await authenticateUser2(input.email, input.password);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      const token = generateToken2(user);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      try {
        const { updateOrganizationLastUsed: updateOrganizationLastUsed2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
        await updateOrganizationLastUsed2(user.organizationId);
      } catch (error) {
        console.error("[Auth] Failed to update organization lastUsedAt:", error);
      }
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    // Signup - Register new organization and admin user
    signup: publicProcedure.input(z3.object({
      organizationName: z3.string().min(1),
      adminName: z3.string().min(1),
      email: z3.string().email(),
      password: z3.string().min(8)
    })).mutation(async ({ input, ctx }) => {
      const { createUser: createUser2, getUserByEmail: getUserByEmail2, hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const { createOrganization: createOrganization2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      const existingUser = await getUserByEmail2(input.email);
      if (existingUser) {
        throw new Error("An account with this email already exists");
      }
      const organization = await createOrganization2({
        name: input.organizationName
      });
      const passwordHash = await hashPassword2(input.password);
      const user = await createUser2({
        email: input.email,
        name: input.adminName,
        passwordHash,
        organizationId: organization.id,
        role: "admin",
        isPrimaryAdmin: true
        // First admin who created the organization
      });
      if (user) {
        try {
          const { sendWelcomeEmail: sendWelcomeEmail2 } = await Promise.resolve().then(() => (init_auth_emails(), auth_emails_exports));
          const baseUrl = getBaseUrl2(ctx.req);
          await sendWelcomeEmail2({
            email: user.email,
            name: user.name,
            organizationName: organization.name,
            baseUrl
          });
          console.log(`[Auth] Welcome email sent to: ${user.email}`);
        } catch (error) {
          console.error("[Auth] Failed to send welcome email:", error);
        }
      }
      return {
        success: true,
        message: "Account created successfully. Please log in."
      };
    }),
    // Forgot Password - Generate reset token and send email
    forgotPassword: publicProcedure.input(z3.object({
      email: z3.string().email()
    })).mutation(async ({ input, ctx }) => {
      const { getUserByEmail: getUserByEmail2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const { createPasswordResetToken: createPasswordResetToken2 } = await Promise.resolve().then(() => (init_password_reset_db(), password_reset_db_exports));
      const { sendPasswordResetEmail: sendPasswordResetEmail2 } = await Promise.resolve().then(() => (init_auth_emails(), auth_emails_exports));
      const baseUrl = getBaseUrl2(ctx.req);
      const user = await getUserByEmail2(input.email);
      if (!user) {
        return {
          success: true,
          message: "If an account exists with this email, a password reset link has been sent."
        };
      }
      try {
        const resetToken = await createPasswordResetToken2(user.id);
        await sendPasswordResetEmail2({
          email: user.email,
          name: user.name,
          resetToken,
          baseUrl
        });
        console.log(`[Auth] Password reset email sent to: ${input.email}`);
      } catch (error) {
        console.error("[Auth] Failed to send password reset email:", error);
      }
      return {
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      };
    }),
    // Reset Password - Validate token and update password
    resetPassword: publicProcedure.input(z3.object({
      token: z3.string(),
      newPassword: z3.string().min(8)
    })).mutation(async ({ input }) => {
      const { validatePasswordResetToken: validatePasswordResetToken3, markTokenAsUsed: markTokenAsUsed2 } = await Promise.resolve().then(() => (init_password_reset_db(), password_reset_db_exports));
      const { updateUserPassword: updateUserPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const userId = await validatePasswordResetToken3(input.token);
      if (!userId) {
        throw new Error("Invalid or expired reset token");
      }
      const success = await updateUserPassword2(userId, input.newPassword);
      if (!success) {
        throw new Error("Failed to update password");
      }
      await markTokenAsUsed2(input.token);
      console.log(`[Auth] Password successfully reset for user ID: ${userId}`);
      return {
        success: true,
        message: "Password updated successfully. Please log in with your new password."
      };
    })
  }),
  geocoding: router({
    // Search for address suggestions
    search: publicProcedure.input(z3.object({
      address: z3.string(),
      limit: z3.number().optional()
    })).mutation(async ({ input }) => {
      const results = await searchAddresses(input.address, input.limit);
      return results;
    }),
    // Geocode an address to coordinates
    geocode: publicProcedure.input(z3.object({
      address: z3.string()
    })).mutation(async ({ input }) => {
      const result = await geocodeAddress(input.address);
      return result;
    })
  }),
  jobs: router({
    // Create a service request (public - no auth required)
    createRequest: publicProcedure.input(z3.object({
      organizationId: z3.number().optional(),
      // For tenant-specific public forms
      clientName: z3.string(),
      clientEmail: z3.string().email(),
      siteName: z3.string(),
      siteAddress: z3.string(),
      siteLatitude: z3.string(),
      siteLongitude: z3.string(),
      siteContactName: z3.string(),
      siteContactNumber: z3.string(),
      incidentDetails: z3.string(),
      scheduledDateTime: z3.date().optional(),
      hoursRequired: z3.string(),
      downTime: z3.boolean().optional(),
      // Optional fields
      siteId: z3.string().optional(),
      changeNumber: z3.string().optional(),
      incidentNumber: z3.string().optional(),
      projectName: z3.string().optional(),
      toolsRequired: z3.string().optional(),
      deviceDetails: z3.string().optional(),
      scopeOfWork: z3.string().optional(),
      videoConferenceLink: z3.string().optional(),
      notes: z3.string().optional(),
      projectId: z3.string().optional(),
      createNewSite: z3.boolean().optional(),
      selectedProjectSiteId: z3.number().optional(),
      timezone: z3.string().optional()
      // Site timezone (IANA format)
    })).mutation(async ({ input, ctx }) => {
      console.log("\u{1F3AB} [CreateRequest] New service request received");
      console.log("\u{1F4E7} [CreateRequest] Client email from form:", input.clientEmail);
      const baseUrl = getBaseUrl2(ctx.req);
      if (input.createNewSite && input.projectId) {
        const { createProjectSite: createProjectSite2 } = await Promise.resolve().then(() => (init_project_sites_db(), project_sites_db_exports));
        try {
          await createProjectSite2({
            projectId: input.projectId,
            siteName: input.siteName,
            siteAddress: input.siteAddress,
            latitude: input.siteLatitude || null,
            longitude: input.siteLongitude || null,
            contactName: input.siteContactName || null,
            contactPhone: input.siteContactNumber || null,
            isActive: true
          });
          console.log("\u2705 [CreateRequest] New site created for project:", input.projectId);
        } catch (error) {
          console.error("\u274C [CreateRequest] Failed to create site:", error);
        }
      }
      const jobToken = randomBytes4(32).toString("hex");
      const organizationId = input.organizationId || 1;
      const { isJobLimitExceeded: isJobLimitExceeded2 } = await Promise.resolve().then(() => (init_job_count_helper(), job_count_helper_exports));
      const limitExceeded = await isJobLimitExceeded2(organizationId);
      if (limitExceeded) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "JOB_LIMIT_EXCEEDED"
        });
      }
      const job = await createJob({
        ...input,
        jobToken,
        organizationId,
        status: "pending_approval",
        coveredByCOI: true,
        createdBy: null
      });
      console.log("\u2705 [CreateRequest] Job created with ID:", job?.id);
      const adminEmail = "admin@field-pulse.io";
      console.log("\u{1F4E4} [CreateRequest] Preparing to send admin email to:", adminEmail);
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
            ticketId: job.id
          });
          console.log("[Notification] Admin email notification sent for ticket #", job.id);
        } catch (error) {
          console.error("[Notification] Failed to send admin email:", error);
        }
      }
      console.log("\u{1F4E4} [CreateRequest] Preparing to send client confirmation to:", input.clientEmail);
      console.log("\u{1F4E4} [CreateRequest] Client email exists?", !!input.clientEmail, "Job exists?", !!job);
      if (input.clientEmail && job) {
        console.log("\u{1F4E4} [CreateRequest] Calling sendClientConfirmation...");
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
            baseUrl
          });
          console.log("[Notification] \u2705 Client confirmation email sent successfully for ticket #", job.id, "Result:", clientEmailResult);
        } catch (error) {
          console.error("[Notification] \u274C Failed to send client confirmation:", error);
          console.error("[Notification] \u274C Error stack:", error instanceof Error ? error.stack : error);
        }
      }
      return {
        success: true,
        message: "Service request submitted for approval",
        trackingToken: jobToken,
        ticketId: job?.id
      };
    }),
    // Create a new job (admin only)
    create: protectedProcedure.input(z3.object({
      siteName: z3.string(),
      siteId: z3.string().optional(),
      siteLocation: z3.string().optional(),
      siteAddress: z3.string().optional(),
      siteLatitude: z3.string().optional(),
      siteLongitude: z3.string().optional(),
      siteContactName: z3.string().optional(),
      siteContactNumber: z3.string().optional(),
      changeNumber: z3.string().optional(),
      incidentNumber: z3.string().optional(),
      projectName: z3.string().optional(),
      downTime: z3.boolean().optional(),
      scheduledDateTime: z3.date().optional(),
      hoursRequired: z3.string().optional(),
      toolsRequired: z3.string().optional(),
      deviceDetails: z3.string().optional(),
      incidentDetails: z3.string().optional(),
      scopeOfWork: z3.string().optional(),
      coveredByCOI: z3.boolean().optional(),
      videoConferenceLink: z3.string().optional(),
      notes: z3.string().optional(),
      clientName: z3.string(),
      projectId: z3.string().optional(),
      createNewSite: z3.boolean().optional(),
      selectedProjectSiteId: z3.number().optional(),
      engineerName: z3.string().optional(),
      engineerEmail: z3.string().email().optional(),
      sendEmailToEngineer: z3.boolean().optional(),
      timezone: z3.string().optional()
      // Site timezone (IANA format)
    })).mutation(async ({ input, ctx }) => {
      const { isJobLimitExceeded: isJobLimitExceeded2 } = await Promise.resolve().then(() => (init_job_count_helper(), job_count_helper_exports));
      const limitExceeded = await isJobLimitExceeded2(ctx.user.organizationId);
      if (limitExceeded) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "JOB_LIMIT_EXCEEDED"
        });
      }
      if (input.createNewSite && input.projectId && input.siteName && input.siteAddress) {
        const { createProjectSite: createProjectSite2 } = await Promise.resolve().then(() => (init_project_sites_db(), project_sites_db_exports));
        try {
          await createProjectSite2({
            projectId: input.projectId,
            siteName: input.siteName,
            siteAddress: input.siteAddress,
            latitude: input.siteLatitude || null,
            longitude: input.siteLongitude || null,
            contactName: input.siteContactName || null,
            contactPhone: input.siteContactNumber || null,
            isActive: true
          });
          console.log("\u2705 [CreateJob] New site created for project:", input.projectId);
        } catch (error) {
          console.error("\u274C [CreateJob] Failed to create site:", error);
        }
      }
      const jobToken = randomBytes4(32).toString("hex");
      const job = await createJob({
        ...input,
        jobToken,
        organizationId: ctx.user.organizationId,
        status: input.sendEmailToEngineer ? "sent_to_engineer" : "created",
        engineerName: input.engineerName,
        engineerEmail: input.engineerEmail,
        createdBy: ctx.user.id
      });
      if (!job) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create job" });
      }
      await addJobStatusHistory({
        jobId: job.id,
        status: "created",
        notes: "Job created by admin"
      });
      if (input.sendEmailToEngineer && input.engineerEmail && input.engineerName) {
        let emailSent = false;
        try {
          const baseUrl = getBaseUrl2(ctx.req);
          const { sendJobAssignmentNotification: sendJobAssignmentNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendJobAssignmentNotification2({
            engineerEmail: input.engineerEmail,
            engineerName: input.engineerName,
            siteName: input.siteName,
            siteAddress: input.siteAddress || "N/A",
            scheduledDateTime: input.scheduledDateTime,
            incidentDetails: input.incidentDetails || "N/A",
            jobToken,
            baseUrl
          });
          console.log("[Email] Job assignment email sent to:", input.engineerEmail);
          emailSent = true;
        } catch (error) {
          console.error("[Email] Failed to send job assignment email:", error);
        }
        await addJobStatusHistory({
          jobId: job.id,
          status: "sent_to_engineer",
          notes: emailSent ? `Job assignment email sent to ${input.engineerName} (${input.engineerEmail})` : `Job sent to ${input.engineerName} (email failed)`
        });
      }
      return {
        success: true,
        jobToken,
        engineerLink: `/engineer/${jobToken}`,
        clientLink: `/track/${jobToken}`
      };
    }),
    // Duplicate an existing job (admin only)
    duplicate: protectedProcedure.input(z3.object({
      jobId: z3.number()
    })).mutation(async ({ input, ctx }) => {
      const originalJob = await getJobById(input.jobId);
      if (!originalJob) {
        throw new Error("Job not found");
      }
      const jobToken = randomBytes4(32).toString("hex");
      await createJob({
        organizationId: ctx.user.organizationId,
        siteName: originalJob.siteName,
        siteId: originalJob.siteId || void 0,
        siteLocation: originalJob.siteLocation || void 0,
        siteAddress: originalJob.siteAddress || void 0,
        siteLatitude: originalJob.siteLatitude || void 0,
        siteLongitude: originalJob.siteLongitude || void 0,
        siteContactName: originalJob.siteContactName || void 0,
        siteContactNumber: originalJob.siteContactNumber || void 0,
        changeNumber: originalJob.changeNumber || void 0,
        incidentNumber: originalJob.incidentNumber || void 0,
        projectName: originalJob.projectName || void 0,
        downTime: originalJob.downTime || false,
        scheduledDateTime: originalJob.scheduledDateTime || void 0,
        hoursRequired: originalJob.hoursRequired || void 0,
        toolsRequired: originalJob.toolsRequired || void 0,
        deviceDetails: originalJob.deviceDetails || void 0,
        incidentDetails: originalJob.incidentDetails || void 0,
        scopeOfWork: originalJob.scopeOfWork || void 0,
        coveredByCOI: originalJob.coveredByCOI || false,
        videoConferenceLink: originalJob.videoConferenceLink || void 0,
        notes: `Duplicated from job #${originalJob.id}`,
        clientName: originalJob.clientName,
        jobToken,
        status: "created",
        createdBy: ctx.user.id
      });
      return {
        success: true,
        jobToken,
        engineerLink: `/engineer/${jobToken}`,
        clientLink: `/track/${jobToken}`
      };
    }),
    // Cancel a job with reason (admin only)
    cancel: protectedProcedure.input(z3.object({
      jobId: z3.number(),
      reason: z3.string(),
      cancelledBy: z3.string()
    })).mutation(async ({ input, ctx }) => {
      const job = await getJobById(input.jobId);
      if (!job) {
        throw new Error("Job not found");
      }
      await updateJobStatus(input.jobId, "cancelled", {
        cancellationReason: input.reason,
        cancelledBy: input.cancelledBy,
        cancelledAt: /* @__PURE__ */ new Date()
      });
      const baseUrl = getBaseUrl2(ctx.req);
      const trackingUrl = `${baseUrl}/track/${job.jobToken}`;
      try {
        await sendCancellationNotification({
          jobId: job.id,
          siteName: job.siteName,
          clientName: job.clientName,
          clientEmail: job.clientEmail || void 0,
          engineerName: job.engineerName || void 0,
          engineerEmail: job.engineerEmail || void 0,
          cancellationReason: input.reason,
          cancelledBy: input.cancelledBy,
          trackingUrl,
          baseUrl
        });
        console.log(`[CancelJob] Cancellation notifications sent for job #${job.id}`);
      } catch (error) {
        console.error(`[CancelJob] Failed to send cancellation notifications:`, error);
      }
      return { success: true };
    }),
    // Reassign job to another engineer (admin only)
    reassign: protectedProcedure.input(z3.object({
      jobId: z3.number()
    })).mutation(async ({ input, ctx }) => {
      const job = await getJobById(input.jobId);
      if (!job) {
        throw new Error("Job not found");
      }
      const newJobToken = randomBytes4(32).toString("hex");
      await updateJobStatus(input.jobId, "created", {
        jobToken: newJobToken,
        engineerName: null,
        engineerEmail: null,
        engineerPhone: null,
        acceptedAt: null
      });
      console.log(`[ReassignJob] Job #${job.id} reassigned with new token`);
      return {
        success: true,
        jobToken: newJobToken,
        engineerLink: `/engineer/${newJobToken}`
      };
    }),
    // Get all jobs (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getJobsByOrganization: getJobsByOrganization2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await getJobsByOrganization2(ctx.user.organizationId);
    }),
    // Get filtered jobs (admin only)
    getFiltered: protectedProcedure.input(z3.object({
      filter: z3.enum(["today", "urgent", "overdue", "pending", "in_progress"])
    })).query(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getFilteredJobsByOrganization: getFilteredJobsByOrganization2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await getFilteredJobsByOrganization2(input.filter, ctx.user.organizationId);
    }),
    // Get filter counts (admin only)
    getFilterCounts: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getJobFilterCountsByOrganization: getJobFilterCountsByOrganization2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await getJobFilterCountsByOrganization2(ctx.user.organizationId);
    }),
    // Get job by token (public - for engineer and client access)
    getByToken: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      return await getJobByToken(input.token);
    }),
    // Get job by ID (admin only)
    getById: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
      return await getJobById(input.id);
    }),
    // Send job assignment email to engineer (admin only)
    sendToEngineer: protectedProcedure.input(z3.object({
      jobId: z3.number(),
      engineerEmail: z3.string().email(),
      engineerName: z3.string()
    })).mutation(async ({ input, ctx }) => {
      const baseUrl = getBaseUrl2(ctx.req);
      const job = await getJobById(input.jobId);
      if (!job) throw new Error("Job not found");
      await updateJobStatus(job.id, "sent_to_engineer");
      try {
        const { sendJobAssignmentNotification: sendJobAssignmentNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        await sendJobAssignmentNotification2({
          engineerEmail: input.engineerEmail,
          engineerName: input.engineerName,
          siteName: job.siteName,
          siteAddress: job.siteAddress || "N/A",
          scheduledDateTime: job.scheduledDateTime || void 0,
          incidentDetails: job.incidentDetails || "N/A",
          jobToken: job.jobToken,
          baseUrl
        });
        console.log("[Email] Job assignment sent to engineer:", input.engineerEmail);
        return { success: true, message: "Job assignment email sent successfully" };
      } catch (error) {
        console.error("[Email] Failed to send job assignment:", error);
        throw new Error("Failed to send job assignment email");
      }
    }),
    // Accept job (engineer via link)
    accept: publicProcedure.input(z3.object({
      token: z3.string(),
      engineerName: z3.string(),
      engineerEmail: z3.string().optional(),
      engineerPhone: z3.string().optional(),
      counterProposedDate: z3.string().optional(),
      // Keep as string to avoid midnight UTC conversion
      counterProposedTime: z3.string().optional(),
      counterProposalNotes: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const baseUrl = getBaseUrl2(ctx.req);
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      if (job.status !== "created" && job.status !== "sent_to_engineer") {
        throw new Error("Job already accepted or completed");
      }
      const updateFields = {
        engineerName: input.engineerName,
        engineerEmail: input.engineerEmail,
        engineerPhone: input.engineerPhone,
        acceptedAt: /* @__PURE__ */ new Date()
      };
      if (input.counterProposedDate) {
        updateFields.confirmedStartDate = new Date(input.counterProposedDate);
      }
      if (input.counterProposedTime) {
        updateFields.confirmedStartTime = input.counterProposedTime;
      }
      if (input.counterProposalNotes) {
        updateFields.timeNegotiationNotes = input.counterProposalNotes;
      }
      await updateJobStatus(job.id, "accepted", updateFields);
      await addJobStatusHistory({
        jobId: job.id,
        status: "accepted",
        notes: `Accepted by ${input.engineerName}`
      });
      if (input.counterProposedDate) {
        const currentTime = job.proposedStartTime || job.requestedStartTime || "Flexible";
        const proposedTime = input.counterProposedTime || "Flexible";
        await addJobStatusHistory({
          jobId: job.id,
          status: "time_counter_proposed",
          notes: `Engineer ${input.engineerName} proposed time change from ${currentTime} to ${proposedTime}${input.counterProposalNotes ? `. Reason: ${input.counterProposalNotes}` : ""}. Awaiting admin approval.`
        });
      }
      if (job.clientEmail) {
        try {
          const { sendStatusUpdateNotification: sendStatusUpdateNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendStatusUpdateNotification2(job.clientEmail, {
            siteName: job.siteName,
            status: "accepted",
            engineerName: input.engineerName,
            jobToken: job.jobToken,
            baseUrl
          });
          console.log("[Email] Status update sent to client:", job.clientEmail);
        } catch (error) {
          console.error("[Email] Failed to send status update:", error);
        }
      }
      try {
        const adminEmail = "admin@field-pulse.io";
        if (input.counterProposedDate) {
          const { sendTimeCounterProposalNotification: sendTimeCounterProposalNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendTimeCounterProposalNotification2(adminEmail, {
            engineerName: input.engineerName,
            engineerEmail: input.engineerEmail || "Not provided",
            jobId: job.id,
            siteName: job.siteName,
            siteAddress: job.siteAddress || "",
            clientName: job.clientName || "",
            requestedStartDate: job.requestedStartDate || void 0,
            requestedStartTime: job.requestedStartTime || void 0,
            proposedStartDate: job.proposedStartDate || void 0,
            proposedStartTime: job.proposedStartTime || void 0,
            counterProposedDate: new Date(input.counterProposedDate),
            counterProposedTime: input.counterProposedTime || void 0,
            counterProposalNotes: input.counterProposalNotes || void 0,
            baseUrl
          });
          console.log("[Email] Time counter-proposal notification sent to admin");
        } else {
          const { sendEngineerAcceptanceNotification: sendEngineerAcceptanceNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendEngineerAcceptanceNotification2(adminEmail, {
            engineerName: input.engineerName,
            engineerEmail: input.engineerEmail || "Not provided",
            jobId: job.id,
            siteName: job.siteName,
            siteAddress: job.siteAddress || "",
            clientName: job.clientName || "",
            scheduledDateTime: job.scheduledDateTime || void 0,
            acceptedAt: /* @__PURE__ */ new Date(),
            baseUrl
          });
          console.log("[Email] Engineer acceptance notification sent to admin");
        }
      } catch (error) {
        console.error("[Email] Failed to send acceptance notification to admin:", error);
      }
      return { success: true };
    }),
    // Decline job (engineer via link)
    decline: publicProcedure.input(z3.object({
      token: z3.string(),
      reason: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const baseUrl = getBaseUrl2(ctx.req);
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      await updateJobStatus(job.id, "declined");
      await addJobStatusHistory({
        jobId: job.id,
        status: "declined",
        notes: input.reason || "Declined by engineer"
      });
      try {
        const adminEmail = "admin@field-pulse.io";
        const { sendEngineerDeclineNotification: sendEngineerDeclineNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        await sendEngineerDeclineNotification2(adminEmail, {
          engineerName: job.engineerName || "Unknown Engineer",
          engineerEmail: job.engineerEmail || "Not provided",
          jobId: job.id,
          siteName: job.siteName,
          siteAddress: job.siteAddress || "",
          clientName: job.clientName || "",
          scheduledDateTime: job.scheduledDateTime || void 0,
          declinedAt: /* @__PURE__ */ new Date(),
          baseUrl
        });
        console.log("[Email] Engineer decline notification sent to admin");
      } catch (error) {
        console.error("[Email] Failed to send decline notification to admin:", error);
      }
      return { success: true };
    }),
    // Update job status
    updateStatus: publicProcedure.input(z3.object({
      token: z3.string(),
      status: z3.enum(["approved", "rejected", "created", "sent_to_engineer", "en_route", "on_site", "completed", "cancelled"]),
      latitude: z3.string().optional(),
      longitude: z3.string().optional(),
      notes: z3.string().optional(),
      engineerName: z3.string().optional(),
      engineerEmail: z3.string().email().optional(),
      sendEmailToEngineer: z3.boolean().optional(),
      timezone: z3.string().optional(),
      // Site timezone (IANA format)
      proposedStartDate: z3.date().optional(),
      proposedStartTime: z3.string().optional(),
      timeNegotiationNotes: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const baseUrl = getBaseUrl2(ctx.req);
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      const updateFields = {};
      if (input.status === "en_route") {
        updateFields.enRouteAt = /* @__PURE__ */ new Date();
      } else if (input.status === "on_site") {
        updateFields.arrivedAt = /* @__PURE__ */ new Date();
      } else if (input.status === "completed") {
        updateFields.completedAt = /* @__PURE__ */ new Date();
      } else if (input.status === "approved") {
        if (input.proposedStartDate) {
          updateFields.proposedStartDate = input.proposedStartDate;
          if (input.proposedStartTime) {
            const dateStr = input.proposedStartDate.toISOString().split("T")[0];
            const localDateTimeStr = `${dateStr}T${input.proposedStartTime}`;
            if (job.timezone) {
              const { convertLocalTimeToUTC: convertLocalTimeToUTC2 } = await Promise.resolve().then(() => (init_timezone(), timezone_exports));
              updateFields.scheduledDateTime = convertLocalTimeToUTC2(localDateTimeStr, job.timezone);
            } else {
              updateFields.scheduledDateTime = new Date(localDateTimeStr);
            }
          } else {
            updateFields.scheduledDateTime = input.proposedStartDate;
          }
        }
        if (input.proposedStartTime) {
          updateFields.proposedStartTime = input.proposedStartTime;
        }
        if (input.timeNegotiationNotes) {
          updateFields.timeNegotiationNotes = input.timeNegotiationNotes;
        }
      }
      await updateJobStatus(job.id, input.status, updateFields);
      await addJobStatusHistory({
        jobId: job.id,
        status: input.status,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes || (input.status === "sent_to_engineer" && input.engineerName ? `Assigned to ${input.engineerName} (${input.engineerEmail})` : void 0)
      });
      if (input.status === "approved" && input.proposedStartDate) {
        const oldTime = job.requestedStartTime || "Flexible";
        const newTime = input.proposedStartTime || "Flexible";
        await addJobStatusHistory({
          jobId: job.id,
          status: "time_adjusted",
          notes: `Admin adjusted time from ${oldTime} to ${newTime}${input.timeNegotiationNotes ? `. Reason: ${input.timeNegotiationNotes}` : ""}`
        });
      }
      if (input.status === "approved" && job.clientEmail) {
        try {
          if (input.proposedStartDate) {
            const { sendTimeAdjustmentNotification: sendTimeAdjustmentNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
            await sendTimeAdjustmentNotification2(job.clientEmail, {
              clientName: job.clientName || "",
              siteName: job.siteName,
              siteAddress: job.siteAddress || "",
              requestedStartDate: job.requestedStartDate || void 0,
              requestedStartTime: job.requestedStartTime || void 0,
              proposedStartDate: input.proposedStartDate,
              proposedStartTime: input.proposedStartTime || void 0,
              timeNegotiationNotes: input.timeNegotiationNotes || void 0,
              trackingToken: job.jobToken,
              baseUrl
            });
            console.log("[Email] Time adjustment notification sent to client:", job.clientEmail);
          } else {
            const { sendJobApprovalNotification: sendJobApprovalNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
            await sendJobApprovalNotification2(job.clientEmail, {
              clientName: job.clientName || "",
              siteName: job.siteName,
              siteAddress: job.siteAddress || "",
              scheduledDateTime: job.scheduledDateTime || void 0,
              trackingToken: job.jobToken,
              baseUrl
            });
            console.log("[Email] Job approval notification sent to client:", job.clientEmail);
          }
        } catch (error) {
          console.error("[Email] Failed to send approval notification to client:", error);
        }
      }
      if (input.status === "rejected" && job.clientEmail) {
        try {
          const { sendJobRejectionNotification: sendJobRejectionNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendJobRejectionNotification2(job.clientEmail, {
            clientName: job.clientName || "",
            siteName: job.siteName,
            siteAddress: job.siteAddress || "",
            scheduledDateTime: job.scheduledDateTime || void 0,
            rejectionReason: input.notes,
            baseUrl
          });
          console.log("[Email] Job rejection notification sent to client:", job.clientEmail);
        } catch (error) {
          console.error("[Email] Failed to send rejection notification to client:", error);
        }
      }
      if (input.status === "approved" && input.sendEmailToEngineer && input.engineerEmail && input.engineerName) {
        await updateJobStatus(job.id, "sent_to_engineer", {
          engineerName: input.engineerName,
          engineerEmail: input.engineerEmail
        });
        let emailSent = false;
        try {
          const { sendJobAssignmentNotification: sendJobAssignmentNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendJobAssignmentNotification2({
            engineerEmail: input.engineerEmail,
            engineerName: input.engineerName,
            siteName: job.siteName,
            siteAddress: job.siteAddress || "N/A",
            scheduledDateTime: job.scheduledDateTime || void 0,
            incidentDetails: job.incidentDetails || "N/A",
            jobToken: job.jobToken,
            baseUrl
          });
          console.log("[Email] Job assignment email sent to:", input.engineerEmail);
          emailSent = true;
        } catch (error) {
          console.error("[Email] Failed to send job assignment email:", error);
        }
        await addJobStatusHistory({
          jobId: job.id,
          status: "sent_to_engineer",
          notes: emailSent ? `Job assignment email sent to ${input.engineerName} (${input.engineerEmail})` : `Job sent to ${input.engineerName} (email failed)`
        });
      }
      if (job.clientEmail && ["en_route", "on_site", "completed"].includes(input.status)) {
        try {
          const { sendStatusUpdateNotification: sendStatusUpdateNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendStatusUpdateNotification2(job.clientEmail, {
            siteName: job.siteName,
            status: input.status,
            engineerName: job.engineerName || "Engineer",
            jobToken: job.jobToken,
            baseUrl
          });
          console.log("[Email] Status update sent to client:", job.clientEmail);
        } catch (error) {
          console.error("[Email] Failed to send status update:", error);
        }
      }
      return { success: true };
    }),
    // Approve engineer's time counter-proposal
    approveTimeChange: protectedProcedure.input(z3.object({
      jobId: z3.number(),
      approved: z3.boolean(),
      adminNotes: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const baseUrl = getBaseUrl2(ctx.req);
      const job = await getJobById(input.jobId);
      if (!job) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Job not found" });
      }
      if (!job.confirmedStartDate) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "No time change proposal found for this job"
        });
      }
      const updateFields = {};
      if (input.approved) {
        if (job.confirmedStartTime) {
          const dateStr = job.confirmedStartDate.toISOString().split("T")[0];
          const localDateTimeStr = `${dateStr}T${job.confirmedStartTime}`;
          const { convertLocalTimeToUTC: convertLocalTimeToUTC2 } = await Promise.resolve().then(() => (init_timezone(), timezone_exports));
          const timezone = job.timezone || "Europe/London";
          updateFields.scheduledDateTime = convertLocalTimeToUTC2(localDateTimeStr, timezone);
        } else {
          updateFields.scheduledDateTime = job.confirmedStartDate;
        }
        updateFields.confirmedStartDate = null;
        updateFields.confirmedStartTime = null;
        if (input.adminNotes) {
          updateFields.timeNegotiationNotes = input.adminNotes;
        }
      } else {
        updateFields.confirmedStartDate = null;
        updateFields.confirmedStartTime = null;
        if (input.adminNotes) {
          updateFields.timeNegotiationNotes = input.adminNotes;
        }
      }
      await updateJobStatus(job.id, job.status, updateFields);
      if (input.approved) {
        const proposedTime = job.confirmedStartTime || "Flexible";
        await addJobStatusHistory({
          jobId: job.id,
          status: "time_approved",
          notes: `Admin approved engineer's time change to ${proposedTime}${input.adminNotes ? `. Note: ${input.adminNotes}` : ""}`
        });
      } else {
        await addJobStatusHistory({
          jobId: job.id,
          status: "time_rejected",
          notes: `Admin rejected engineer's time change proposal${input.adminNotes ? `. Reason: ${input.adminNotes}` : ""}`
        });
      }
      if (input.approved && job.engineerEmail && job.engineerName) {
        try {
          await sendEngineerTimeChangeApprovalNotification(job.engineerEmail, {
            engineerName: job.engineerName,
            siteName: job.siteName,
            siteAddress: job.siteAddress || "Address not specified",
            clientName: job.clientName,
            confirmedStartDate: job.confirmedStartDate,
            confirmedStartTime: job.confirmedStartTime || void 0,
            jobToken: job.jobToken,
            baseUrl
          });
          console.log(`[Email] \u2705 Time change approval notification sent to engineer:`, job.engineerEmail);
        } catch (error) {
          console.error("[Email] \u274C Failed to send time change approval notification to engineer:", error);
        }
      }
      if (input.approved && job.clientEmail) {
        try {
          const originalStartDate = job.proposedStartDate || job.requestedStartDate;
          const originalStartTime = job.proposedStartTime || job.requestedStartTime;
          await sendClientTimeChangeNotification(job.clientEmail, {
            clientName: job.clientName,
            siteName: job.siteName,
            siteAddress: job.siteAddress || "Address not specified",
            engineerName: job.engineerName || "Assigned Engineer",
            originalStartDate: originalStartDate || void 0,
            originalStartTime: originalStartTime || void 0,
            newStartDate: job.confirmedStartDate,
            newStartTime: job.confirmedStartTime || void 0,
            counterProposalNotes: job.timeNegotiationNotes || void 0,
            trackingToken: job.jobToken,
            baseUrl
          });
          console.log("[Email] \u2705 Time change notification sent to client:", job.clientEmail);
        } catch (error) {
          console.error("[Email] Failed to send time confirmation:", error);
        }
      }
      return { success: true };
    }),
    // Resend engineer assignment email
    resendEngineerEmail: protectedProcedure.input(z3.object({
      jobId: z3.number()
    })).mutation(async ({ input, ctx }) => {
      const job = await getJobById(input.jobId);
      if (!job) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Job not found" });
      }
      if (!job.engineerEmail || !job.engineerName) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Job does not have engineer assigned"
        });
      }
      const baseUrl = getBaseUrl2(ctx.req);
      let emailSent = false;
      try {
        const { sendJobAssignmentNotification: sendJobAssignmentNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        await sendJobAssignmentNotification2({
          engineerEmail: job.engineerEmail,
          engineerName: job.engineerName,
          siteName: job.siteName,
          siteAddress: job.siteAddress || "N/A",
          scheduledDateTime: job.scheduledDateTime || void 0,
          incidentDetails: job.incidentDetails || "N/A",
          jobToken: job.jobToken,
          baseUrl
        });
        console.log("[Email] Job assignment email resent to:", job.engineerEmail);
        emailSent = true;
      } catch (error) {
        console.error("[Email] Failed to resend job assignment email:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email"
        });
      }
      await addJobStatusHistory({
        jobId: job.id,
        status: "sent_to_engineer",
        notes: `Job assignment email resent to ${job.engineerName} (${job.engineerEmail})`
      });
      return { success: true, emailSent };
    }),
    // Add comment (from engineer, client, or admin)
    addComment: publicProcedure.input(z3.object({
      token: z3.string(),
      comment: z3.string(),
      authorName: z3.string(),
      authorType: z3.enum(["engineer", "client", "admin"]),
      authorEmail: z3.string().optional(),
      attachments: z3.array(z3.object({
        url: z3.string(),
        type: z3.enum(["image", "video"]),
        filename: z3.string(),
        size: z3.number(),
        mimeType: z3.string()
      })).optional()
    })).mutation(async ({ input, ctx }) => {
      const baseUrl = getBaseUrl2(ctx.req);
      const { addJobComment: addJobComment2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      const { serializeAttachments: serializeAttachments2 } = await Promise.resolve().then(() => (init_media_upload(), media_upload_exports));
      await addJobComment2({
        jobId: job.id,
        authorName: input.authorName,
        authorType: input.authorType,
        comment: input.comment,
        attachments: input.attachments ? serializeAttachments2(input.attachments) : null
      });
      const { sendCommentNotification: sendCommentNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const recipients = [];
      if (job.clientEmail && input.authorType !== "client") {
        recipients.push(job.clientEmail);
      }
      if (job.engineerEmail && input.authorType !== "engineer") {
        recipients.push(job.engineerEmail);
      }
      if (input.authorType !== "admin") {
        const adminEmail = "admin@field-pulse.io";
        if (adminEmail) {
          recipients.push(adminEmail);
        }
      }
      for (const email of recipients) {
        try {
          await sendCommentNotification2(email, {
            siteName: job.siteName,
            authorName: input.authorName,
            authorType: input.authorType,
            commentText: input.comment,
            jobToken: job.jobToken,
            baseUrl
          });
          console.log("[Email] Comment notification sent to:", email);
        } catch (error) {
          console.error("[Email] Failed to send comment notification to", email, ":", error);
        }
      }
      return { success: true };
    }),
    // Get all comments for a job
    getComments: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const { getJobComments: getJobComments2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      return await getJobComments2(job.id);
    }),
    // Update video conference link
    updateVideoConferenceLink: publicProcedure.input(z3.object({
      token: z3.string(),
      videoConferenceLink: z3.string().nullable()
    })).mutation(async ({ input }) => {
      const { updateJobVideoConferenceLink: updateJobVideoConferenceLink2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      await updateJobVideoConferenceLink2(job.id, input.videoConferenceLink);
      return { success: true };
    }),
    // Add location update
    addLocation: publicProcedure.input(z3.object({
      token: z3.string(),
      latitude: z3.string(),
      longitude: z3.string(),
      accuracy: z3.string().optional(),
      trackingType: z3.enum(["en_route", "on_site", "milestone"])
    })).mutation(async ({ input }) => {
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      await addJobLocation({
        jobId: job.id,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
        trackingType: input.trackingType
      });
      return { success: true };
    }),
    // Get location history
    getLocations: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      return await getJobLocations(job.id);
    }),
    // Get latest location
    getLatestLocation: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      return await getLatestJobLocation(job.id);
    }),
    // Get status history
    getStatusHistory: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      return await getJobStatusHistory(job.id);
    }),
    // Export jobs by date range and status
    exportJobs: protectedProcedure.input(z3.object({
      startDate: z3.date(),
      endDate: z3.date(),
      status: z3.string().optional()
    })).query(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const jobs2 = await getJobsByDateRange(
        input.startDate,
        input.endDate,
        ctx.user.organizationId,
        input.status
      );
      const exportData = jobs2.map((job) => ({
        "Job ID": job.id,
        "Site Name": job.siteName,
        "Site Address": job.siteAddress || "",
        "Client Name": job.clientName || "",
        "Contact Number": job.siteContactNumber || "",
        "Status": job.status,
        "Engineer": job.engineerName || "Unassigned",
        "Scheduled": job.scheduledDateTime ? new Date(job.scheduledDateTime).toLocaleDateString() : "",
        "Created": new Date(job.createdAt).toLocaleDateString(),
        "Completed": job.completedAt ? new Date(job.completedAt).toLocaleDateString() : ""
      }));
      return exportData;
    }),
    // Email export to specified recipient
    emailExport: protectedProcedure.input(z3.object({
      startDate: z3.date(),
      endDate: z3.date(),
      status: z3.string().optional(),
      format: z3.enum(["csv", "excel"]),
      recipientEmail: z3.string().email(),
      recipientName: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const jobs2 = await getJobsByDateRange(
        input.startDate,
        input.endDate,
        ctx.user.organizationId,
        input.status
      );
      const exportData = jobs2.map((job) => ({
        "Job ID": job.id,
        "Site Name": job.siteName,
        "Site Address": job.siteAddress || "",
        "Client Name": job.clientName || "",
        "Contact Number": job.siteContactNumber || "",
        "Status": job.status,
        "Engineer": job.engineerName || "Unassigned",
        "Scheduled": job.scheduledDateTime ? new Date(job.scheduledDateTime).toLocaleDateString() : "",
        "Created": new Date(job.createdAt).toLocaleDateString(),
        "Completed": job.completedAt ? new Date(job.completedAt).toLocaleDateString() : ""
      }));
      const { sendExportEmail: sendExportEmail2 } = await Promise.resolve().then(() => (init_email_export(), email_export_exports));
      const success = await sendExportEmail2({
        recipientEmail: input.recipientEmail,
        recipientName: input.recipientName,
        exportData,
        format: input.format,
        dateRange: {
          start: input.startDate.toISOString().split("T")[0],
          end: input.endDate.toISOString().split("T")[0]
        },
        status: input.status
      });
      return { success, count: exportData.length };
    }),
    // Create or update scheduled export
    scheduleExport: protectedProcedure.input(z3.object({
      id: z3.string().optional(),
      schedule: z3.enum(["daily", "weekly", "monthly"]),
      recipientEmail: z3.string().email(),
      recipientName: z3.string().optional(),
      format: z3.enum(["csv", "excel"]),
      status: z3.string().optional(),
      isActive: z3.boolean()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { scheduleExport: scheduleExport2 } = await Promise.resolve().then(() => (init_scheduled_exports(), scheduled_exports_exports));
      const exportId = input.id || `export_${ctx.user.organizationId}_${Date.now()}`;
      const cronExpression = input.schedule === "daily" ? "0 8 * * *" : input.schedule === "weekly" ? "0 8 * * 1" : "0 8 1 * *";
      const success = scheduleExport2({
        id: exportId,
        organizationId: ctx.user.organizationId,
        schedule: input.schedule,
        cronExpression,
        recipientEmail: input.recipientEmail,
        recipientName: input.recipientName,
        format: input.format,
        status: input.status,
        isActive: input.isActive
      });
      return { success, exportId };
    }),
    // Get all scheduled exports for organization
    getScheduledExports: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getScheduledExports: getScheduledExports2 } = await Promise.resolve().then(() => (init_scheduled_exports(), scheduled_exports_exports));
      const allExports = getScheduledExports2();
      return allExports.filter((exp) => exp.organizationId === ctx.user.organizationId);
    }),
    // Remove scheduled export
    removeScheduledExport: protectedProcedure.input(z3.object({ id: z3.string() })).mutation(async ({ input }) => {
      const { removeScheduledExport: removeScheduledExport2 } = await Promise.resolve().then(() => (init_scheduled_exports(), scheduled_exports_exports));
      const success = removeScheduledExport2(input.id);
      return { success };
    }),
    // Upload document to job
    uploadDocument: publicProcedure.input(z3.object({
      token: z3.string(),
      fileName: z3.string(),
      fileType: z3.string(),
      mimeType: z3.string(),
      fileData: z3.string(),
      // base64 encoded
      documentType: z3.enum(["instruction_guide", "task_list", "reference", "other"]).optional(),
      description: z3.string().optional(),
      uploadedBy: z3.string(),
      uploaderType: z3.enum(["admin", "client", "system"])
    })).mutation(async ({ input, ctx }) => {
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      const { storagePut: storagePut3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileKey = `job-${job.id}/documents/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut3(fileKey, fileBuffer, input.mimeType);
      return { success: true, url };
    }),
    // Get documents for a job
    getDocuments: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      return [];
    }),
    // Delete document
    deleteDocument: protectedProcedure.input(z3.object({ documentId: z3.number(), jobId: z3.number() })).mutation(async ({ input, ctx }) => {
      return { success: true };
    }),
    // Get audit logs for a job
    getAuditLogs: protectedProcedure.input(z3.object({ jobId: z3.number() })).query(async ({ input, ctx }) => {
      return [];
    })
  }),
  // Site Visit Reports
  svr: router({
    // Create SVR and complete job
    create: publicProcedure.input(z3.object({
      token: z3.string(),
      visitDate: z3.date(),
      ticketNumbers: z3.string(),
      engineerName: z3.string(),
      onsiteContact: z3.string(),
      timeOnsite: z3.string(),
      timeLeftSite: z3.string(),
      issueFault: z3.string(),
      actionsPerformed: z3.string(),
      issueResolved: z3.boolean(),
      contactAgreed: z3.boolean(),
      clientSignatory: z3.string(),
      clientSignatureData: z3.string()
    })).mutation(async ({ input, ctx }) => {
      const baseUrl = getBaseUrl2(ctx.req);
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
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
        signedAt: /* @__PURE__ */ new Date()
      });
      await updateJobStatus(job.id, "completed", {
        completedAt: /* @__PURE__ */ new Date()
      });
      await addJobStatusHistory({
        jobId: job.id,
        status: "completed",
        notes: "Job completed with Site Visit Report"
      });
      const { sendJobCompletionNotification: sendJobCompletionNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      if (job.clientEmail) {
        try {
          await sendJobCompletionNotification2(job.clientEmail, {
            siteName: job.siteName,
            engineerName: input.engineerName,
            jobToken: job.jobToken,
            baseUrl
          });
          console.log("[Email] Completion notification sent to client:", job.clientEmail);
        } catch (error) {
          console.error("[Email] Failed to send completion notification to client:", error);
        }
      }
      const adminEmail = "admin@field-pulse.io";
      if (adminEmail) {
        try {
          await sendJobCompletionNotification2(adminEmail, {
            siteName: job.siteName,
            engineerName: input.engineerName,
            jobToken: job.jobToken,
            baseUrl
          });
          console.log("[Email] Completion notification sent to admin:", adminEmail);
        } catch (error) {
          console.error("[Email] Failed to send completion notification to admin:", error);
        }
      }
      return { success: true, svr };
    }),
    // Get SVR by job token
    getByToken: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      return await getSiteVisitReportByJobId(job.id);
    }),
    // Upload media file to SVR
    uploadMedia: publicProcedure.input(z3.object({
      token: z3.string(),
      fileName: z3.string(),
      fileType: z3.enum(["image", "video"]),
      mimeType: z3.string(),
      fileData: z3.string()
      // Base64 encoded file
    })).mutation(async ({ input }) => {
      const { storagePut: storagePut3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const { addSvrMediaFile: addSvrMediaFile2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      const svr = await getSiteVisitReportByJobId(job.id);
      if (!svr) throw new Error("Site Visit Report not found");
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileSize = fileBuffer.length;
      const maxSize = 50 * 1024 * 1024;
      if (fileSize > maxSize) {
        throw new Error("File size exceeds 50MB limit");
      }
      const timestamp2 = Date.now();
      const randomSuffix = randomBytes4(8).toString("hex");
      const fileExtension = input.fileName.split(".").pop();
      const fileKey = `svr-media/${svr.id}/${timestamp2}-${randomSuffix}.${fileExtension}`;
      const { url } = await storagePut3(fileKey, fileBuffer, input.mimeType);
      await addSvrMediaFile2({
        svrId: svr.id,
        fileKey,
        fileUrl: url,
        fileName: input.fileName,
        fileType: input.fileType,
        mimeType: input.mimeType,
        fileSize
      });
      return { success: true, url };
    }),
    // Get media files for SVR
    getMedia: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const { getSvrMediaFiles: getSvrMediaFiles2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const job = await getJobByToken(input.token);
      if (!job) throw new Error("Job not found");
      const svr = await getSiteVisitReportByJobId(job.id);
      if (!svr) return [];
      return await getSvrMediaFiles2(svr.id);
    }),
    // Email SVR to specified address (admin only)
    email: protectedProcedure.input(z3.object({
      jobId: z3.number(),
      recipientEmail: z3.string().email()
    })).mutation(async ({ input }) => {
      const job = await getJobById(input.jobId);
      if (!job) throw new Error("Job not found");
      const svr = await getSiteVisitReportByJobId(input.jobId);
      if (!svr) throw new Error("Site Visit Report not found");
      try {
        await sendSVREmail({
          recipientEmail: input.recipientEmail,
          job,
          svr
        });
        return { success: true };
      } catch (error) {
        console.error("Failed to send SVR email:", error);
        throw new Error("Failed to send SVR email");
      }
    })
  }),
  projects: router({
    // Create new project (admin only)
    create: protectedProcedure.input(z3.object({
      projectId: z3.string().min(1).max(100),
      name: z3.string().min(1).max(255),
      description: z3.string().optional(),
      clientName: z3.string().optional(),
      clientEmail: z3.string().email().optional(),
      clientPhone: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { createProject: createProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await createProject2({
        organizationId: ctx.user.organizationId,
        projectId: input.projectId,
        name: input.name,
        description: input.description,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        isActive: true
      });
      return project;
    }),
    // List all projects for organization
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectsByOrganization: getProjectsByOrganization3 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      return await getProjectsByOrganization3(ctx.user.organizationId);
    }),
    // Get project by ID (with organization verification)
    getByProjectId: protectedProcedure.input(z3.object({ projectId: z3.string() })).query(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectByProjectId: getProjectByProjectId2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectByProjectId2(input.projectId);
      if (project && project.organizationId !== ctx.user.organizationId) {
        throw new Error("Project not found or access denied");
      }
      return project;
    }),
    // Get project by ID (public - for project request pages)
    getByProjectIdPublic: publicProcedure.input(z3.object({ projectId: z3.string() })).query(async ({ input }) => {
      const { getProjectByProjectId: getProjectByProjectId2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectByProjectId2(input.projectId);
      if (project && !project.isActive) {
        return null;
      }
      return project;
    }),
    // Verify project exists and belongs to organization
    verify: protectedProcedure.input(z3.object({ projectId: z3.string() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { verifyProject: verifyProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const isValid = await verifyProject2(input.projectId, ctx.user.organizationId);
      return { isValid };
    }),
    // Update project
    update: protectedProcedure.input(z3.object({
      projectId: z3.string(),
      name: z3.string().optional(),
      description: z3.string().optional(),
      clientName: z3.string().optional(),
      clientEmail: z3.string().email().optional(),
      clientPhone: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectForValidation: getProjectForValidation2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectForValidation2(input.projectId, ctx.user.organizationId);
      if (!project) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Project not found or you do not have access to this project. Please check the Project ID and try again."
        });
      }
      if (!project.isActive) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: `Project "${project.name}" is currently inactive and cannot accept site uploads. Please contact an administrator to reactivate this project.`
        });
      }
      const { projectId, ...updates } = input;
      const { updateProject: updateProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      return await updateProject2(projectId, updates);
    }),
    // Toggle project status
    toggleStatus: protectedProcedure.input(z3.object({
      projectId: z3.string(),
      isActive: z3.boolean()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectForValidation: getProjectForValidation2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectForValidation2(input.projectId, ctx.user.organizationId);
      if (!project) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Project not found or you do not have access to this project. Please check the Project ID and try again."
        });
      }
      if (!project.isActive) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: `Project "${project.name}" is currently inactive and cannot accept site uploads. Please contact an administrator to reactivate this project.`
        });
      }
      const { toggleProjectStatus: toggleProjectStatus2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      return await toggleProjectStatus2(input.projectId, input.isActive);
    }),
    // Delete project
    delete: protectedProcedure.input(z3.object({ projectId: z3.string() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectForValidation: getProjectForValidation2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectForValidation2(input.projectId, ctx.user.organizationId);
      if (!project) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Project not found or you do not have access to this project. Please check the Project ID and try again."
        });
      }
      const { deleteProject: deleteProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      return await deleteProject2(input.projectId);
    }),
    // Download site upload template
    downloadSiteTemplate: protectedProcedure.mutation(async () => {
      try {
        const { generateSiteTemplate: generateSiteTemplate2 } = await Promise.resolve().then(() => (init_site_template(), site_template_exports));
        const buffer = generateSiteTemplate2();
        return {
          data: buffer.toString("base64"),
          filename: "project-sites-template.xlsx"
        };
      } catch (error) {
        console.error("Template generation error:", error);
        throw new Error(`Failed to generate template: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
    // Upload and parse site file
    uploadSites: protectedProcedure.input(z3.object({
      projectId: z3.string(),
      fileData: z3.string()
      // Base64 encoded file
    })).mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) throw new Error("Unauthorized");
        console.log("[uploadSites] ===== START UPLOAD =====");
        console.log("[uploadSites] ProjectId received:", input.projectId);
        console.log("[uploadSites] ProjectId length:", input.projectId.length);
        console.log("[uploadSites] ProjectId charCodes:", Array.from(input.projectId).map((c) => c.charCodeAt(0)).join(","));
        console.log("[uploadSites] User organizationId:", ctx.user.organizationId);
        const { getProjectForValidation: getProjectForValidation2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
        const project = await getProjectForValidation2(input.projectId, ctx.user.organizationId);
        if (!project) {
          throw new TRPCError3({
            code: "NOT_FOUND",
            message: "Project not found or you do not have access to this project. Please check the Project ID and try again."
          });
        }
        if (!project.isActive) {
          throw new TRPCError3({
            code: "FORBIDDEN",
            message: `Project "${project.name}" is currently inactive and cannot accept site uploads. Please contact an administrator to reactivate this project before uploading sites.`
          });
        }
        console.log("[uploadSites] Project verified successfully:", project.name);
        const { parseSiteUpload: parseSiteUpload2 } = await Promise.resolve().then(() => (init_site_template(), site_template_exports));
        const { geocodeAddress: geocodeAddress2 } = await Promise.resolve().then(() => (init_geocoding(), geocoding_exports));
        const fileBuffer = Buffer.from(input.fileData, "base64");
        const { sites, errors } = parseSiteUpload2(fileBuffer);
        if (errors.length > 0) {
          return { success: false, errors, imported: 0 };
        }
        const sitesWithCoords = await Promise.all(
          sites.map(async (site) => {
            let lat = site.latitude;
            let lng = site.longitude;
            if (!lat || !lng) {
              try {
                const fullAddress = `${site.siteAddress}, ${site.city || ""} ${site.postalCode || ""} ${site.country || ""}`.trim();
                const coords = await geocodeAddress2(fullAddress);
                lat = coords.latitude;
                lng = coords.longitude;
              } catch (error) {
                errors.push(`Failed to geocode address for "${site.siteName}": ${error instanceof Error ? error.message : "Unknown error"}`);
                return null;
              }
            }
            return {
              projectId: input.projectId,
              siteName: site.siteName,
              siteAddress: site.siteAddress,
              city: site.city || null,
              postalCode: site.postalCode || null,
              country: site.country || null,
              latitude: lat,
              longitude: lng,
              contactName: site.contactName || null,
              contactPhone: site.contactPhone || null,
              contactEmail: site.contactEmail || null,
              notes: site.notes || null,
              isActive: true
            };
          })
        );
        const validSites = sitesWithCoords.filter((site) => site !== null);
        if (validSites.length === 0) {
          return { success: false, errors, imported: 0 };
        }
        console.log("[ImportSites] Checking for duplicates in project:", input.projectId);
        const existingSites = await getProjectSites(input.projectId);
        console.log("[ImportSites] Found existing sites in target project:", existingSites.length);
        console.log("[ImportSites] Existing site names:", existingSites.map((s) => s.siteName).join(", "));
        const existingMap = new Map(
          existingSites.map((site) => [
            `${site.siteName.toLowerCase().trim()}|${site.siteAddress.toLowerCase().trim()}`,
            site
          ])
        );
        const newSites = validSites.filter((site) => {
          const key = `${site.siteName.toLowerCase().trim()}|${site.siteAddress.toLowerCase().trim()}`;
          const isDuplicate = existingMap.has(key);
          if (isDuplicate) {
            errors.push(`Skipped duplicate: "${site.siteName}" at "${site.siteAddress}"`);
          }
          return !isDuplicate;
        });
        const skipped = validSites.length - newSites.length;
        if (newSites.length === 0) {
          return {
            success: false,
            errors: [`All ${validSites.length} sites already exist in this project`, ...errors],
            imported: 0,
            skipped
          };
        }
        const imported = await bulkCreateProjectSites(newSites);
        return {
          success: true,
          imported,
          skipped,
          errors
        };
      } catch (error) {
        console.error("[uploadSites] ERROR:", error);
        console.error("[uploadSites] Error stack:", error instanceof Error ? error.stack : "No stack trace");
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to upload sites",
          cause: error
        });
      }
    }),
    // Get sites for a project (protected - requires auth)
    getSites: protectedProcedure.input(z3.object({ projectId: z3.string() })).query(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectForValidation: getProjectForValidation2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectForValidation2(input.projectId, ctx.user.organizationId);
      if (!project) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Project not found or you do not have access to this project. Please check the Project ID and try again."
        });
      }
      if (!project.isActive) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: `Project "${project.name}" is currently inactive and cannot accept site uploads. Please contact an administrator to reactivate this project.`
        });
      }
      console.log("[getSites endpoint] Called with projectId:", input.projectId);
      console.log("[getSites endpoint] ProjectId length:", input.projectId.length);
      console.log("[getSites endpoint] ProjectId charCodes:", Array.from(input.projectId).map((c) => c.charCodeAt(0)).join(","));
      console.log("[getSites endpoint] User organizationId:", ctx.user.organizationId);
      const sites = await getProjectSites(input.projectId);
      console.log("[getSites endpoint] Returning sites:", sites.length);
      if (sites.length > 0) {
        console.log("[getSites endpoint] First site:", sites[0].siteName);
      }
      return sites;
    }),
    // DIAGNOSTIC: Show what Drizzle actually returns
    debugSites: protectedProcedure.input(z3.object({ projectId: z3.string() })).query(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const sites = await getProjectSites(input.projectId);
      const uniqueProjectIds = Array.from(new Set(sites.map((s) => s.projectId)));
      return {
        requestedProjectId: input.projectId,
        totalSitesReturned: sites.length,
        uniqueProjectIdsInResults: uniqueProjectIds,
        sitesGroupedByProjectId: uniqueProjectIds.map((pid) => ({
          projectId: pid,
          count: sites.filter((s) => s.projectId === pid).length,
          siteNames: sites.filter((s) => s.projectId === pid).map((s) => s.siteName)
        })),
        allSites: sites.map((s) => ({
          siteName: s.siteName,
          projectId: s.projectId,
          siteAddress: s.siteAddress
        }))
      };
    }),
    // Get sites for a project (public - no auth required)
    getSitesPublic: publicProcedure.input(z3.object({ projectId: z3.string() })).query(async ({ input }) => {
      console.log("[getSitesPublic] Called with projectId:", input.projectId);
      const { getProjectByProjectId: getProjectByProjectId2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectByProjectId2(input.projectId);
      console.log("[getSitesPublic] Project found:", project ? `${project.name} (active: ${project.isActive})` : "null");
      if (!project || !project.isActive) {
        throw new Error("Project not found or inactive");
      }
      const sites = await getProjectSites(input.projectId);
      console.log("[getSitesPublic] Returning", sites.length, "sites");
      return sites;
    }),
    // Add single site
    addSite: protectedProcedure.input(z3.object({
      projectId: z3.string(),
      siteName: z3.string(),
      siteAddress: z3.string(),
      city: z3.string().optional(),
      postalCode: z3.string().optional(),
      country: z3.string().optional(),
      latitude: z3.string().optional(),
      longitude: z3.string().optional(),
      contactName: z3.string().optional(),
      contactPhone: z3.string().optional(),
      contactEmail: z3.string().optional(),
      notes: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectForValidation: getProjectForValidation2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const project = await getProjectForValidation2(input.projectId, ctx.user.organizationId);
      if (!project) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Project not found or you do not have access to this project. Please check the Project ID and try again."
        });
      }
      if (!project.isActive) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: `Project "${project.name}" is currently inactive and cannot accept site uploads. Please contact an administrator to reactivate this project.`
        });
      }
      const { geocodeAddress: geocodeAddress2 } = await Promise.resolve().then(() => (init_geocoding(), geocoding_exports));
      let lat = input.latitude;
      let lng = input.longitude;
      if (!lat || !lng) {
        const fullAddress = `${input.siteAddress}, ${input.city || ""} ${input.postalCode || ""} ${input.country || ""}`.trim();
        const coords = await geocodeAddress2(fullAddress);
        lat = String(coords.latitude);
        lng = String(coords.longitude);
      }
      return await createProjectSite({
        projectId: input.projectId,
        siteName: input.siteName,
        siteAddress: input.siteAddress,
        city: input.city || null,
        postalCode: input.postalCode || null,
        country: input.country || null,
        latitude: lat || null,
        longitude: lng || null,
        contactName: input.contactName || null,
        contactPhone: input.contactPhone || null,
        contactEmail: input.contactEmail || null,
        notes: input.notes || null,
        isActive: true
      });
    }),
    // Delete site
    deleteSite: protectedProcedure.input(z3.object({ siteId: z3.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectSiteById: getProjectSiteById2 } = await Promise.resolve().then(() => (init_project_sites_db(), project_sites_db_exports));
      const site = await getProjectSiteById2(input.siteId);
      if (!site) {
        throw new Error("Site not found");
      }
      const { verifyProject: verifyProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const isValid = await verifyProject2(site.projectId, ctx.user.organizationId);
      if (!isValid) {
        throw new Error("Site not found or access denied");
      }
      return await deleteProjectSite(input.siteId);
    }),
    // Update site location coordinates
    updateSiteLocation: protectedProcedure.input(z3.object({
      siteId: z3.number(),
      latitude: z3.number(),
      longitude: z3.number()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectSiteById: getProjectSiteById2 } = await Promise.resolve().then(() => (init_project_sites_db(), project_sites_db_exports));
      const site = await getProjectSiteById2(input.siteId);
      if (!site) {
        throw new Error("Site not found");
      }
      const { verifyProject: verifyProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const isValid = await verifyProject2(site.projectId, ctx.user.organizationId);
      if (!isValid) {
        throw new Error("Site not found or access denied");
      }
      return await updateProjectSiteLocation(input.siteId, input.latitude, input.longitude);
    }),
    // Geocode a single site
    geocodeSite: protectedProcedure.input(z3.object({ siteId: z3.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectSiteById: getProjectSiteById2, updateProjectSiteLocation: updateProjectSiteLocation2 } = await Promise.resolve().then(() => (init_project_sites_db(), project_sites_db_exports));
      const site = await getProjectSiteById2(input.siteId);
      if (!site) {
        throw new Error("Site not found");
      }
      const { verifyProject: verifyProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const isValid = await verifyProject2(site.projectId, ctx.user.organizationId);
      if (!isValid) {
        throw new Error("Site not found or access denied");
      }
      const { geocodeAddress: geocodeAddress2 } = await Promise.resolve().then(() => (init_geocoding(), geocoding_exports));
      const fullAddress = `${site.siteAddress}, ${site.city || ""} ${site.postalCode || ""} ${site.country || ""}`.trim();
      const result = await geocodeAddress2(fullAddress);
      if (!result.success || !result.latitude || !result.longitude) {
        throw new Error(result.error || "Failed to geocode address");
      }
      const updated = await updateProjectSiteLocation2(
        input.siteId,
        parseFloat(result.latitude),
        parseFloat(result.longitude)
      );
      return {
        success: updated,
        latitude: result.latitude,
        longitude: result.longitude
      };
    }),
    // Search for address suggestions
    searchAddresses: protectedProcedure.input(z3.object({
      address: z3.string(),
      limit: z3.number().optional().default(5)
    })).query(async ({ input }) => {
      const { searchAddresses: searchAddresses2 } = await Promise.resolve().then(() => (init_geocoding(), geocoding_exports));
      return await searchAddresses2(input.address, input.limit);
    }),
    // Verify project ID exists and belongs to organization (public endpoint for service request form)
    verifyPublic: publicProcedure.input(z3.object({
      projectId: z3.string(),
      organizationId: z3.number().optional()
      // Optional for backward compatibility
    })).mutation(async ({ input }) => {
      const project = await getProjectByProjectId(input.projectId);
      if (input.organizationId && project) {
        const isValid = project.organizationId === input.organizationId;
        return {
          isValid,
          projectName: isValid ? project.name : void 0
        };
      }
      return {
        isValid: !!project,
        projectName: project?.name
      };
    }),
    // Update site details
    updateSite: protectedProcedure.input(z3.object({
      siteId: z3.number(),
      siteName: z3.string().optional(),
      siteAddress: z3.string().optional(),
      city: z3.string().optional(),
      postalCode: z3.string().optional(),
      country: z3.string().optional(),
      contactName: z3.string().optional(),
      contactPhone: z3.string().optional(),
      contactEmail: z3.string().optional(),
      notes: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const { getProjectSiteById: getProjectSiteById2 } = await Promise.resolve().then(() => (init_project_sites_db(), project_sites_db_exports));
      const site = await getProjectSiteById2(input.siteId);
      if (!site) {
        throw new Error("Site not found");
      }
      const { verifyProject: verifyProject2 } = await Promise.resolve().then(() => (init_projects_db(), projects_db_exports));
      const isValid = await verifyProject2(site.projectId, ctx.user.organizationId);
      if (!isValid) {
        throw new Error("Site not found or access denied");
      }
      const { siteId, ...updates } = input;
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).map(([key, value]) => [
          key,
          value === "" || value === void 0 ? null : value
        ])
      );
      return await updateProjectSite(siteId, cleanUpdates);
    })
  }),
  organizations: router({
    // List all organizations (super admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized: Super admin access required");
      }
      const { getAllOrganizationsWithAdmins: getAllOrganizationsWithAdmins2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      return await getAllOrganizationsWithAdmins2();
    }),
    // Get current user's organization
    getMy: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.organizationId) {
        return null;
      }
      const { getOrganizationById: getOrganizationById2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      return await getOrganizationById2(ctx.user.organizationId);
    }),
    // Get organization by slug (public - for request forms)
    getBySlug: publicProcedure.input(z3.object({ slug: z3.string() })).query(async ({ input }) => {
      const { getOrganizationBySlug: getOrganizationBySlug2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      return await getOrganizationBySlug2(input.slug);
    }),
    // Create organization (super admin only)
    create: protectedProcedure.input(z3.object({
      name: z3.string().min(1),
      slug: z3.string().min(1)
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized: Super admin access required");
      }
      const { createOrganization: createOrganization2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      return await createOrganization2({ name: input.name });
    }),
    // Suspend organization (super admin only)
    suspend: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized: Super admin access required");
      }
      const { suspendOrganization: suspendOrganization2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      return await suspendOrganization2(input.id);
    }),
    // Unsuspend organization (super admin only)
    unsuspend: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized: Super admin access required");
      }
      const { unsuspendOrganization: unsuspendOrganization2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      return await unsuspendOrganization2(input.id);
    }),
    // Delete organization (super admin only)
    delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized: Super admin access required");
      }
      const { deleteOrganization: deleteOrganization2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      return await deleteOrganization2(input.id);
    })
  }),
  users: router({
    // List users (filtered by organization for tenant admins, all users for super admin)
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getAllUsers: getAllUsers2, getUsersByOrganization: getUsersByOrganization2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      if (ctx.user.role === "super_admin") {
        return await getAllUsers2();
      }
      return await getUsersByOrganization2(ctx.user.organizationId);
    }),
    // Create a new user (admin only)
    create: protectedProcedure.input(z3.object({
      email: z3.string().email(),
      name: z3.string(),
      password: z3.string().min(8),
      role: z3.enum(["super_admin", "admin"]).default("admin")
    })).mutation(async ({ input, ctx }) => {
      const { createUserInOrganization: createUserInOrganization2, getUserByEmail: getUserByEmail2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const existingUser = await getUserByEmail2(input.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      const user = await createUserInOrganization2(
        input.email,
        input.password,
        input.name,
        input.role,
        ctx.user.organizationId
      );
      if (!user) {
        throw new Error("Failed to create user");
      }
      try {
        const { sendNewUserEmail: sendNewUserEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        const baseUrl = getBaseUrl2(ctx.req);
        await sendNewUserEmail2({
          recipientEmail: input.email,
          recipientName: input.name,
          password: input.password,
          baseUrl,
          organizationId: ctx.user.organizationId
        });
      } catch (error) {
        console.error("[User Creation] Failed to send email notification:", error);
      }
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId
        }
      };
    }),
    // Change password (authenticated user)
    changePassword: protectedProcedure.input(z3.object({
      currentPassword: z3.string(),
      newPassword: z3.string().min(8)
    })).mutation(async ({ input, ctx }) => {
      const { authenticateUser: authenticateUser2, updateUserPassword: updateUserPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }
      const user = await authenticateUser2(ctx.user.email, input.currentPassword);
      if (!user) {
        throw new Error("Current password is incorrect");
      }
      const success = await updateUserPassword2(ctx.user.id, input.newPassword);
      if (!success) {
        throw new Error("Failed to update password");
      }
      return { success: true };
    }),
    // Toggle user active status (admin only)
    toggleStatus: protectedProcedure.input(z3.object({
      userId: z3.number(),
      isActive: z3.boolean()
    })).mutation(async ({ input, ctx }) => {
      const { updateUserStatus: updateUserStatus2, getUserById: getUserById2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      if (ctx.user && input.userId === ctx.user.id) {
        throw new Error("Cannot deactivate your own account");
      }
      const targetUser = await getUserById2(input.userId);
      if (targetUser?.isPrimaryAdmin && !input.isActive) {
        throw new Error("Cannot deactivate the primary admin of this organization");
      }
      const success = await updateUserStatus2(input.userId, input.isActive);
      if (!success) {
        throw new Error("Failed to update user status");
      }
      return { success: true, isActive: input.isActive };
    }),
    // Resend welcome email to user (admin only)
    resendWelcomeEmail: protectedProcedure.input(z3.object({
      userId: z3.number()
    })).mutation(async ({ input, ctx }) => {
      const { getUserById: getUserById2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const { getOrganizationById: getOrganizationById2 } = await Promise.resolve().then(() => (init_organizations_db(), organizations_db_exports));
      const { sendWelcomeEmail: sendWelcomeEmail2 } = await Promise.resolve().then(() => (init_auth_emails(), auth_emails_exports));
      const user = await getUserById2(input.userId);
      if (!user) {
        throw new Error("User not found");
      }
      const organization = await getOrganizationById2(user.organizationId);
      if (!organization) {
        throw new Error("Organization not found");
      }
      const baseUrl = getBaseUrl2(ctx.req);
      await sendWelcomeEmail2({
        email: user.email,
        name: user.name,
        organizationName: organization.name,
        baseUrl
      });
      return { success: true };
    })
  }),
  // Subscription Management
  subscription: router({
    // Create Stripe Checkout session for subscription
    createCheckout: protectedProcedure.input(z3.object({
      planTier: z3.enum(["starter", "enterprise"])
    })).mutation(async ({ input, ctx }) => {
      const { createCheckoutSession: createCheckoutSession2 } = await Promise.resolve().then(() => (init_stripe_helpers(), stripe_helpers_exports));
      const { getOrganizationSubscription: getOrganizationSubscription2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      if (!ctx.user) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Must be logged in" });
      }
      const org = await getOrganizationSubscription2(ctx.user.organizationId);
      if (!org) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Organization not found" });
      }
      if (org.subscriptionStatus === "active" && org.planTier !== "trial") {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Already have an active subscription. Use billing portal to change plans."
        });
      }
      const baseUrl = getBaseUrl2(ctx.req);
      try {
        const session = await createCheckoutSession2({
          organizationId: ctx.user.organizationId,
          planTier: input.planTier,
          customerEmail: ctx.user.email,
          successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/subscription/cancelled`
        });
        return {
          sessionId: session.sessionId,
          url: session.url
        };
      } catch (error) {
        console.error("[Subscription] Failed to create checkout:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session"
        });
      }
    }),
    // Get current subscription status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const { getOrganizationSubscription: getOrganizationSubscription2, getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3, jobs: jobs2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq9, and: and6, gte: gte3, sql: sql3 } = await import("drizzle-orm");
      if (!ctx.user) {
        throw new TRPCError3({ code: "UNAUTHORIZED" });
      }
      const org = await getOrganizationSubscription2(ctx.user.organizationId);
      if (!org) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Organization not found" });
      }
      const db = await getDb2();
      if (!db) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }
      const adminCountResult = await db.select({ count: sql3`count(*)` }).from(users3).where(
        and6(
          eq9(users3.organizationId, ctx.user.organizationId),
          eq9(users3.role, "admin")
        )
      );
      const adminUserCount = Number(adminCountResult[0]?.count || 0);
      const startDate = org.billingCycleStart ? new Date(org.billingCycleStart) : new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
      const jobCountResult = await db.select({ count: sql3`count(*)` }).from(jobs2).where(
        and6(
          eq9(jobs2.organizationId, ctx.user.organizationId),
          gte3(jobs2.createdAt, startDate)
        )
      );
      const currentMonthJobCount = Number(jobCountResult[0]?.count || 0);
      return {
        planTier: org.planTier,
        subscriptionStatus: org.subscriptionStatus,
        monthlyJobLimit: org.monthlyJobLimit,
        currentMonthJobCount,
        adminUserCount,
        maxAdminUsers: org.maxAdminUsers,
        trialEndsAt: org.trialEndsAt,
        billingCycleStart: org.billingCycleStart,
        billingCycleEnd: org.billingCycleEnd,
        stripeCustomerId: org.stripeCustomerId,
        stripeSubscriptionId: org.stripeSubscriptionId
      };
    }),
    // Create Stripe Customer Portal session
    createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
      const { createPortalSession: createPortalSession2 } = await Promise.resolve().then(() => (init_stripe_helpers(), stripe_helpers_exports));
      const { getOrganizationSubscription: getOrganizationSubscription2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      if (!ctx.user) {
        throw new TRPCError3({ code: "UNAUTHORIZED" });
      }
      const org = await getOrganizationSubscription2(ctx.user.organizationId);
      if (!org || !org.stripeCustomerId) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "No active subscription found"
        });
      }
      const baseUrl = getBaseUrl2(ctx.req);
      try {
        const session = await createPortalSession2({
          customerId: org.stripeCustomerId,
          returnUrl: `${baseUrl}/settings/billing`
        });
        return {
          url: session.url
        };
      } catch (error) {
        console.error("[Subscription] Failed to create portal session:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create portal session"
        });
      }
    }),
    // Cancel subscription
    cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      const { cancelSubscription: cancelSubscription2 } = await Promise.resolve().then(() => (init_stripe_helpers(), stripe_helpers_exports));
      const { getOrganizationSubscription: getOrganizationSubscription2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      if (!ctx.user) {
        throw new TRPCError3({ code: "UNAUTHORIZED" });
      }
      const org = await getOrganizationSubscription2(ctx.user.organizationId);
      if (!org || !org.stripeSubscriptionId) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "No active subscription found"
        });
      }
      try {
        await cancelSubscription2(org.stripeSubscriptionId);
        return {
          success: true,
          message: "Subscription cancelled successfully"
        };
      } catch (error) {
        console.error("[Subscription] Failed to cancel subscription:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel subscription"
        });
      }
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path3 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path2.resolve(import.meta.dirname),
  root: path2.resolve(import.meta.dirname, "client"),
  publicDir: path2.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path3.resolve(import.meta.dirname, "../..", "dist", "public") : path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const { initializeSuperAdmin: initializeSuperAdmin2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
  await initializeSuperAdmin2();
  const app = express2();
  const server = createServer(app);
  const { registerWebhookEndpoint: registerWebhookEndpoint2 } = await Promise.resolve().then(() => (init_webhook_middleware(), webhook_middleware_exports));
  registerWebhookEndpoint2(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  if (process.env.USE_LOCAL_STORAGE === "true") {
    const { initializeUploadDirectories: initializeUploadDirectories2 } = await Promise.resolve().then(() => (init_storage_local(), storage_local_exports));
    await initializeUploadDirectories2();
    const uploadsPath = path4.join(process.cwd(), "uploads");
    app.use("/uploads", express2.static(uploadsPath));
    console.log("[Storage] Serving uploads from:", uploadsPath);
  }
  const { registerTestSubscriptionEndpoint: registerTestSubscriptionEndpoint2 } = await Promise.resolve().then(() => (init_test_subscription_update(), test_subscription_update_exports));
  registerTestSubscriptionEndpoint2(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
