CREATE TABLE `cycle_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`flow` enum('spotting','light','medium','heavy'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cycle_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `food_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageKey` varchar(500) NOT NULL,
	`imageUrl` varchar(700) NOT NULL,
	`phase` enum('menstrual','follicular','ovulation','luteal') NOT NULL,
	`analysisJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `food_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`phase` enum('menstrual','follicular','ovulation','luteal') NOT NULL,
	`entryAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredCycleLength` int NOT NULL DEFAULT 28,
	`preferredPeriodLength` int NOT NULL DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `wellness_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryAt` timestamp NOT NULL,
	`mood` enum('great','good','okay','low','difficult'),
	`energy` enum('low','medium','high'),
	`symptoms` text NOT NULL,
	`sleepQuality` enum('poor','fair','good','restful'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wellness_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `wellness_user_day_unique` UNIQUE(`userId`,`entryAt`)
);
--> statement-breakpoint
CREATE INDEX `cycle_user_start_idx` ON `cycle_logs` (`userId`,`startAt`);--> statement-breakpoint
CREATE INDEX `food_user_created_idx` ON `food_entries` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `journal_user_date_idx` ON `journal_entries` (`userId`,`entryAt`);--> statement-breakpoint
CREATE INDEX `wellness_user_date_idx` ON `wellness_entries` (`userId`,`entryAt`);