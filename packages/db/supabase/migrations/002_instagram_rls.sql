-- Enable RLS on Instagram tables
alter table "InstagramAccount" enable row level security;
alter table "InstagramMetric"  enable row level security;
alter table "InstagramPost"    enable row level security;

create policy "instagram_account_select" on "InstagramAccount"
  for select using (org_id in (select auth.user_org_ids()));

create policy "instagram_metric_select" on "InstagramMetric"
  for select using (org_id in (select auth.user_org_ids()));

create policy "instagram_post_select" on "InstagramPost"
  for select using (org_id in (select auth.user_org_ids()));
