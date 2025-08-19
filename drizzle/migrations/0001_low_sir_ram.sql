-- DROPPED: original migration attempted to drop `newscomment_news_article_id_newsarticle_id_fk`.
-- Dropping constraints conditionally requires stored procedure context; to avoid
-- SQL dialect issues during automated migrations we leave the DROP out. If you
-- need to force-remove the old constraint, run the following manually on the DB:
--    ALTER TABLE `newscomment` DROP FOREIGN KEY `newscomment_news_article_id_newsarticle_id_fk`;
-- Then re-run migrations.

-- ALTER TABLE `newscomment` ADD CONSTRAINT `newscomment_news_article_id_fk` FOREIGN KEY (`news_article_id`) REFERENCES `newsarticle`(`id`) ON DELETE cascade ON UPDATE no action;