#!/usr/bin/env node
/**
 * ⚠️⚠️⚠️ DESTRUCTIVE SCRIPT - DO NOT USE ON PRODUCTION ⚠️⚠️⚠️
 * 
 * This script DROPS ALL TABLES and DELETES ALL DATA!
 * 
 * Use this ONLY for:
 * - Initial local development setup
 * - Resetting local test database
 * 
 * For production migrations, use: pnpm db:migrate
 * See DATABASE_MIGRATIONS.md for details
 * 
 * ⚠️⚠️⚠️ YOU HAVE BEEN WARNED ⚠️⚠️⚠️
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

console.log('🔧 Starting database table creation...');

const tables = [
  // Organizations table
  `CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    trialEndsAt TIMESTAMP NULL,
    subscriptionStatus ENUM('trial', 'active', 'past_due', 'cancelled', 'expired') NOT NULL DEFAULT 'trial',
    subscriptionPlan ENUM('go_only', 'core_only', 'both') NULL,
    stripeCustomerId VARCHAR(255) NULL,
    stripeSubscriptionId VARCHAR(255) NULL,
    planTier ENUM('trial', 'starter', 'enterprise', 'free_enterprise') DEFAULT 'trial',
    monthlyJobLimit INT DEFAULT 50,
    currentMonthJobCount INT NOT NULL DEFAULT 0,
    maxAdminUsers INT NOT NULL DEFAULT 999,
    billingCycleStart TIMESTAMP NULL,
    billingCycleEnd TIMESTAMP NULL,
    cancelAtPeriodEnd BOOLEAN NOT NULL DEFAULT FALSE,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    projectsEnabled BOOLEAN NOT NULL DEFAULT FALSE,
    lastUsedAt TIMESTAMP NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizationId INT NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    name TEXT NOT NULL,
    role ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin',
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    isPrimaryAdmin BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP NULL,
    FOREIGN KEY (organizationId) REFERENCES organizations(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Projects table
  `CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizationId INT NOT NULL,
    projectId VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    clientName VARCHAR(255) NULL,
    clientEmail VARCHAR(320) NULL,
    clientPhone VARCHAR(50) NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    restrictToSites BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES organizations(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Project Sites table
  `CREATE TABLE IF NOT EXISTS project_sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId VARCHAR(100) NOT NULL,
    siteName VARCHAR(255) NOT NULL,
    siteAddress TEXT NOT NULL,
    city VARCHAR(150) NULL,
    postalCode VARCHAR(50) NULL,
    country VARCHAR(100) NULL,
    latitude VARCHAR(50) NULL,
    longitude VARCHAR(50) NULL,
    contactName VARCHAR(255) NULL,
    contactPhone VARCHAR(50) NULL,
    contactEmail VARCHAR(320) NULL,
    notes TEXT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Jobs table
  `CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizationId INT NOT NULL,
    projectId VARCHAR(100) NULL,
    jobToken VARCHAR(64) NOT NULL UNIQUE,
    siteName VARCHAR(255) NOT NULL,
    siteId VARCHAR(100) NULL,
    siteLocation VARCHAR(255) NULL,
    siteAddress TEXT NULL,
    siteLatitude VARCHAR(50) NULL,
    siteLongitude VARCHAR(50) NULL,
    siteContactName VARCHAR(255) NULL,
    siteContactNumber VARCHAR(50) NULL,
    changeNumber VARCHAR(100) NULL,
    incidentNumber VARCHAR(100) NULL,
    projectName VARCHAR(255) NULL,
    downTime BOOLEAN DEFAULT FALSE,
    scheduledDateTime TIMESTAMP NULL,
    hoursRequired VARCHAR(100) NULL,
    bookingType ENUM('full_day', 'hourly', 'multi_day') NULL,
    estimatedHours INT NULL,
    estimatedDays INT NULL,
    requestedStartDate TIMESTAMP NULL,
    requestedStartTime VARCHAR(10) NULL,
    proposedStartDate TIMESTAMP NULL,
    proposedStartTime VARCHAR(10) NULL,
    confirmedStartDate TIMESTAMP NULL,
    confirmedStartTime VARCHAR(10) NULL,
    timeNegotiationNotes TEXT NULL,
    toolsRequired TEXT NULL,
    deviceDetails TEXT NULL,
    incidentDetails TEXT NULL,
    scopeOfWork TEXT NULL,
    coveredByCOI BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    videoConferenceLink VARCHAR(500) NULL,
    status ENUM('pending_approval', 'approved', 'rejected', 'created', 'sent_to_engineer', 'accepted', 'declined', 'en_route', 'on_site', 'completed', 'cancelled') NOT NULL DEFAULT 'pending_approval',
    engineerName VARCHAR(255) NULL,
    engineerEmail VARCHAR(320) NULL,
    engineerPhone VARCHAR(50) NULL,
    timezone VARCHAR(100) NULL,
    acceptedAt TIMESTAMP NULL,
    enRouteAt TIMESTAMP NULL,
    arrivedAt TIMESTAMP NULL,
    completedAt TIMESTAMP NULL,
    cancelledAt TIMESTAMP NULL,
    cancellationReason VARCHAR(500) NULL,
    cancelledBy VARCHAR(255) NULL,
    clientName VARCHAR(255) NOT NULL,
    clientEmail VARCHAR(320) NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    createdBy INT NULL,
    FOREIGN KEY (organizationId) REFERENCES organizations(id),
    FOREIGN KEY (projectId) REFERENCES projects(projectId),
    FOREIGN KEY (createdBy) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Job Locations table
  `CREATE TABLE IF NOT EXISTS job_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobId INT NOT NULL,
    latitude VARCHAR(50) NOT NULL,
    longitude VARCHAR(50) NOT NULL,
    accuracy VARCHAR(50) NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Job Comments table
  `CREATE TABLE IF NOT EXISTS job_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobId INT NOT NULL,
    userId INT NULL,
    authorName VARCHAR(255) NOT NULL,
    authorType ENUM('admin', 'engineer', 'client', 'system') NOT NULL,
    comment TEXT NOT NULL,
    isInternal BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // SVR Reports table
  `CREATE TABLE IF NOT EXISTS svr_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobId INT NOT NULL,
    reportData JSON NOT NULL,
    engineerSignature TEXT NULL,
    clientSignature TEXT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // SVR Media Files table
  `CREATE TABLE IF NOT EXISTS svr_media_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    svrReportId INT NOT NULL,
    fileUrl VARCHAR(500) NOT NULL,
    fileType ENUM('photo', 'video', 'document') NOT NULL,
    caption TEXT NULL,
    uploadedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (svrReportId) REFERENCES svr_reports(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Password Reset Tokens table
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiresAt TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

try {
  console.log('📡 Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('✅ Connected successfully');
  
  // Drop existing tables to ensure clean slate
  console.log('🗑️  Dropping existing tables (if any)...\n');
  
  // Disable foreign key checks to allow dropping tables with constraints
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  
  const dropTables = [
    'DROP TABLE IF EXISTS password_reset_tokens',
    'DROP TABLE IF EXISTS svr_media_files',
    'DROP TABLE IF EXISTS svr_reports',
    'DROP TABLE IF EXISTS job_comments',
    'DROP TABLE IF EXISTS job_locations',
    'DROP TABLE IF EXISTS jobs',
    'DROP TABLE IF EXISTS project_sites',
    'DROP TABLE IF EXISTS projects',
    'DROP TABLE IF EXISTS users',
    'DROP TABLE IF EXISTS organizations',
  ];
  
  for (const sql of dropTables) {
    await connection.execute(sql);
  }
  
  // Re-enable foreign key checks
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  
  console.log('  ✓ Dropped all existing tables\n');
  
  console.log('📝 Creating tables...\n');

  for (const [index, sql] of tables.entries()) {
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
    try {
      await connection.execute(sql);
      console.log(`  ✓ Created table: ${tableName}`);
    } catch (error) {
      console.error(`  ✗ Failed to create table ${tableName}:`, error.message);
      throw error;
    }
  }

  await connection.end();
  
  console.log('\n🎉 All tables created successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Database initialization failed:', error.message);
  process.exit(1);
}

