begin;
do $$ begin if not exists(select 1 from pg_roles where rolname='pasarmalam_agent') then create role pasarmalam_agent nologin nosuperuser nocreatedb nocreaterole noinherit;end if;end $$;
grant usage on schema public,private to pasarmalam_agent;
create function public.agent_environment() returns text language sql stable security definer set search_path='' as $$ select mode from private.environment_guard where product='pasarmalam' $$;
revoke all on function public.agent_environment() from public;
grant execute on function public.agent_environment() to pasarmalam_agent;
create function private.inspect_batch(p_batch uuid) returns void language plpgsql security definer set search_path='' as $$
declare decision jsonb;stall uuid;market uuid;threshold integer;left_seconds numeric;
begin
 decision=private.evaluate_batch(p_batch);select s.id,s.market_id into stall,market from public.batches b join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id where b.id=p_batch;
 left_seconds=extract(epoch from least((decision->>'deadline')::timestamptz,private.market_close(market))-private.clock_now());
 threshold=case when decision->>'deadline' is null then null when left_seconds<=0 then 0 when left_seconds<=900 then 15 when left_seconds<=1800 then 30 else null end;
 update public.alerts set current=false where batch_id=p_batch;
 if threshold is not null and ((decision->>'eligible')::boolean or threshold=0) then
  insert into public.alerts(owner_id,batch_id,threshold_minutes,dedup_key,policy_version) select m.user_id,p_batch,threshold,p_batch::text||':DEMO_ADVISORY_V2:'||threshold||':'||m.user_id::text,'DEMO_ADVISORY_V2' from public.stall_memberships m where m.stall_id=stall on conflict(dedup_key) do update set current=true;
  if threshold=30 and (decision->>'eligible')::boolean then insert into public.clearance_drafts(batch_id) values(p_batch) on conflict(batch_id) do nothing;end if;
 end if;
end $$;
create or replace function private.closing_tick() returns void language plpgsql security definer set search_path='' as $$ declare b record;started timestamptz=clock_timestamp();counted integer=0;begin
 for b in select x.id from public.batches x join public.food_items f on f.id=x.food_item_id where x.inventory_state='available' order by f.id,x.id limit 1000 loop perform private.inspect_batch(b.id);counted=counted+1;end loop;
 update public.promotions set status='expired' where status='active' and ends_at<=private.clock_now();
 insert into private.agent_runs values(gen_random_uuid(),'closing-tick',started,extract(epoch from clock_timestamp()-started)*1000,jsonb_build_object('batches',counted));end $$;
create function public.refresh_discovery_advisories() returns void language plpgsql security definer set search_path='' as $$ declare b record;begin
 for b in select x.id from public.batches x join public.food_items f on f.id=x.food_item_id join public.stalls s on s.id=f.stall_id where s.published and f.published and x.inventory_state='available' order by f.id,x.id limit 1000 loop perform private.evaluate_batch(b.id);end loop;end $$;
