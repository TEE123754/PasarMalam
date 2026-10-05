-- All financial/provider records here are fictional. Caller JWT only; no operator keys.
begin;
create table private.commerce_records(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('order','campaign')),owner uuid not null references public.profiles(id),stall uuid references public.stalls(id),market uuid references public.markets(id),organisation uuid references public.organisations(id),assigned uuid references public.profiles(id),data jsonb not null,created_at timestamptz not null default now());
create index commerce_scope on private.commerce_records(kind,owner,stall,market);
create index commerce_assigned on private.commerce_records(assigned) where assigned is not null;
create table private.commerce_ledger(id uuid primary key default gen_random_uuid(),order_id uuid not null references private.commerce_records(id),kind text not null,amount integer not null,at timestamptz not null default now(),event_key text not null unique);
create table private.commerce_requests(actor uuid not null references public.profiles(id),request uuid not null,hash text not null,result uuid not null,at timestamptz not null default now(),primary key(actor,request));
create table private.commerce_accounts(owner uuid primary key references public.profiles(id),balance integer not null default 100000 check(balance>=0),advertiser jsonb not null default '{}',tier text not null default 'free' check(tier in ('free','premium','renewal-failed')));
create table private.commerce_policy(singleton boolean primary key default true check(singleton),rate integer not null default 300 check(rate between 0 and 1000));
insert into private.commerce_policy values(true,300);
alter table private.commerce_records enable row level security;
alter table private.commerce_ledger enable row level security;
alter table private.commerce_requests enable row level security;
alter table private.commerce_accounts enable row level security;
alter table private.commerce_policy enable row level security;
revoke all on private.commerce_records,private.commerce_ledger,private.commerce_requests,private.commerce_accounts,private.commerce_policy from public,anon,authenticated;

create function private.commerce_active(d jsonb) returns boolean language sql immutable set search_path='' as $$ select d->>'status' in ('reserved','accepted','ready') $$;
create function private.commerce_vendor(s uuid) returns boolean language sql stable security definer set search_path='' as $$ select private.has_role('vendor') and exists(select 1 from public.stall_memberships where stall_id=s and user_id=auth.uid()) $$;
create function private.commerce_org() returns uuid language sql stable security definer set search_path='' as $$ select o.id from public.organisations o join public.organisation_members m on m.organisation_id=o.id where m.user_id=auth.uid() and o.kind='advertiser' order by o.id limit 1 $$;
create function private.commerce_allowed(r private.commerce_records) returns boolean language sql stable security definer set search_path='' as $$ select private.has_role('admin') or r.owner=auth.uid() or (r.kind='order' and (private.commerce_vendor(r.stall) or r.assigned=auth.uid())) or (r.kind='campaign' and r.organisation is not null and private.member_of(r.organisation)) $$;
create function private.commerce_valid(d jsonb) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id join public.promotions p on p.id=(d->>'offer')::uuid where b.id=(d->>'batch')::uuid and b.inventory_state='available' and b.status='active' and s.published and s.open and f.published and p.status='active' and p.starts_at<=private.clock_now() and p.ends_at>private.clock_now() and private.effective_deadline(b.id)>private.clock_now()+interval '15 minutes' and (d->>'expires')::timestamptz>private.clock_now() and p.ends_at>=private.clock_now() and private.market_close(s.market_id)>private.clock_now()) $$;
create function private.commerce_held(p_batch uuid) returns integer language sql volatile security definer set search_path='' as $$ select coalesce(sum((data->>'units')::integer),0)::integer from private.commerce_records where kind='order' and data->>'batch'=p_batch::text and private.commerce_active(data) and private.commerce_valid(data) $$;
create function private.commerce_stock_guard() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.remaining_quantity is distinct from old.remaining_quantity and coalesce(new.remaining_quantity,0)<private.commerce_held(old.id) then raise exception 'Stock held by reservations' using errcode='22023';end if;
 if new.status in ('sold-out','merged') and new.status is distinct from old.status and private.commerce_held(old.id)>0 then raise exception 'Fulfil or cancel reservations first' using errcode='22023';end if;return new;
