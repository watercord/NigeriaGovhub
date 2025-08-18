-- DropIndex
DROP INDEX `ProjectTag_tagId_fkey` ON `projecttag`;

-- AlterTable
ALTER TABLE `newscomment` ADD COLUMN `newsarticleId` VARCHAR(191) NULL;
