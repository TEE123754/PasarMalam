begin;
-- Advisory refresh must not publish Realtime events for unchanged source rows.
create or replace function private.discovery_changed() returns trigger
language plpgsql security definer set search_path='' as $$
declare row_data jsonb; target uuid; previous_market uuid;
begin
 if TG_OP='UPDATE' and to_jsonb(old) is not distinct from to_jsonb(new) then return null;end if;
 row_data=case when TG_OP='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 if TG_TABLE_NAME='markets' then target=(row_data->>'id')::uuid;
 elsif TG_TABLE_NAME in ('stalls','market_schedules','market_exceptions','check_ins') then target=(row_data->>'market_id')::uuid;
 elsif TG_TABLE_NAME in ('food_items','reviews','dietary_claims') then
   select market_id into target from public.stalls where id=(row_data->>'stall_id')::uuid;
 elsif TG_TABLE_NAME='batches' then
   select s.market_id into target from public.food_items f join public.stalls s on s.id=f.stall_id where f.id=(row_data->>'food_item_id')::uuid;
 elsif TG_TABLE_NAME='promotions' then
   select s.market_id into target from public.batches b join public.food_items f on f.id=b.food_item_id
     join public.stalls s on s.id=f.stall_id where b.id=(row_data->>'batch_id')::uuid;
 end if;
 if target is not null and exists(select 1 from public.markets where id=target) then
   insert into public.discovery_versions(market_id) values(target)
   on conflict(market_id) do update set version=public.discovery_versions.version+1,updated_at=now();
 end if;
 if TG_TABLE_NAME='stalls' and TG_OP='UPDATE' then
   if (to_jsonb(old)->>'market_id') is distinct from (to_jsonb(new)->>'market_id') then
     previous_market=(to_jsonb(old)->>'market_id')::uuid;
     update public.discovery_versions set version=version+1,updated_at=now() where market_id=previous_market;
   end if;
 end if;
 return null;
end $$;

commit;
