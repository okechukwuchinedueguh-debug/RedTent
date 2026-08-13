CREATE TABLE `ask_conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ask_conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ask_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`includeWellness` int NOT NULL DEFAULT 1,
	`includeFood` int NOT NULL DEFAULT 1,
	`includeJournal` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ask_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ask_message_user_conversation_idx` ON `ask_conversation_messages` (`userId`,`conversationId`);--> statement-breakpoint
CREATE INDEX `ask_message_conversation_created_idx` ON `ask_conversation_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ask_conversation_user_updated_idx` ON `ask_conversations` (`userId`,`updatedAt`);