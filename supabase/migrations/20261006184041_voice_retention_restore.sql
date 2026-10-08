begin;
-- Serialize scheduled inspection with operator reset; preserve timestamps and grants.
create or replace function private.closing_tick() returns void language plpgsql security definer set search_path='' as $$ declare b record;started timestamptz=clock_timestamp();counted integer=0;begin
 perform pg_advisory_xact_lock(517011);
 for b in select x.id from public.batches x join public.food_items f on f.id=x.food_item_id where x.inventory_state='available' order by f.id,x.id limit 1000 loop perform private.inspect_batch(b.id);counted=counted+1;end loop;
 update public.promotions set status='expired' where status='active' and ends_at<=private.clock_now();
 insert into private.agent_runs values(gen_random_uuid(),'closing-tick',started,extract(epoch from clock_timestamp()-started)*1000,jsonb_build_object('batches',counted)); delete from private.voice_attempts where at<now()-interval '1 hour';
 delete from public.extraction_runs where source_scenario='phase6' and confirmed_at<now()-interval '30 days';
end $$;

commit;
