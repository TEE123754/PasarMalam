begin;
-- Subscription credentials are never directly readable, including by admin browser roles.
revoke all on public.push_subscriptions from anon,authenticated;
create table private.test_push_subscriptions(
 owner_id uuid primary key references public.profiles(id),endpoint text unique not null,
 p256dh text not null,auth_key text not null,consented_at timestamptz not null default now()
);
alter table private.test_push_subscriptions enable row level security;
revoke all on private.test_push_subscriptions from public,anon,authenticated,pasarmalam_agent;
create table private.test_push_attempts(id uuid primary key default gen_random_uuid(),outbox_id uuid not null references public.notification_outbox(id),at timestamptz not null default now(),outcome text not null);
alter table private.test_push_attempts enable row level security;
revoke all on private.test_push_attempts from public,anon,authenticated,pasarmalam_agent;
create function public.push_enrol(p_endpoint text,p_key text,p_auth text) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 if public.agent_environment()<>'disposable-demo' then raise exception 'Disposable environment required';end if;
 if p_endpoint!~'^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com)/[^[:space:]]+$' or length(p_endpoint)>2000 or p_key!~'^[A-Za-z0-9_-]{80,100}={0,2}$' or p_auth!~'^[A-Za-z0-9_-]{20,30}={0,2}$' then raise exception 'Invalid subscription' using errcode='22023';end if;
 insert into private.test_push_subscriptions(owner_id,endpoint,p256dh,auth_key) values(auth.uid(),p_endpoint,p_key,p_auth) on conflict(owner_id) do update set endpoint=excluded.endpoint,p256dh=excluded.p256dh,auth_key=excluded.auth_key,consented_at=now();
 return jsonb_build_object('enrolled',true,'device_limit',1);
end $$;
create function public.push_revoke() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 delete from private.test_push_subscriptions where owner_id=auth.uid();
 update public.notification_preferences set push_opt_in=false where owner_id=auth.uid();
 update public.notification_outbox set status='cancelled',lease_token=null where owner_id=auth.uid() and status in ('pending','leased');
 return jsonb_build_object('revoked',true);
