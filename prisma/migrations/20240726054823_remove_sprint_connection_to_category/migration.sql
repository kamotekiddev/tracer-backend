/*
  Warnings:

  - You are about to drop the column `sprintId` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_sprintId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "sprintId";
