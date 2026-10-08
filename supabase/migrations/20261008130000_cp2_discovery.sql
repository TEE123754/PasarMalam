-- CP2 additive contracts; original commands remain private compatibility helpers.
begin;
alter table public.markets add column kind text not null default 'general' check(kind in ('general','farmers'));
insert into public.categories(id,name_en,name_ms) values ('rice','Rice & noodles','Nasi & mi'),('skewers','BBQ & skewers','BBQ & sate'),('kuih','Kuih & pastries','Kuih & pastri'),('drinks','Drinks','Minuman'),('fried','Fried food','Makanan goreng'),('produce','Fresh produce','Hasil segar') on conflict(id) do update set name_en=excluded.name_en,name_ms=excluded.name_ms;
create function private.cp2_category(p_label text) returns text language sql immutable set search_path='' as $$
 select id from (values ('rice','rice'),('rice & noodles','rice'),('rice','rice'),('rice and noodles','rice'),('rice & noodles','rice'),('noodles','rice'),('nasi','rice'),('mi','rice'),('mee','rice'),('skewers','skewers'),('bbq & skewers','skewers'),('skewers','skewers'),('bbq','skewers'),('satay','skewers'),('sate','skewers'),('kuih','kuih'),('kuih & pastries','kuih'),('desserts','kuih'),('bread','kuih'),('kuih','kuih'),('pastries','kuih'),('drinks','drinks'),('drinks','drinks'),('drinks','drinks'),('minuman','drinks'),('fried','fried'),('fried food','fried'),('fried food','fried'),('goreng','fried'),('produce','produce'),('fresh produce','produce'),('fresh produce','produce'),('produce','produce'),('sayur','produce')) a(label,id) where a.label=lower(p_label) limit 1
$$;
revoke all on function private.cp2_category(text) from public,anon,authenticated;
alter table public.stalls add column category_id text references public.categories(id),add column availability_confirmed_at timestamptz;
alter table public.food_items add column plant_diet jsonb not null default '{"vegetarian":"unknown","vegan":"unknown"}',add column plant_diet_recorded_at timestamptz;
create function private.cp2_valid_plant(value jsonb) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(value)='object' and (select count(*) from jsonb_object_keys(value))=2 and value->>'vegetarian' in ('unknown','yes','no') and value->>'vegan' in ('unknown','yes','no'),false)
$$;
revoke all on function private.cp2_valid_plant(jsonb) from public,anon,authenticated;
alter table public.food_items add constraint cp2_plant_valid check(private.cp2_valid_plant(plant_diet));
-- Preserve existing recognised menu associations; assign missing legacy menu categories.
update public.stalls set category_id=private.cp2_category(category);
update public.food_items f set category_id=coalesce(private.cp2_category(f.category_id),f.category_id,s.category_id) from public.stalls s where s.id=f.stall_id;
create function private.cp2_metadata() returns trigger language plpgsql security definer set search_path='' as $$
declare prior jsonb;
begin
 if TG_TABLE_NAME='stalls' then
  if TG_OP='INSERT' or new.category is distinct from old.category then new.category_id=private.cp2_category(new.category);end if;
  if TG_OP='UPDATE' and new.open is distinct from old.open then new.availability_confirmed_at=null;end if;
 else
  if TG_OP='INSERT' and new.category_id is null then select category_id into new.category_id from public.stalls where id=new.stall_id;end if;
  prior=case when TG_OP='INSERT' then null else old.plant_diet end;
  if TG_OP='UPDATE' and new.ingredients is distinct from old.ingredients then new.plant_diet='{"vegetarian":"unknown","vegan":"unknown"}';end if;
  new.plant_diet_recorded_at=case when new.plant_diet='{"vegetarian":"unknown","vegan":"unknown"}'::jsonb then null when new.plant_diet is distinct from prior then now() else old.plant_diet_recorded_at end;
  if new.plant_diet is distinct from prior then insert into private.listing_statement_events(entity_id,entity_kind,actor_id,source,previous,statement) values(new.id,'food_items',auth.uid(),'plant-declaration',prior,new.plant_diet);end if;
 end if;
 return new;
end $$;
revoke all on function private.cp2_metadata() from public,anon,authenticated;
create trigger cp2_stall_metadata before insert or update on public.stalls for each row execute function private.cp2_metadata();
create trigger cp2_food_metadata before insert or update on public.food_items for each row execute function private.cp2_metadata();
grant select(plant_diet,plant_diet_recorded_at) on public.food_items to anon,authenticated;
create or replace view public.public_stalls with(security_invoker=true) as
 select id,market_id,name,category,specialty,price_sen,halal,open,is_demo,photo,lot,opens,closes,
 extensions.st_y(location::extensions.geometry) as latitude,extensions.st_x(location::extensions.geometry) as longitude,
 description,declarations,declarations_recorded_at,category_id,availability_confirmed_at from public.stalls where published;
