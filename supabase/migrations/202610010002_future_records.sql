-- Generated from scripts/schema_catalog.py; later modules are read-only foundations.

begin;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id), complaint_id uuid references public.complaints(id), batch_id uuid references public.batches(id), bucket text not null check(bucket in ('listing-media','complaint-evidence','certifications')), object_key text not null, generated boolean not null default true, unique(bucket,object_key),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.media_assets enable row level security;
revoke all on public.media_assets from anon, authenticated;
grant select on public.media_assets to authenticated;

create policy media_assets_read on public.media_assets for select to authenticated using (owner_id=auth.uid() or private.has_role('admin'));

create index media_assets_owner_id_idx on public.media_assets(owner_id);

create index media_assets_stall_id_idx on public.media_assets(stall_id);

create index media_assets_batch_id_idx on public.media_assets(batch_id);

create table public.dietary_claims (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, food_item_id uuid references public.food_items(id), status text not null check(status in ('declared','certified','non-halal','not-declared')), evidence_id uuid references public.media_assets(id), expires_at timestamptz, reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.dietary_claims enable row level security;
revoke all on public.dietary_claims from anon, authenticated;
grant select on public.dietary_claims to authenticated;

create policy dietary_claims_read on public.dietary_claims for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index dietary_claims_stall_id_idx on public.dietary_claims(stall_id);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, batch_id uuid references public.batches(id), threshold_minutes integer check(threshold_minutes>=0), read_at timestamptz, dedup_key text not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.alerts enable row level security;
revoke all on public.alerts from anon, authenticated;
grant select on public.alerts to authenticated;

create policy alerts_read on public.alerts for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index alerts_owner_id_idx on public.alerts(owner_id);

create index alerts_batch_id_idx on public.alerts(batch_id);

create table public.favourites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id) not null, unique(owner_id,stall_id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.favourites enable row level security;
revoke all on public.favourites from anon, authenticated;
grant select on public.favourites to authenticated;

create policy favourites_read on public.favourites for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id));

create index favourites_owner_id_idx on public.favourites(owner_id);

create index favourites_stall_id_idx on public.favourites(stall_id);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, market_id uuid not null references public.markets(id), on_date date not null, unique(owner_id,market_id,on_date),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.check_ins enable row level security;
revoke all on public.check_ins from anon, authenticated;
grant select on public.check_ins to authenticated;

create policy check_ins_read on public.check_ins for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index check_ins_owner_id_idx on public.check_ins(owner_id);

create index check_ins_market_id_idx on public.check_ins(market_id);

