CREATE TABLE `account` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `account_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_account_provider_providerAccountId` UNIQUE(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `bookmarkednewsarticle` (
	`id` varchar(36) NOT NULL DEFAULT UUID(),
	`user_id` varchar(255) NOT NULL,
	`news_article_id` varchar(36) NOT NULL,
	`createdAt` datetime DEFAULT NOW(),
	CONSTRAINT `bookmarkednewsarticle_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_bookmarkednewsarticle_user_news` UNIQUE(`user_id`,`news_article_id`)
);
--> statement-breakpoint
CREATE TABLE `bookmarkedproject` (
	`id` varchar(36) NOT NULL DEFAULT UUID(),
	`user_id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`createdAt` datetime DEFAULT NOW(),
	CONSTRAINT `bookmarkedproject_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_bookmarkedproject_user_project` UNIQUE(`user_id`,`project_id`)
);
--> statement-breakpoint
CREATE TABLE `Feedback` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`user_name` varchar(255) NOT NULL,
	`comment` text NOT NULL,
	`rating` int,
	`sentiment_summary` varchar(255),
	`created_at` datetime DEFAULT NOW(),
	CONSTRAINT `Feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsarticle` (
	`id` varchar(36) NOT NULL DEFAULT UUID(),
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`imageUrl` varchar(255),
	`dataAiHint` varchar(255),
	`category` varchar(255) NOT NULL,
	`publishedDate` datetime NOT NULL,
	`content` text NOT NULL,
	`createdAt` datetime DEFAULT NOW(),
	`updatedAt` datetime DEFAULT NOW(),
	CONSTRAINT `newsarticle_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsarticle_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `newscomment` (
	`id` varchar(36) NOT NULL DEFAULT UUID(),
	`content` text NOT NULL,
	`news_article_id` varchar(36) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`createdAt` datetime DEFAULT NOW(),
	`updatedAt` datetime DEFAULT NOW(),
	CONSTRAINT `newscomment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newslike` (
	`id` varchar(36) NOT NULL DEFAULT UUID(),
	`user_id` varchar(255) NOT NULL,
	`news_article_id` varchar(36) NOT NULL,
	`createdAt` datetime DEFAULT NOW(),
	CONSTRAINT `newslike_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_newslike_user_news` UNIQUE(`user_id`,`news_article_id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` datetime NOT NULL,
	CONSTRAINT `idx_passwordResetToken_identifier_token` UNIQUE(`identifier`,`token`)
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255) NOT NULL,
	`ministry_id` varchar(255),
	`state_id` varchar(255),
	`status` varchar(255) NOT NULL,
	`start_date` datetime NOT NULL,
	`expected_end_date` datetime,
	`actual_end_date` datetime,
	`description` text NOT NULL,
	`images` text,
	`videos` text,
	`impact_stats` text,
	`budget` decimal(15,2),
	`expenditure` decimal(15,2),
	`created_at` datetime DEFAULT NOW(),
	`last_updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `project_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projecttag` (
	`projectId` varchar(255) NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `idx_projecttag_project_tag` UNIQUE(`projectId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `service` (
	`id` varchar(36) NOT NULL DEFAULT UUID(),
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`iconName` varchar(255),
	`link` varchar(255),
	`category` varchar(255) NOT NULL,
	`imageUrl` varchar(255),
	`dataAiHint` varchar(255),
	`createdAt` datetime DEFAULT NOW(),
	`updatedAt` datetime DEFAULT NOW(),
	CONSTRAINT `service_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`sessionToken` varchar(255),
	`userId` varchar(255) NOT NULL,
	`expires` datetime NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `sitesetting` (
	`id` varchar(255) NOT NULL,
	`siteName` varchar(255) NOT NULL,
	`maintenanceMode` boolean NOT NULL DEFAULT false,
	`contactEmail` varchar(255) NOT NULL,
	`footerMessage` text NOT NULL,
	`updatedAt` datetime DEFAULT NOW(),
	CONSTRAINT `sitesetting_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `tag_id` PRIMARY KEY(`id`),
	CONSTRAINT `tag_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`emailVerified` datetime,
	`image` varchar(255),
	`password` varchar(255),
	`role` varchar(255) DEFAULT 'user',
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` datetime NOT NULL,
	CONSTRAINT `idx_verificationToken_identifier_token` UNIQUE(`identifier`,`token`)
);
--> statement-breakpoint
CREATE TABLE `video` (
	`id` varchar(36) NOT NULL DEFAULT UUID(),
	`title` varchar(255) NOT NULL,
	`url` varchar(255) NOT NULL,
	`thumbnailUrl` varchar(255),
	`dataAiHint` varchar(255),
	`description` text,
	`createdAt` datetime DEFAULT NOW(),
	`updatedAt` datetime DEFAULT NOW(),
	CONSTRAINT `video_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_account_userId` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_feedback_project` ON `Feedback` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_feedback_user` ON `Feedback` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_newsarticle_slug` ON `newsarticle` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_newscomment_user_news` ON `newscomment` (`user_id`,`news_article_id`);--> statement-breakpoint
CREATE INDEX `idx_passwordResetToken_token` ON `passwordResetToken` (`token`);--> statement-breakpoint
CREATE INDEX `idx_project_ministry` ON `project` (`ministry_id`);--> statement-breakpoint
CREATE INDEX `idx_project_state` ON `project` (`state_id`);--> statement-breakpoint
CREATE INDEX `idx_service_slug` ON `service` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_session_sessionToken` ON `session` (`sessionToken`);--> statement-breakpoint
CREATE INDEX `idx_session_userId` ON `session` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_user_email` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_verificationToken_token` ON `verificationToken` (`token`);