grant execute on function public.refresh_discovery_advisories() to anon,authenticated;
create function public.fresh_workspace() returns jsonb language plpgsql security definer set search_path='' as $$
declare b record;workspace jsonb;weather jsonb;state jsonb;
begin
 if not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 for b in select x.id from public.batches x join public.food_items f on f.id=x.food_item_id where private.owns_stall(f.stall_id) order by f.id,x.id loop perform private.inspect_batch(b.id);end loop;
 workspace=public.vendor_workspace();
 select jsonb_build_object('id',w.id,'temperature',w.temperature_c,'humidity',w.humidity_pct,'observed',w.observed_at,'source',w.provider) into weather from public.weather_snapshots w join public.stalls s on s.market_id=w.market_id where private.owns_stall(s.id) order by w.created_at desc limit 1;
 state=jsonb_build_object('declarations','{}'::jsonb,'requests','{}'::jsonb,
 'weather',coalesce(weather,jsonb_build_object('id','missing','temperature',null,'humidity',null,'observed','1970-01-01T00:00:00Z','source','open-meteo')),
 'decisions',coalesce((select jsonb_object_agg(a.batch_id,a.result||jsonb_build_object('remaining',greatest(0,floor(extract(epoch from (a.result->>'deadline')::timestamptz-private.clock_now())/60)))) from public.batch_advisories a join public.batches b on b.id=a.batch_id join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'{}'::jsonb),
 'alerts',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'batch',a.batch_id,'threshold',a.threshold_minutes,'current',a.current,'read',a.read_at is not null,'at',a.created_at)) from public.alerts a where a.owner_id=auth.uid()),'[]'::jsonb),
 'drafts',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'batch',d.batch_id,'state',d.state,'created',d.created_at)) from public.clearance_drafts d join public.batches b on b.id=d.batch_id join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'[]'::jsonb),
 'promotions',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'batch',p.batch_id,'stall',f.stall_id,'title',p.title,'price',p.price_sen,'original',f.price_sen*p.bundle_units,'units',p.quantity_limit,'bundle',p.bundle_units,'ends',p.ends_at,'state',case when p.status='active' and p.ends_at>private.clock_now() then 'active' else 'ended' end,'request',p.request_id)) from public.promotions p join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'[]'::jsonb),
 'outcomes',coalesce((select jsonb_agg(jsonb_build_object('batch',o.batch_id,'units',o.sold_quantity,'grams',o.waste_grams,'at',o.created_at)) from public.inventory_outcomes o where private.owns_stall(o.stall_id)),'[]'::jsonb),'outbox','[]'::jsonb,'audit','[]'::jsonb,'consent',false);
 return jsonb_build_object('server_now',private.clock_now(),'workspace',workspace,'state',state);
end $$;
create function public.weather_context(p_market uuid) returns jsonb language sql stable security definer set search_path='' as $$ select jsonb_build_object('market',m.id,'latitude',extensions.st_y(m.location::extensions.geometry),'longitude',extensions.st_x(m.location::extensions.geometry),'cached',(select to_jsonb(w) from public.weather_snapshots w where market_id=m.id order by created_at desc limit 1)) from public.markets m where m.id=p_market and m.published $$;
create function public.store_market_weather(p_payload text,p_signature text) returns void language plpgsql security definer set search_path='' as $$
declare data jsonb;market uuid;b record;begin
 if not exists(select 1 from private.agent_config where encode(extensions.hmac('weather:'||p_payload,secret,'sha256'),'hex')=p_signature) then raise exception 'Trusted weather signature required' using errcode='42501';end if;
 data=p_payload::jsonb;market=(data->>'market')::uuid;
 if data->>'temperature' is null or data->>'humidity' is null or data->>'observed' is null or data->>'source' is null or (data->>'temperature')::numeric not between -20 and 60 or (data->>'humidity')::numeric not between 0 and 100 or (data->>'observed')::timestamptz>now()+interval '5 minutes' or data->>'source' not in ('fixture','open-meteo') then raise exception 'Invalid weather' using errcode='22023';end if;
 insert into public.weather_snapshots(market_id,temperature_c,humidity_pct,observed_at,provider,synthetic,status,source_scenario) values(market,(data->>'temperature')::numeric,(data->>'humidity')::numeric,(data->>'observed')::timestamptz,data->>'source',data->>'source'='fixture','valid','phase5');
 for b in select x.id from public.batches x join public.food_items f on f.id=x.food_item_id join public.stalls s on s.id=f.stall_id where s.market_id=market and x.inventory_state='available' order by f.id,x.id loop perform private.inspect_batch(b.id);end loop;end $$;
alter table public.notification_outbox add column delivered_at timestamptz;

create function private.effective_deadline(p_batch uuid) returns timestamptz language sql stable security definer set search_path='' as $$
 select least(b.advisory_deadline,case when w.id is null or w.observed_at<private.clock_now()-interval '30 minutes' or w.observed_at>private.clock_now()+interval '5 minutes' or w.temperature_c is null or w.humidity_pct is null or w.temperature_c not between -20 and 60 or w.humidity_pct not between 0 and 100 then coalesce(b.corrected_prepared_at,b.prepared_at)+interval '30 minutes' else b.advisory_deadline end)
 from public.batches b join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id left join lateral(select x.* from public.weather_snapshots x where x.market_id=s.market_id order by x.created_at desc limit 1) w on true
 where b.id=p_batch and b.advisory_deadline is not null and (private.owns_stall(s.id) or (s.published and f.published))
