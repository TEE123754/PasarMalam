begin;
-- Disposable internal simulations. No external company or agency adapter.
create table private.partner_records(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('collaboration','case','permit','claim','collection','trail')),owner uuid not null references public.profiles(id),org uuid not null references public.organisations(id),stall uuid references public.stalls(id),market uuid references public.markets(id),data jsonb not null,created_at timestamptz not null default now());
create table private.partner_requests(actor uuid not null,request uuid not null,hash text not null,result uuid not null,primary key(actor,request));
create table private.partner_links(report uuid not null references public.complaints(id),org uuid not null,entry uuid not null references private.partner_records(id),primary key(report,org));
create table private.partner_log(id uuid primary key default gen_random_uuid(),entry uuid not null references private.partner_records(id),kind text not null,body text not null,at timestamptz not null default now());
create index partner_owner on private.partner_records(owner);
create index partner_org on private.partner_records(org,kind);
create index partner_batch on private.partner_records((data->>'batch')) where kind='collection';
create index partner_log_entry on private.partner_log(entry,at);
alter table private.partner_records enable row level security;
alter table private.partner_requests enable row level security;
alter table private.partner_links enable row level security;
alter table private.partner_log enable row level security;
revoke all on private.partner_records,private.partner_requests,private.partner_links,private.partner_log from public,anon,authenticated;
create function private.partner_access(r private.partner_records) returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role('admin') or r.owner=auth.uid() or (r.kind<>'case' and private.commerce_vendor(r.stall)) or (private.member_of(r.org) and (r.kind not in ('permit','claim') or exists(select 1 from public.organiser_memberships where user_id=auth.uid() and market_id=r.market)))
$$;
create function private.partner_cutoff(p_batch uuid) returns timestamptz language sql stable security definer set search_path='' as $$
 select least(private.effective_deadline(b.id)-interval '15 minutes',private.market_close(s.market_id),private.clock_now()+interval '10 minutes') from public.batches b join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id where b.id=p_batch and b.status='active' and b.inventory_state='available' and s.published and s.open and f.published
$$;
create function private.partner_held(p_batch uuid) returns integer language sql volatile security definer set search_path='' as $$
 select coalesce(sum((data->>'units')::integer),0)::integer from private.partner_records where kind='collection' and data->>'batch'=p_batch::text and data->>'status' in ('requested','accepted','scheduled') and ((data->>'route')<>'donation' or ((data->>'expires')::timestamptz>private.clock_now() and private.partner_cutoff(p_batch)>private.clock_now()))
$$;
-- Share the commerce transaction lock and stock guard; one stock pool across paths.
create or replace function private.commerce_held(p_batch uuid) returns integer language sql volatile security definer set search_path='' as $$
 select coalesce((select sum((data->>'units')::integer)::integer from private.commerce_records where kind='order' and data->>'batch'=p_batch::text and private.commerce_active(data) and private.commerce_valid(data)),0)+private.partner_held(p_batch)
