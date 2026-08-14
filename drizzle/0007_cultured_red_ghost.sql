CREATE TABLE `browser_push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`partnerConnectionId` int,
	`endpoint` varchar(1200) NOT NULL,
	`p256dh` varchar(300) NOT NULL,
	`authSecret` varchar(300) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `browser_push_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `push_subscription_endpoint_unique` UNIQUE(`endpoint`)
);
--> statement-breakpoint
CREATE TABLE `cycle_moment_reflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`moment` enum('menstrual','post-menstrual','follicular','ovulation','premenstrual','luteal') NOT NULL,
	`cycleStartAt` timestamp NOT NULL,
	`whatHelped` text NOT NULL,
	`entryAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cycle_moment_reflections_id` PRIMARY KEY(`id`),
	CONSTRAINT `reflection_user_moment_cycle_unique` UNIQUE(`userId`,`moment`,`cycleStartAt`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ownerBrowserAlertsEnabled` int NOT NULL DEFAULT 0,
	`reminderTime` varchar(5) NOT NULL DEFAULT '09:00',
	`scheduleCronTaskUid` varchar(65),
	`consentedAt` timestamp,
	`lastOwnerReminderAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preference_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `partner_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`partnerEmail` varchar(320) NOT NULL,
	`partnerName` varchar(80),
	`tokenHash` varchar(128) NOT NULL,
	`consentedAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`revokedAt` timestamp,
	`emailAlertsEnabled` int NOT NULL DEFAULT 0,
	`browserAlertsEnabled` int NOT NULL DEFAULT 0,
	`lastPartnerReminderAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_connection_token_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `preparation_checklist_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemId` int NOT NULL,
	`cycleStartAt` timestamp NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `preparation_checklist_completions_id` PRIMARY KEY(`id`),
	CONSTRAINT `prep_completion_user_item_cycle_unique` UNIQUE(`userId`,`itemId`,`cycleStartAt`)
);
--> statement-breakpoint
CREATE TABLE `preparation_checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preparation_checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `push_subscription_user_partner_idx` ON `browser_push_subscriptions` (`userId`,`partnerConnectionId`);--> statement-breakpoint
CREATE INDEX `reflection_user_created_idx` ON `cycle_moment_reflections` (`userId`,`entryAt`);--> statement-breakpoint
CREATE INDEX `notification_preference_schedule_idx` ON `notification_preferences` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `partner_connection_owner_active_idx` ON `partner_connections` (`ownerUserId`,`revokedAt`);--> statement-breakpoint
CREATE INDEX `prep_completion_user_cycle_idx` ON `preparation_checklist_completions` (`userId`,`cycleStartAt`);--> statement-breakpoint
CREATE INDEX `prep_item_user_order_idx` ON `preparation_checklist_items` (`userId`,`isActive`,`sortOrder`);