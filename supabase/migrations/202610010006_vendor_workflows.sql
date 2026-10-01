-- Disposable demo only. Production requires a separate, reviewed schema and project.
begin;
alter table public.stalls add column lot text not null default '', add column opens text not null default '17:00', add column closes text not null default '22:00', add column photo text;
alter table public.food_items add column photo text;
alter table public.batches add column photo text, add column corrected_prepared_at timestamptz;
alter table public.batches alter column original_quantity drop not null, alter column remaining_quantity drop not null;
alter table public.batches add constraint batch_quantity_pair check ((original_quantity is null)=(remaining_quantity is null));
alter table public.batches drop constraint batches_check;
alter table public.batches add constraint batch_effective_deadline check(advisory_deadline is null or advisory_deadline>=coalesce(corrected_prepared_at,prepared_at));
alter table public.batches drop constraint batches_status_check;
alter table public.batches add constraint batches_status_check check(status in ('needs-information','active','withdrawn','recalled','expired','sold-out','discarded','merged'));
grant select(photo) on public.food_items to anon,authenticated;
grant select(photo,corrected_prepared_at) on public.batches to anon,authenticated;

create table private.vendor_requests(actor_id uuid not null,request_id uuid not null,fingerprint text not null,result uuid not null,primary key(actor_id,request_id));
create table private.media_secret(singleton boolean primary key default true check(singleton),secret text not null check(length(secret)>=32));
-- Provision the same random secret here and in MEDIA_SIGNING_SECRET using the guarded operator.
create table private.listing_uploads(object_key text primary key,actor_id uuid not null,stall_id uuid not null references public.stalls(id) on delete cascade,expires_at timestamptz not null default now()+interval '5 minutes',ready boolean not null default false,attached boolean not null default false);
revoke all on all tables in schema private from anon,authenticated;
create function private.valid_media_signature(p_key text,p_stage text,p_signature text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.media_secret where encode(extensions.hmac(p_stage||':'||p_key,secret,'sha256'),'hex')=p_signature)
$$;
create function public.authorize_listing_photo(p_key text,p_stage text,p_signature text) returns void
language plpgsql security definer set search_path='' as $$
declare stall uuid;
begin
 if auth.uid() is null or not private.valid_media_signature(p_key,p_stage,p_signature) then raise exception 'Invalid upload authorization' using errcode='42501'; end if;
 if p_key !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$' then raise exception 'Invalid media path' using errcode='22023'; end if;
 stall=split_part(p_key,'/',1)::uuid;
 if not private.owns_stall(stall) or split_part(p_key,'/',2)<>auth.uid()::text then raise exception 'Media owner mismatch' using errcode='42501'; end if;
 if p_stage='authorize' then
  insert into private.listing_uploads(object_key,actor_id,stall_id) values(p_key,auth.uid(),stall);
 elsif p_stage='complete' then
  update private.listing_uploads set ready=true where object_key=p_key and actor_id=auth.uid() and expires_at>now();
  if not found then raise exception 'Upload ticket expired' using errcode='22023'; end if;
 else raise exception 'Invalid upload stage' using errcode='22023'; end if;
