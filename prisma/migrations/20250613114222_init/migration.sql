/*
  Warnings:

  - You are about to drop the column `currentPosition` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `degreeTitle` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `titleYear` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `language` table. All the data in the column will be lost.
  - You are about to drop the column `timeRange` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `authorRole` on the `publication` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `publication` table. All the data in the column will be lost.
  - You are about to drop the `degree` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workexperience` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `language` to the `Language` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author` to the `Publication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place` to the `Publication` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `degree` DROP FOREIGN KEY `Degree_expertId_fkey`;

-- DropForeignKey
ALTER TABLE `language` DROP FOREIGN KEY `Language_expertId_fkey`;

-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `Project_expertId_fkey`;

-- DropForeignKey
ALTER TABLE `publication` DROP FOREIGN KEY `Publication_expertId_fkey`;

-- DropForeignKey
ALTER TABLE `workexperience` DROP FOREIGN KEY `WorkExperience_expertId_fkey`;

-- DropIndex
DROP INDEX `Language_expertId_fkey` ON `language`;

-- DropIndex
DROP INDEX `Project_expertId_fkey` ON `project`;

-- DropIndex
DROP INDEX `Publication_expertId_fkey` ON `publication`;

-- AlterTable
ALTER TABLE `expert` DROP COLUMN `currentPosition`,
    DROP COLUMN `degreeTitle`,
    DROP COLUMN `titleYear`,
    ADD COLUMN `academicTitleYear` INTEGER NULL,
    ADD COLUMN `position` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `language` DROP COLUMN `name`,
    ADD COLUMN `language` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `timeRange`,
    ADD COLUMN `endYear` INTEGER NULL,
    ADD COLUMN `startYear` INTEGER NULL;

-- AlterTable
ALTER TABLE `publication` DROP COLUMN `authorRole`,
    DROP COLUMN `publisher`,
    ADD COLUMN `author` VARCHAR(191) NOT NULL,
    ADD COLUMN `place` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `degree`;

-- DropTable
DROP TABLE `workexperience`;

-- CreateTable
CREATE TABLE `Education` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `school` VARCHAR(191) NOT NULL,
    `major` VARCHAR(191) NOT NULL,
    `expertId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startYear` INTEGER NOT NULL,
    `endYear` INTEGER NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `workplace` VARCHAR(191) NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `expertId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Education` ADD CONSTRAINT `Education_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkHistory` ADD CONSTRAINT `WorkHistory_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Publication` ADD CONSTRAINT `Publication_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Language` ADD CONSTRAINT `Language_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
