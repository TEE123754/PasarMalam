begin;
-- Resolve PL/pgSQL variables explicitly; retain existing authorization and grants.
create or replace function public.fresh_workspace() returns jsonb language plpgsql security definer set search_path='' as $$
declare batch_row record;workspace jsonb;weather jsonb;state jsonb;
begin
 if not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 for batch_row in select x.id from public.batches x join public.food_items f on f.id=x.food_item_id where private.owns_stall(f.stall_id) order by f.id,x.id loop perform private.inspect_batch(batch_row.id);end loop;
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
create or replace function public.commerce_command(p_data jsonb,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
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
  if units>b.remaining_quantity-held or b.remaining_quantity is null or units+(select coalesce(sum((data->>'units')::integer),0) from private.commerce_records offer_order where offer_order.kind='order' and offer_order.data->>'offer'=p.id::text and (data->>'status'='completed' or (private.commerce_active(data) and private.commerce_valid(data))))>p.quantity_limit then raise exception 'Insufficient unreserved stock' using errcode='22023';end if;
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


commit;
