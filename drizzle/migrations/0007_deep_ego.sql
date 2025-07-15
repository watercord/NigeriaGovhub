ALTER TABLE `newscomment` DROP INDEX `idx_newscomment_user_news`;--> statement-breakpoint
ALTER TABLE `newscomment` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `newslike` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `service` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `video` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `newscomment` ADD CONSTRAINT `newscomment_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newscomment` ADD CONSTRAINT `newscomment_news_article_id_newsarticle_id_fk` FOREIGN KEY (`news_article_id`) REFERENCES `newsarticle`(`id`) ON DELETE cascade ON UPDATE no action;