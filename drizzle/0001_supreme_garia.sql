CREATE TABLE `jobLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`latitude` varchar(50) NOT NULL,
	`longitude` varchar(50) NOT NULL,
	`accuracy` varchar(50),
	`trackingType` enum('en_route','on_site') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`notes` text,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobToken` varchar(64) NOT NULL,
	`siteName` varchar(255) NOT NULL,
	`siteId` varchar(100),
	`siteLocation` varchar(255),
	`siteAddress` text,
	`siteContactName` varchar(255),
	`siteContactNumber` varchar(50),
	`changeNumber` varchar(100),
	`incidentNumber` varchar(100),
	`projectName` varchar(255),
	`downTime` boolean DEFAULT false,
	`scheduledDateTime` timestamp,
	`hoursRequired` varchar(100),
	`toolsRequired` text,
	`deviceDetails` text,
	`incidentDetails` text,
	`scopeOfWork` text,
	`coveredByCOI` boolean DEFAULT true,
	`notes` text,
	`status` enum('created','sent_to_engineer','accepted','declined','en_route','on_site','completed','cancelled') NOT NULL DEFAULT 'created',
	`engineerName` varchar(255),
	`engineerEmail` varchar(320),
	`engineerPhone` varchar(50),
	`acceptedAt` timestamp,
	`enRouteAt` timestamp,
	`arrivedAt` timestamp,
	`completedAt` timestamp,
	`clientName` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobs_jobToken_unique` UNIQUE(`jobToken`)
);
--> statement-breakpoint
ALTER TABLE `jobLocations` ADD CONSTRAINT `jobLocations_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobStatusHistory` ADD CONSTRAINT `jobStatusHistory_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;