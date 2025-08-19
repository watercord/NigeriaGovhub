CREATE TABLE IF NOT EXISTS `opportunity` (
		`id` varchar(36) NOT NULL,
		`slug` varchar(255) NOT NULL,
		`title` varchar(255) NOT NULL,
		`summary` text NOT NULL,
		`category` varchar(255) NOT NULL,
		`imageUrl` varchar(255),
		`dataAiHint` varchar(255),
		`publishedDate` datetime NOT NULL,
		`content` text NOT NULL,
		`createdAt` datetime DEFAULT NOW(),
		`updatedAt` datetime DEFAULT NOW(),
		CONSTRAINT `opportunity_id` PRIMARY KEY(`id`),
		CONSTRAINT `opportunity_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
-- NOTE: Migration originally attempted to drop `newscomment_news_article_id_newsarticle_id_fk`.
-- Conditional DROP logic was removed to avoid SQL dialect/runtime errors. Run the
-- DROP manually on the DB if necessary, then re-run migrations.

ALTER TABLE `bookmarkednewsarticle` MODIFY COLUMN `user_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `bookmarkednewsarticle` MODIFY COLUMN `news_article_id` varchar(36) NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_opportunity_slug` ON `opportunity` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_opportunity_category` ON `opportunity` (`category`);--> statement-breakpoint
-- ALTER TABLE `newscomment` ADD CONSTRAINT `newscomment_news_article_id_fk` FOREIGN KEY (`news_article_id`) REFERENCES `newsarticle`(`id`) ON DELETE cascade ON UPDATE no action;