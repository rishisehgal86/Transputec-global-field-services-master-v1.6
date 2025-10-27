CREATE TABLE `siteVisitReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`visitDate` timestamp NOT NULL,
	`ticketNumbers` text,
	`engineerName` varchar(255) NOT NULL,
	`onsiteContact` varchar(255),
	`timeOnsite` varchar(50),
	`timeLeftSite` varchar(50),
	`issueFault` text,
	`actionsPerformed` text,
	`issueResolved` boolean DEFAULT false,
	`contactAgreed` boolean DEFAULT false,
	`clientSignatory` varchar(255),
	`clientSignatureData` text,
	`signedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteVisitReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteVisitReports_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
ALTER TABLE `jobs` ADD `clientEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `siteVisitReports` ADD CONSTRAINT `siteVisitReports_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE no action ON UPDATE no action;