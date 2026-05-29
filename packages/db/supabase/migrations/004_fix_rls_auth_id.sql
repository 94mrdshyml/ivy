-- auth schema is restricted — function lives in public schema instead
-- Returns text[] (not setof text) so = any() works in RLS policy expressions

drop function if exists auth.user_org_ids();
drop function if exists public.user_org_ids();

create function public.user_org_ids()
returns text[] language sql security definer stable as $func$
  select coalesce(array_agg(m."orgId"), '{}')
  from "Membership" m
  join "User" u on u.id = m."userId"
  where u."authId" = auth.uid()::text
    and m."deletedAt" is null
    and u."deletedAt" is null
$func$;

-- LinkPage policies (drop + recreate to switch from auth.user_org_ids → public.user_org_ids)
drop policy if exists "org members can read link pages" on "LinkPage";
drop policy if exists "org members can insert link pages" on "LinkPage";
drop policy if exists "org members can update link pages" on "LinkPage";
drop policy if exists "public can read published link pages" on "LinkPage";

create policy "org members can read link pages"
  on "LinkPage" for select
  using ("orgId" = any(public.user_org_ids()) or ("isPublished" = true and "deletedAt" is null));

create policy "org members can insert link pages"
  on "LinkPage" for insert
  with check ("orgId" = any(public.user_org_ids()));

create policy "org members can update link pages"
  on "LinkPage" for update
  using ("orgId" = any(public.user_org_ids()));

-- Link policies
drop policy if exists "org members can read links" on "Link";
drop policy if exists "org members can insert links" on "Link";
drop policy if exists "org members can update links" on "Link";
drop policy if exists "public can read active links" on "Link";

create policy "org members can read links"
  on "Link" for select
  using ("orgId" = any(public.user_org_ids()) or ("isActive" = true and "deletedAt" is null));

create policy "org members can insert links"
  on "Link" for insert
  with check ("orgId" = any(public.user_org_ids()));

create policy "org members can update links"
  on "Link" for update
  using ("orgId" = any(public.user_org_ids()));

-- LinkClick policies
drop policy if exists "org members can read link clicks" on "LinkClick";
drop policy if exists "public can insert link clicks" on "LinkClick";

create policy "org members can read link clicks"
  on "LinkClick" for select
  using ("orgId" = any(public.user_org_ids()));

create policy "public can insert link clicks"
  on "LinkClick" for insert
  with check (true);

-- SocialProfile policies
drop policy if exists "org members can read social profiles" on "SocialProfile";
drop policy if exists "org members can insert social profiles" on "SocialProfile";
drop policy if exists "org members can update social profiles" on "SocialProfile";
drop policy if exists "public can read social profiles" on "SocialProfile";

create policy "org members can read social profiles"
  on "SocialProfile" for select
  using ("orgId" = any(public.user_org_ids()) or "deletedAt" is null);

create policy "org members can insert social profiles"
  on "SocialProfile" for insert
  with check ("orgId" = any(public.user_org_ids()));

create policy "org members can update social profiles"
  on "SocialProfile" for update
  using ("orgId" = any(public.user_org_ids()));
