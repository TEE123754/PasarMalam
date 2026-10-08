begin;
alter function public.vendor_command(text,jsonb,uuid) set schema private;
alter function private.vendor_command(text,jsonb,uuid) rename to cp4_vendor_command;
revoke all on function private.cp4_vendor_command(text,jsonb,uuid) from public,anon,authenticated;
create function public.vendor_command(p_kind text,p_data jsonb,p_request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare targets uuid[];
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 if not exists(select 1 from private.vendor_requests where actor_id=auth.uid() and request_id=p_request_id) and (p_kind='merge' or (p_kind='action' and p_data->>'action'='available')) then
  if p_kind='merge' then select array_agg(value::uuid) into targets from jsonb_array_elements_text(p_data->'source_ids');else targets=array[(p_data->>'batch_id')::uuid];end if;
  perform 1 from public.food_items where id in (select food_item_id from public.batches where id=any(targets)) order by id for update;
  perform 1 from public.batches where id=any(targets) order by id for update;
  if exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id where b.id=any(targets) and not private.owns_stall(f.stall_id)) then raise exception 'Owner required' using errcode='42501';end if;
  if exists(select 1 from private.batch_handling_records where batch_id=any(targets) and data->>'kind'='storage') then raise exception 'Reviewed transition policy required before restoring or merging' using errcode='22023';end if;
 end if;
 return private.cp4_vendor_command(p_kind,p_data,p_request_id);
end $$;
revoke all on function public.vendor_command(text,jsonb,uuid) from public,anon;
grant execute on function public.vendor_command(text,jsonb,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
