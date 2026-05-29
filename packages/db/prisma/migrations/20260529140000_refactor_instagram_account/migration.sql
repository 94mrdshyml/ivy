-- Refactor InstagramAccount: remove SocialAccount FK, rename fields, add encryption column

-- Drop FK to SocialAccount
ALTER TABLE "InstagramAccount" DROP CONSTRAINT IF EXISTS "InstagramAccount_socialAccountId_fkey";

-- Drop unique index on socialAccountId
DROP INDEX IF EXISTS "InstagramAccount_socialAccountId_key";

-- Drop global unique on igUserId (replaced by [orgId, igUserId])
DROP INDEX IF EXISTS "InstagramAccount_igUserId_key";

-- Rename columns
ALTER TABLE "InstagramAccount" RENAME COLUMN "accessToken" TO "accessTokenEnc";
ALTER TABLE "InstagramAccount" RENAME COLUMN "handle" TO "igUsername";
ALTER TABLE "InstagramAccount" RENAME COLUMN "name" TO "igName";
ALTER TABLE "InstagramAccount" RENAME COLUMN "profilePicUrl" TO "igProfilePicUrl";
ALTER TABLE "InstagramAccount" RENAME COLUMN "followersCount" TO "igFollowersCount";
ALTER TABLE "InstagramAccount" RENAME COLUMN "lastSyncedAt" TO "lastSyncAt";

-- Add new columns
ALTER TABLE "InstagramAccount" ADD COLUMN "igAccountType" TEXT;
ALTER TABLE "InstagramAccount" ADD COLUMN "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- tokenExpiresAt: nullable → non-null (set default for any existing nulls)
UPDATE "InstagramAccount" SET "tokenExpiresAt" = NOW() + INTERVAL '60 days' WHERE "tokenExpiresAt" IS NULL;
ALTER TABLE "InstagramAccount" ALTER COLUMN "tokenExpiresAt" SET NOT NULL;

-- igFollowersCount: Int DEFAULT 0 NOT NULL → Int? nullable
ALTER TABLE "InstagramAccount" ALTER COLUMN "igFollowersCount" DROP NOT NULL;
ALTER TABLE "InstagramAccount" ALTER COLUMN "igFollowersCount" DROP DEFAULT;

-- Drop socialAccountId column
ALTER TABLE "InstagramAccount" DROP COLUMN IF EXISTS "socialAccountId";

-- Drop updatedAt column
ALTER TABLE "InstagramAccount" DROP COLUMN IF EXISTS "updatedAt";

-- Add unique constraint [orgId, igUserId]
ALTER TABLE "InstagramAccount" ADD CONSTRAINT "InstagramAccount_orgId_igUserId_key" UNIQUE ("orgId", "igUserId");