create table public.review_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, review_id uuid not null references public.reviews(id), reason text not null, unique(owner_id,review_id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.review_reports enable row level security;
revoke all on public.review_reports from anon, authenticated;
grant select on public.review_reports to authenticated;

create policy review_reports_read on public.review_reports for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index review_reports_owner_id_idx on public.review_reports(owner_id);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, stall_id uuid references public.stalls(id), budget_sen integer not null default 0 check(budget_sen>=0), starts_at timestamptz, ends_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.campaigns enable row level security;
revoke all on public.campaigns from anon, authenticated;
grant select on public.campaigns to authenticated;

create policy campaigns_read on public.campaigns for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index campaigns_organisation_id_idx on public.campaigns(organisation_id);

create index campaigns_stall_id_idx on public.campaigns(stall_id);

create table public.ad_creatives (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, campaign_id uuid not null references public.campaigns(id), media_id uuid references public.media_assets(id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.ad_creatives enable row level security;
revoke all on public.ad_creatives from anon, authenticated;
grant select on public.ad_creatives to authenticated;

create policy ad_creatives_read on public.ad_creatives for select to authenticated using (private.has_role('admin') or private.member_of(organisation_id));

create index ad_creatives_organisation_id_idx on public.ad_creatives(organisation_id);

create table public.inventory_outcomes (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, batch_id uuid references public.batches(id), sold_quantity integer not null default 0 check(sold_quantity>=0), waste_grams integer not null default 0 check(waste_grams>=0),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.inventory_outcomes enable row level security;
revoke all on public.inventory_outcomes from anon, authenticated;
grant select on public.inventory_outcomes to authenticated;

create policy inventory_outcomes_read on public.inventory_outcomes for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index inventory_outcomes_stall_id_idx on public.inventory_outcomes(stall_id);

create index inventory_outcomes_batch_id_idx on public.inventory_outcomes(batch_id);

create table public.analytics_daily (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id), stall_id uuid references public.stalls(id), on_date date not null, metrics jsonb not null default '{}',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.analytics_daily enable row level security;
revoke all on public.analytics_daily from anon, authenticated;
grant select on public.analytics_daily to authenticated;

create policy analytics_daily_read on public.analytics_daily for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index analytics_daily_organisation_id_idx on public.analytics_daily(organisation_id);

create index analytics_daily_stall_id_idx on public.analytics_daily(stall_id);

create table public.collaboration_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, stall_id uuid references public.stalls(id) not null, request_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.collaboration_requests enable row level security;
revoke all on public.collaboration_requests from anon, authenticated;
grant select on public.collaboration_requests to authenticated;

create policy collaboration_requests_read on public.collaboration_requests for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index collaboration_requests_organisation_id_idx on public.collaboration_requests(organisation_id);

create index collaboration_requests_stall_id_idx on public.collaboration_requests(stall_id);

create table public.media_features (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, stall_id uuid references public.stalls(id), collaboration_id uuid references public.collaboration_requests(id), title text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.media_features enable row level security;
revoke all on public.media_features from anon, authenticated;
grant select on public.media_features to authenticated;

create policy media_features_read on public.media_features for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index media_features_organisation_id_idx on public.media_features(organisation_id);

create index media_features_stall_id_idx on public.media_features(stall_id);

create table public.food_trails (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, name text not null, feature_id uuid references public.media_features(id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.food_trails enable row level security;
revoke all on public.food_trails from anon, authenticated;
grant select on public.food_trails to authenticated;

create policy food_trails_read on public.food_trails for select to authenticated using (private.has_role('admin') or private.member_of(organisation_id));

create index food_trails_organisation_id_idx on public.food_trails(organisation_id);

create table public.referral_consents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, complaint_id uuid not null references public.complaints(id), organisation_id uuid references public.organisations(id) not null, consented_at timestamptz not null, withdrawn_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.referral_consents enable row level security;
revoke all on public.referral_consents from anon, authenticated;
grant select on public.referral_consents to authenticated;

create policy referral_consents_read on public.referral_consents for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index referral_consents_owner_id_idx on public.referral_consents(owner_id);

create index referral_consents_organisation_id_idx on public.referral_consents(organisation_id);

create table public.authority_cases (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, consent_id uuid not null references public.referral_consents(id), stall_id uuid references public.stalls(id) not null, reference text not null unique check(reference like 'DEMO-%'), redacted_summary text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.authority_cases enable row level security;
revoke all on public.authority_cases from anon, authenticated;
grant select on public.authority_cases to authenticated;

create policy authority_cases_read on public.authority_cases for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index authority_cases_organisation_id_idx on public.authority_cases(organisation_id);

create index authority_cases_stall_id_idx on public.authority_cases(stall_id);

create table public.case_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, case_id uuid not null references public.authority_cases(id), actor_id uuid references public.profiles(id), kind text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.case_events enable row level security;
revoke all on public.case_events from anon, authenticated;
grant select on public.case_events to authenticated;

create policy case_events_read on public.case_events for select to authenticated using (private.has_role('admin') or private.member_of(organisation_id));

create index case_events_organisation_id_idx on public.case_events(organisation_id);

create table public.inspection_visits (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, case_id uuid not null references public.authority_cases(id), scheduled_at timestamptz, redacted_findings text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.inspection_visits enable row level security;
revoke all on public.inspection_visits from anon, authenticated;
grant select on public.inspection_visits to authenticated;

create policy inspection_visits_read on public.inspection_visits for select to authenticated using (private.has_role('admin') or private.member_of(organisation_id));

create index inspection_visits_organisation_id_idx on public.inspection_visits(organisation_id);

create table public.permits (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, stall_id uuid references public.stalls(id) not null, reference text not null unique check(reference like 'DEMO-%'), expires_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.permits enable row level security;
revoke all on public.permits from anon, authenticated;
grant select on public.permits to authenticated;

create policy permits_read on public.permits for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index permits_organisation_id_idx on public.permits(organisation_id);

create index permits_stall_id_idx on public.permits(stall_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id) not null, total_sen integer not null check(total_sen>=0), request_id uuid not null unique, fulfilment text not null default 'pay-at-stall' check(fulfilment in ('pay-at-stall','demo-pickup','demo-delivery')),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;

create policy orders_read on public.orders for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id));

create index orders_owner_id_idx on public.orders(owner_id);

create index orders_stall_id_idx on public.orders(stall_id);

create table public.order_lines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id) not null, order_id uuid not null references public.orders(id), batch_id uuid references public.batches(id) not null, quantity integer not null check(quantity>0), unit_price_sen integer not null check(unit_price_sen>=0),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.order_lines enable row level security;
revoke all on public.order_lines from anon, authenticated;
grant select on public.order_lines to authenticated;

create policy order_lines_read on public.order_lines for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id));

create index order_lines_owner_id_idx on public.order_lines(owner_id);

create index order_lines_stall_id_idx on public.order_lines(stall_id);

create index order_lines_batch_id_idx on public.order_lines(batch_id);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id) not null, order_id uuid references public.orders(id), batch_id uuid references public.batches(id) not null, quantity integer not null check(quantity>0), expires_at timestamptz not null, released_at timestamptz, request_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.reservations enable row level security;
revoke all on public.reservations from anon, authenticated;
grant select on public.reservations to authenticated;

create policy reservations_read on public.reservations for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id));

create index reservations_owner_id_idx on public.reservations(owner_id);

create index reservations_stall_id_idx on public.reservations(stall_id);

create index reservations_batch_id_idx on public.reservations(batch_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, order_id uuid not null references public.orders(id), amount_sen integer not null check(amount_sen>=0), reference text not null unique check(reference like 'DEMO-%'), request_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

create policy payments_read on public.payments for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index payments_owner_id_idx on public.payments(owner_id);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, payment_id uuid not null references public.payments(id), amount_sen integer not null check(amount_sen>0), request_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.refunds enable row level security;
revoke all on public.refunds from anon, authenticated;
grant select on public.refunds to authenticated;

create policy refunds_read on public.refunds for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index refunds_owner_id_idx on public.refunds(owner_id);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id), organisation_id uuid references public.organisations(id), tier text not null default 'basic', expires_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.subscriptions enable row level security;
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

create policy subscriptions_read on public.subscriptions for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.member_of(organisation_id));

create index subscriptions_owner_id_idx on public.subscriptions(owner_id);

create index subscriptions_organisation_id_idx on public.subscriptions(organisation_id);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id), organisation_id uuid references public.organisations(id), subscription_id uuid references public.subscriptions(id), amount_sen integer not null check(amount_sen>=0), reference text not null unique check(reference like 'DEMO-%'),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.invoices enable row level security;
revoke all on public.invoices from anon, authenticated;
grant select on public.invoices to authenticated;