alter function public.vendor_command(text,jsonb,uuid) rename to cp1_vendor_command;
alter function public.cp1_vendor_command(text,jsonb,uuid) set schema private;
revoke all on function private.cp1_vendor_command(text,jsonb,uuid) from public,anon,authenticated;
create function public.vendor_command(p_kind text,p_data jsonb,p_request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; retry boolean;
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 if p_kind in ('stall','food') and p_data ? 'category_id' and p_data->>'category_id' is not null and p_data->>'category_id' not in ('rice','skewers','kuih','drinks','fried','produce') then raise exception 'Invalid category' using errcode='22023';end if;
 if p_kind='food' and p_data ? 'plant_diet' and not private.cp2_valid_plant(p_data->'plant_diet') then raise exception 'Invalid plant declaration' using errcode='22023';end if;
 if p_kind='stall' and p_data ? 'confirm_availability' and jsonb_typeof(p_data->'confirm_availability') is distinct from 'boolean' then raise exception 'Invalid confirmation' using errcode='22023';end if;
 select exists(select 1 from private.vendor_requests where actor_id=auth.uid() and request_id=p_request_id) into retry;
 result=private.cp1_vendor_command(p_kind,p_data,p_request_id);
 if not retry then
  if p_kind='stall' then
   if p_data ? 'category_id' then update public.stalls set category_id=p_data->>'category_id' where id=result;end if;
   if p_data->>'confirm_availability'='true' then update public.stalls set availability_confirmed_at=now() where id=result;end if;
  elsif p_kind='food' then
   if p_data ? 'category_id' then update public.food_items set category_id=p_data->>'category_id' where id=result;end if;
   if p_data ? 'plant_diet' then update public.food_items set plant_diet=p_data->'plant_diet' where id=result;end if;
  end if;
 end if;
 return result;
end $$;
revoke all on function public.vendor_command(text,jsonb,uuid) from public,anon;
grant execute on function public.vendor_command(text,jsonb,uuid) to authenticated;
alter function public.vendor_workspace() rename to cp1_vendor_workspace;
alter function public.cp1_vendor_workspace() set schema private;
revoke all on function private.cp1_vendor_workspace() from public,anon,authenticated;
create function public.vendor_workspace() returns jsonb language sql stable security definer set search_path='' as $$
 select base||jsonb_build_object(
 'stalls',(select coalesce(jsonb_agg(item||jsonb_build_object('category_id',s.category_id,'availability_confirmed_at',s.availability_confirmed_at)),'[]') from jsonb_array_elements(base->'stalls') item join public.stalls s on s.id=(item->>'id')::uuid),
 'foods',(select coalesce(jsonb_agg(item||jsonb_build_object('category_id',f.category_id,'plant_diet',f.plant_diet,'plant_diet_recorded_at',f.plant_diet_recorded_at)),'[]') from jsonb_array_elements(base->'foods') item join public.food_items f on f.id=(item->>'id')::uuid))
 from (select private.cp1_vendor_workspace() as base) source where base is not null
$$;
revoke all on function public.vendor_workspace() from public,anon;
grant execute on function public.vendor_workspace() to authenticated;
-- Dedicated fictional farmer market. No new accounts, reviews or invented certification.
insert into public.markets(id,name,area,type,kind,location,display_hours,display_days,published,source_scenario) values('c0200000-0000-4000-8000-000000000001','DEMO Pasar Tani Embun','Petaling Jaya · fictional','day','farmers',extensions.st_setsrid(extensions.st_makepoint(101.61,3.12),4326)::extensions.geography,'07:00–12:00','Daily · fictional schedule',true,'cp2');
insert into public.market_schedules(market_id,weekday,opens_at,closes_at,source_scenario) select 'c0200000-0000-4000-8000-000000000001',i,'07:00','12:00','cp2' from generate_series(0,6) i;
insert into public.stalls(id,market_id,name,category,specialty,description,price_sen,published,open,lot,opens,closes,location,source_scenario) values('c0200000-0000-4000-8000-000000000002','c0200000-0000-4000-8000-000000000001','DEMO Kebun Pagi','Fresh produce','Seasonal vegetables','Fictional farmers’ stall; ask the hawker about ingredients and availability.',400,true,false,'T01','07:00','12:00',extensions.st_setsrid(extensions.st_makepoint(101.6101,3.1201),4326)::extensions.geography,'cp2');
insert into public.stall_memberships(stall_id,user_id,membership) select 'c0200000-0000-4000-8000-000000000002',user_id,'owner' from private.demo_identity_map where persona='vendor-a';
insert into public.food_items(id,stall_id,category_id,name,price_sen,ingredients,plant_diet,published,source_scenario) values('c0200000-0000-4000-8000-000000000003','c0200000-0000-4000-8000-000000000002','produce','DEMO vegetable portion',400,array['Vegetables'],'{"vegetarian":"yes","vegan":"yes"}',true,'cp2');
notify pgrst,'reload schema';
commit;
