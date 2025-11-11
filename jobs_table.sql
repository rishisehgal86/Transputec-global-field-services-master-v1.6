-- MySQL Script for Jobs Table
-- FieldPulse Go Field Engineer Dispatch Transputec Field Engineer Dispatch & Tracking System Tracking System
-- Version 2.0.3

CREATE TABLE IF NOT EXISTS `jobs` (
  -- Primary Key
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Unique identifier for shareable links
  `jobToken` VARCHAR(64) NOT NULL UNIQUE,
  
  -- Site Information
  `siteName` VARCHAR(255) NOT NULL,
  `siteId` VARCHAR(100) DEFAULT NULL,
  `siteLocation` VARCHAR(255) DEFAULT NULL,
  `siteAddress` TEXT DEFAULT NULL,
  `siteLatitude` VARCHAR(50) DEFAULT NULL,
  `siteLongitude` VARCHAR(50) DEFAULT NULL,
  
  -- Contact Information
  `siteContactName` VARCHAR(255) DEFAULT NULL,
  `siteContactNumber` VARCHAR(50) DEFAULT NULL,
  
  -- Job Details
  `changeNumber` VARCHAR(100) DEFAULT NULL,
  `incidentNumber` VARCHAR(100) DEFAULT NULL,
  `projectName` VARCHAR(255) DEFAULT NULL,
  `downTime` BOOLEAN DEFAULT FALSE,
  `scheduledDateTime` TIMESTAMP NULL DEFAULT NULL,
  `hoursRequired` VARCHAR(100) DEFAULT NULL,
  
  -- Technical Requirements
  `toolsRequired` TEXT DEFAULT NULL,
  `deviceDetails` TEXT DEFAULT NULL,
  `incidentDetails` TEXT DEFAULT NULL,
  `scopeOfWork` TEXT DEFAULT NULL,
  
  -- Additional Information
  `coveredByCOI` BOOLEAN DEFAULT TRUE,
  `notes` TEXT DEFAULT NULL,
  `videoConferenceLink` VARCHAR(500) DEFAULT NULL,
  
  -- Job Status
  `status` ENUM(
    'pending_approval',
    'approved',
    'rejected',
    'created',
    'sent_to_engineer',
    'accepted',
    'declined',
    'en_route',
    'on_site',
    'completed',
    'cancelled'
  ) DEFAULT 'pending_approval' NOT NULL,
  
  -- Engineer Information
  `engineerName` VARCHAR(255) DEFAULT NULL,
  `engineerEmail` VARCHAR(320) DEFAULT NULL,
  `engineerPhone` VARCHAR(50) DEFAULT NULL,
  
  -- Timestamps
  `acceptedAt` TIMESTAMP NULL DEFAULT NULL,
  `enRouteAt` TIMESTAMP NULL DEFAULT NULL,
  `arrivedAt` TIMESTAMP NULL DEFAULT NULL,
  `completedAt` TIMESTAMP NULL DEFAULT NULL,
  
  -- Client Information
  `clientName` VARCHAR(255) NOT NULL,
  `clientEmail` VARCHAR(320) DEFAULT NULL,
  
  -- System Timestamps
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  -- Foreign Key
  `createdBy` INT DEFAULT NULL,
  
  -- Indexes
  INDEX `idx_jobToken` (`jobToken`),
  INDEX `idx_status` (`status`),
  INDEX `idx_engineerEmail` (`engineerEmail`),
  INDEX `idx_clientEmail` (`clientEmail`),
  INDEX `idx_createdAt` (`createdAt`),
  INDEX `idx_scheduledDateTime` (`scheduledDateTime`),
  
  -- Foreign Key Constraint (uncomment if users table exists)
  -- CONSTRAINT `fk_jobs_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Add comments to columns for documentation
ALTER TABLE `jobs` 
  MODIFY COLUMN `jobToken` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Unique token for shareable engineer and client links',
  MODIFY COLUMN `status` ENUM(
    'pending_approval',
    'approved',
    'rejected',
    'created',
    'sent_to_engineer',
    'accepted',
    'declined',
    'en_route',
    'on_site',
    'completed',
    'cancelled'
  ) DEFAULT 'pending_approval' NOT NULL COMMENT 'Current status of the job in the workflow',
  MODIFY COLUMN `videoConferenceLink` VARCHAR(500) DEFAULT NULL COMMENT 'Optional video conference link for remote support';

