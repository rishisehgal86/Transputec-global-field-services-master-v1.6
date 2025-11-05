import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table for local authentication.
 * Supports email/password login with role-based access.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["super_admin", "admin"]).default("admin").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
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
  
  // Technical Requirements
  toolsRequired: text("toolsRequired"),
  deviceDetails: text("deviceDetails"),
  incidentDetails: text("incidentDetails"),
  scopeOfWork: text("scopeOfWork"),
  
  // Additional Information
  coveredByCOI: boolean("coveredByCOI").default(true),
  notes: text("notes"),
  
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
  
  // Timestamps
  acceptedAt: timestamp("acceptedAt"),
  enRouteAt: timestamp("enRouteAt"),
  arrivedAt: timestamp("arrivedAt"),
  completedAt: timestamp("completedAt"),
  
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
  trackingType: mysqlEnum("trackingType", ["en_route", "on_site"]).notNull(),
  
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

