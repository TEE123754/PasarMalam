-- Demo-only schema. Apply with the Supabase migration runner as the DB owner.
begin;
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;

create table private.environment_guard (
  id uuid primary key default gen_random_uuid(),
  product text not null check (product = 'pasarmalam'),
  mode text not null check (mode = 'disposable-demo'),
  singleton boolean not null default true unique check (singleton)
);
insert into private.environment_guard(product, mode) values ('pasarmalam','disposable-demo');
create table private.demo_identity_map (
  persona text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 80),
  locale text not null default 'en' check (locale in ('en','ms')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check (is_demo),
  source_scenario text not null default 'phase2'
);
create table public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('customer','vendor','admin','partner','organiser')),
  primary key(user_id,role)
);
create table public.markets (
  id uuid primary key default gen_random_uuid(), name text not null,
  area text not null, type text not null check (type in ('night','day')),
  location extensions.geography(point,4326) not null,
  timezone text not null default 'Asia/Kuala_Lumpur' check (timezone='Asia/Kuala_Lumpur'),
  display_hours text not null, display_days text not null,
  status text not null default 'closed' check (status in ('open','upcoming','closed')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check (is_demo),
  source_scenario text not null default 'phase2'
);
create index markets_location_gist on public.markets using gist(location);
create table public.market_schedules (
  id uuid primary key default gen_random_uuid(), market_id uuid not null references public.markets(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), opens_at time not null,
  closes_at time not null, closes_next_day boolean not null default false,
  unique(market_id,weekday,opens_at), is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);
create table public.market_exceptions (
  id uuid primary key default gen_random_uuid(), market_id uuid not null references public.markets(id) on delete cascade,
  on_date date not null, cancelled boolean not null default false, note text,
  opens_at time, closes_at time, unique(market_id,on_date),
  is_demo boolean not null default true check(is_demo), source_scenario text not null default 'phase2'
);
create table public.stalls (
  id uuid primary key default gen_random_uuid(), market_id uuid not null references public.markets(id),
  name text not null, category text not null, specialty text not null,
  price_sen integer not null check(price_sen >= 0),
  halal text not null default 'not-declared' check(halal in ('declared','non-halal','not-declared')),
  open boolean not null default false, published boolean not null default false,
  location extensions.geography(point,4326),
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check (is_demo), source_scenario text not null default 'phase2'
);
create index stalls_location_gist on public.stalls using gist(location);
create table public.stall_memberships (
  stall_id uuid references public.stalls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  membership text not null check(membership in ('owner','staff')), primary key(stall_id,user_id)
);
create unique index stall_one_owner on public.stall_memberships(stall_id) where membership='owner';
create table public.categories(id text primary key, name_en text not null, name_ms text not null);
create table public.food_items (
  id uuid primary key default gen_random_uuid(), stall_id uuid not null references public.stalls(id) on delete cascade,
  category_id text references public.categories(id), name text not null,
  price_sen integer not null check(price_sen >= 0), ingredients text[] not null default '{}',
  published boolean not null default false, next_batch_number integer not null default 1 check(next_batch_number>0),
  created_at timestamptz not null default now(), is_demo boolean not null default true check(is_demo),
  source_scenario text not null default 'phase2'
);
create table public.handling_policies (
  id uuid primary key default gen_random_uuid(), version text not null unique,
  rules jsonb not null default '{}', expert_reviewed boolean not null default false,
  is_demo boolean not null default true check(is_demo), created_at timestamptz not null default now()
);
create table public.batches (
  id uuid primary key default gen_random_uuid(), food_item_id uuid not null references public.food_items(id),
  batch_number integer not null check(batch_number>0), prepared_at timestamptz not null,
  uploaded_at timestamptz not null default now(), original_quantity integer not null check(original_quantity>0),
  remaining_quantity integer not null check(remaining_quantity>=0 and remaining_quantity<=original_quantity),
  handling jsonb not null default '{}', policy_id uuid references public.handling_policies(id),
  advisory_deadline timestamptz, status text not null default 'needs-information'
    check(status in ('needs-information','active','withdrawn','recalled','expired','sold-out')),
  request_id uuid not null, request_hash text not null,
  is_demo boolean not null default true check(is_demo), source_scenario text not null default 'phase2',
  unique(food_item_id,batch_number), unique(food_item_id,request_id),
  check(advisory_deadline is null or advisory_deadline>=prepared_at)
);
create table public.batch_events (
  id uuid primary key default gen_random_uuid(), batch_id uuid not null references public.batches(id),
  actor_id uuid references public.profiles(id), kind text not null, details jsonb not null default '{}',
  request_id uuid not null, created_at timestamptz not null default now(), unique(batch_id,request_id)
);
create table public.promotions (
  id uuid primary key default gen_random_uuid(), batch_id uuid not null references public.batches(id),
  title text not null check(length(title) between 1 and 120), price_sen integer not null check(price_sen>=0),
  quantity_limit integer not null check(quantity_limit>0), starts_at timestamptz not null default now(),
  ends_at timestamptz not null, status text not null default 'active' check(status in ('active','expired','withdrawn')),
  request_id uuid not null, request_hash text not null,
  is_demo boolean not null default true check(is_demo), source_scenario text not null default 'phase2',
  unique(batch_id,request_id), check(ends_at>starts_at)
);
create unique index one_active_offer on public.promotions(batch_id) where status='active';
create table public.reviews (
  id uuid primary key default gen_random_uuid(), stall_id uuid not null references public.stalls(id),
  customer_id uuid not null references public.profiles(id), rating smallint not null check(rating between 1 and 5),
  body text not null check(length(body) between 1 and 1500),
  status text not null default 'pending' check(status in ('pending','published','hidden')),
  created_at timestamptz not null default now(),
  is_demo boolean not null default true check(is_demo), source_scenario text not null default 'phase2',
  unique(stall_id,customer_id)
);
create table public.complaints (
  id uuid primary key default gen_random_uuid(), stall_id uuid not null references public.stalls(id),
  reporter_id uuid not null references public.profiles(id), body text not null check(length(body) between 10 and 2000),
  evidence_keys text[] not null default '{}', status text not null default 'submitted'
    check(status in ('submitted','triaged','dismissed','escalated')),
  created_at timestamptz not null default now(), request_id uuid not null,
  is_demo boolean not null default true check(is_demo), source_scenario text not null default 'phase2',
  unique(reporter_id,request_id)
);
create index complaints_reporter_time on public.complaints(reporter_id,created_at);
create table public.complaint_events (
  id uuid primary key default gen_random_uuid(), complaint_id uuid not null references public.complaints(id),
  actor_id uuid not null references public.profiles(id), status text not null, request_id uuid not null,
  created_at timestamptz not null default now(), unique(complaint_id,request_id)
);
create table public.organisations (
  id uuid primary key default gen_random_uuid(), name text not null,
  kind text not null check(kind in ('media','advertiser','authority','council','delivery','charity','waste','organiser')),
  is_demo boolean not null default true check(is_demo), source_scenario text not null default 'phase2'
);
create table public.organisation_members (
  organisation_id uuid references public.organisations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  membership text not null check(membership in ('manager','member')), primary key(organisation_id,user_id)
);
create table public.organiser_memberships (
  market_id uuid references public.markets(id), user_id uuid references public.profiles(id),
  primary key(market_id,user_id)
);

-- Helpers derive permissions only from protected database assignments.
create function private.has_role(required_role text) returns boolean language sql stable
security definer set search_path='' as $$
  select exists(select 1 from public.user_roles where user_id=(select auth.uid()) and role=required_role)
$$;
create function private.owns_stall(target uuid) returns boolean language sql stable
security definer set search_path='' as $$
  select private.has_role('admin') or (private.has_role('vendor') and exists(
    select 1 from public.stall_memberships where stall_id=target and user_id=(select auth.uid())))
$$;
create function private.member_of(target uuid) returns boolean language sql stable
security definer set search_path='' as $$
  select private.has_role('admin') or exists(select 1 from public.organisation_members
    where organisation_id=target and user_id=(select auth.uid()))
$$;
create function private.organises(target uuid) returns boolean language sql stable
security definer set search_path='' as $$
  select private.has_role('admin') or exists(select 1 from public.organiser_memberships
    where market_id=target and user_id=(select auth.uid()))
$$;
revoke all on all functions in schema private from public;
grant execute on function private.has_role(text), private.owns_stall(uuid),
  private.member_of(uuid), private.organises(uuid) to anon, authenticated;

-- No browser role gets direct protected writes, including administrators.
do $$ declare tab text; begin
  foreach tab in array array['profiles','user_roles','markets','market_schedules','market_exceptions',
    'stalls','stall_memberships','categories','food_items','handling_policies','batches','batch_events',
    'promotions','reviews','complaints','complaint_events','organisations','organisation_members','organiser_memberships']
  loop
    execute format('alter table public.%I enable row level security',tab);
    execute format('revoke all on public.%I from anon, authenticated',tab);
  end loop;
end $$;
grant select on public.profiles, public.user_roles, public.stall_memberships,
  public.organisations, public.organisation_members, public.organiser_memberships,
  public.complaints, public.complaint_events, public.batch_events to authenticated;
create policy profiles_read on public.profiles for select to authenticated
  using(id=auth.uid() or private.has_role('admin'));
create policy roles_read on public.user_roles for select to authenticated
  using(user_id=auth.uid() or private.has_role('admin'));
create policy memberships_read on public.stall_memberships for select to authenticated
  using(user_id=auth.uid() or private.owns_stall(stall_id));
create policy organisations_read on public.organisations for select to authenticated using(private.member_of(id));
create policy org_members_read on public.organisation_members for select to authenticated
  using(user_id=auth.uid() or private.member_of(organisation_id));
create policy organisers_read on public.organiser_memberships for select to authenticated
  using(user_id=auth.uid() or private.has_role('admin'));
create policy complaints_read on public.complaints for select to authenticated
  using(reporter_id=auth.uid() or private.has_role('admin'));
create policy complaint_events_read on public.complaint_events for select to authenticated
  using(exists(select 1 from public.complaints c where c.id=complaint_id));
create policy batch_events_read on public.batch_events for select to authenticated
  using(exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id
    where b.id=batch_id and private.owns_stall(f.stall_id)));

