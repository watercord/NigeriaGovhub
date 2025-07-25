ALTER TABLE `newscomment` DROP FOREIGN KEY `newscomment_news_article_id_newsarticle_id_fk`;
--> statement-breakpoint
ALTER TABLE `newscomment` ADD CONSTRAINT `newscomment_news_article_id_fk` FOREIGN KEY (`news_article_id`) REFERENCES `newsarticle`(`id`) ON DELETE cascade ON UPDATE no action;