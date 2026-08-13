ALTER TABLE `food_entries` ADD `lensMode` enum('before','after') DEFAULT 'after' NOT NULL;--> statement-breakpoint
ALTER TABLE `food_entries` ADD `userNotes` text;--> statement-breakpoint
ALTER TABLE `food_entries` ADD `lensMode` enum('before','after') NOT NULL DEFAULT 'after';--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `foodCulture` varchar(120) DEFAULT 'Nigerian and global foods' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `dietaryPreferences` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `dietaryRestrictions` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `wellnessGoals` text;
