/*
  Warnings:

  - You are about to drop the column `academic_title` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `academic_title_year` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `birth_year` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `current_job` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `current_position` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `degree` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `degree_year` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `expert` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `language` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `project_name` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `author_role` on the `publication` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `workexperience` table. All the data in the column will be lost.
  - You are about to drop the column `work_place` on the `workexperience` table. All the data in the column will be lost.
  - You are about to drop the `education` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fullName` to the `Expert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Language` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeRange` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorRole` to the `Publication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution` to the `WorkExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeRange` to the `WorkExperience` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `education` DROP FOREIGN KEY `Education_expertId_fkey`;

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

-- DropIndex
DROP INDEX `WorkExperience_expertId_fkey` ON `workexperience`;

-- AlterTable
ALTER TABLE `expert` DROP COLUMN `academic_title`,
    DROP COLUMN `academic_title_year`,
    DROP COLUMN `birth_year`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `current_job`,
    DROP COLUMN `current_position`,
    DROP COLUMN `degree`,
    DROP COLUMN `degree_year`,
    DROP COLUMN `full_name`,
    DROP COLUMN `isDeleted`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `academicTitle` VARCHAR(191) NULL,
    ADD COLUMN `birthYear` INTEGER NULL,
    ADD COLUMN `currentPosition` VARCHAR(191) NULL,
    ADD COLUMN `currentWork` VARCHAR(191) NULL,
    ADD COLUMN `degreeTitle` VARCHAR(191) NULL,
    ADD COLUMN `degreeYear` INTEGER NULL,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL,
    ADD COLUMN `titleYear` INTEGER NULL;

-- AlterTable
ALTER TABLE `language` DROP COLUMN `language`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `period`,
    DROP COLUMN `project_name`,
    ADD COLUMN `timeRange` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NULL,
    MODIFY `role` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `publication` DROP COLUMN `author_role`,
    ADD COLUMN `authorRole` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `workexperience` DROP COLUMN `period`,
    DROP COLUMN `work_place`,
    ADD COLUMN `institution` VARCHAR(191) NOT NULL,
    ADD COLUMN `timeRange` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `education`;

-- CreateTable
CREATE TABLE `Degree` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `expertId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `major` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Degree` ADD CONSTRAINT `Degree_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkExperience` ADD CONSTRAINT `WorkExperience_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Publication` ADD CONSTRAINT `Publication_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Language` ADD CONSTRAINT `Language_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `Expert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