$$;
revoke all on function private.effective_deadline(uuid) from public;
grant execute on function private.effective_deadline(uuid) to anon,authenticated;
create or replace view public.public_batches with(security_invoker=true) as select id,food_item_id,batch_number,prepared_at,uploaded_at,remaining_quantity,private.effective_deadline(id) as advisory_deadline,is_demo,photo,corrected_prepared_at from public.batches where status='active' and inventory_state='available' and private.effective_deadline(id)>private.clock_now() and remaining_quantity>0;
create or replace view public.public_promotions with(security_invoker=true) as select p.id,f.stall_id,p.title,p.price_sen,f.price_sen*p.bundle_units as original_price_sen,p.ends_at,p.is_demo from public.promotions p join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id where p.status='active' and p.starts_at<=private.clock_now() and p.ends_at>private.clock_now() and b.status='active' and b.inventory_state='available' and private.effective_deadline(b.id)-interval '15 minutes'>=p.ends_at and b.remaining_quantity>0 and f.published;
create function private.recipient_matches(p_owner uuid,p_promotion uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.notification_preferences n join public.promotions p on p.id=p_promotion join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id join public.markets m on m.id=s.market_id where n.owner_id=p_owner and n.push_opt_in and n.location_expires_at>private.clock_now() and m.published and n.coarse_cell=round(extensions.st_y(m.location::extensions.geometry)::numeric,2)::text||','||round(extensions.st_x(m.location::extensions.geometry)::numeric,2)::text) $$;
revoke all on function private.recipient_matches(uuid,uuid) from public;
create function private.claim_dispatch() returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.notification_outbox;results jsonb='[]'::jsonb;token uuid;begin
 update public.notification_outbox set status='pending',lease_token=null where status='leased' and lease_until<private.clock_now();
 for q in select * from public.notification_outbox where status='pending' and next_attempt_at<=private.clock_now() order by created_at for update skip locked limit 20 loop
  if not private.recipient_matches(q.owner_id,q.promotion_id) or q.expires_at<=private.clock_now() or not exists(select 1 from public.notification_preferences n where n.owner_id=q.owner_id and n.push_opt_in and n.location_expires_at>private.clock_now()) or not exists(select 1 from public.promotions p join public.batches b on b.id=p.batch_id where p.id=q.promotion_id and p.status='active' and p.ends_at>private.clock_now() and b.status='active' and b.inventory_state='available' and private.effective_deadline(b.id)-interval '15 minutes'>=p.ends_at and b.remaining_quantity>0) then update public.notification_outbox set status='cancelled' where id=q.id;
  elsif q.attempts>=5 then update public.notification_outbox set status='failed' where id=q.id;
  else token=gen_random_uuid();update public.notification_outbox set status='leased',lease_token=token,lease_until=private.clock_now()+interval '30 seconds',attempts=attempts+1 where id=q.id;results=results||jsonb_build_array(jsonb_build_object('id',q.id,'token',token));end if;
 end loop;return results;end $$;
