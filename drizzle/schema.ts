import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Organizations table - multi-tenant support
 * Each organization represents a separate company/tenant using the system
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
  
  // Trial and Subscription
  trialEndsAt: timestamp("trialEndsAt"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["trial", "active", "past_due", "cancelled", "expired"]).default("trial").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["go_only", "core_only", "both"]), // null during trial
  
  // Stripe Integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  planTier: mysqlEnum("planTier", ["trial", "starter", "enterprise", "free_enterprise"]).default("trial"),
  monthlyJobLimit: int("monthlyJobLimit").default(50), // 50 for trial, 100 for starter, NULL for enterprise
  currentMonthJobCount: int("currentMonthJobCount").default(0).notNull(),
  maxAdminUsers: int("maxAdminUsers").default(999).notNull(), // 3 for starter, 999 for others
  billingCycleStart: timestamp("billingCycleStart"),
  billingCycleEnd: timestamp("billingCycleEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(), // Stripe cancel_at_period_end flag
  
  // Settings
  isActive: boolean("isActive").default(true).notNull(),
  projectsEnabled: boolean("projectsEnabled").default(false).notNull(), // Enable/disable multi-project feature
  
  lastUsedAt: timestamp("lastUsedAt"), // Track when organization was last active
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Projects table - allows organizing jobs by project/client
 * Each project has a unique ID that can be used for job assignment
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  
  // Project identification
  projectId: varchar("projectId", { length: 100 }).notNull().unique(), // Unique identifier (e.g., "PROJ-001")
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Client information
  clientName: varchar("clientName", { length: 255 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 50 }),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Site restriction
  restrictToSites: boolean("restrictToSites").default(false).notNull(), // If true, only predefined sites can be selected
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project Sites table - predefined sites for project-based job requests
 * Each site belongs to a specific project
 */
export const projectSites = mysqlTable("project_sites", {
  id: int("id").autoincrement().primaryKey(),
  projectId: varchar("projectId", { length: 100 }).notNull().references(() => projects.projectId, { onDelete: 'cascade' }),
  
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectSite = typeof projectSites.$inferSelect;
export type InsertProjectSite = typeof projectSites.$inferInsert;

/**
 * Core user table for local authentication.
 * Supports email/password login with role-based access.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["super_admin", "admin"]).default("admin").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isPrimaryAdmin: boolean("isPrimaryAdmin").default(false).notNull(), // First admin who created the organization
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Jobs table - stores all dispatch requests
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  projectId: varchar("projectId", { length: 100 }).references(() => projects.projectId), // Optional project assignment
  
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
  estimatedHours: int("estimatedHours"), // For hourly bookings
  estimatedDays: int("estimatedDays"), // For multi-day bookings
  
  // Time Scheduling and Negotiation
  requestedStartDate: timestamp("requestedStartDate"),
  requestedStartTime: varchar("requestedStartTime", { length: 10 }), // HH:MM format
  proposedStartDate: timestamp("proposedStartDate"), // Admin/Engineer counter-proposal
  proposedStartTime: varchar("proposedStartTime", { length: 10 }),
  confirmedStartDate: timestamp("confirmedStartDate"), // Final confirmed schedule
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
  cancelledBy: varchar("cancelledBy", { length: 255 }), // Name of person who cancelled
  
  // Client Information
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Job Locations - stores GPS tracking data
 */
export const jobLocations = mysqlTable("jobLocations", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => jobs.id),
  
  // GPS Coordinates
  latitude: varchar("latitude", { length: 50 }).notNull(),
  longitude: varchar("longitude", { length: 50 }).notNull(),
  accuracy: varchar("accuracy", { length: 50 }), // in meters
  
  // Tracking context
  trackingType: mysqlEnum("trackingType", ["en_route", "on_site", "milestone"]).notNull(),
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type JobLocation = typeof jobLocations.$inferSelect;
export type InsertJobLocation = typeof jobLocations.$inferInsert;

/**
 * Job Status History - audit trail for status changes
 */
export const jobStatusHistory = mysqlTable("jobStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => jobs.id),
  
  status: varchar("status", { length: 50 }).notNull(),
  notes: text("notes"),
  
  // Location at time of status change (optional)
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type JobStatusHistory = typeof jobStatusHistory.$inferSelect;
export type InsertJobStatusHistory = typeof jobStatusHistory.$inferInsert;

/**
 * Site Visit Reports - stores engineer completion reports
 */
export const siteVisitReports = mysqlTable("siteVisitReports", {
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
  clientSignatureData: text("clientSignatureData"), // Base64 signature image
  signedAt: timestamp("signedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteVisitReport = typeof siteVisitReports.$inferSelect;
export type InsertSiteVisitReport = typeof siteVisitReports.$inferInsert;

/**
 * SVR Media Files - stores photos and videos attached to site visit reports
 */
export const svrMediaFiles = mysqlTable("svrMediaFiles", {
  id: int("id").autoincrement().primaryKey(),
  svrId: int("svrId").notNull().references(() => siteVisitReports.id),
  
  // File Information
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(), // S3 URL
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["image", "video"]).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SvrMediaFile = typeof svrMediaFiles.$inferSelect;
export type InsertSvrMediaFile = typeof svrMediaFiles.$inferInsert;

/**
 * Job Comments - stores comments/notes from engineers and clients visible to all parties
 */
export const jobComments = mysqlTable("jobComments", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => jobs.id),
  
  // Comment Information
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorType: mysqlEnum("authorType", ["engineer", "client", "admin"]).notNull(),
  comment: text("comment").notNull(),
  
  // Media Attachments (JSON array of {url: string, type: 'image'|'video', filename: string, size: number})
  attachments: text("attachments"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobComment = typeof jobComments.$inferSelect;
export type InsertJobComment = typeof jobComments.$inferInsert;

/**
 * Password Reset Tokens - stores tokens for password reset requests
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

