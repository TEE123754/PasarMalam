begin;
drop policy favourites_read on public.favourites;
create policy favourites_read on public.favourites for select to authenticated
  using(owner_id=auth.uid() or private.has_role('admin'));
-- Only a public market identity, monotonic version and UTC update time enter Realtime.
create table public.discovery_versions (
  market_id uuid primary key references public.markets(id) on delete cascade,
  version bigint not null default 1 check(version>0),
  updated_at timestamptz not null default now()
);
alter table public.discovery_versions enable row level security;
revoke all on public.discovery_versions from anon,authenticated;
grant select on public.discovery_versions to anon,authenticated;
create policy discovery_versions_read on public.discovery_versions for select to anon,authenticated
  using(exists(select 1 from public.markets m where m.id=market_id and m.published));
insert into public.discovery_versions(market_id) select id from public.markets;

create function private.market_popularity(p_market uuid) returns bigint
language sql stable security definer set search_path='' as $$
 select count(*) from public.check_ins where market_id=p_market
   and on_date>=(now() at time zone 'Asia/Kuala_Lumpur')::date-29;
$$;
revoke all on function private.market_popularity(uuid) from public;
grant execute on function private.market_popularity(uuid) to anon,authenticated;

create function public.discovery_markets() returns table(
 id uuid,name text,area text,type text,hours text,days text,status text,
 latitude double precision,longitude double precision,schedules jsonb,exceptions jsonb,
 popularity bigint,version bigint)
language sql stable security invoker set search_path='' as $$
 select m.id,m.name,m.area,m.type,m.display_hours,m.display_days,m.status,
 extensions.st_y(m.location::extensions.geometry),extensions.st_x(m.location::extensions.geometry),
 coalesce((select jsonb_agg(jsonb_build_object('weekday',s.weekday,'opens',s.opens_at::text,
   'closes',s.closes_at::text,'nextDay',s.closes_next_day) order by s.weekday,s.opens_at)
   from public.market_schedules s where s.market_id=m.id),'[]'::jsonb),
 coalesce((select jsonb_agg(jsonb_build_object('date',e.on_date::text,'cancelled',e.cancelled,
   'opens',e.opens_at::text,'closes',e.closes_at::text)) from public.market_exceptions e
   where e.market_id=m.id),'[]'::jsonb),private.market_popularity(m.id),coalesce(v.version,0)
 from public.markets m left join public.discovery_versions v on v.market_id=m.id where m.published;
$$;

-- An explicitly public projection; never returns evidence IDs, object paths or owners.
create function public.discovery_claims() returns table(stall_id uuid,food_item_id uuid,
 status text,expires_at timestamptz,reviewed_at timestamptz,evidence boolean)
language sql stable security definer set search_path='' as $$
 select c.stall_id,c.food_item_id,c.status,c.expires_at,c.reviewed_at,
   c.evidence_id is not null and c.reviewed_at is not null
 from public.dietary_claims c join public.stalls s on s.id=c.stall_id
 join public.markets m on m.id=s.market_id
 where s.published and m.published and (c.food_item_id is null or exists(
   select 1 from public.food_items f where f.id=c.food_item_id and f.stall_id=s.id and f.published));
$$;

-- Intended for manual market centres / coarse area cells. Precise GPS stays in the browser.
create function public.nearby_markets(p_lat double precision,p_lon double precision,
 p_radius integer default 50000,p_south double precision default -90,p_west double precision default -180,
 p_north double precision default 90,p_east double precision default 180)
returns table(id uuid,distance_m double precision)
language plpgsql stable security invoker set search_path='' as $$
declare origin extensions.geography;
begin
 if p_lat is null or p_lon is null or p_lat not between -90 and 90 or p_lon not between -180 and 180
   or p_radius not between 1 and 100000 or p_south>p_north or p_west>p_east then
   raise exception 'Invalid map query' using errcode='22023'; end if;
 origin=extensions.st_setsrid(extensions.st_makepoint(p_lon,p_lat),4326)::extensions.geography;
 return query select m.id,extensions.st_distance(m.location,origin) from public.markets m
 where m.published and extensions.st_dwithin(m.location,origin,p_radius)
   and extensions.st_intersects(m.location::extensions.geometry,
     extensions.st_makeenvelope(p_west,p_south,p_east,p_north,4326))
 order by extensions.st_distance(m.location,origin),m.id;
