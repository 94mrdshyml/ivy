-- Helper function: returns org IDs the current user belongs to
create or replace function auth.user_org_ids()
returns setof text language sql security definer stable as $$
  select org_id from "Membership"
  where user_id = auth.uid()::text
  and deleted_at is null
$$;

-- Enable RLS on all tables
alter table "User"          enable row level security;
alter table "Organization"  enable row level security;
alter table "Membership"    enable row level security;
alter table "Invitation"    enable row level security;
alter table "SocialAccount" enable row level security;
alter table "AuditLog"      enable row level security;

-- User: can only see themselves
create policy "users_select_own" on "User"
  for select using (id = auth.uid()::text);

-- Organization: members can see their orgs
create policy "org_select_members" on "Organization"
  for select using (id in (select auth.user_org_ids()));

-- Membership: org members can see memberships in their orgs
create policy "membership_select" on "Membership"
  for select using (org_id in (select auth.user_org_ids()));

-- Invitation: org members can see invitations
create policy "invitation_select" on "Invitation"
  for select using (org_id in (select auth.user_org_ids()));

-- SocialAccount: org members only
create policy "social_account_select" on "SocialAccount"
  for select using (org_id in (select auth.user_org_ids()));

-- AuditLog: org members only
create policy "audit_log_select" on "AuditLog"
  for select using (org_id in (select auth.user_org_ids()));