create policy invoices_read on public.invoices for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.member_of(organisation_id));

create index invoices_owner_id_idx on public.invoices(owner_id);

create index invoices_organisation_id_idx on public.invoices(organisation_id);

create table public.ad_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, campaign_id uuid not null references public.campaigns(id), kind text not null check(kind in ('impression','click','no-fill')), event_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.ad_events enable row level security;
revoke all on public.ad_events from anon, authenticated;
grant select on public.ad_events to authenticated;

create policy ad_events_read on public.ad_events for select to authenticated using (private.has_role('admin') or private.member_of(organisation_id));

create index ad_events_organisation_id_idx on public.ad_events(organisation_id);

create table public.campaign_budgets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, campaign_id uuid not null unique references public.campaigns(id), allocated_sen integer not null check(allocated_sen>=0), spent_sen integer not null default 0 check(spent_sen>=0 and spent_sen<=allocated_sen),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.campaign_budgets enable row level security;
revoke all on public.campaign_budgets from anon, authenticated;
grant select on public.campaign_budgets to authenticated;

create policy campaign_budgets_read on public.campaign_budgets for select to authenticated using (private.has_role('admin') or private.member_of(organisation_id));

create index campaign_budgets_organisation_id_idx on public.campaign_budgets(organisation_id);

create table public.delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id) not null, order_id uuid not null references public.orders(id), assigned_user_id uuid references public.profiles(id), eta_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.delivery_jobs enable row level security;
revoke all on public.delivery_jobs from anon, authenticated;
grant select on public.delivery_jobs to authenticated;

