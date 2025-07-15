CREATE TABLE `ministry` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `ministry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `state` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `state_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP INDEX `idx_newscomment_user_news` ON `newscomment`;--> statement-breakpoint
ALTER TABLE `newscomment` ADD CONSTRAINT `idx_newscomment_user_news` UNIQUE(`user_id`,`news_article_id`);