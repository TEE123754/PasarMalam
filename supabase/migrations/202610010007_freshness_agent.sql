-- Synthetic advisory policy and simulated dispatch; never an approved real-food policy.
begin;
create table private.agent_config(singleton boolean primary key default true check(singleton),secret text not null check(length(secret)>=32),dispatch_url text,clock_override timestamptz);
create function private.clock_now() returns timestamptz language sql stable security definer set search_path='' as $$ select greatest(now(),(select clock_override from private.agent_config where singleton)) $$;
revoke all on function private.clock_now() from public;
grant execute on function private.clock_now() to anon,authenticated;
create function public.fresh_clock() returns timestamptz language sql stable set search_path='' as $$ select private.clock_now() $$;
grant execute on function public.fresh_clock() to anon,authenticated;
alter table public.batches add column inventory_state text not null default 'available' check(inventory_state in ('available','sold-out','withdrawn','discarded','merged','recalled'));
update public.batches set inventory_state=case when status in ('sold-out','withdrawn','discarded','merged','recalled') then status else 'available' end;
create function private.inventory_state_sync() returns trigger language plpgsql set search_path='' as $$ begin
 if new.status in ('sold-out','withdrawn','discarded','merged','recalled') then new.inventory_state=new.status;
 elsif old.status='withdrawn' and new.status='active' then new.inventory_state='available'; end if;return new;end $$;
create trigger inventory_state_sync before update on public.batches for each row execute function private.inventory_state_sync();
revoke all on function private.inventory_state_sync() from public;
create table public.batch_advisories(batch_id uuid primary key references public.batches(id),ingredients text[] not null default '{}',confirmed boolean not null default false,result jsonb not null default '{}',weather_id uuid references public.weather_snapshots(id));
alter table public.batch_advisories enable row level security;
revoke all on public.batch_advisories from anon,authenticated;
grant select on public.batch_advisories to authenticated;
create policy advisory_read on public.batch_advisories for select to authenticated using(exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id where b.id=batch_id and private.owns_stall(f.stall_id)));
create table public.clearance_drafts(id uuid primary key default gen_random_uuid(),batch_id uuid not null unique references public.batches(id),state text not null default 'pending',created_at timestamptz not null default now());
alter table public.clearance_drafts enable row level security;
revoke all on public.clearance_drafts from anon,authenticated;
grant select on public.clearance_drafts to authenticated;
create policy drafts_read on public.clearance_drafts for select to authenticated using(exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id where b.id=batch_id and private.owns_stall(f.stall_id)));
alter table public.alerts add column policy_version text not null default 'DEMO_ADVISORY_V2',add column current boolean not null default true;
create unique index advisory_alert_threshold on public.alerts(batch_id,policy_version,threshold_minutes,owner_id);
alter table public.promotions add column bundle_units integer not null default 1 check(bundle_units in (1,2));
alter table public.inventory_outcomes add column request_id uuid unique,add column promotion_id uuid references public.promotions(id);
alter table public.notification_outbox add column promotion_id uuid references public.promotions(id),add column expires_at timestamptz,add column lease_until timestamptz,add column lease_token uuid,add column next_attempt_at timestamptz not null default now();
create table private.agent_runs(id uuid primary key default gen_random_uuid(),kind text not null,started_at timestamptz not null,duration_ms numeric not null,details jsonb not null);
create table private.agent_wakes(id boolean primary key default true check(id),last_at timestamptz);
insert into private.agent_wakes values(true,null);
insert into public.handling_policies(version,rules,expert_reviewed,is_demo) values('DEMO_ADVISORY_V2','{"version":"DEMO_ADVISORY_V2","approval":"synthetic-demo-only","provenance":"Product demonstration table; no scientific validation or real-food approval","base":120,"risk":{"low":120,"medium":90,"high":60,"unknown":30},"temperature":[{"below":30,"cap":120},{"below":35,"cap":90},{"below":100,"cap":60}],"humidity":[{"below":80,"cap":120},{"below":90,"cap":90},{"below":101,"cap":60}],"uncertain":30,"ingredients":{"rice":"medium","nasi":"medium","noodles":"medium","mee":"medium","chicken":"high","ayam":"high","egg":"high","telur":"high","coconut":"high","santan":"high","milk":"high","susu":"high","fish":"high","ikan":"high","meat":"high","daging":"high","pork":"high","flour":"low","tepung":"low","potato":"low","kentang":"low","sugar":"low","gula":"low","peanuts":"medium","kacang":"medium"}}'::jsonb,false,true);

