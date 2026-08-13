ALTER TABLE `user_profiles` ADD `username` varchar(32);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `username` varchar(32);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `profilePhotoKey` varchar(500);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `profilePhotoUrl` varchar(700);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `profile_username_unique` UNIQUE(`username`);
