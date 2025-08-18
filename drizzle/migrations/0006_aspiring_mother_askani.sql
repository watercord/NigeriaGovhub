DROP INDEX `idx_newsarticle_slug` ON `newsarticle`;--> statement-breakpoint
ALTER TABLE `newsarticle` MODIFY COLUMN `id` varchar(36) NOT NULL;