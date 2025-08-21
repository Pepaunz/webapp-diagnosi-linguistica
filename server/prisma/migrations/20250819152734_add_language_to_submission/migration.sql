/*
  Warnings:

  - Added the required column `language_used` to the `Submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Submissions" ADD COLUMN     "language_used" TEXT NOT NULL;
