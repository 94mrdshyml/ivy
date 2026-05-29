-- AlterTable: add theme column to LinkPage (defaults to dark)
ALTER TABLE "LinkPage" ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'dark';