end $$;
create function private.upload_allowed(p_key text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.listing_uploads where object_key=p_key and actor_id=auth.uid() and expires_at>now() and not ready and not attached) and private.listing_path_owned(p_key)
$$;
create function private.upload_deletable(p_key text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.listing_uploads where object_key=p_key and actor_id=auth.uid() and not attached) and private.listing_path_owned(p_key)
$$;
drop policy listing_insert on storage.objects;
drop policy listing_update on storage.objects;
drop policy listing_delete on storage.objects;
create policy listing_insert on storage.objects for insert to authenticated with check(bucket_id='listing-media' and private.upload_allowed(name));
create policy listing_delete on storage.objects for delete to authenticated using(bucket_id='listing-media' and private.upload_deletable(name));
-- No UPDATE policy: an approved original image cannot be overwritten.
update storage.buckets set allowed_mime_types=array['image/jpeg'],file_size_limit=1048576 where id='listing-media';
create function public.check_listing_cleanup(p_key text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from private.listing_uploads where object_key=p_key and actor_id=auth.uid() and not attached) then raise exception 'Photo is attached or unavailable' using errcode='42501'; end if;
end $$;
revoke all on function public.check_listing_cleanup(text) from public;
grant execute on function public.check_listing_cleanup(text) to authenticated;
create function private.attach_listing_photo(p_key text,p_stall uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_key is null then return; end if;
 update private.listing_uploads set attached=true where object_key=p_key and stall_id=p_stall and actor_id=auth.uid() and ready;
 if not found then raise exception 'Photo is not an approved upload for this stall' using errcode='42501'; end if;
end $$;

create or replace function private.batch_integrity() returns trigger language plpgsql set search_path='' as $$
begin
 if row(new.id,new.food_item_id,new.batch_number,new.prepared_at,new.uploaded_at,new.original_quantity,new.request_id,new.request_hash,new.photo)
    is distinct from row(old.id,old.food_item_id,old.batch_number,old.prepared_at,old.uploaded_at,old.original_quantity,old.request_id,old.request_hash,old.photo) then
  raise exception 'Batch identity, photo and original history are immutable' using errcode='23514'; end if;
 if old.advisory_deadline is not null and (new.advisory_deadline is null or new.advisory_deadline>old.advisory_deadline) then raise exception 'Deadline cannot extend' using errcode='23514'; end if;
 if new.corrected_prepared_at is not null and new.corrected_prepared_at>coalesce(old.corrected_prepared_at,old.prepared_at) then raise exception 'Correction cannot move preparation later' using errcode='23514'; end if;
 if old.corrected_prepared_at is not null and new.corrected_prepared_at is null then raise exception 'Correction cannot be erased' using errcode='23514'; end if;
 return new;
end $$;

create function public.vendor_workspace() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'stalls',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'market_id',s.market_id,'name',s.name,'category',s.category,'specialty',s.specialty,'price_sen',s.price_sen,'halal',s.halal,'open',s.open,'lot',s.lot,'opens',s.opens,'closes',s.closes,'latitude',extensions.st_y(s.location::extensions.geometry),'longitude',extensions.st_x(s.location::extensions.geometry),'photo',s.photo)) from public.stalls s where private.owns_stall(s.id)),'[]'::jsonb),
  'foods',coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'stall_id',f.stall_id,'name',f.name,'price_sen',f.price_sen,'ingredients',f.ingredients,'photo',f.photo)) from public.food_items f where private.owns_stall(f.stall_id)),'[]'::jsonb),
  'batches',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'food_item_id',b.food_item_id,'batch_number',b.batch_number,'prepared_at',b.prepared_at,'uploaded_at',b.uploaded_at,'original_quantity',b.original_quantity,'remaining_quantity',b.remaining_quantity,'corrected_prepared_at',b.corrected_prepared_at,'advisory_deadline',b.advisory_deadline,'status',b.status,'handling',b.handling,'photo',b.photo)) from public.batches b join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'[]'::jsonb),
  'events',coalesce((select jsonb_agg(jsonb_build_object('batch_id',e.batch_id,'kind',e.kind,'at',e.created_at,'details',e.details)) from public.batch_events e join public.batches b on b.id=e.batch_id join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'[]'::jsonb),'requests','{}'::jsonb)
 where private.has_role('vendor') or private.has_role('admin')
$$;