create policy delivery_jobs_read on public.delivery_jobs for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index delivery_jobs_owner_id_idx on public.delivery_jobs(owner_id);

create index delivery_jobs_organisation_id_idx on public.delivery_jobs(organisation_id);

create index delivery_jobs_stall_id_idx on public.delivery_jobs(stall_id);

create table public.collection_jobs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, stall_id uuid references public.stalls(id) not null, batch_id uuid references public.batches(id), destination text not null check(destination in ('donation','compost','bsf')), weight_grams integer check(weight_grams>=0),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.collection_jobs enable row level security;
revoke all on public.collection_jobs from anon, authenticated;
grant select on public.collection_jobs to authenticated;

create policy collection_jobs_read on public.collection_jobs for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index collection_jobs_organisation_id_idx on public.collection_jobs(organisation_id);

create index collection_jobs_stall_id_idx on public.collection_jobs(stall_id);

create index collection_jobs_batch_id_idx on public.collection_jobs(batch_id);

create table public.collection_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) not null, stall_id uuid references public.stalls(id) not null, collection_id uuid not null references public.collection_jobs(id), kind text not null, event_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.collection_events enable row level security;
revoke all on public.collection_events from anon, authenticated;
grant select on public.collection_events to authenticated;

create policy collection_events_read on public.collection_events for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or private.member_of(organisation_id));

create index collection_events_organisation_id_idx on public.collection_events(organisation_id);

create index collection_events_stall_id_idx on public.collection_events(stall_id);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null unique, push_opt_in boolean not null default false, sms_opt_in boolean not null default false, email_opt_in boolean not null default false, coarse_cell text, location_expires_at timestamptz, quiet_start time, quiet_end time,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.notification_preferences enable row level security;
revoke all on public.notification_preferences from anon, authenticated;
grant select on public.notification_preferences to authenticated;

create policy notification_preferences_read on public.notification_preferences for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index notification_preferences_owner_id_idx on public.notification_preferences(owner_id);

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, batch_id uuid references public.batches(id), channel text not null check(channel in ('in-app','test-push','simulated-sms','simulated-email')), dedup_key text not null unique, attempts integer not null default 0 check(attempts>=0),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.notification_outbox enable row level security;
revoke all on public.notification_outbox from anon, authenticated;
grant select on public.notification_outbox to authenticated;

create policy notification_outbox_read on public.notification_outbox for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index notification_outbox_owner_id_idx on public.notification_outbox(owner_id);

create index notification_outbox_batch_id_idx on public.notification_outbox(batch_id);

create table public.simulated_deliveries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, outbox_id uuid not null references public.notification_outbox(id), reference text not null unique check(reference like 'DEMO-%'), event_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.simulated_deliveries enable row level security;
revoke all on public.simulated_deliveries from anon, authenticated;
grant select on public.simulated_deliveries to authenticated;

create policy simulated_deliveries_read on public.simulated_deliveries for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index simulated_deliveries_owner_id_idx on public.simulated_deliveries(owner_id);

create table public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, batch_id uuid references public.batches(id), temperature_c numeric, observed_at timestamptz not null, synthetic boolean not null default true check(synthetic),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.sensor_readings enable row level security;
revoke all on public.sensor_readings from anon, authenticated;
grant select on public.sensor_readings to authenticated;

create policy sensor_readings_read on public.sensor_readings for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index sensor_readings_stall_id_idx on public.sensor_readings(stall_id);

create index sensor_readings_batch_id_idx on public.sensor_readings(batch_id);

create table public.weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id), temperature_c numeric, humidity_pct numeric check(humidity_pct between 0 and 100), observed_at timestamptz not null, provider text not null check(provider in ('open-meteo','fixture')), synthetic boolean not null default true,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.weather_snapshots enable row level security;
revoke all on public.weather_snapshots from anon, authenticated;
grant select on public.weather_snapshots to authenticated;

create policy weather_snapshots_read on public.weather_snapshots for select to authenticated using (private.has_role('admin'));

create index weather_snapshots_market_id_idx on public.weather_snapshots(market_id);