end $$;
create trigger commerce_stock_guard before update on public.batches for each row execute function private.commerce_stock_guard();
create function private.commerce_reconcile(p_order uuid,p_key text) returns void language plpgsql security definer set search_path='' as $$
declare d jsonb;target integer;delta integer;
begin select data into d from private.commerce_records where id=p_order;target=case when d->>'status'='completed' and not (d->>'disputed')::boolean then floor(((d->>'total')::bigint-(d->>'refunded')::bigint)*(d->>'rate')::integer/10000.0)::integer else 0 end;delta=target-(d->>'commission')::integer;if delta<>0 then insert into private.commerce_ledger(order_id,kind,amount,event_key) values(p_order,case when delta>0 then 'commission' else 'adjustment' end,delta,p_key||':commission');update private.commerce_records set data=jsonb_set(data,'{commission}',to_jsonb(target)) where id=p_order;end if;end $$;

create function public.commerce_command(p_data jsonb,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid=auth.uid();kind text=p_data->>'kind';act text=p_data->>'action';result uuid=gen_random_uuid();r private.commerce_records;d jsonb;p public.promotions;b public.batches;f public.food_items;s public.stalls;deadline timestamptz;expires timestamptz;units integer;qty integer;held integer;rate integer;amount integer;prior private.commerce_requests;org uuid;courier uuid;key text;decision jsonb;required text[];allowed text[];field text;
begin
 if uid is null or not exists(select 1 from public.profiles where id=uid and verified_at is not null) or not exists(select 1 from private.environment_guard where mode='disposable-demo') then raise exception 'Verified disposable account required' using errcode='42501';end if;
 if p_request is null or p_data is null or length(p_data::text)>10000 then raise exception 'Invalid command' using errcode='22023';end if;
 required=case kind when 'onboard' then array['kind','name','business'] when 'reserve' then array['kind','offer','quantity','fulfilment','payment','eta'] when 'order' then array['kind','id','action'] when 'payment' then array['kind','id','scenario'] when 'refund' then array['kind','id','amount'] when 'campaign' then array['kind','stall','market','category','radius','start','end','budget','placement','description'] when 'moderate' then array['kind','id','action'] when 'ad' then array['kind','id','event'] when 'subscription' then array['kind','tier'] when 'rate' then array['kind','basisPoints'] when 'delivery' then array['kind','id','action'] end;
 allowed=required||case when kind='order' then array['code'] else '{}'::text[] end;
 if required is null or exists(select 1 from unnest(required) x where not p_data ? x or p_data->x='null'::jsonb) or exists(select 1 from jsonb_object_keys(p_data) x where not x=any(allowed)) then raise exception 'Unknown or missing fields' using errcode='22023';end if;
 foreach field in array array['quantity','eta','amount','budget','radius','basisPoints'] loop
  if p_data ? field and (jsonb_typeof(p_data->field)<>'number' or not (p_data->>field ~ '^[0-9]+$')) then raise exception 'Integer fields required' using errcode='22023';end if;
 end loop;
 -- A single demo command lock gives predictable cross-order, ledger and account ordering.
 perform pg_advisory_xact_lock(824008);
 select * into prior from private.commerce_requests where actor=uid and request=p_request;
 if found then if prior.hash<>p_data::text then raise exception 'Retry conflict' using errcode='23505';end if;return prior.result;end if;
 if (select count(*) from private.commerce_requests where actor=uid and at>now()-interval '1 hour')>=120 then raise exception 'Demo command rate limit' using errcode='P0001';end if;
 key=uid::text||':'||p_request::text;
 insert into private.commerce_accounts(owner) values(uid) on conflict do nothing;
 if kind='onboard' then
  if not (private.has_role('vendor') or (private.has_role('partner') and private.commerce_org() is not null)) then raise exception 'Advertiser required' using errcode='42501';end if;
  if length(trim(p_data->>'name')) not between 2 and 100 or length(trim(p_data->>'business')) not between 2 and 100 then raise exception 'Fictional names required' using errcode='22023';end if;
  update private.commerce_accounts set advertiser=jsonb_build_object('name',p_data->>'name','business',p_data->>'business') where owner=uid;
 elsif kind='reserve' then
  if not private.has_role('customer') then raise exception 'Customer required' using errcode='42501';end if;
  select * into p from public.promotions where id=(p_data->>'offer')::uuid;
  select * into f from public.food_items where id=(select food_item_id from public.batches where id=p.batch_id) for update;
  select * into b from public.batches where id=p.batch_id for update;
  select * into s from public.stalls where id=f.stall_id;
  decision=private.evaluate_batch(b.id);deadline=private.effective_deadline(b.id);
  select * into b from public.batches where id=p.batch_id;select * into p from public.promotions where id=p.id;
  qty=(p_data->>'quantity')::integer;units=qty*p.bundle_units;
  expires=least(p.ends_at,deadline-interval '15 minutes',private.market_close(s.market_id),private.clock_now()+interval '10 minutes');
  if qty is null or qty not between 1 and 100 or (p_data->>'eta')::integer not between 0 and 60 or not coalesce((decision->>'eligible')::boolean,false) or not s.published or not s.open or not f.published or p.status<>'active' or p.starts_at>private.clock_now() or expires is null or expires<=private.clock_now()+(p_data->>'eta')::integer*interval '1 minute' or p_data->>'fulfilment' not in ('pickup','delivery') or p_data->>'payment' not in ('stall','future') then raise exception 'Ineligible batch, offer or fulfilment cutoff' using errcode='22023';end if;
  held=private.commerce_held(b.id);
  if units>b.remaining_quantity-held or b.remaining_quantity is null or units+(select coalesce(sum((data->>'units')::integer),0) from private.commerce_records where kind='order' and data->>'offer'=p.id::text and (data->>'status'='completed' or (private.commerce_active(data) and private.commerce_valid(data))))>p.quantity_limit then raise exception 'Insufficient unreserved stock' using errcode='22023';end if;
  select x.user_id into courier from public.organisation_members x join public.organisations o on o.id=x.organisation_id join public.user_roles u on u.user_id=x.user_id and u.role='partner' where o.kind='delivery' order by x.user_id limit 1;
  if p_data->>'fulfilment'='delivery' and courier is null then raise exception 'No fictional courier assigned' using errcode='22023';end if;
  select c.rate into rate from private.commerce_policy c where singleton;
  d=jsonb_build_object('id',result,'owner',uid,'stall',s.id,'market',s.market_id,'batch',b.id,'offer',p.id,'units',units,'total',p.price_sen*qty,'expires',expires,'status','reserved','fulfilment',p_data->>'fulfilment','payment',p_data->>'payment','paid',false,'vendorConfirmed',false,'customerConfirmed',false,'code','DEMO-'||upper(substr(result::text,1,8)),'courier',case when p_data->>'fulfilment'='delivery' then courier end,'delivery','assigned','eta',(p_data->>'eta')::integer,'refunded',0,'disputed',false,'commission',0,'rate',rate,'created',private.clock_now());
  insert into private.commerce_records(id,kind,owner,stall,market,assigned,data) values(result,'order',uid,s.id,s.market_id,case when p_data->>'fulfilment'='delivery' then courier end,d);
 elsif kind in ('order','payment','refund','delivery') then
  select * into r from private.commerce_records where id=(p_data->>'id')::uuid and private.commerce_records.kind='order' for update;
  if r.id is null or not private.commerce_allowed(r) then raise exception 'Order unavailable' using errcode='42501';end if;
  select * into f from public.food_items where id=(select food_item_id from public.batches where id=(r.data->>'batch')::uuid) for update;
  select * into b from public.batches where id=(r.data->>'batch')::uuid for update;
  d=r.data;result=r.id;
  if private.commerce_active(d) and not private.commerce_valid(d) then d=d||jsonb_build_object('status','expired','delivery','cancelled');end if;
  if kind='order' then
   if act='dispute' then
    if not (r.owner=uid or private.commerce_vendor(r.stall)) then raise exception 'Owner required' using errcode='42501';end if;d=d||'{"disputed":true}'::jsonb;
   elsif act='cancel' then
    if not (r.owner=uid or private.commerce_vendor(r.stall)) then raise exception 'Owner required' using errcode='42501';end if;
    if not private.commerce_active(d) then raise exception 'Order closed' using errcode='22023';end if;d=d||'{"status":"cancelled","delivery":"cancelled"}'::jsonb;
   elsif act in ('vendor-confirm','customer-confirm') then
    if not (case when act='vendor-confirm' then private.commerce_vendor(r.stall) else r.owner=uid end) then raise exception 'Confirmation owner required' using errcode='42501';end if;
    if d->>'status'<>'ready' or p_data->>'code' is distinct from d->>'code' or (d->>'fulfilment'='delivery' and d->>'delivery'<>'arrived') then raise exception 'Ready order, arrival and matching code required' using errcode='22023';end if;
    d=jsonb_set(d,case when act='vendor-confirm' then '{vendorConfirmed}'::text[] else '{customerConfirmed}'::text[] end,'true'::jsonb);
    if (d->>'vendorConfirmed')::boolean and (d->>'customerConfirmed')::boolean then
     if d->>'payment'='future' and not (d->>'paid')::boolean then raise exception 'Pretend payment pending' using errcode='22023';end if;
     if b.remaining_quantity<(d->>'units')::integer then raise exception 'Stock unavailable' using errcode='22023';end if;
     d=d||'{"status":"completed","paid":true}'::jsonb;
     update private.commerce_records set data=d where id=result;
     update public.batches set remaining_quantity=remaining_quantity-(d->>'units')::integer,status=case when remaining_quantity=(d->>'units')::integer then 'sold-out' else status end where id=b.id;
     insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(b.id,uid,'DEMO-clearance-collected',p_request,jsonb_build_object('order',result,'units',d->'units'));
     insert into private.commerce_ledger(order_id,kind,amount,event_key) values(result,'collection',(d->>'total')::integer,key||':collection');
    end if;
   else
    if not private.commerce_vendor(r.stall) then raise exception 'Vendor required' using errcode='42501';end if;
    if (act in ('accept','reject') and d->>'status'<>'reserved') or (act='ready' and d->>'status'<>'accepted') or act not in ('accept','reject','ready') then raise exception 'Invalid transition' using errcode='22023';end if;
    d=d||jsonb_build_object('status',case act when 'accept' then 'accepted' when 'reject' then 'rejected' else 'ready' end);
   end if;
  elsif kind='payment' then
   if r.owner<>uid or d->>'payment'<>'future' then raise exception 'Payment owner required' using errcode='42501';end if;
   if (d->>'paid')::boolean then raise exception 'Payment already settled' using errcode='22023';end if;
   if p_data->>'scenario'='success' then
    if not private.commerce_active(d) then raise exception 'Late success rejected' using errcode='22023';end if;
    update private.commerce_accounts set balance=balance-(d->>'total')::integer where owner=uid and balance>=(d->>'total')::integer;if not found then raise exception 'Pretend balance insufficient' using errcode='22023';end if;
    d=d||'{"paid":true}'::jsonb;insert into private.commerce_ledger(order_id,kind,amount,event_key) values(result,'pretend-payment',(d->>'total')::integer,key||':payment');
   elsif p_data->>'scenario'='failure' then
    if not private.commerce_active(d) then raise exception 'Order closed' using errcode='22023';end if;d=d||'{"status":"failed"}'::jsonb;
   elsif p_data->>'scenario' not in ('timeout','late') then raise exception 'Invalid callback' using errcode='22023';end if;
  elsif kind='refund' then
   if not private.commerce_vendor(r.stall) then raise exception 'Vendor required' using errcode='42501';end if;
   amount=(p_data->>'amount')::integer;if private.commerce_active(d) or amount is null or amount<=0 or not (d->>'paid')::boolean or amount>(d->>'total')::integer-(d->>'refunded')::integer then raise exception 'Refund cap exceeded' using errcode='22023';end if;
   d=jsonb_set(d,'{refunded}',to_jsonb((d->>'refunded')::integer+amount));
   if d->>'payment'='future' then update private.commerce_accounts set balance=balance+amount where owner=r.owner;end if;
   insert into private.commerce_ledger(order_id,kind,amount,event_key) values(result,'refund',-amount,key||':refund');
  else
   if r.assigned is distinct from uid or not private.has_role('partner') then raise exception 'Assigned courier required' using errcode='42501';end if;
   if not private.commerce_active(d) or least((d->>'expires')::timestamptz,private.effective_deadline(b.id)-interval '15 minutes',(select ends_at from public.promotions where id=(d->>'offer')::uuid),private.market_close(r.market))<=private.clock_now()+(d->>'eta')::integer*interval '1 minute' then raise exception 'Delivery closed or ETA beyond cutoff' using errcode='22023';end if;
   if not (act in ('failed','cancelled') or (d->>'delivery'='assigned' and act='accepted') or (d->>'delivery'='accepted' and act='picked-up' and d->>'status'='ready') or (d->>'delivery'='picked-up' and act='arrived')) then raise exception 'Invalid courier transition' using errcode='22023';end if;
   d=d||jsonb_build_object('delivery',act);if act in ('failed','cancelled') then d=d||'{"status":"failed"}'::jsonb;end if;
  end if;
  update private.commerce_records set data=d where id=result;perform private.commerce_reconcile(result,key);
 elsif kind='campaign' then
  select * into s from public.stalls where id=(p_data->>'stall')::uuid and published;org=private.commerce_org();
  if s.id is null or not (private.commerce_vendor(s.id) or (private.has_role('partner') and org is not null)) then raise exception 'Assigned stall or advertiser organisation required' using errcode='42501';end if;
  if s.market_id is distinct from (p_data->>'market')::uuid or s.category is distinct from p_data->>'category' or (p_data->>'budget')::integer not between 1 and 10000000 or (p_data->>'radius')::numeric not between 1 and 50 or (p_data->>'end')::timestamptz<=(p_data->>'start')::timestamptz or (p_data->>'end')::timestamptz<=private.clock_now() or length(trim(p_data->>'description')) not between 1 and 300 or p_data->>'placement' not in ('sponsored','banner','native','interstitial') then raise exception 'Invalid campaign' using errcode='22023';end if;
  d=(p_data-'kind')||jsonb_build_object('id',result,'owner',uid,'spent',0,'status','pending','approved',false,'impressions',0,'clicks',0);
  insert into private.commerce_records(id,kind,owner,stall,market,organisation,data) values(result,'campaign',uid,s.id,s.market_id,org,d);
 elsif kind in ('moderate','ad') then
  select * into r from private.commerce_records where id=(p_data->>'id')::uuid and private.commerce_records.kind='campaign' for update;
  if r.id is null or not private.commerce_allowed(r) then raise exception 'Campaign unavailable' using errcode='42501';end if;d=r.data;result=r.id;
  if kind='moderate' then
   if not private.has_role('admin') and not ((r.owner=uid or private.member_of(r.organisation)) and (d->>'approved')::boolean and ((act='paused' and d->>'status'='approved') or (act='resume' and d->>'status'='paused'))) then raise exception 'Moderation authority required' using errcode='42501';end if;
   if act not in ('approved','rejected','paused','resume') or (act='resume' and not (d->>'approved')::boolean) then raise exception 'Invalid moderation' using errcode='22023';end if;
   d=d||jsonb_build_object('status',case when act='resume' then 'approved' else act end,'approved',case when act='approved' then true when act='rejected' then false else (d->>'approved')::boolean end);
  else
   if p_data->>'event' not in ('impression','click') then raise exception 'Invalid ad event' using errcode='22023';end if;amount=case when p_data->>'event'='click' then 5 else 1 end;
   if (d->>'approved')::boolean and d->>'status'='approved' and (d->>'start')::timestamptz<=private.clock_now() and (d->>'end')::timestamptz>private.clock_now() and (d->>'spent')::integer+amount<=(d->>'budget')::integer then d=jsonb_set(d,'{spent}',to_jsonb((d->>'spent')::integer+amount));d=jsonb_set(d,case when p_data->>'event'='click' then '{clicks}'::text[] else '{impressions}'::text[] end,to_jsonb((d->>case when p_data->>'event'='click' then 'clicks' else 'impressions' end)::integer+1));else d=jsonb_set(d,'{noFill}',to_jsonb(coalesce((d->>'noFill')::integer,0)+1));end if;
  end if;update private.commerce_records set data=d where id=result;
 elsif kind='subscription' then
  if not (private.has_role('vendor') or private.has_role('organiser')) then raise exception 'Vendor or organiser required' using errcode='42501';end if;
  if p_data->>'tier' not in ('free','premium','renewal-failed') then raise exception 'Invalid tier' using errcode='22023';end if;update private.commerce_accounts set tier=p_data->>'tier' where owner=uid;
 elsif kind='rate' then
  if not private.has_role('admin') then raise exception 'Admin required' using errcode='42501';end if;update private.commerce_policy set rate=(p_data->>'basisPoints')::integer where singleton;
 else raise exception 'Unknown command' using errcode='22023';end if;
 insert into private.commerce_requests(actor,request,hash,result) values(uid,p_request,p_data::text,result);return result;
end $$;

create function public.commerce_workspace() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid=auth.uid();roles jsonb='[]';stalls jsonb;markets jsonb;orders jsonb;campaigns jsonb;ledger jsonb;offers jsonb;inventory jsonb;council jsonb;rec record;n integer;h integer;activity jsonb;
begin
 if uid is null or not exists(select 1 from private.environment_guard where mode='disposable-demo') then raise exception 'Disposable account required' using errcode='42501';end if;
 select coalesce(jsonb_agg(stall_id),'[]') into stalls from public.stall_memberships where user_id=uid;
 select coalesce(jsonb_agg(market_id),'[]') into markets from public.organiser_memberships where user_id=uid;
 if private.has_role('customer') then roles=roles||jsonb_build_array(jsonb_build_object('id',uid,'role','customer','stalls',stalls,'markets',markets));end if;
 if private.has_role('vendor') then roles=roles||jsonb_build_array(jsonb_build_object('id',uid,'role','vendor','stalls',stalls,'markets',markets));end if;
 if private.has_role('admin') then roles=roles||jsonb_build_array(jsonb_build_object('id',uid,'role','admin','stalls',stalls,'markets',markets));end if;
 if private.has_role('organiser') then roles=roles||jsonb_build_array(jsonb_build_object('id',uid,'role','organiser','stalls',stalls,'markets',markets));end if;
 if private.has_role('partner') and private.commerce_org() is not null then roles=roles||jsonb_build_array(jsonb_build_object('id',uid,'role','advertiser','stalls',stalls,'markets',markets));end if;
 if private.has_role('partner') and exists(select 1 from public.organisation_members m join public.organisations o on o.id=m.organisation_id where m.user_id=uid and o.kind='delivery') then roles=roles||jsonb_build_array(jsonb_build_object('id',uid,'role','courier','stalls',stalls,'markets',markets));end if;
 select coalesce(jsonb_agg(case when r.assigned=uid and r.owner<>uid and not private.commerce_vendor(r.stall) and not private.has_role('admin') then r.data||jsonb_build_object('code','','total',0,'refunded',0,'commission',0,'owner','') else r.data end ||case when private.commerce_active(r.data) and not private.commerce_valid(r.data) then '{"status":"expired","delivery":"cancelled"}'::jsonb else '{}'::jsonb end order by r.created_at desc),'[]') into orders from private.commerce_records r where r.kind='order' and private.commerce_allowed(r);
 select coalesce(jsonb_agg(data order by created_at desc),'[]') into campaigns from private.commerce_records r where kind='campaign' and private.commerce_allowed(r);
 select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'order',l.order_id,'kind',l.kind,'amount',l.amount,'at',l.at) order by l.at),'[]') into ledger from private.commerce_ledger l join private.commerce_records r on r.id=l.order_id where r.owner=uid or private.commerce_vendor(r.stall) or private.has_role('admin');
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'batch',b.id,'stall',s.id,'title',p.title,'price',p.price_sen,'original',f.price_sen*p.bundle_units,'units',p.quantity_limit,'bundle',p.bundle_units,'ends',p.ends_at,'state','active','request',p.request_id,'available',b.remaining_quantity-private.commerce_held(b.id),'food',f.name)),'[]') into offers from public.promotions p join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id where p.status='active' and p.starts_at<=private.clock_now() and p.ends_at>private.clock_now() and b.status='active' and b.inventory_state='available' and private.effective_deadline(b.id)-interval '15 minutes'>=p.ends_at and b.remaining_quantity>private.commerce_held(b.id) and s.published and s.open and f.published;
 select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'stall',f.stall_id,'quantity',b.remaining_quantity,'available',greatest(0,b.remaining_quantity-private.commerce_held(b.id)),'status',b.status)),'[]') into inventory from public.batches b join public.food_items f on f.id=b.food_item_id where private.commerce_vendor(f.stall_id);
 council='[]';
 for rec in select market_id from public.organiser_memberships where user_id=uid loop
  select count(distinct stall) into n from private.commerce_records where kind='order' and market=rec.market_id and data->>'status'='completed' and not (data->>'disputed')::boolean and (data->>'refunded')::integer<(data->>'total')::integer and created_at>now()-interval '30 days';
  select count(distinct s.id) into h from public.complaints c join public.stalls s on s.id=c.stall_id where s.market_id=rec.market_id and c.independent and not c.blocked and c.created_at>now()-interval '30 days';
  select coalesce(jsonb_agg(jsonb_build_object('date',day,'stalls',stalls,'units',units)),'[]') into activity from (select created_at::date as day,count(distinct stall) as stalls,sum((data->>'units')::numeric*((data->>'total')::integer-(data->>'refunded')::integer)/greatest(1,(data->>'total')::integer)) as units from private.commerce_records where kind='order' and market=rec.market_id and data->>'status'='completed' and not (data->>'disputed')::boolean and (data->>'refunded')::integer<(data->>'total')::integer and created_at>now()-interval '30 days' group by created_at::date having count(distinct stall)>=5) grouped;
  council=council||jsonb_build_array(jsonb_build_object('market',rec.market_id,'collected',case when n>=5 then (select coalesce(sum((data->>'total')::integer-(data->>'refunded')::integer),0) from private.commerce_records where kind='order' and market=rec.market_id and data->>'status'='completed' and not (data->>'disputed')::boolean and created_at>now()-interval '30 days') end,'reserved',case when n>=5 then (select coalesce(sum((data->>'total')::integer),0) from private.commerce_records where kind='order' and market=rec.market_id and private.commerce_active(data) and private.commerce_valid(data)) end,'kg',case when n>=5 then (select coalesce(sum((data->>'units')::numeric*((data->>'total')::integer-(data->>'refunded')::integer)/greatest(1,(data->>'total')::integer)),0)*0.15 from private.commerce_records where kind='order' and market=rec.market_id and data->>'status'='completed' and not (data->>'disputed')::boolean and created_at>now()-interval '30 days') end,'activity',activity,'hygiene',case when h>=5 then 'Fictional reporting activity across at least five independently reporting stalls; not proven violations' else 'Suppressed: fewer than five independently reporting stalls' end));
 end loop;
 return jsonb_build_object('actors',roles,'server_now',private.clock_now(),'commerce',jsonb_build_object('orders',orders,'campaigns',campaigns,'ledger',ledger,'advertisers',jsonb_build_object(uid::text,coalesce((select advertiser from private.commerce_accounts where owner=uid),'{}')),'requests','{}'::jsonb,'events','[]'::jsonb,'subscriptions',jsonb_build_object(uid::text,coalesce((select tier from private.commerce_accounts where owner=uid),'free')),'balance',jsonb_build_object(uid::text,coalesce((select balance from private.commerce_accounts where owner=uid),100000)),'rate',(select rate from private.commerce_policy where singleton)),'offers',offers,'inventory',inventory,'council',council,'targets',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'marketId',market_id,'category',category)) from public.stalls where published),'[]'));
