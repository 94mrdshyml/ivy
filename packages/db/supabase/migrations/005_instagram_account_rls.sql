-- Drop old policies from 002_instagram_rls.sql (used wrong col name + old function)
DROP POLICY IF EXISTS "instagram_account_select" ON "InstagramAccount";
DROP POLICY IF EXISTS "org_members_can_read_instagram_accounts" ON "InstagramAccount";

-- RLS already enabled in 002, this is idempotent
ALTER TABLE "InstagramAccount" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_instagram_accounts"
ON "InstagramAccount" FOR SELECT
USING (
  "orgId" = any(public.user_org_ids())
  AND "deletedAt" IS NULL
);