$$;
create function public.partners_public() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'kind',r.kind,'stall',coalesce(r.stall::text,''),'org',r.org,'body',r.data->>'body','stops',r.data->'stops','reference',r.data->>'reference')),'[]'::jsonb) from private.partner_records r where r.data->>'status'='published' and r.kind in ('trail','collaboration') and (r.stall is null or exists(select 1 from public.stalls where id=r.stall and published)) and (r.kind<>'trail' or not exists(select 1 from jsonb_array_elements_text(r.data->'stops') stop where not exists(select 1 from public.stalls where id=stop::uuid and published)))
$$;
create function public.partners_command(p_data jsonb,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid=auth.uid();k text=p_data->>'kind';act text=p_data->>'action';result uuid=gen_random_uuid();r private.partner_records;d jsonb;prior private.partner_requests;o public.organisations;s public.stalls;b public.batches;f public.food_items;c public.complaints;cutoff timestamptz;amount integer;note text;allowed text[];required text[];field text;food_id uuid;
begin
 if uid is null or not exists(select 1 from public.profiles where id=uid and verified_at is not null) or not exists(select 1 from private.environment_guard where mode='disposable-demo') then raise exception 'Verified disposable account required' using errcode='42501';end if;
 if p_request is null or p_data is null or length(p_data::text)>12000 then raise exception 'Invalid partner command' using errcode='22023';end if;
 required=case k when 'collaboration' then array['kind','stall','org','body'] when 'permit' then array['kind','stall','org','body'] when 'claim' then array['kind','stall','org','body'] when 'referral' then array['kind','report','org','summary','consent'] when 'collection' then array['kind','batch','org','route','units','estimatedGrams'] when 'trail' then array['kind','org','body','stops'] when 'transition' then array['kind','id','action'] end;
 allowed=required||case when k='transition' then array['body','scheduled','checklist','weighedGrams','scenario'] else '{}'::text[] end;
 if required is null or exists(select 1 from unnest(required) x where not p_data?x or p_data->x='null'::jsonb) or exists(select 1 from jsonb_object_keys(p_data) x where not x=any(allowed)) then raise exception 'Unknown or missing fields' using errcode='22023';end if;
 foreach field in array array['units','estimatedGrams','weighedGrams'] loop if p_data?field and (jsonb_typeof(p_data->field)<>'number' or not (p_data->>field ~ '^[0-9]+$') or (p_data->>field)::numeric>10000000) then raise exception 'Bounded integer quantity required' using errcode='22023';end if;end loop;
 note=private.community_redact(coalesce(p_data->>'body',p_data->>'summary','Fictional internal event'));
 if length(note)<3 or length(note)>1500 then raise exception 'Invalid description' using errcode='22023';end if;
 perform pg_advisory_xact_lock(824008);
 select * into prior from private.partner_requests where actor=uid and request=p_request;
 if found then if prior.hash<>p_data::text then raise exception 'Retry conflict' using errcode='23505';end if;return prior.result;end if;
 if (select count(*) from private.partner_log l join private.partner_records x on x.id=l.entry where x.owner=uid and l.at>now()-interval '1 hour')>=120 then raise exception 'Partner command quota' using errcode='22023';end if;
 update private.partner_records set data=jsonb_set(data,'{status}','"expired"') where kind='permit' and data->>'status'='approved' and (data->>'expires')::timestamptz<=private.clock_now();
 update private.partner_records set data=jsonb_set(data,'{status}','"expired"') where kind='collection' and data->>'route'='donation' and data->>'status' in ('requested','accepted','scheduled') and ((data->>'expires')::timestamptz<=private.clock_now() or coalesce(private.partner_cutoff((data->>'batch')::uuid)<=private.clock_now(),true));
 if k='transition' then
  select * into r from private.partner_records where id=(p_data->>'id')::uuid for update;
  if not found or not private.partner_access(r) then raise exception 'Assigned partner access required' using errcode='42501';end if;d=r.data;result=r.id;
  if act='submit' then
   if not (r.owner=uid or r.kind='case' and private.has_role('admin')) or d->>'status' not in ('requested','pending','timeout','changes') or p_data->>'scenario' not in ('success','pending','timeout','rejection') then raise exception 'Submission unavailable' using errcode='22023';end if;
   d=jsonb_set(d,'{status}',to_jsonb(case p_data->>'scenario' when 'success' then 'submitted' when 'rejection' then 'rejected' else p_data->>'scenario' end));
  elsif act='renew' then
   if r.kind<>'permit' or not private.commerce_vendor(r.stall) or d->>'status' not in ('expired','rejected') then raise exception 'Renewal unavailable' using errcode='42501';end if;d=d||jsonb_build_object('status','requested','expires',null);
  elsif act='cancel' then
   if r.kind<>'collection' or not private.commerce_vendor(r.stall) or d->>'status' not in ('requested','accepted','scheduled') then raise exception 'Cancellation unavailable' using errcode='42501';end if;d=jsonb_set(d,'{status}','"cancelled"');
  else
   if not private.member_of(r.org) or not private.has_role('partner') and not private.has_role('organiser') then raise exception 'Assigned organisation membership required' using errcode='42501';end if;
   select * into o from public.organisations where id=r.org;
   if r.kind='collaboration' then
    if o.kind not in ('media','advertiser') then raise exception 'Media/company role required' using errcode='42501';end if;
    if act='publish' then if o.kind<>'media' or d->>'status'<>'approved' then raise exception 'Approval required' using errcode='22023';end if;d=d||jsonb_build_object('status','published','public',true);
    else if act not in ('approve','reject','changes') or d->>'status' not in ('submitted','changes') then raise exception 'Invalid editorial transition' using errcode='22023';end if;d=jsonb_set(d,'{status}',to_jsonb(case act when 'approve' then 'approved' when 'reject' then 'rejected' else 'changes' end));end if;
   elsif r.kind='trail' then
    if o.kind<>'media' or act<>'publish' or d->>'status'<>'requested' then raise exception 'Invalid trail publication' using errcode='22023';end if;d=d||jsonb_build_object('status','published','public',true);
   elsif r.kind='case' then
    if o.kind<>'authority' then raise exception 'Authority membership required' using errcode='42501';end if;
    if act='acknowledge' and d->>'status'='submitted' then d=jsonb_set(d,'{status}','"acknowledged"');
    elsif act='schedule' and d->>'status' in ('acknowledged','corrective','follow-up') then
     if (p_data->>'scheduled')::timestamptz<=private.clock_now() or p_data->>'scheduled' is null then raise exception 'Future schedule required' using errcode='22023';end if;d=d||jsonb_build_object('status','scheduled','scheduled',p_data->>'scheduled');
    elsif act='inspect' and d->>'status'='scheduled' then
     if not p_data?'checklist' or jsonb_typeof(p_data->'checklist')<>'array' or jsonb_array_length(p_data->'checklist') not between 1 and 8 or exists(select 1 from jsonb_array_elements_text(p_data->'checklist') x where x not in ('handling','storage','cleaning','labels')) then raise exception 'Synthetic checklist required' using errcode='22023';end if;d=d||jsonb_build_object('status','inspected','checklist',p_data->'checklist');
    elsif act='corrective' and d->>'status'='inspected' then d=jsonb_set(d,'{status}','"corrective"');
    elsif act='follow-up' and d->>'status'='corrective' then d=jsonb_set(d,'{status}','"follow-up"');
    elsif act='resolve' and d->>'status' in ('inspected','follow-up') then d=jsonb_set(d,'{status}','"resolved"');else raise exception 'Invalid officer transition' using errcode='22023';end if;
   elsif r.kind in ('permit','claim') then
    if o.kind<>'council' or not exists(select 1 from public.organiser_memberships where user_id=uid and market_id=r.market) or d->>'status' not in ('submitted','reviewing') or act not in ('review','approve','reject') then raise exception 'Assigned council review required' using errcode='42501';end if;
    if act='approve' and r.kind='permit' and (select count(*) from private.partner_records where kind='permit' and market=r.market and data->>'status'='approved' and (data->>'expires')::timestamptz>private.clock_now())>=20 then raise exception 'Fictional market capacity reached' using errcode='22023';end if;
    d=d||jsonb_build_object('status',case act when 'review' then 'reviewing' when 'approve' then 'approved' else 'rejected' end,'expires',case when act='approve' then private.clock_now()+interval '7 days' end);
   elsif r.kind='collection' then
    if o.kind not in ('charity','waste') or d->>'status' not in ('requested','accepted','scheduled') then raise exception 'Pickup closed or unassigned' using errcode='22023';end if;
    if act in ('accept','reject') and d->>'status'='requested' then d=jsonb_set(d,'{status}',to_jsonb(case act when 'accept' then 'accepted' else 'rejected' end));
    elsif act='schedule' and d->>'status'='accepted' then
     if p_data->>'scheduled' is null or (p_data->>'scheduled')::timestamptz<=private.clock_now() or (d->>'route'='donation' and (p_data->>'scheduled')::timestamptz>=least((d->>'expires')::timestamptz,private.partner_cutoff((d->>'batch')::uuid))) then raise exception 'Pickup exceeds advisory buffer' using errcode='22023';end if;d=d||jsonb_build_object('status','scheduled','scheduled',p_data->>'scheduled');
    elsif act='missed' and d->>'status'='scheduled' then d=jsonb_set(d,'{status}','"missed"');
    elsif act='collect' and d->>'status'='scheduled' then
     if not p_data?'weighedGrams' or (d->>'scheduled')::timestamptz>private.clock_now() then raise exception 'Due schedule and synthetic weight required' using errcode='22023';end if;
     select food_item_id into food_id from public.batches where id=(d->>'batch')::uuid;select * into f from public.food_items where id=food_id for update;if d->>'route'='donation' then perform private.evaluate_batch((d->>'batch')::uuid);end if;select * into b from public.batches where id=(d->>'batch')::uuid for update;
     if b.id is null or b.remaining_quantity<(d->>'units')::integer or b.inventory_state<>'available' or b.status in ('sold-out','merged','discarded','recalled') or (d->>'route'='donation' and coalesce(private.partner_cutoff(b.id)<=private.clock_now(),true)) then raise exception 'Stock/cutoff unavailable' using errcode='22023';end if;
     d=d||jsonb_build_object('status','collected','weighedGrams',(p_data->>'weighedGrams')::integer);update private.partner_records set data=d where id=result;
     update public.batches set remaining_quantity=remaining_quantity-(d->>'units')::integer,status=case when remaining_quantity=(d->>'units')::integer then 'sold-out' else status end where id=b.id;
     insert into public.batch_events(batch_id,actor_id,request_id,kind,details) values(b.id,uid,p_request,'inventory',jsonb_build_object('source','DEMO collection','units',d->'units','route',d->>'route'));
    else raise exception 'Invalid collector transition' using errcode='22023';end if;
   else raise exception 'Invalid partner record' using errcode='22023';end if;
  end if;
  update private.partner_records set data=d where id=result;
 else
  select * into o from public.organisations where id=(p_data->>'org')::uuid;
  if not found then raise exception 'Fictional organisation unavailable' using errcode='22023';end if;
  d=jsonb_build_object('id',result,'kind',case when k='referral' then 'case' else k end,'owner',uid,'org',o.id,'stall','','market','','body',note,'status','requested','created',private.clock_now(),'expires',null,'reference','DEMO-'||case k when 'referral' then 'CASE' when 'permit' then 'PERMIT' when 'claim' then 'CLAIM' when 'collection' then 'PICKUP' else 'PARTNER' end||'-'||right(result::text,8));
  if k in ('collaboration','permit','claim') then
   select * into s from public.stalls where id=(p_data->>'stall')::uuid;
   if s.id is null or not private.commerce_vendor(s.id) or (k='collaboration' and o.kind not in ('media','advertiser')) or (k in ('permit','claim') and o.kind<>'council') then raise exception 'Assigned stall/destination required' using errcode='42501';end if;
   if k='permit' and exists(select 1 from private.partner_records where kind='permit' and stall=s.id and data->>'status' in ('requested','submitted','reviewing','approved')) then raise exception 'Existing permit requires review/renewal' using errcode='22023';end if;
  elsif k='referral' then
   if not private.has_role('admin') or o.kind<>'authority' or p_data->'consent' is distinct from 'true'::jsonb then raise exception 'Moderator and explicit simulated consent required' using errcode='42501';end if;
   select * into c from public.complaints where id=(p_data->>'report')::uuid;
   if not found or c.approved_summary='' or c.blocked or not c.independent or c.status='dismissed' or c.reply_due>private.clock_now() or (select count(*) from private.community_eligible(c.stall_id))<3 or exists(select 1 from private.community_eligible(c.stall_id) where reply_due>private.clock_now()) then raise exception 'Independent reviewed threshold and reply opportunity required' using errcode='22023';end if;
   if note<>p_data->>'summary' or position(c.reporter_id::text in note)>0 then raise exception 'Remove case identifiers before approval' using errcode='22023';end if;
   select * into s from public.stalls where id=c.stall_id;d=d||jsonb_build_object('consent',true);
  elsif k='trail' then
   if o.kind<>'media' or not private.member_of(o.id) or not private.has_role('partner') or jsonb_typeof(p_data->'stops')<>'array' or jsonb_array_length(p_data->'stops') not between 2 and 5 or (select count(distinct value) from jsonb_array_elements_text(p_data->'stops'))<>jsonb_array_length(p_data->'stops') or exists(select 1 from jsonb_array_elements_text(p_data->'stops') x where not exists(select 1 from public.stalls where id=x::uuid and published)) then raise exception 'Scoped media trail and published stops required' using errcode='42501';end if;d=d||jsonb_build_object('stops',p_data->'stops');
  elsif k='collection' then
   select food_item_id into food_id from public.batches where id=(p_data->>'batch')::uuid;select * into f from public.food_items where id=food_id for update;select * into b from public.batches where id=(p_data->>'batch')::uuid for update;select * into s from public.stalls where id=f.stall_id;
   amount=(p_data->>'units')::integer;
   if s.id is null or not private.commerce_vendor(s.id) or amount not between 1 and 100000 or b.remaining_quantity is null or amount>b.remaining_quantity-private.commerce_held(b.id) or b.inventory_state<>'available' or b.status in ('sold-out','merged','discarded','recalled') then raise exception 'Unreserved assigned stock required' using errcode='22023';end if;
   if p_data->>'route' not in ('donation','compost','bsf') or (p_data->>'route'='donation' and o.kind<>'charity') or (p_data->>'route' in ('compost','bsf') and o.kind<>'waste') then raise exception 'Destination/path mismatch' using errcode='22023';end if;
   if private.partner_held(b.id)>0 then raise exception 'Resolve existing batch pickup first' using errcode='22023';end if;
   if p_data->>'route'='donation' then perform private.evaluate_batch(b.id);cutoff=private.partner_cutoff(b.id);if cutoff is null or cutoff<=private.clock_now() then raise exception 'Donation advisory cutoff reached' using errcode='22023';end if;end if;
   d=d||jsonb_build_object('batch',b.id,'route',p_data->>'route','units',amount,'estimatedGrams',(p_data->>'estimatedGrams')::integer,'expires',cutoff);
  end if;
  if s.id is not null then d=d||jsonb_build_object('stall',s.id,'market',s.market_id);end if;
  insert into private.partner_records(id,kind,owner,org,stall,market,data) values(result,case when k='referral' then 'case' else k end,uid,o.id,s.id,s.market_id,d);
  if k='referral' then insert into private.partner_links(report,org,entry) values(c.id,o.id,result);end if;
 end if;
 insert into private.partner_log(entry,kind,body) values(result,coalesce(act,'created'),note);
 insert into private.partner_requests values(uid,p_request,p_data::text,result);return result;
end $$;
create function public.partners_workspace() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid=auth.uid();roles jsonb='[]';rec record;ownstalls jsonb;ownmarkets jsonb;rows jsonb;jobcount integer;estimated numeric;weighed numeric;
begin
 if uid is null then raise exception 'Sign in required' using errcode='42501';end if;
 select coalesce(jsonb_agg(id::text),'[]') into ownstalls from public.stalls where private.commerce_vendor(id);
 select coalesce(jsonb_agg(market_id::text),'[]') into ownmarkets from public.organiser_memberships where user_id=uid;
 if private.has_role('vendor') then roles=roles||jsonb_build_array(jsonb_build_object('id',uid::text||':vendor','role','vendor','org','','stalls',ownstalls,'markets',ownmarkets));end if;
 if private.has_role('admin') then roles=roles||jsonb_build_array(jsonb_build_object('id',uid::text||':moderator','role','moderator','org','','stalls','[]'::jsonb,'markets','[]'::jsonb));end if;
 for rec in select o.id,o.kind from public.organisations o where private.member_of(o.id) and o.kind in ('media','advertiser','authority','council','charity','waste') and (private.has_role('partner') or private.has_role('organiser')) loop
  roles=roles||jsonb_build_array(jsonb_build_object('id',uid::text||':'||rec.id::text,'role',case rec.kind when 'media' then 'editor' when 'advertiser' then 'company' when 'authority' then 'officer' when 'council' then 'council' else 'collector' end,'org',rec.id,'stalls','[]'::jsonb,'markets',ownmarkets));
 end loop;
 if roles='[]'::jsonb then roles=jsonb_build_array(jsonb_build_object('id',uid::text,'role','visitor','org','','stalls','[]'::jsonb,'markets','[]'::jsonb));end if;
 select coalesce(jsonb_agg(data||jsonb_build_object('status',case when kind='permit' and data->>'status'='approved' and (data->>'expires')::timestamptz<=private.clock_now() then 'expired' when kind='collection' and data->>'route'='donation' and data->>'status' in ('requested','accepted','scheduled') and ((data->>'expires')::timestamptz<=private.clock_now() or coalesce(private.partner_cutoff((data->>'batch')::uuid)<=private.clock_now(),true)) then 'expired' else data->>'status' end)),'[]') into rows from private.partner_records r where private.partner_access(r);
 select count(*),coalesce(sum((data->>'estimatedGrams')::numeric),0)/1000,coalesce(sum((data->>'weighedGrams')::numeric),0)/1000 into jobcount,estimated,weighed from private.partner_records r where private.partner_access(r) and kind='collection' and data->>'status'='collected';
 return jsonb_build_object('council',coalesce((select jsonb_agg(jsonb_build_object('market',m.market_id,'reports',case when (select count(distinct c.stall_id) from public.complaints c join public.stalls st on st.id=c.stall_id where st.market_id=m.market_id and c.independent and not c.blocked and c.status<>'dismissed')>=5 then (select count(*) from public.complaints c join public.stalls st on st.id=c.stall_id where st.market_id=m.market_id and c.independent and not c.blocked and c.status<>'dismissed') end,'weighed',case when (select count(distinct stall) from private.partner_records where kind='collection' and market=m.market_id and data->>'status'='collected')>=5 then (select sum((data->>'weighedGrams')::numeric)/1000 from private.partner_records where kind='collection' and market=m.market_id and data->>'status'='collected') end)) from public.organiser_memberships m where m.user_id=uid),'[]'),'now',private.clock_now(),'personas',roles,'directory',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name||' · DEMO','kind',case kind when 'advertiser' then 'company' when 'charity' then 'donation' else kind end,'description','Fictional internal simulation; no official affiliation, API or external sending')) from public.organisations where kind in ('media','advertiser','authority','council','charity','waste')),'[]'),'entries',rows,'logs',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'entry',l.entry,'kind',l.kind,'body',l.body,'at',l.at)) from private.partner_log l join private.partner_records r on r.id=l.entry where private.partner_access(r)),'[]'),'public',public.partners_public(),'totals',jsonb_build_object('jobs',jobcount,'estimated',estimated,'weighed',weighed),'stalls',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'market',market_id)) from public.stalls where published or private.commerce_vendor(id)),'[]'),'batches',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'status',b.status,'available',greatest(0,coalesce(b.remaining_quantity,0)-private.commerce_held(b.id)))) from public.batches b join public.food_items f on f.id=b.food_item_id where private.commerce_vendor(f.stall_id)),'[]'),'reports',case when private.has_role('admin') then coalesce((select jsonb_agg(jsonb_build_object('id',id,'stall',stall_id,'summary',approved_summary,'replyDue',reply_due)) from public.complaints where approved_summary<>''),'[]') else '[]'::jsonb end);
end $$;
revoke all on function private.partner_access(private.partner_records),private.partner_cutoff(uuid),private.partner_held(uuid) from public,anon,authenticated;
revoke all on function public.partners_command(jsonb,uuid),public.partners_workspace(),public.partners_public() from public,anon,authenticated;
grant execute on function public.partners_command(jsonb,uuid),public.partners_workspace() to authenticated;
grant execute on function public.partners_public() to anon,authenticated;
commit;