end $$;

create function public.commerce_ads() returns jsonb language sql stable security definer set search_path='' as $$ select coalesce(jsonb_agg(r.data-'owner'-'budget'-'spent'||jsonb_build_object('budget',1,'spent',0)),'[]') from private.commerce_records r join public.stalls s on s.id=r.stall where r.kind='campaign' and r.data->>'status'='approved' and (r.data->>'approved')::boolean and (r.data->>'start')::timestamptz<=private.clock_now() and (r.data->>'end')::timestamptz>private.clock_now() and (r.data->>'spent')::integer<(r.data->>'budget')::integer and s.published and s.open $$;
revoke all on function private.commerce_active(jsonb),private.commerce_vendor(uuid),private.commerce_org(),private.commerce_allowed(private.commerce_records),private.commerce_valid(jsonb),private.commerce_held(uuid),private.commerce_stock_guard(),private.commerce_reconcile(uuid,text) from public,anon,authenticated;
revoke all on function public.commerce_command(jsonb,uuid),public.commerce_workspace(),public.commerce_ads() from public,anon,authenticated;
grant execute on function public.commerce_command(jsonb,uuid),public.commerce_workspace() to authenticated;
grant execute on function public.commerce_ads() to anon,authenticated;
-- Legacy delivery scaffold no longer gives all organisation members access to assigned jobs.
drop policy delivery_jobs_read on public.delivery_jobs;
create policy delivery_jobs_read on public.delivery_jobs for select to authenticated using(private.has_role('admin') or owner_id=auth.uid() or private.commerce_vendor(stall_id) or assigned_user_id=auth.uid());
commit;