end $$;
create function private.push_payload(p_id uuid,p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.notification_outbox;p public.notification_preferences;s private.test_push_subscriptions;local_time time;
begin
 select * into p from public.notification_preferences where owner_id=(select owner_id from public.notification_outbox where id=p_id) for update; select * into q from public.notification_outbox where id=p_id for update;
 if q.status<>'leased' or q.lease_token is distinct from p_token or q.lease_until<=private.clock_now() or q.expires_at<=private.clock_now()+interval '6 seconds' or not private.recipient_matches(q.owner_id,q.promotion_id) then return null;end if;
 select * into p from public.notification_preferences where owner_id=q.owner_id;
 local_time=(private.clock_now() at time zone 'Asia/Kuala_Lumpur')::time;
 if p.quiet_start is not null and p.quiet_end is not null and p.quiet_start<>p.quiet_end and ((p.quiet_start<p.quiet_end and local_time>=p.quiet_start and local_time<p.quiet_end) or (p.quiet_start>p.quiet_end and (local_time>=p.quiet_start or local_time<p.quiet_end))) then return null;end if;
 if (select count(*) from public.notification_outbox where owner_id=q.owner_id and status in ('provider-accepted','delivered-simulated') and (delivered_at at time zone 'Asia/Kuala_Lumpur')::date=(private.clock_now() at time zone 'Asia/Kuala_Lumpur')::date)>=3 or exists(select 1 from public.notification_outbox where owner_id=q.owner_id and status in ('provider-accepted','delivered-simulated') and delivered_at>private.clock_now()-interval '30 minutes') then return null;end if;
 if not exists(select 1 from public.promotions x join public.batches b on b.id=x.batch_id where x.id=q.promotion_id and x.status='active' and x.ends_at>private.clock_now() and b.status='active' and b.inventory_state='available' and b.remaining_quantity>0 and private.effective_deadline(b.id)-interval '15 minutes'>=x.ends_at) then return null;end if;
 select * into s from private.test_push_subscriptions where owner_id=q.owner_id;
 if s.owner_id is null then return null;end if;
 return jsonb_build_object('subscription',jsonb_build_object('endpoint',s.endpoint,'keys',jsonb_build_object('p256dh',s.p256dh,'auth',s.auth_key)),'ttl',greatest(0,floor(extract(epoch from q.expires_at-private.clock_now()))),'message',jsonb_build_object('tag','DEMO-'||q.id::text,'expires',floor(extract(epoch from q.expires_at)*1000)));
end $$;
create function private.push_finish(p_id uuid,p_token uuid,p_outcome text,p_endpoint text) returns text language plpgsql security definer set search_path='' as $$
declare q public.notification_outbox;result text;
begin
 select * into q from public.notification_outbox where id=p_id for update;
 if q.id is null then return 'missing';end if;
 if p_outcome not in ('accepted','invalid','failed','disabled','suppressed') then raise exception 'Invalid outcome';end if;
 -- Log the actual attempt even if opt-out invalidated the lease during network transit.
 insert into private.test_push_attempts(outbox_id,outcome) values(p_id,p_outcome);
 if q.status<>'leased' or q.lease_token is distinct from p_token or q.lease_until<=private.clock_now() then return 'stale-lease';end if;
 if p_outcome='invalid' then delete from private.test_push_subscriptions where owner_id=q.owner_id and endpoint=p_endpoint;end if;
 result=case when p_outcome='accepted' then 'provider-accepted' when p_outcome in ('invalid','suppressed') then 'cancelled' when q.attempts>=5 then 'failed' else 'pending' end;
 update public.notification_outbox set status=result,lease_token=null,lease_until=null,next_attempt_at=private.clock_now()+least(300,power(2,attempts)::integer*15)*interval '1 second',delivered_at=case when result='provider-accepted' then private.clock_now() else delivered_at end where id=p_id;
 return result;
end $$;
revoke all on function public.push_enrol(text,text,text),public.push_revoke(),private.push_payload(uuid,uuid),private.push_finish(uuid,uuid,text,text) from public;
grant execute on function public.push_enrol(text,text,text),public.push_revoke() to authenticated;
grant execute on function private.push_payload(uuid,uuid),private.push_finish(uuid,uuid,text,text) to pasarmalam_agent;
-- Connected nearby matching uses only coarse cells; no device GPS is collected.
alter table public.notification_preferences add column radius_m integer not null default 1500 check(radius_m between 500 and 5000);
alter table public.notification_preferences alter column quiet_start set default '22:00';
alter table public.notification_preferences alter column quiet_end set default '08:00';
update public.notification_preferences set quiet_start='22:00',quiet_end='08:00' where quiet_start is null and quiet_end is null;
create or replace function private.recipient_matches(p_owner uuid,p_promotion uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.notification_preferences n join public.promotions p on p.id=p_promotion join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id join public.markets m on m.id=s.market_id where n.owner_id=p_owner and n.push_opt_in and n.location_expires_at>private.clock_now() and m.published and n.coarse_cell~'^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$' and extensions.st_dwithin(extensions.st_setsrid(extensions.st_makepoint(split_part(n.coarse_cell,',',2)::double precision,split_part(n.coarse_cell,',',1)::double precision),4326)::extensions.geography,extensions.st_setsrid(extensions.st_makepoint(round(extensions.st_x(m.location::extensions.geometry)::numeric,2)::double precision,round(extensions.st_y(m.location::extensions.geometry)::numeric,2)::double precision),4326)::extensions.geography,n.radius_m))
$$;
create function private.push_enqueue_radius() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='active' and new.ends_at>private.clock_now() then
 insert into public.notification_outbox(owner_id,batch_id,channel,dedup_key,promotion_id,expires_at) select n.owner_id,new.batch_id,'in-app',new.id::text||':'||n.owner_id::text,new.id,new.ends_at from public.notification_preferences n where private.recipient_matches(n.owner_id,new.id) on conflict(dedup_key) do nothing;
 end if;return new;
end $$;
revoke all on function private.push_enqueue_radius() from public;
create trigger push_enqueue_radius after insert on public.promotions for each row execute function private.push_enqueue_radius();
create function public.push_preferences(p_radius integer,p_start time,p_end time) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 if p_radius is null or p_radius not between 500 and 5000 or p_start is null or p_end is null then raise exception 'Invalid preference' using errcode='22023';end if;
 insert into public.notification_preferences(owner_id,radius_m,quiet_start,quiet_end) values(auth.uid(),p_radius,p_start,p_end) on conflict(owner_id) do update set radius_m=excluded.radius_m,quiet_start=excluded.quiet_start,quiet_end=excluded.quiet_end;
end $$;
create function public.push_workspace() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 return jsonb_build_object('enrolled',exists(select 1 from private.test_push_subscriptions where owner_id=auth.uid()),'radius',coalesce((select radius_m from public.notification_preferences where owner_id=auth.uid()),1500),'start',coalesce((select quiet_start from public.notification_preferences where owner_id=auth.uid()),'22:00'::time),'end',coalesce((select quiet_end from public.notification_preferences where owner_id=auth.uid()),'08:00'::time),'events',coalesce((select jsonb_agg(x) from(select q.id,q.status,q.attempts,q.delivered_at as provider_accepted_at,null::boolean as device_acknowledged,coalesce((select jsonb_agg(jsonb_build_object('at',a.at,'outcome',a.outcome)) from private.test_push_attempts a where a.outbox_id=q.id),'[]'::jsonb) as history from public.notification_outbox q where q.owner_id=auth.uid() order by q.created_at desc limit 50)x),'[]'::jsonb));
end $$;
revoke all on function public.push_preferences(integer,time,time),public.push_workspace() from public;
grant execute on function public.push_preferences(integer,time,time),public.push_workspace() to authenticated;

commit;
