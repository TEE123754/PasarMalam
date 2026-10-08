-- CP1: explicit statements, append-only audit and verified customer onboarding.
begin;
create function private.valid_business_declarations(v jsonb) returns boolean
language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='object' and v ?& array['pork_free','alcohol_free','muslim_owned']
 and v-array['pork_free','alcohol_free','muslim_owned']='{}'::jsonb
 and v->>'pork_free' in ('unknown','yes','no') and v->>'alcohol_free' in ('unknown','yes','no')
 and v->>'muslim_owned' in ('unknown','yes','no'),false)
$$;
create function private.valid_allergen_statement(v jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(v) is distinct from 'object' or not(v ?& array['status','contains','cross_contact'])
 or v-array['status','contains','cross_contact']<>'{}'::jsonb or jsonb_typeof(v->'contains') is distinct from 'array'
 or coalesce(v->>'status','') not in ('unknown','confirmed') or coalesce(v->>'cross_contact','') not in ('unknown','possible') then return false; end if;
 return jsonb_array_length(v->'contains')<=10
 and (v->>'status'='confirmed' or jsonb_array_length(v->'contains')=0)
 and not exists(select 1 from jsonb_array_elements(v->'contains') a where jsonb_typeof(a) is distinct from 'string'
  or a#>>'{}' not in ('peanuts','tree-nuts','milk','eggs','soy','wheat','fish','shellfish','sesame','other'))
 and (select count(*)=count(distinct a) from jsonb_array_elements(v->'contains') a);
end $$;
revoke all on function private.valid_business_declarations(jsonb),private.valid_allergen_statement(jsonb) from public,anon,authenticated;
alter table public.stalls add column description text not null default '' check(length(description)<=1000),
 add column declarations jsonb not null default '{"pork_free":"unknown","alcohol_free":"unknown","muslim_owned":"unknown"}' check(private.valid_business_declarations(declarations)),
 add column declarations_recorded_at timestamptz;
alter table public.food_items add column allergens jsonb not null default '{"status":"unknown","contains":[],"cross_contact":"unknown"}' check(private.valid_allergen_statement(allergens)),
 add column allergens_recorded_at timestamptz;
grant select(allergens,allergens_recorded_at) on public.food_items to anon,authenticated;
create table private.listing_statement_events(
 id bigint generated always as identity primary key, entity_id uuid not null, entity_kind text not null,
 actor_id uuid, recorded_at timestamptz not null default now(), source text not null,
 previous jsonb, statement jsonb not null
);
revoke all on private.listing_statement_events from public,anon,authenticated;
create function private.listing_statement_audit() returns trigger language plpgsql security definer set search_path='' as $$
declare prior jsonb; current_statement jsonb; changed boolean;
begin
 if TG_TABLE_NAME='stalls' then
  prior=case when TG_OP='INSERT' then null else old.declarations end;current_statement=new.declarations;
  changed=current_statement is distinct from prior;
  new.declarations_recorded_at=case when changed then now() else old.declarations_recorded_at end;
 else
  prior=case when TG_OP='INSERT' then null else old.allergens end;
  -- Ingredients changed without a later explicit statement save: invalidate confirmation,
  -- including voice and any operator path. The RPC reconfirms only after this write.
  if TG_OP='UPDATE' and new.ingredients is distinct from old.ingredients then
   new.allergens='{"status":"unknown","contains":[],"cross_contact":"unknown"}'::jsonb;
  end if;
  current_statement=new.allergens;
  changed=current_statement is distinct from prior;
  new.allergens_recorded_at=case when new.allergens->>'status'<>'confirmed' then null
   when changed then now() else old.allergens_recorded_at end;
 end if;
 if changed then insert into private.listing_statement_events(entity_id,entity_kind,actor_id,source,previous,statement)
  values(new.id,TG_TABLE_NAME,auth.uid(),case when auth.uid() is null then 'operator-fixture' else 'hawker-declaration' end,prior,current_statement); end if;
 return new;
end $$;
revoke all on function private.listing_statement_audit() from public,anon,authenticated;
create trigger cp1_stall_statement before insert or update on public.stalls for each row execute function private.listing_statement_audit();
create trigger cp1_food_statement before insert or update on public.food_items for each row execute function private.listing_statement_audit();
-- Existing fictional specialties remain intact; unreviewed declarations stay unknown.
update public.stalls set description='Fictional community stall serving '||specialty||'. Ask the hawker about ingredients.' where description='' and is_demo;
create or replace view public.public_stalls with(security_invoker=true) as
 select id,market_id,name,category,specialty,price_sen,halal,open,is_demo,photo,lot,opens,closes,
 extensions.st_y(location::extensions.geometry) as latitude,extensions.st_x(location::extensions.geometry) as longitude,
 description,declarations,declarations_recorded_at from public.stalls where published;

create table private.profile_onboarding_acceptance(user_id uuid primary key references auth.users(id) on delete cascade,
 notice_version text not null, accepted_at timestamptz not null default now());
revoke all on private.profile_onboarding_acceptance from public,anon,authenticated;
create function public.onboard_customer(p_display_name text,p_locale text) returns uuid
language plpgsql security definer set search_path='' as $$
declare confirmed timestamptz;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 select email_confirmed_at into confirmed from auth.users where id=auth.uid();
 if confirmed is null then raise exception 'Verified email required' using errcode='42501'; end if;
 if length(trim(coalesce(p_display_name,''))) not between 2 and 80 or coalesce(p_locale,'') not in ('en','ms') then raise exception 'Invalid profile' using errcode='22023'; end if;
 -- Never read browser mode, requested roles or raw user metadata to grant privileges.
 insert into public.profiles(id,display_name,locale,verified_at,source_scenario)
 values(auth.uid(),trim(p_display_name),p_locale,confirmed,'cp1-invited-fictional')
 on conflict(id) do update set display_name=excluded.display_name,locale=excluded.locale;
 insert into public.user_roles(user_id,role) values(auth.uid(),'customer') on conflict do nothing;
 insert into private.profile_onboarding_acceptance(user_id,notice_version) values(auth.uid(),'cp1-draft-2026-10-08') on conflict do nothing;
 return auth.uid();
end $$;
revoke all on function public.onboard_customer(text,text) from public,anon;
grant execute on function public.onboard_customer(text,text) to authenticated;

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
 if p_kind='stall' and ((p_data ? 'description' and (jsonb_typeof(p_data->'description') is distinct from 'string' or length(p_data->>'description')>1000)) or (p_data ? 'declarations' and not private.valid_business_declarations(p_data->'declarations'))) then raise exception 'Invalid stall statement' using errcode='22023'; end if;
 if p_kind='food' and p_data ? 'allergens' and not private.valid_allergen_statement(p_data->'allergens') then raise exception 'Invalid allergen statement' using errcode='22023'; end if;
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
  update public.stalls set market_id=(p_data->>'market_id')::uuid,name=p_data->>'name',category=p_data->>'category',specialty=p_data->>'specialty',description=case when p_data ? 'description' then trim(p_data->>'description') else description end,declarations=case when p_data ? 'declarations' then p_data->'declarations' else declarations end,price_sen=(p_data->>'price_sen')::integer,halal=p_data->>'halal',open=(p_data->>'open')::boolean,lot=p_data->>'lot',opens=p_data->>'opens',closes=p_data->>'closes',photo=listing_photo,
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
  -- Explicit vendor reconfirmation is a separate statement write after ingredient invalidation.
  if p_data ? 'allergens' then update public.food_items set allergens=p_data->'allergens' where id=object_id; end if;
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

create or replace function public.vendor_workspace() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'stalls',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'market_id',s.market_id,'name',s.name,'category',s.category,'specialty',s.specialty,'description',s.description,'declarations',s.declarations,'declarations_recorded_at',s.declarations_recorded_at,'price_sen',s.price_sen,'halal',s.halal,'open',s.open,'lot',s.lot,'opens',s.opens,'closes',s.closes,'latitude',extensions.st_y(s.location::extensions.geometry),'longitude',extensions.st_x(s.location::extensions.geometry),'photo',s.photo)) from public.stalls s where private.owns_stall(s.id)),'[]'::jsonb),
  'foods',coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'stall_id',f.stall_id,'name',f.name,'price_sen',f.price_sen,'ingredients',f.ingredients,'allergens',f.allergens,'allergens_recorded_at',f.allergens_recorded_at,'photo',f.photo)) from public.food_items f where private.owns_stall(f.stall_id)),'[]'::jsonb),
  'batches',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'food_item_id',b.food_item_id,'batch_number',b.batch_number,'prepared_at',b.prepared_at,'uploaded_at',b.uploaded_at,'original_quantity',b.original_quantity,'remaining_quantity',b.remaining_quantity,'corrected_prepared_at',b.corrected_prepared_at,'advisory_deadline',b.advisory_deadline,'status',b.status,'handling',b.handling,'photo',b.photo)) from public.batches b join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'[]'::jsonb),
  'events',coalesce((select jsonb_agg(jsonb_build_object('batch_id',e.batch_id,'kind',e.kind,'at',e.created_at,'details',e.details)) from public.batch_events e join public.batches b on b.id=e.batch_id join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'[]'::jsonb),'requests','{}'::jsonb)
 where private.has_role('vendor') or private.has_role('admin')
$$;


notify pgrst, 'reload schema';
commit;