grant select on public.markets, public.market_schedules, public.market_exceptions,
  public.stalls, public.categories, public.handling_policies to anon, authenticated;
grant select(id,stall_id,category_id,name,price_sen,ingredients,published,created_at,is_demo,source_scenario)
  on public.food_items to anon, authenticated;
grant select(id,food_item_id,batch_number,prepared_at,uploaded_at,original_quantity,remaining_quantity,
  advisory_deadline,status,is_demo) on public.batches to anon, authenticated;
grant select(id,batch_id,title,price_sen,quantity_limit,starts_at,ends_at,status,is_demo)
  on public.promotions to anon, authenticated;
grant select(id,stall_id,rating,body,status,created_at,is_demo) on public.reviews to anon, authenticated;
create policy markets_read on public.markets for select to anon, authenticated
  using(published or private.has_role('admin') or private.organises(id));
create policy schedules_read on public.market_schedules for select to anon, authenticated
  using(exists(select 1 from public.markets m where m.id=market_id));
create policy exceptions_read on public.market_exceptions for select to anon, authenticated
  using(exists(select 1 from public.markets m where m.id=market_id));
create policy stalls_read on public.stalls for select to anon, authenticated
  using((published and exists(select 1 from public.markets m where m.id=market_id and m.published)) or private.owns_stall(id));
