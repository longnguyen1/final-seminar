-- CreateTable
CREATE TABLE `MessageLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userMessage` VARCHAR(191) NOT NULL,
    `botReply` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `source` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
