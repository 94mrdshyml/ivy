-- RLS policies for Link in Bio tables
-- Follows the same pattern as 001_rls.sql using auth.user_org_ids()

ALTER TABLE "LinkPage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Link" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LinkClick" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialProfile" ENABLE ROW LEVEL SECURITY;

-- LinkPage: members of the org can read their own page
CREATE POLICY "org members can read link pages"
  ON "LinkPage" FOR SELECT
  USING ("orgId" = ANY(auth.user_org_ids()));

CREATE POLICY "org members can insert link pages"
  ON "LinkPage" FOR INSERT
  WITH CHECK ("orgId" = ANY(auth.user_org_ids()));

CREATE POLICY "org members can update link pages"
  ON "LinkPage" FOR UPDATE
  USING ("orgId" = ANY(auth.user_org_ids()));

-- Public read for published pages (by username lookup)
CREATE POLICY "public can read published link pages"
  ON "LinkPage" FOR SELECT
  USING ("isPublished" = true AND "deletedAt" IS NULL);

-- Link
CREATE POLICY "org members can read links"
  ON "Link" FOR SELECT
  USING ("orgId" = ANY(auth.user_org_ids()));

CREATE POLICY "org members can insert links"
  ON "Link" FOR INSERT
  WITH CHECK ("orgId" = ANY(auth.user_org_ids()));

CREATE POLICY "org members can update links"
  ON "Link" FOR UPDATE
  USING ("orgId" = ANY(auth.user_org_ids()));

-- Public read of active links (for public page)
CREATE POLICY "public can read active links"
  ON "Link" FOR SELECT
  USING ("isActive" = true AND "deletedAt" IS NULL);

-- LinkClick: org members can read their click data; anyone can insert
CREATE POLICY "org members can read link clicks"
  ON "LinkClick" FOR SELECT
  USING ("orgId" = ANY(auth.user_org_ids()));

CREATE POLICY "public can insert link clicks"
  ON "LinkClick" FOR INSERT
  WITH CHECK (true);

-- SocialProfile
CREATE POLICY "org members can read social profiles"
  ON "SocialProfile" FOR SELECT
  USING ("orgId" = ANY(auth.user_org_ids()));

CREATE POLICY "org members can insert social profiles"
  ON "SocialProfile" FOR INSERT
  WITH CHECK ("orgId" = ANY(auth.user_org_ids()));

CREATE POLICY "org members can update social profiles"
  ON "SocialProfile" FOR UPDATE
  USING ("orgId" = ANY(auth.user_org_ids()));

-- Public read of social profiles (for public page)
CREATE POLICY "public can read social profiles"
  ON "SocialProfile" FOR SELECT
  USING ("deletedAt" IS NULL);
