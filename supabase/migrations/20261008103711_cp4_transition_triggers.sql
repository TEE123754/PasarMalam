begin;
-- Trigger boundaries survive later CREATE OR REPLACE of an older command implementation.
create function private.cp4_restore_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='withdrawn' and new.status='active' and exists(select 1 from private.batch_handling_records where batch_id=new.id and data->>'kind'='storage') then raise exception 'Reviewed transition policy required before restoring' using errcode='22023';end if;
 return new;
end $$;
create function private.cp4_merge_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.kind='merged-from' and exists(select 1 from private.batch_handling_records where batch_id in (select value::uuid from jsonb_array_elements_text(new.details->'source_ids')) and data->>'kind'='storage') then raise exception 'Reviewed transition policy required before merging' using errcode='22023';end if;
 return new;
end $$;
revoke all on function private.cp4_restore_guard(),private.cp4_merge_guard() from public,anon,authenticated;
create trigger cp4_restore_guard before update of status on public.batches for each row execute function private.cp4_restore_guard();
create trigger cp4_merge_guard before insert on public.batch_events for each row execute function private.cp4_merge_guard();
commit;
