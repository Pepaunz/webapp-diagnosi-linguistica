/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Templates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Templates_name_key" ON "public"."Templates"("name");
