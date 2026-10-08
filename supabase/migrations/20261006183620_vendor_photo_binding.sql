-- Rename the local photo variable; retain caller guards and immutable media rules.
begin;
create or replace function public.vendor_command(p_kind text,p_data jsonb,p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare fingerprint text; previous private.vendor_requests; result uuid; target public.batches; item public.food_items;
 stall uuid; food uuid; object_id uuid; listing_photo text; quantity integer; prepared timestamptz; deadline timestamptz; earliest timestamptz;
 action text; sources uuid[]; source_count integer; expected integer; old_photo text;
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501'; end if;
 if p_request_id is null or p_data is null or jsonb_typeof(p_data)<>'object' then raise exception 'Invalid command' using errcode='22023'; end if;
 -- Serialize retries for this actor; food locks additionally coordinate staff/vendor concurrency.
 perform 1 from public.profiles where id=auth.uid() for update;
 fingerprint=encode(extensions.digest(jsonb_build_array(p_kind,p_data)::text,'sha256'),'hex');
 select * into previous from private.vendor_requests where actor_id=auth.uid() and request_id=p_request_id;
 if found then if previous.fingerprint<>fingerprint then raise exception 'Retry conflict' using errcode='23505'; end if; return previous.result; end if;
 listing_photo=p_data->>'photo';
 if p_kind in ('stall','food') and (length(coalesce(p_data->>'name','')) not between 2 and 100 or (p_data->>'price_sen')::integer is null or (p_data->>'price_sen')::integer not between 0 and 100000000) then raise exception 'Invalid listing' using errcode='22023'; end if;
 if p_kind='stall' and (length(coalesce(p_data->>'category','')) not between 1 and 60 or length(coalesce(p_data->>'specialty','')) not between 1 and 150 or length(coalesce(p_data->>'lot',''))>60 or coalesce(p_data->>'opens','') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(p_data->>'closes','') !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$' or ((p_data->>'latitude' is null)<>(p_data->>'longitude' is null)) or (p_data->>'latitude')::float not between -90 and 90 or (p_data->>'longitude')::float not between -180 and 180) then raise exception 'Invalid stall placement or hours' using errcode='22023'; end if;
 if p_kind='food' and (jsonb_typeof(p_data->'ingredients') is distinct from 'array' or jsonb_array_length(p_data->'ingredients')>40 or exists(select 1 from jsonb_array_elements_text(p_data->'ingredients') where length(value) not between 1 and 80)) then raise exception 'Invalid ingredients' using errcode='22023'; end if;
 if p_kind='stall' then
  object_id=(p_data->>'id')::uuid;
  if not exists(select 1 from public.markets where id=(p_data->>'market_id')::uuid and published) then raise exception 'Market unavailable' using errcode='22023'; end if;
  select s.photo into old_photo from public.stalls s where id=object_id for update;
  if found then if not private.owns_stall(object_id) then raise exception 'Owner required' using errcode='42501'; end if;
  else
   insert into public.stalls(id,market_id,name,category,specialty,price_sen,published) values(object_id,(p_data->>'market_id')::uuid,p_data->>'name',p_data->>'category',p_data->>'specialty',(p_data->>'price_sen')::integer,true);
   insert into public.stall_memberships(stall_id,user_id,membership) values(object_id,auth.uid(),'owner');
  end if;
  if listing_photo is distinct from old_photo then perform private.attach_listing_photo(listing_photo,object_id); end if;
  update public.stalls set market_id=(p_data->>'market_id')::uuid,name=p_data->>'name',category=p_data->>'category',specialty=p_data->>'specialty',price_sen=(p_data->>'price_sen')::integer,halal=p_data->>'halal',open=(p_data->>'open')::boolean,lot=p_data->>'lot',opens=p_data->>'opens',closes=p_data->>'closes',photo=listing_photo,
   location=case when p_data->>'latitude' is null then null else extensions.st_setsrid(extensions.st_makepoint((p_data->>'longitude')::float,(p_data->>'latitude')::float),4326)::extensions.geography end where id=object_id;
  result=object_id;
 elsif p_kind='food' then
  stall=(p_data->>'stall_id')::uuid;object_id=(p_data->>'id')::uuid;
  if not private.owns_stall(stall) then raise exception 'Owner required' using errcode='42501'; end if;
  select * into item from public.food_items where id=object_id for update;
  if found and item.stall_id<>stall then raise exception 'Food owner mismatch' using errcode='42501'; end if;
  if not found or listing_photo is distinct from item.photo then perform private.attach_listing_photo(listing_photo,stall); end if;
  insert into public.food_items(id,stall_id,name,price_sen,ingredients,published,photo) values(object_id,stall,p_data->>'name',(p_data->>'price_sen')::integer,array(select jsonb_array_elements_text(p_data->'ingredients')),true,listing_photo)
   on conflict(id) do update set name=excluded.name,price_sen=excluded.price_sen,ingredients=excluded.ingredients,photo=excluded.photo;
  result=object_id;
 elsif p_kind='batch' then
  food=(p_data->>'food_item_id')::uuid;select * into item from public.food_items where id=food for update;
  if not found or not private.owns_stall(item.stall_id) then raise exception 'Owner required' using errcode='42501'; end if;
  prepared=(p_data->>'prepared_at')::timestamptz;quantity=(p_data->>'quantity')::integer;
  if prepared is null or prepared>now() or (quantity is not null and (quantity<1 or quantity>100000)) or jsonb_typeof(p_data->'handling') is distinct from 'object' then raise exception 'Invalid batch' using errcode='22023'; end if;
  perform private.attach_listing_photo(listing_photo,item.stall_id);
  insert into public.batches(food_item_id,batch_number,prepared_at,original_quantity,remaining_quantity,handling,photo,request_id,request_hash)
   values(food,item.next_batch_number,prepared,quantity,quantity,p_data->'handling',listing_photo,p_request_id,fingerprint) returning id into result;
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
commit;
