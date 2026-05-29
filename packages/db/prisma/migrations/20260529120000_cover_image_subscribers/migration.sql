-- AlterTable: add coverImageUrl to LinkPage
ALTER TABLE "LinkPage" ADD COLUMN "coverImageUrl" TEXT;

-- CreateTable: Subscriber
CREATE TABLE "Subscriber" (
    "id"         TEXT NOT NULL,
    "orgId"      TEXT NOT NULL,
    "linkPageId" TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "firstName"  TEXT,
    "lastName"   TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_linkPageId_email_key" ON "Subscriber"("linkPageId", "email");
CREATE INDEX "Subscriber_orgId_idx" ON "Subscriber"("orgId");
CREATE INDEX "Subscriber_linkPageId_idx" ON "Subscriber"("linkPageId");
CREATE INDEX "Subscriber_createdAt_idx" ON "Subscriber"("createdAt");

-- AddForeignKey
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_linkPageId_fkey"
  FOREIGN KEY ("linkPageId") REFERENCES "LinkPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
