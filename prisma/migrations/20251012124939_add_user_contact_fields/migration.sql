/*
  Warnings:

  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '0000000000',
    ADD COLUMN `shopLink` VARCHAR(191) NULL,
    ADD COLUMN `whatsappNumber` VARCHAR(191) NULL;