create function public.vendor_command(p_kind text,p_data jsonb,p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare fingerprint text; previous private.vendor_requests; result uuid; target public.batches; item public.food_items;
 stall uuid; food uuid; object_id uuid; photo text; quantity integer; prepared timestamptz; deadline timestamptz; earliest timestamptz;
 action text; sources uuid[]; source_count integer; expected integer; old_photo text;
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501'; end if;
 if p_request_id is null or p_data is null or jsonb_typeof(p_data)<>'object' then raise exception 'Invalid command' using errcode='22023'; end if;
 -- Serialize retries for this actor; food locks additionally coordinate staff/vendor concurrency.
 perform 1 from public.profiles where id=auth.uid() for update;
 fingerprint=encode(extensions.digest(jsonb_build_array(p_kind,p_data)::text,'sha256'),'hex');
 select * into previous from private.vendor_requests where actor_id=auth.uid() and request_id=p_request_id;
 if found then if previous.fingerprint<>fingerprint then raise exception 'Retry conflict' using errcode='23505'; end if; return previous.result; end if;
 photo=p_data->>'photo';
 if p_kind in ('stall','food') and (length(coalesce(p_data->>'name','')) not between 2 and 100 or (p_data->>'price_sen')::integer is null or (p_data->>'price_sen')::integer not between 0 and 100000000) then raise exception 'Invalid listing' using errcode='22023'; end if;
 if p_kind='stall' and (length(coalesce(p_data->>'category','')) not between 1 and 60 or length(coalesce(p_data->>'specialty','')) not between 1 and 150 or length(coalesce(p_data->>'lot',''))>60 or coalesce(p_data->>'opens','') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(p_data->>'closes','') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$' or ((p_data->>'latitude' is null)<>(p_data->>'longitude' is null)) or (p_data->>'latitude')::float not between -90 and 90 or (p_data->>'longitude')::float not between -180 and 180) then raise exception 'Invalid stall placement or hours' using errcode='22023'; end if;
 if p_kind='food' and (jsonb_typeof(p_data->'ingredients') is distinct from 'array' or jsonb_array_length(p_data->'ingredients')>40 or exists(select 1 from jsonb_array_elements_text(p_data->'ingredients') where length(value) not between 1 and 80)) then raise exception 'Invalid ingredients' using errcode='22023'; end if;
 if p_kind='stall' then
  object_id=(p_data->>'id')::uuid;
  if not exists(select 1 from public.markets where id=(p_data->>'market_id')::uuid and published) then raise exception 'Market unavailable' using errcode='22023'; end if;
  select photo into old_photo from public.stalls where id=object_id for update;
  if found then if not private.owns_stall(object_id) then raise exception 'Owner required' using errcode='42501'; end if;
  else
   insert into public.stalls(id,market_id,name,category,specialty,price_sen,published) values(object_id,(p_data->>'market_id')::uuid,p_data->>'name',p_data->>'category',p_data->>'specialty',(p_data->>'price_sen')::integer,true);
   insert into public.stall_memberships(stall_id,user_id,membership) values(object_id,auth.uid(),'owner');
  end if;
  if photo is distinct from old_photo then perform private.attach_listing_photo(photo,object_id); end if;
  update public.stalls set market_id=(p_data->>'market_id')::uuid,name=p_data->>'name',category=p_data->>'category',specialty=p_data->>'specialty',price_sen=(p_data->>'price_sen')::integer,halal=p_data->>'halal',open=(p_data->>'open')::boolean,lot=p_data->>'lot',opens=p_data->>'opens',closes=p_data->>'closes',photo=photo,
   location=case when p_data->>'latitude' is null then null else extensions.st_setsrid(extensions.st_makepoint((p_data->>'longitude')::float,(p_data->>'latitude')::float),4326)::extensions.geography end where id=object_id;
  result=object_id;
 elsif p_kind='food' then
  stall=(p_data->>'stall_id')::uuid;object_id=(p_data->>'id')::uuid;
  if not private.owns_stall(stall) then raise exception 'Owner required' using errcode='42501'; end if;
  select * into item from public.food_items where id=object_id for update;
  if found and item.stall_id<>stall then raise exception 'Food owner mismatch' using errcode='42501'; end if;
  if not found or photo is distinct from item.photo then perform private.attach_listing_photo(photo,stall); end if;
  insert into public.food_items(id,stall_id,name,price_sen,ingredients,published,photo) values(object_id,stall,p_data->>'name',(p_data->>'price_sen')::integer,array(select jsonb_array_elements_text(p_data->'ingredients')),true,photo)
   on conflict(id) do update set name=excluded.name,price_sen=excluded.price_sen,ingredients=excluded.ingredients,photo=excluded.photo;
  result=object_id;
 elsif p_kind='batch' then
  food=(p_data->>'food_item_id')::uuid;select * into item from public.food_items where id=food for update;
  if not found or not private.owns_stall(item.stall_id) then raise exception 'Owner required' using errcode='42501'; end if;
  prepared=(p_data->>'prepared_at')::timestamptz;quantity=(p_data->>'quantity')::integer;
  if prepared is null or prepared>now() or (quantity is not null and (quantity<1 or quantity>100000)) or jsonb_typeof(p_data->'handling') is distinct from 'object' then raise exception 'Invalid batch' using errcode='22023'; end if;
  perform private.attach_listing_photo(photo,item.stall_id);
  insert into public.batches(food_item_id,batch_number,prepared_at,original_quantity,remaining_quantity,handling,photo,request_id,request_hash)
   values(food,item.next_batch_number,prepared,quantity,quantity,p_data->'handling',photo,p_request_id,fingerprint) returning id into result;
  update public.food_items set next_batch_number=next_batch_number+1 where id=food;
  insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(result,auth.uid(),'created-needs-policy',p_request_id,jsonb_build_object('quantity',quantity));
 elsif p_kind='action' then
  object_id=(p_data->>'batch_id')::uuid;select food_item_id into food from public.batches where id=object_id;
  select * into item from public.food_items where id=food for update;
  if not found or not private.owns_stall(item.stall_id) then raise exception 'Owner required' using errcode='42501'; end if;
  select * into target from public.batches where id=object_id for update;action=p_data->>'action';result=object_id;
  if action='correct' then
   prepared=(p_data->>'prepared_at')::timestamptz;earliest=coalesce(target.corrected_prepared_at,target.prepared_at);
   if prepared is null or prepared>earliest then raise exception 'Correction must move earlier' using errcode='22023'; end if;
   update public.batches set corrected_prepared_at=prepared,advisory_deadline=advisory_deadline-(earliest-prepared) where id=object_id;
  elsif action='available' then
   if target.status<>'withdrawn' or target.remaining_quantity is null or target.remaining_quantity<=0 or target.policy_id is null or target.advisory_deadline is null or target.advisory_deadline<=now() then raise exception 'Original policy window required' using errcode='22023'; end if;
   update public.batches set status='active' where id=object_id;
  else
   if (target.status not in ('active','needs-information') or (target.advisory_deadline is not null and target.advisory_deadline<=now())) and not(action='discarded' and target.status in ('withdrawn','expired','active','needs-information')) then raise exception 'Batch is closed' using errcode='22023'; end if;
   if action='consume' then
    quantity=(p_data->>'quantity')::integer;
    if quantity is null or quantity<=0 or target.remaining_quantity is null or quantity>target.remaining_quantity then raise exception 'Insufficient stock' using errcode='22023'; end if;
    update public.batches set remaining_quantity=remaining_quantity-quantity,status=case when remaining_quantity=quantity then 'sold-out' else status end where id=object_id;
   elsif action in ('sold-out','withdrawn','discarded') then
    if action='sold-out' and target.remaining_quantity is null then raise exception 'Stock unknown' using errcode='22023'; end if;
    update public.batches set status=action,remaining_quantity=case when action='sold-out' then 0 else remaining_quantity end where id=object_id;
   else raise exception 'Invalid action' using errcode='22023'; end if;
  end if;
  update public.promotions set status='withdrawn' where batch_id=object_id and status='active';
  insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(object_id,auth.uid(),action,p_request_id,(p_data-'batch_id')||jsonb_build_object('remaining',(select remaining_quantity from public.batches where id=object_id)));
 elsif p_kind='merge' then
  select array_agg(distinct value::uuid order by value::uuid) into sources from jsonb_array_elements_text(p_data->'source_ids');expected=cardinality(sources);
  if expected is null or expected<2 or expected>20 then raise exception 'Select 2 to 20 batches' using errcode='22023'; end if;
  select food_item_id into food from public.batches where id=sources[1];select * into item from public.food_items where id=food for update;
  if not found or not private.owns_stall(item.stall_id) then raise exception 'Owner required' using errcode='42501'; end if;
  perform 1 from public.batches where id=any(sources) order by id for update;
  select count(*),min(coalesce(corrected_prepared_at,prepared_at)),case when count(advisory_deadline)=count(*) then min(advisory_deadline) else null end,case when count(remaining_quantity)=count(*) then sum(remaining_quantity)::integer else null end
   into source_count,earliest,deadline,quantity from public.batches where id=any(sources) and food_item_id=food and status in ('active','needs-information') and (advisory_deadline is null or advisory_deadline>now());
  if source_count<>expected or quantity>100000 or quantity=0 then raise exception 'Incompatible source batches' using errcode='22023'; end if;
  insert into public.batches(food_item_id,batch_number,prepared_at,original_quantity,remaining_quantity,handling,advisory_deadline,request_id,request_hash)
   values(food,item.next_batch_number,earliest,quantity,quantity,'{"storage":"unknown","note":"Merged; policy must be reevaluated"}',deadline,p_request_id,fingerprint) returning id into result;
  update public.food_items set next_batch_number=next_batch_number+1 where id=food;
  update public.batches set status='merged' where id=any(sources);
  update public.promotions set status='withdrawn' where batch_id=any(sources) and status='active';
  insert into public.batch_events(batch_id,actor_id,kind,request_id,details) select unnest(sources),auth.uid(),'merged-into',p_request_id,jsonb_build_object('batch_id',result);
  insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(result,auth.uid(),'merged-from',p_request_id,jsonb_build_object('source_ids',sources));
 else raise exception 'Invalid command' using errcode='22023'; end if;
 insert into private.vendor_requests values(auth.uid(),p_request_id,fingerprint,result);return result;
end $$;
-- A NULL quantity must never pass SQL's three-valued eligibility comparisons.
create function private.promotion_batch_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare batch public.batches;
begin
 if new.status='active' then
  select * into batch from public.batches where id=new.batch_id;
  if not found or batch.status<>'active' or batch.remaining_quantity is null or batch.remaining_quantity<=0 or new.quantity_limit>batch.remaining_quantity or batch.policy_id is null or batch.advisory_deadline is null or batch.advisory_deadline<new.ends_at or new.ends_at<=now() then raise exception 'Batch ineligible for clearance' using errcode='22023'; end if;
 end if;return new;
end $$;
revoke all on function private.promotion_batch_guard() from public;
create trigger promotion_batch_guard before insert or update on public.promotions for each row execute function private.promotion_batch_guard();
-- Legacy endpoints use the same lock/idempotency/inventory rules; no bypass for closed batches.
create or replace function public.create_batch(p_food_item_id uuid,p_prepared_at timestamptz,p_quantity integer,p_handling jsonb,p_request_id uuid) returns uuid
language sql security definer set search_path='' as $$ select public.vendor_command('batch',jsonb_build_object('food_item_id',p_food_item_id,'prepared_at',p_prepared_at,'quantity',p_quantity,'handling',p_handling,'photo',null),p_request_id) $$;
create or replace function public.change_inventory(p_batch_id uuid,p_delta integer,p_request_id uuid) returns integer
language plpgsql security definer set search_path='' as $$ declare result uuid; qty integer; begin
 if p_delta is null or p_delta>=0 then raise exception 'Consume positive units' using errcode='22023'; end if;
 result=public.vendor_command('action',jsonb_build_object('batch_id',p_batch_id,'action','consume','quantity',-p_delta),p_request_id);
 select remaining_quantity into qty from public.batches where id=result;
 select coalesce((details->>'remaining')::integer,qty) into qty from public.batch_events where batch_id=result and request_id=p_request_id;return qty;
end $$;
create or replace view public.public_batches with(security_invoker=true) as select id,food_item_id,batch_number,prepared_at,uploaded_at,remaining_quantity,advisory_deadline,is_demo,photo,corrected_prepared_at from public.batches where status='active' and advisory_deadline>now() and remaining_quantity>0;
create or replace view public.public_stalls with(security_invoker=true) as select id,market_id,name,category,specialty,price_sen,halal,open,is_demo,photo,lot,opens,closes,extensions.st_y(location::extensions.geometry) as latitude,extensions.st_x(location::extensions.geometry) as longitude from public.stalls where published;
revoke all on function private.valid_media_signature(text,text,text),private.upload_allowed(text),private.upload_deletable(text),private.attach_listing_photo(text,uuid) from public;
grant execute on function private.upload_allowed(text),private.upload_deletable(text) to authenticated;
revoke all on function public.authorize_listing_photo(text,text,text),public.vendor_workspace(),public.vendor_command(text,jsonb,uuid) from public;
grant execute on function public.authorize_listing_photo(text,text,text),public.vendor_workspace(),public.vendor_command(text,jsonb,uuid) to authenticated;
commit;