create function private.finish_dispatch(p_id uuid,p_token uuid,p_success boolean) returns text language plpgsql security definer set search_path='' as $$
declare q public.notification_outbox;owner uuid;pref public.notification_preferences;delivered integer;last_at timestamptz;result text;begin
 select owner_id into owner from public.notification_outbox where id=p_id;select * into pref from public.notification_preferences where owner_id=owner for update;select * into q from public.notification_outbox where id=p_id for update;
 if q.status<>'leased' or q.lease_token is distinct from p_token or q.lease_until<=private.clock_now() then return 'stale-lease';end if;
 select count(*),max(delivered_at) into delivered,last_at from public.notification_outbox where owner_id=owner and status='delivered-simulated' and (delivered_at at time zone 'Asia/Kuala_Lumpur')::date=(private.clock_now() at time zone 'Asia/Kuala_Lumpur')::date;
 if not private.recipient_matches(q.owner_id,q.promotion_id) or not coalesce(pref.push_opt_in,false) or pref.location_expires_at<=private.clock_now() or q.expires_at<=private.clock_now() or delivered>=3 or not exists(select 1 from public.promotions p join public.batches b on b.id=p.batch_id where p.id=q.promotion_id and p.status='active' and p.ends_at>private.clock_now() and b.status='active' and b.inventory_state='available' and private.effective_deadline(b.id)-interval '15 minutes'>=p.ends_at and b.remaining_quantity>0) then result='cancelled';
 elsif last_at>private.clock_now()-interval '30 minutes' or not p_success then result='pending';
 else result='delivered-simulated';end if;
 update public.notification_outbox set status=result,lease_token=null,next_attempt_at=greatest(private.clock_now()+least(300,power(2,attempts)::integer*15)*interval '1 second',coalesce(last_at+interval '30 minutes',private.clock_now())),delivered_at=case when result='delivered-simulated' then private.clock_now() else delivered_at end where id=p_id;
 insert into private.agent_runs values(gen_random_uuid(),'fake-dispatch',clock_timestamp(),0,jsonb_build_object('queue',p_id,'result',result,'attempt',q.attempts));return result;end $$;
create function private.weather_due() returns jsonb language sql stable security definer set search_path='' as $$ select coalesce(jsonb_agg(x),'[]'::jsonb) from(select m.id as market,extensions.st_y(m.location::extensions.geometry) as latitude,extensions.st_x(m.location::extensions.geometry) as longitude from public.markets m where m.published and exists(select 1 from public.stalls s join public.food_items f on f.stall_id=s.id join public.batches b on b.food_item_id=f.id where s.market_id=m.id and b.inventory_state='available' and b.status in ('active','needs-information')) and not exists(select 1 from public.weather_snapshots w where w.market_id=m.id and w.created_at>now()-interval '15 minutes') limit 10)x $$;
-- These are the only privileges given to the scoped dispatcher role.
revoke all on function private.inspect_batch(uuid),private.claim_dispatch(),private.finish_dispatch(uuid,uuid,boolean),private.weather_due() from public;
grant execute on function private.claim_dispatch(),private.finish_dispatch(uuid,uuid,boolean),private.weather_due(),private.closing_tick() to pasarmalam_agent;
revoke all on function public.fresh_workspace(),public.weather_context(uuid),public.store_market_weather(text,text) from public;
grant execute on function public.fresh_workspace(),public.weather_context(uuid),public.store_market_weather(text,text) to authenticated;
grant execute on function public.store_market_weather(text,text) to pasarmalam_agent;
create function private.scheduled_agent() returns void language plpgsql security definer set search_path='' as $$
declare cfg private.agent_config;last_at timestamptz;begin
 perform pg_advisory_xact_lock(517005);perform private.closing_tick();select * into cfg from private.agent_config where singleton;select a.last_at into last_at from private.agent_wakes a where id for update;
 if cfg.dispatch_url is not null and to_regnamespace('net') is not null and (last_at is null or last_at<now()-interval '5 minutes') and (exists(select 1 from public.notification_outbox where (status='pending' and next_attempt_at<=private.clock_now()) or (status='leased' and lease_until<=private.clock_now())) or jsonb_array_length(private.weather_due())>0) then
  execute 'select net.http_post(url := $1,headers := $2,body := $3,timeout_milliseconds := 5000)' using cfg.dispatch_url,jsonb_build_object('Content-Type','application/json','X-Agent-Secret',cfg.secret),'{}'::jsonb;update private.agent_wakes set last_at=now() where id;
 end if;end $$;
revoke all on function private.scheduled_agent() from public;
-- Install extensions/schedule separately through the guarded operator; unavailable free accounts
-- still retain effective-time SQL reads/mutations and a manual operator dispatch command.
commit;