create table public.research_scenarios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, name text not null, inputs jsonb not null default '{}', operational boolean not null default false check(not operational),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.research_scenarios enable row level security;
revoke all on public.research_scenarios from anon, authenticated;
grant select on public.research_scenarios to authenticated;

create policy research_scenarios_read on public.research_scenarios for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index research_scenarios_owner_id_idx on public.research_scenarios(owner_id);

create table public.ai_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id), draft jsonb not null default '{}', scripted boolean not null default true,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.ai_drafts enable row level security;
revoke all on public.ai_drafts from anon, authenticated;
grant select on public.ai_drafts to authenticated;

create policy ai_drafts_read on public.ai_drafts for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id));

create index ai_drafts_owner_id_idx on public.ai_drafts(owner_id);

create index ai_drafts_stall_id_idx on public.ai_drafts(stall_id);

create table public.demo_scenarios (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, outcome text not null check(outcome in ('success','pending','rejected','timeout')),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.demo_scenarios enable row level security;
revoke all on public.demo_scenarios from anon, authenticated;
grant select on public.demo_scenarios to authenticated;

create policy demo_scenarios_read on public.demo_scenarios for select to authenticated using (true);

create table public.integration_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id), owner_id uuid references public.profiles(id), provider_key text not null check(provider_key in ('media','authority','payments','ads','delivery','collection','sms','email','sensors')), event_id uuid not null unique, reference text not null check(reference like 'DEMO-%'), outcome text not null check(outcome in ('success','pending','rejected','timeout')),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.integration_events enable row level security;
revoke all on public.integration_events from anon, authenticated;
grant select on public.integration_events to authenticated;

create policy integration_events_read on public.integration_events for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.member_of(organisation_id));

create index integration_events_owner_id_idx on public.integration_events(owner_id);

create index integration_events_organisation_id_idx on public.integration_events(organisation_id);

create table public.asset_manifest (
  id uuid primary key default gen_random_uuid(),
  prompt_id text not null unique, filename text not null unique, alt_text text not null, generation_method text not null, license text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.asset_manifest enable row level security;
revoke all on public.asset_manifest from anon, authenticated;
grant select on public.asset_manifest to authenticated;

create policy asset_manifest_read on public.asset_manifest for select to authenticated using (true);

create table public.extraction_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id), transcript text not null, extracted jsonb not null default '{}', confirmed_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.extraction_runs enable row level security;
revoke all on public.extraction_runs from anon, authenticated;
grant select on public.extraction_runs to authenticated;

create policy extraction_runs_read on public.extraction_runs for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id));

create index extraction_runs_owner_id_idx on public.extraction_runs(owner_id);

create index extraction_runs_stall_id_idx on public.extraction_runs(stall_id);

create table public.field_confidences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, extraction_id uuid not null references public.extraction_runs(id), field text not null, score numeric not null check(score between 0 and 1), unique(extraction_id,field),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.field_confidences enable row level security;
revoke all on public.field_confidences from anon, authenticated;
grant select on public.field_confidences to authenticated;

create policy field_confidences_read on public.field_confidences for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index field_confidences_owner_id_idx on public.field_confidences(owner_id);

