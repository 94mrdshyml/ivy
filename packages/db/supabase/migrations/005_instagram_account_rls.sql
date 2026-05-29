ALTER TABLE "InstagramAccount" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_instagram_accounts"
ON "InstagramAccount" FOR SELECT
USING (
  "orgId" IN (SELECT unnest(auth.user_org_ids()))
  AND "deletedAt" IS NULL
);