create function private.market_close(p_market uuid) returns timestamptz language sql stable set search_path='' as $$
 with days as(select (private.clock_now() at time zone 'Asia/Kuala_Lumpur')::date+i as day from generate_series(-1,0) i), intervals as(
 select (d.day+coalesce(e.opens_at,s.opens_at)) at time zone 'Asia/Kuala_Lumpur' as opens,
 (d.day+coalesce(e.closes_at,s.closes_at)+case when (e.closes_at is null and s.closes_next_day) or coalesce(e.closes_at,s.closes_at)<=coalesce(e.opens_at,s.opens_at) then interval '1 day' else interval '0' end) at time zone 'Asia/Kuala_Lumpur' as closes
 from days d join public.market_schedules s on s.market_id=p_market and s.weekday=extract(dow from d.day)
 left join public.market_exceptions e on e.market_id=p_market and e.on_date=d.day where not coalesce(e.cancelled,false))
 select coalesce(min(closes) filter(where opens<=private.clock_now() and closes>private.clock_now()),max(closes) filter(where opens<=private.clock_now()),min(closes)) from intervals
$$;
create function private.evaluate_batch(p_batch uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare b public.batches;f public.food_items;s public.stalls;a public.batch_advisories;w public.weather_snapshots;pol public.handling_policies;rules jsonb;caps jsonb;result jsonb;valid boolean;unknown boolean;blocked boolean;risk integer;temp integer;humid integer;cap_minutes integer;deadline timestamptz;eligible boolean;
begin
 select food_item_id into f.id from public.batches where id=p_batch;select * into f from public.food_items where id=f.id for update;
 select * into b from public.batches where id=p_batch for update;if not found then return '{}'::jsonb;end if;
 select * into s from public.stalls where id=f.stall_id;
 select * into a from public.batch_advisories where batch_id=p_batch;
 select * into pol from public.handling_policies where version='DEMO_ADVISORY_V2';rules=pol.rules;
 if pol.id is null or not exists(select 1 from private.environment_guard where mode='disposable-demo') then raise exception 'No applicable approved policy' using errcode='42501';end if;
 select * into w from public.weather_snapshots where market_id=s.market_id order by created_at desc limit 1;
 valid=w.id is not null and w.observed_at>=private.clock_now()-interval '30 minutes' and w.observed_at<=private.clock_now()+interval '5 minutes' and w.temperature_c between -20 and 60 and w.humidity_pct between 0 and 100;
 valid=coalesce(valid,false);
 select coalesce(bool_or(rules->'ingredients'->lower(trim(x)) is null),true),coalesce(min((rules->'risk'->>(rules->'ingredients'->>lower(trim(x))))::integer),30) into unknown,risk from unnest(a.ingredients) x;
 if unknown then risk=30;end if;
 select (v->>'cap')::integer into temp from jsonb_array_elements(rules->'temperature') v where w.temperature_c<(v->>'below')::numeric order by (v->>'below')::numeric limit 1;
 select (v->>'cap')::integer into humid from jsonb_array_elements(rules->'humidity') v where w.humidity_pct<(v->>'below')::numeric order by (v->>'below')::numeric limit 1;
 caps=jsonb_build_object('base',120,'risk',risk,'temperature',case when valid then temp else 30 end,'humidity',case when valid then humid else 30 end,'uncertainty',case when unknown or not valid then 30 else 120 end);
 cap_minutes=least(120,risk,case when valid then temp else 30 end,case when valid then humid else 30 end,case when unknown or not valid then 30 else 120 end);
 blocked=not coalesce(a.confirmed,false) or b.handling->>'storage' is distinct from 'ambient' or coalesce(b.corrected_prepared_at,b.prepared_at)>private.clock_now();
 deadline=b.advisory_deadline;
 if not blocked then deadline=least(b.advisory_deadline,coalesce(b.corrected_prepared_at,b.prepared_at)+cap_minutes*interval '1 minute');end if;
 eligible=not blocked and deadline>private.clock_now() and b.inventory_state='available' and (b.remaining_quantity is null or b.remaining_quantity>0);
 result=jsonb_build_object('weather',jsonb_build_object('id',coalesce(w.id::text,'missing'),'temperature',w.temperature_c,'humidity',w.humidity_pct,'observed',coalesce(w.observed_at,'1970-01-01T00:00:00Z'::timestamptz),'source',coalesce(w.provider,'open-meteo')),'version',pol.version,'deadline',deadline,'caps',caps,'eligible',coalesce(eligible,false),'reasons',to_jsonb(array_remove(array[case when unknown then 'Unknown ingredient: conservative cap' end,case when not valid then 'Missing, invalid or stale weather: conservative cap' end,case when blocked then 'Confirm preparation/ingredients and ambient handling before listing' end],null)));
 update public.batches set advisory_deadline=deadline,policy_id=pol.id,status=case when inventory_state<>'available' then inventory_state when coalesce(eligible,false) then 'active' when deadline<=private.clock_now() then 'expired' else 'needs-information' end where id=p_batch;
 if a.result is distinct from result or a.weather_id is distinct from w.id then
  insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(p_batch,auth.uid(),'advisory-decision',gen_random_uuid(),jsonb_build_object('previous_deadline',b.advisory_deadline,'decision',result,'ingredients',a.ingredients,'weather_id',w.id,'weather_observed',w.observed_at,'weather_provider',w.provider,'approval','synthetic-demo-only'));
 end if;
 insert into public.batch_advisories(batch_id,result,weather_id) values(p_batch,result,w.id) on conflict(batch_id) do update set result=excluded.result,weather_id=excluded.weather_id;
 update public.promotions set status='withdrawn' where batch_id=p_batch and status='active' and (not coalesce(eligible,false) or ends_at>deadline-interval '15 minutes' or ends_at<=private.clock_now());
 return result;
end $$;
create function public.confirm_advisory(p_batch uuid,p_ingredients text[],p_confirmed boolean,p_ambient boolean,p_request uuid) returns void language plpgsql security definer set search_path='' as $$
declare food uuid;stall uuid;
begin
 select f.id,f.stall_id into food,stall from public.batches b join public.food_items f on f.id=b.food_item_id where b.id=p_batch;
 if not private.owns_stall(stall) then raise exception 'Vendor required' using errcode='42501';end if;
 perform 1 from public.profiles where id=auth.uid() for update;perform 1 from public.food_items where id=food for update;perform 1 from public.batches where id=p_batch for update;
 if cardinality(p_ingredients)>40 or exists(select 1 from unnest(p_ingredients) x where length(x) not between 1 and 80) then raise exception 'Invalid ingredients' using errcode='22023';end if;
 if exists(select 1 from public.batch_events where batch_id=p_batch and request_id=p_request) then
  if not exists(select 1 from public.batch_events where batch_id=p_batch and request_id=p_request and kind='declaration-confirmed' and details=jsonb_build_object('ingredients',p_ingredients,'confirmed',p_confirmed,'ambient',p_ambient)) then raise exception 'Retry conflict' using errcode='23505';end if;return;end if;
 insert into public.batch_advisories(batch_id,ingredients,confirmed) values(p_batch,p_ingredients,p_confirmed) on conflict(batch_id) do update set ingredients=excluded.ingredients,confirmed=excluded.confirmed;
 update public.batches set handling=handling||jsonb_build_object('storage',case when p_ambient then 'ambient' else 'unknown' end) where id=p_batch;
 insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(p_batch,auth.uid(),'declaration-confirmed',p_request,jsonb_build_object('ingredients',p_ingredients,'confirmed',p_confirmed,'ambient',p_ambient));
 perform private.evaluate_batch(p_batch);
end $$;
create function private.closing_tick() returns void language plpgsql security definer set search_path='' as $$
declare b record;decision jsonb;threshold integer;left_seconds numeric;started timestamptz=clock_timestamp();counted integer=0;
begin
 for b in select x.id,f.stall_id,s.market_id from public.batches x join public.food_items f on f.id=x.food_item_id join public.stalls s on s.id=f.stall_id where x.inventory_state='available' order by f.id,x.id limit 1000 loop
  decision=private.evaluate_batch(b.id);left_seconds=extract(epoch from least((decision->>'deadline')::timestamptz,private.market_close(b.market_id))-private.clock_now());
  threshold=case when left_seconds<=0 then 0 when left_seconds<=900 then 15 when left_seconds<=1800 then 30 else null end;
  update public.alerts set current=false where batch_id=b.id;
  if threshold is not null and ((decision->>'eligible')::boolean or threshold=0) then
   insert into public.alerts(owner_id,batch_id,threshold_minutes,dedup_key,policy_version) select m.user_id,b.id,threshold,b.id::text||':DEMO_ADVISORY_V2:'||threshold||':'||m.user_id::text,'DEMO_ADVISORY_V2' from public.stall_memberships m where m.stall_id=b.stall_id on conflict(dedup_key) do update set current=true;
   if threshold=30 and (decision->>'eligible')::boolean then insert into public.clearance_drafts(batch_id) values(b.id) on conflict(batch_id) do nothing;end if;
  end if;counted=counted+1;
 end loop;
 update public.promotions set status='expired' where status='active' and ends_at<=private.clock_now();
 insert into private.agent_runs(kind,started_at,duration_ms,details) values('closing-tick',started,extract(epoch from clock_timestamp()-started)*1000,jsonb_build_object('batches',counted));
end $$;
create or replace function private.promotion_batch_guard() returns trigger language plpgsql security definer set search_path='' as $$ declare b public.batches;market uuid;begin
 if new.status='active' then
  select * into b from public.batches where id=new.batch_id;select s.market_id into market from public.food_items f join public.stalls s on s.id=f.stall_id where f.id=b.food_item_id;
  if b.status<>'active' or b.inventory_state<>'available' or b.remaining_quantity is null or b.remaining_quantity<=0 or new.quantity_limit>b.remaining_quantity or b.advisory_deadline is null or new.ends_at>b.advisory_deadline-interval '15 minutes' or new.ends_at<=private.clock_now() or private.market_close(market) is null or new.ends_at>private.market_close(market) or not exists(select 1 from public.batch_advisories a where a.batch_id=b.id and a.confirmed and (a.result->>'eligible')::boolean) then raise exception 'Ineligible clearance cap_minutes' using errcode='22023';end if;
 end if;return new;end $$;
create function public.publish_clearance(p_batch uuid,p_kind text,p_value integer,p_units integer,p_title text,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare b public.batches;f public.food_items;s public.stalls;decision jsonb;end_at timestamptz;price integer;bundle integer;result uuid;previous public.promotions;fingerprint text;
begin
 select food_item_id into f.id from public.batches where id=p_batch;select * into f from public.food_items where id=f.id for update;
 if not private.owns_stall(f.stall_id) then raise exception 'Vendor required' using errcode='42501';end if;
 perform private.evaluate_batch(p_batch);select * into b from public.batches where id=p_batch for update;select * into s from public.stalls where id=f.stall_id;
 fingerprint=encode(extensions.digest(jsonb_build_array(p_kind,p_value,p_units,p_title)::text,'sha256'),'hex');select * into previous from public.promotions where batch_id=p_batch and request_id=p_request;
 if found then if previous.request_hash<>fingerprint then raise exception 'Retry conflict' using errcode='23505';end if;return previous.id;end if;
 if b.status<>'active' or b.inventory_state<>'available' or b.remaining_quantity is null or b.advisory_deadline<=private.clock_now()+interval '15 minutes' then raise exception 'No eligible clearance cap_minutes' using errcode='22023';end if;
 bundle=case when p_kind='bogo' then 2 else 1 end;
 if p_units is null or p_units<bundle or p_units>b.remaining_quantity or p_units%bundle<>0 or p_value is null or p_value<0 then raise exception 'Invalid bundle stock' using errcode='22023';end if;
 price=case p_kind when 'free' then 0 when 'bogo' then f.price_sen when 'fixed' then p_value when 'percentage' then floor(f.price_sen::numeric*(100-p_value)/100)::integer else -1 end;
 if price<0 or price>f.price_sen*bundle then raise exception 'Invalid discount' using errcode='22023';end if;
 end_at=least(b.advisory_deadline-interval '15 minutes',coalesce(private.market_close(s.market_id),private.clock_now()));
 insert into public.promotions(batch_id,title,price_sen,quantity_limit,ends_at,request_id,request_hash,bundle_units) values(p_batch,p_title,price,p_units,end_at,p_request,fingerprint,bundle) returning id into result;
 update public.clearance_drafts set state='confirmed' where batch_id=p_batch;
 insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(p_batch,auth.uid(),'hawker-confirmed-offer',p_request,jsonb_build_object('promotion',result,'kind',p_kind,'units',p_units));
 insert into public.notification_outbox(owner_id,batch_id,channel,dedup_key,promotion_id,expires_at) select n.owner_id,p_batch,'in-app',result::text||':'||n.owner_id::text,result,end_at from public.notification_preferences n where n.push_opt_in and n.location_expires_at>private.clock_now() and n.coarse_cell=round(extensions.st_y((select location from public.markets where id=s.market_id)::extensions.geometry)::numeric,2)::text||','||round(extensions.st_x((select location from public.markets where id=s.market_id)::extensions.geometry)::numeric,2)::text on conflict(dedup_key) do nothing;
 return result;
end $$;
create function public.set_clearance_consent(p_enabled boolean,p_market uuid) returns void language plpgsql security definer set search_path='' as $$ declare cell text;begin
 if not private.has_role('customer') then raise exception 'Customer required' using errcode='42501';end if;
 if p_enabled then select round(extensions.st_y(location::extensions.geometry)::numeric,2)::text||','||round(extensions.st_x(location::extensions.geometry)::numeric,2)::text into cell from public.markets where id=p_market and published;if cell is null then raise exception 'Choose published market' using errcode='22023';end if;end if;
 insert into public.notification_preferences(owner_id,push_opt_in,coarse_cell,location_expires_at) values(auth.uid(),p_enabled,cell,private.clock_now()+interval '2 hours') on conflict(owner_id) do update set push_opt_in=excluded.push_opt_in,coarse_cell=excluded.coarse_cell,location_expires_at=excluded.location_expires_at;
 if not p_enabled then update public.notification_outbox set status='cancelled',lease_token=null where owner_id=auth.uid() and status in ('pending','leased');end if;end $$;
create function public.mark_advisory_read(p_id uuid) returns void language plpgsql security definer set search_path='' as $$ begin update public.alerts set read_at=private.clock_now() where id=p_id and owner_id=auth.uid();end $$;
create function public.record_clearance_outcome(p_batch uuid,p_promotion uuid,p_units integer,p_grams integer,p_request uuid) returns void language plpgsql security definer set search_path='' as $$
declare food uuid;stall uuid;b public.batches;p public.promotions;previous public.inventory_outcomes;begin
 select f.id,f.stall_id into food,stall from public.batches x join public.food_items f on f.id=x.food_item_id where x.id=p_batch;
 if not private.owns_stall(stall) then raise exception 'Vendor required' using errcode='42501';end if;
 perform 1 from public.profiles where id=auth.uid() for update;perform 1 from public.food_items where id=food for update;perform private.evaluate_batch(p_batch);select * into b from public.batches where id=p_batch for update;
 select * into previous from public.inventory_outcomes where request_id=p_request;
 if found then if previous.batch_id<>p_batch or previous.sold_quantity<>p_units or previous.waste_grams<>p_grams or previous.promotion_id is distinct from p_promotion then raise exception 'Retry conflict' using errcode='23505';end if;return;end if;
 if p_units is null or p_grams is null or p_units<0 or p_grams<0 or p_units>100000 or p_grams>10000000 or p_units+p_grams=0 then raise exception 'Invalid report' using errcode='22023';end if;
 if p_units>0 then select * into p from public.promotions where id=p_promotion and batch_id=p_batch for update;
  if not found or p.status<>'active' or p.ends_at<=private.clock_now() or b.status<>'active' or b.remaining_quantity is null or p_units>b.remaining_quantity or p_units>p.quantity_limit or p_units%p.bundle_units<>0 then raise exception 'Ineligible sale or bundle stock' using errcode='22023';end if;
  update public.batches set remaining_quantity=remaining_quantity-p_units,status=case when remaining_quantity=p_units then 'sold-out' else status end where id=p_batch;
  update public.promotions set quantity_limit=greatest(1,quantity_limit-p_units),status=case when quantity_limit=p_units then 'withdrawn' else status end where id=p.id;
 end if;
 if p_grams>0 then update public.batches set status='discarded' where id=p_batch;update public.promotions set status='withdrawn' where batch_id=p_batch and status='active';end if;
 insert into public.inventory_outcomes(stall_id,batch_id,sold_quantity,waste_grams,request_id,promotion_id,status) values(stall,p_batch,p_units,p_grams,p_request,p_promotion,'vendor-reported');
 insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(p_batch,auth.uid(),'vendor-reported-outcome',p_request,jsonb_build_object('units',p_units,'grams',p_grams));end $$;
create function public.advisory_time_override(p_at timestamptz) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.has_role('admin') or not exists(select 1 from private.environment_guard where mode='disposable-demo') or p_at<private.clock_now() then raise exception 'Forward-only disposable admin clock required' using errcode='42501';end if;
 update private.agent_config set clock_override=p_at where singleton;if not found then raise exception 'Agent config missing' using errcode='22023';end if;perform private.closing_tick();end $$;
-- Effective-time reads cannot depend on Cron having run.
create or replace view public.public_batches with(security_invoker=true) as select id,food_item_id,batch_number,prepared_at,uploaded_at,remaining_quantity,advisory_deadline,is_demo,photo,corrected_prepared_at from public.batches where status='active' and inventory_state='available' and advisory_deadline>private.clock_now() and remaining_quantity>0;
create or replace view public.public_promotions with(security_invoker=true) as select p.id,f.stall_id,p.title,p.price_sen,f.price_sen*p.bundle_units as original_price_sen,p.ends_at,p.is_demo from public.promotions p join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id where p.status='active' and p.starts_at<=private.clock_now() and p.ends_at>private.clock_now() and b.status='active' and b.inventory_state='available' and b.advisory_deadline-interval '15 minutes'>=p.ends_at and b.advisory_deadline>private.clock_now() and b.remaining_quantity>0 and f.published;
grant select(inventory_state) on public.batches to anon,authenticated;
grant select(bundle_units) on public.promotions to anon,authenticated;
drop policy batches_read on public.batches;
create policy batches_read on public.batches for select to anon,authenticated using(exists(select 1 from public.food_items f join public.stalls s on s.id=f.stall_id where f.id=food_item_id and (private.owns_stall(f.stall_id) or (f.published and s.published and status='active' and inventory_state='available' and advisory_deadline>private.clock_now() and remaining_quantity>0))));
drop policy promotions_read on public.promotions;
create policy promotions_read on public.promotions for select to anon,authenticated using(exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id where b.id=batch_id and (private.owns_stall(f.stall_id) or (public.promotions.status='active' and starts_at<=private.clock_now() and ends_at>private.clock_now() and b.status='active' and b.inventory_state='available' and b.advisory_deadline-interval '15 minutes'>=ends_at and b.remaining_quantity>0))));
-- Revoke private helpers and protected public mutations explicitly.
revoke all on function private.market_close(uuid),private.evaluate_batch(uuid),private.closing_tick() from public;
do $$ declare fn record;begin for fn in select p.oid::regprocedure as name from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('confirm_advisory','publish_clearance','set_clearance_consent','mark_advisory_read','record_clearance_outcome','advisory_time_override') loop execute format('revoke all on function %s from public',fn.name);execute format('grant execute on function %s to authenticated',fn.name);end loop;end $$;
-- The earlier endpoint cannot bypass confirmation, live-weather reevaluation or queue creation.
create or replace function public.create_promotion(p_batch_id uuid,p_title text,p_price_sen integer,p_quantity integer,p_ends_at timestamptz,p_request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$ begin raise exception 'Use confirmed publish_clearance workflow' using errcode='22023';end $$;
commit;