end $$;

create function public.set_favourite(p_stall_id uuid,p_saved boolean) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not private.has_role('customer') or p_saved is null then
   raise exception 'Customer account required' using errcode='42501'; end if;
 if p_saved and not exists(select 1 from public.stalls s join public.markets m on m.id=s.market_id
   where s.id=p_stall_id and s.published and m.published) then
   raise exception 'Stall unavailable' using errcode='22023'; end if;
 if p_saved then insert into public.favourites(owner_id,stall_id) values(auth.uid(),p_stall_id)
   on conflict(owner_id,stall_id) do nothing;
 else delete from public.favourites where owner_id=auth.uid() and stall_id=p_stall_id; end if;
 return p_saved;
end $$;
create function public.check_in(p_market_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare today date=(now() at time zone 'Asia/Kuala_Lumpur')::date;
begin
 if not private.has_role('customer') then raise exception 'Customer account required' using errcode='42501'; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 if not exists(select 1 from public.markets where id=p_market_id and published) then
   raise exception 'Market unavailable' using errcode='22023'; end if;
 if exists(select 1 from public.check_ins where owner_id=auth.uid() and market_id=p_market_id and on_date=today) then return false; end if;
 if (select count(*) from public.check_ins where owner_id=auth.uid() and on_date=today)>=5 then
   raise exception 'Daily check-in limit reached' using errcode='P0001'; end if;
 insert into public.check_ins(owner_id,market_id,on_date) values(auth.uid(),p_market_id,today);
 return true;
end $$;
revoke execute on function public.discovery_markets(),public.discovery_claims(),
 public.nearby_markets(double precision,double precision,integer,double precision,double precision,double precision,double precision),
 public.set_favourite(uuid,boolean),public.check_in(uuid) from public,anon,authenticated;
grant execute on function public.discovery_markets(),public.discovery_claims(),
 public.nearby_markets(double precision,double precision,integer,double precision,double precision,double precision,double precision)
 to anon,authenticated;
grant execute on function public.set_favourite(uuid,boolean),public.check_in(uuid) to authenticated;

create function private.discovery_changed() returns trigger
language plpgsql security definer set search_path='' as $$
declare row_data jsonb; target uuid; previous_market uuid;
begin
 row_data=case when TG_OP='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 if TG_TABLE_NAME='markets' then target=(row_data->>'id')::uuid;
 elsif TG_TABLE_NAME in ('stalls','market_schedules','market_exceptions','check_ins') then target=(row_data->>'market_id')::uuid;
 elsif TG_TABLE_NAME in ('food_items','reviews','dietary_claims') then
   select market_id into target from public.stalls where id=(row_data->>'stall_id')::uuid;
 elsif TG_TABLE_NAME='batches' then
   select s.market_id into target from public.food_items f join public.stalls s on s.id=f.stall_id where f.id=(row_data->>'food_item_id')::uuid;
 elsif TG_TABLE_NAME='promotions' then
   select s.market_id into target from public.batches b join public.food_items f on f.id=b.food_item_id
     join public.stalls s on s.id=f.stall_id where b.id=(row_data->>'batch_id')::uuid;
 end if;
 if target is not null and exists(select 1 from public.markets where id=target) then
   insert into public.discovery_versions(market_id) values(target)
   on conflict(market_id) do update set version=public.discovery_versions.version+1,updated_at=now();
 end if;
 if TG_TABLE_NAME='stalls' and TG_OP='UPDATE' then
   if (to_jsonb(old)->>'market_id') is distinct from (to_jsonb(new)->>'market_id') then
     previous_market=(to_jsonb(old)->>'market_id')::uuid;
     update public.discovery_versions set version=version+1,updated_at=now() where market_id=previous_market;
   end if;
 end if;
 return null;
end $$;
revoke all on function private.discovery_changed() from public,anon,authenticated;
do $$ declare item text; begin
 foreach item in array array['markets','stalls','market_schedules','market_exceptions','food_items','reviews','dietary_claims','batches','promotions','check_ins'] loop
   execute format('create trigger discovery_changed after insert or update or delete on public.%I for each row execute function private.discovery_changed()',item);
 end loop;
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(
   select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='discovery_versions') then
   alter publication supabase_realtime add table public.discovery_versions;
 end if;
end $$;
commit;
