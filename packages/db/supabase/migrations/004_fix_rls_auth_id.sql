-- Rebuild auth.user_org_ids() to join through User.auth_id instead of legacy user_id mapping
create or replace function auth.user_org_ids()
returns setof text language sql security definer stable as $$
  select m."orgId"
  from "Membership" m
  join "User" u on u.id = m."userId"
  where u."authId" = auth.uid()::text
    and m."deletedAt" is null
    and u."deletedAt" is null
$$;
