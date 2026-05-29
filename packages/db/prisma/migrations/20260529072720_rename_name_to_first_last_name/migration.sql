/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'TWITTER', 'YOUTUBE', 'TIKTOK', 'FACEBOOK', 'LINKEDIN', 'GITHUB', 'WEBSITE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "LinkPage" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "accentColor" TEXT DEFAULT '#00D97E',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LinkPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "linkPageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkClick" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "country" TEXT,
    "device" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialProfile" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "linkPageId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SocialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkPage_orgId_key" ON "LinkPage"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkPage_username_key" ON "LinkPage"("username");

-- CreateIndex
CREATE INDEX "LinkPage_orgId_idx" ON "LinkPage"("orgId");

-- CreateIndex
CREATE INDEX "LinkPage_username_idx" ON "LinkPage"("username");

-- CreateIndex
CREATE INDEX "Link_orgId_idx" ON "Link"("orgId");

-- CreateIndex
CREATE INDEX "Link_linkPageId_idx" ON "Link"("linkPageId");

-- CreateIndex
CREATE INDEX "LinkClick_orgId_idx" ON "LinkClick"("orgId");

-- CreateIndex
CREATE INDEX "LinkClick_linkId_idx" ON "LinkClick"("linkId");

-- CreateIndex
CREATE INDEX "LinkClick_createdAt_idx" ON "LinkClick"("createdAt");

-- CreateIndex
CREATE INDEX "SocialProfile_orgId_idx" ON "SocialProfile"("orgId");

-- CreateIndex
CREATE INDEX "SocialProfile_linkPageId_idx" ON "SocialProfile"("linkPageId");

-- AddForeignKey
ALTER TABLE "LinkPage" ADD CONSTRAINT "LinkPage_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_linkPageId_fkey" FOREIGN KEY ("linkPageId") REFERENCES "LinkPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkClick" ADD CONSTRAINT "LinkClick_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProfile" ADD CONSTRAINT "SocialProfile_linkPageId_fkey" FOREIGN KEY ("linkPageId") REFERENCES "LinkPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