create table public.rule_decisions (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, batch_id uuid references public.batches(id) not null, policy_id uuid not null references public.handling_policies(id), weather_id uuid references public.weather_snapshots(id), deadline timestamptz, reason_codes text[] not null default '{}',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.rule_decisions enable row level security;
revoke all on public.rule_decisions from anon, authenticated;
grant select on public.rule_decisions to authenticated;

create policy rule_decisions_read on public.rule_decisions for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index rule_decisions_stall_id_idx on public.rule_decisions(stall_id);

create index rule_decisions_batch_id_idx on public.rule_decisions(batch_id);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, batch_id uuid references public.batches(id), dedup_key text not null unique, outcome text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.agent_runs enable row level security;
revoke all on public.agent_runs from anon, authenticated;
grant select on public.agent_runs to authenticated;

create policy agent_runs_read on public.agent_runs for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index agent_runs_stall_id_idx on public.agent_runs(stall_id);

create index agent_runs_batch_id_idx on public.agent_runs(batch_id);

create table public.clearance_drafts (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, batch_id uuid references public.batches(id) not null, agent_run_id uuid references public.agent_runs(id), price_sen integer not null check(price_sen>=0), confirmed_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.clearance_drafts enable row level security;
revoke all on public.clearance_drafts from anon, authenticated;
grant select on public.clearance_drafts to authenticated;

create policy clearance_drafts_read on public.clearance_drafts for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index clearance_drafts_stall_id_idx on public.clearance_drafts(stall_id);

create index clearance_drafts_batch_id_idx on public.clearance_drafts(batch_id);

create table public.report_replies (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, complaint_id uuid not null references public.complaints(id), author_id uuid references public.profiles(id) not null, body text not null, unique(complaint_id,author_id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.report_replies enable row level security;
revoke all on public.report_replies from anon, authenticated;
grant select on public.report_replies to authenticated;

create policy report_replies_read on public.report_replies for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id) or author_id=auth.uid());

create index report_replies_stall_id_idx on public.report_replies(stall_id);

create table public.public_report_flags (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null unique, independent_count integer not null check(independent_count>=3), approved_by uuid references public.profiles(id) not null, published boolean not null default false, reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.public_report_flags enable row level security;
revoke all on public.public_report_flags from anon, authenticated;
grant select on public.public_report_flags to authenticated;

create policy public_report_flags_read on public.public_report_flags for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

revoke select on public.public_report_flags from authenticated;
grant select(id,stall_id,independent_count,published,reason,is_demo) on public.public_report_flags to anon, authenticated;
create policy flags_public on public.public_report_flags for select to anon, authenticated using(published and independent_count>=3);

create index public_report_flags_stall_id_idx on public.public_report_flags(stall_id);

create table public.commission_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, stall_id uuid references public.stalls(id) not null, order_id uuid not null references public.orders(id), amount_sen integer not null check(amount_sen>=0), entry_kind text not null check(entry_kind in ('earned','reversed')), event_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.commission_entries enable row level security;
revoke all on public.commission_entries from anon, authenticated;
grant select on public.commission_entries to authenticated;

create policy commission_entries_read on public.commission_entries for select to authenticated using (private.has_role('admin') or owner_id=auth.uid() or private.owns_stall(stall_id));

create index commission_entries_owner_id_idx on public.commission_entries(owner_id);

create index commission_entries_stall_id_idx on public.commission_entries(stall_id);

create table public.forecast_runs (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, on_date date not null, recommendations jsonb not null default '{}', synthetic boolean not null default true,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.forecast_runs enable row level security;
revoke all on public.forecast_runs from anon, authenticated;
grant select on public.forecast_runs to authenticated;

create policy forecast_runs_read on public.forecast_runs for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index forecast_runs_stall_id_idx on public.forecast_runs(stall_id);

create table public.pilot_sessions (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id), on_date date not null, synthetic boolean not null default true, unique(market_id,on_date,synthetic),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.pilot_sessions enable row level security;
revoke all on public.pilot_sessions from anon, authenticated;
grant select on public.pilot_sessions to authenticated;

create policy pilot_sessions_read on public.pilot_sessions for select to authenticated using (private.has_role('admin'));

create index pilot_sessions_market_id_idx on public.pilot_sessions(market_id);

create table public.pilot_measurements (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid references public.stalls(id) not null, session_id uuid not null references public.pilot_sessions(id), batch_id uuid references public.batches(id), diverted_grams integer not null check(diverted_grams>=0), saved_sen integer not null check(saved_sen>=0), synthetic boolean not null default true, event_id uuid not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.pilot_measurements enable row level security;
revoke all on public.pilot_measurements from anon, authenticated;
grant select on public.pilot_measurements to authenticated;

create policy pilot_measurements_read on public.pilot_measurements for select to authenticated using (private.has_role('admin') or private.owns_stall(stall_id));

create index pilot_measurements_stall_id_idx on public.pilot_measurements(stall_id);

create index pilot_measurements_batch_id_idx on public.pilot_measurements(batch_id);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null, endpoint text not null unique, p256dh text not null, auth_key text not null, consented_at timestamptz not null, revoked_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select on public.push_subscriptions to authenticated;

create policy push_subscriptions_read on public.push_subscriptions for select to authenticated using (private.has_role('admin') or owner_id=auth.uid());

create index push_subscriptions_owner_id_idx on public.push_subscriptions(owner_id);

commit;