create policy categories_read on public.categories for select to anon, authenticated using(true);
create policy policies_read on public.handling_policies for select to anon, authenticated using(is_demo);
create policy food_read on public.food_items for select to anon, authenticated
  using((published and exists(select 1 from public.stalls s where s.id=stall_id and s.published)) or private.owns_stall(stall_id));
create policy batches_read on public.batches for select to anon, authenticated using(
  exists(select 1 from public.food_items f join public.stalls s on s.id=f.stall_id
    where f.id=food_item_id and (private.owns_stall(f.stall_id) or
      (f.published and s.published and status='active' and advisory_deadline>now() and remaining_quantity>0)))
);
create policy promotions_read on public.promotions for select to anon, authenticated using(
  exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id
    where b.id=batch_id and (private.owns_stall(f.stall_id) or
      (public.promotions.status='active' and starts_at<=now() and ends_at>now() and b.status='active'
        and b.advisory_deadline>=ends_at and b.remaining_quantity>0)))
);
create policy reviews_read on public.reviews for select to anon, authenticated
  using(status='published' and exists(select 1 from public.stalls s where s.id=stall_id and s.published));

-- Invoker views retain underlying RLS and column privileges. No owner/reporter/evidence fields.
create view public.public_markets with(security_invoker=true) as
 select id,name,area,type,display_hours as hours,display_days as days,status,is_demo
 from public.markets where published;
create view public.public_stalls with(security_invoker=true) as
 select id,market_id,name,category,specialty,price_sen,halal,open,is_demo
 from public.stalls where published;
create view public.public_reviews with(security_invoker=true) as
 select id,stall_id,rating,body,created_at,is_demo from public.reviews where status='published';
create view public.public_batches with(security_invoker=true) as
 select id,food_item_id,batch_number,prepared_at,uploaded_at,remaining_quantity,advisory_deadline,is_demo
 from public.batches where status='active' and advisory_deadline>now() and remaining_quantity>0;
create view public.public_promotions with(security_invoker=true) as
 select p.id,f.stall_id,p.title,p.price_sen,f.price_sen as original_price_sen,p.ends_at,p.is_demo
 from public.promotions p join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id
 where p.status='active' and p.starts_at<=now() and p.ends_at>now() and b.status='active'
   and b.advisory_deadline>=p.ends_at and b.remaining_quantity>0 and f.published;
grant select on public.public_markets, public.public_stalls, public.public_reviews,
  public.public_batches, public.public_promotions to anon, authenticated;

-- Immutable time/identity and non-increasing deadline; later rule engines may only shorten.
create function private.batch_integrity() returns trigger language plpgsql set search_path='' as $$
begin
  if new.food_item_id<>old.food_item_id or new.batch_number<>old.batch_number
     or new.prepared_at<>old.prepared_at or new.uploaded_at<>old.uploaded_at
     or new.original_quantity<>old.original_quantity or new.request_id<>old.request_id then
    raise exception 'Batch identity and preparation history are immutable' using errcode='23514';
  end if;
  if old.advisory_deadline is not null and
    (new.advisory_deadline is null or new.advisory_deadline>old.advisory_deadline) then
    raise exception 'Advisory deadline cannot be extended' using errcode='23514';
  end if;
  return new;
end $$;
create trigger batch_integrity before update on public.batches
  for each row execute function private.batch_integrity();
revoke all on function private.batch_integrity() from public;
commit;
