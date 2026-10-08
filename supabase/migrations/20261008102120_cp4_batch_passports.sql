begin;
create table private.batch_handling_records(
 id uuid primary key default gen_random_uuid(), batch_id uuid not null references public.batches(id) on delete cascade,
 actor_id uuid not null,request_id uuid not null,data jsonb not null,recorded_at timestamptz not null default now(),unique(actor_id,request_id));
create index cp4_handling_batch on private.batch_handling_records(batch_id,recorded_at,id);
alter table private.batch_handling_records enable row level security;
revoke all on private.batch_handling_records from public,anon,authenticated;
-- Keep the accepted ambient algorithm intact. All transitions remain gated until a reviewed policy exists.
alter function private.evaluate_batch(uuid) rename to cp4_ambient_evaluate;
create function private.evaluate_batch(p_batch uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare decision jsonb;
begin
 decision=private.cp4_ambient_evaluate(p_batch);
 if exists(select 1 from private.batch_handling_records where batch_id=p_batch and data->>'kind'='storage') then
  decision=decision||jsonb_build_object('eligible',false,'handling_gate','CP4_REVIEW_REQUIRED','cumulative_exposure',null,'reasons',coalesce(decision->'reasons','[]'::jsonb)||jsonb_build_array('Storage history requires reviewed transition policy; clearance blocked'));
  update public.batches set status=case when inventory_state<>'available' then inventory_state when advisory_deadline<=private.clock_now() then 'expired' else 'needs-information' end where id=p_batch;
  update public.batch_advisories set result=decision where batch_id=p_batch;
  update public.promotions set status='withdrawn' where batch_id=p_batch and status='active';
 end if;
 return decision;
end $$;
revoke all on function private.evaluate_batch(uuid) from public,anon,authenticated;
create function public.batch_handling_record(p_batch uuid,p_data jsonb,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare b public.batches;f public.food_items; prior private.batch_handling_records; effective timestamptz; value_c numeric;result uuid; original private.batch_handling_records;
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 if p_request is null or jsonb_typeof(p_data) is distinct from 'object' or p_data->>'kind' is null or p_data->>'kind' not in ('storage','temperature') or length(p_data::text)>3000 or exists(select 1 from jsonb_object_keys(p_data) k where k not in ('kind','effective_at','storage','value','unit','method','source','note','supersedes')) or p_data->>'source' is distinct from 'manual' or length(coalesce(p_data->>'note',''))>250 or coalesce(p_data->>'effective_at','') !~ '(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'Invalid handling record' using errcode='22023';end if;
 effective=(p_data->>'effective_at')::timestamptz;
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into f from public.food_items where id=(select food_item_id from public.batches where id=p_batch) for update;
 if not found or not private.owns_stall(f.stall_id) then raise exception 'Owned batch required' using errcode='42501';end if;
 select * into b from public.batches where id=p_batch for update;
 select * into prior from private.batch_handling_records where actor_id=auth.uid() and request_id=p_request;
 if found then if prior.batch_id<>p_batch or prior.data<>p_data then raise exception 'Retry conflict' using errcode='23505';end if;return prior.id;end if;
 if effective<coalesce(b.corrected_prepared_at,b.prepared_at) or effective>private.clock_now() then raise exception 'Record time must be between preparation and now' using errcode='22023';end if;
 if p_data->>'kind'='storage' then
  if p_data->>'storage' is null or p_data->>'storage' not in ('ambient','chilled','hot-held','unknown') or p_data->'value' not in ('null'::jsonb) then raise exception 'Invalid storage' using errcode='22023';end if;
 else
  if p_data->>'storage' is not null or jsonb_typeof(p_data->'value') is distinct from 'number' or p_data->>'unit' is null or p_data->>'unit' not in ('C','F') or p_data->>'method' is null or length(trim(p_data->>'method')) not between 2 and 100 then raise exception 'Measured value, unit and method required' using errcode='22023';end if;
  value_c=(p_data->>'value')::numeric;if p_data->>'unit'='F' then value_c=(value_c-32)*5/9;end if;
  if value_c not between -100 and 300 then raise exception 'Invalid measurement range' using errcode='22023';end if;
 end if;
 if p_data->>'supersedes' is not null then
  select * into original from private.batch_handling_records where id=(p_data->>'supersedes')::uuid and batch_id=p_batch and data->>'kind'=p_data->>'kind';
  if not found or length(trim(coalesce(p_data->>'note','')))<2 or exists(select 1 from private.batch_handling_records where data->>'supersedes'=original.id::text) then raise exception 'Correction needs same-batch original, reason and no prior correction' using errcode='22023';end if;
 end if;
 insert into private.batch_handling_records(batch_id,actor_id,request_id,data) values(p_batch,auth.uid(),p_request,p_data) returning id into result;
 insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(p_batch,auth.uid(),'handling-recorded',p_request,jsonb_build_object('record_id',result,'kind',p_data->>'kind','effective_at',effective,'source','manual','policy_gate','review-required'));
 perform private.evaluate_batch(p_batch);
 return result;
end $$;
create function public.batch_handling_history(p_batch uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.batches b join public.food_items f on f.id=b.food_item_id where b.id=p_batch and private.owns_stall(f.stall_id)) then raise exception 'Owned batch required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'actor',actor_id,'recorded_at',recorded_at,'data',data) order by recorded_at,id) from private.batch_handling_records where batch_id=p_batch),'[]'::jsonb);
end $$;
create function public.batch_passport(p_batch uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare b public.batches;f public.food_items;s public.stalls;blocked boolean;
begin
 select * into b from public.batches where id=p_batch;
 if not found then return null;end if;
 select * into f from public.food_items where id=b.food_item_id and published;
 if not found then return null;end if;
 select * into s from public.stalls where id=f.stall_id and published;
 if not found or not exists(select 1 from public.markets where id=s.market_id and published) then return null;end if;
 blocked=exists(select 1 from private.batch_handling_records where batch_id=p_batch and data->>'kind'='storage');
 return jsonb_build_object('id',b.id,'stall_id',s.id,'stall',s.name,'dish',f.name,'batch_number',b.batch_number,'prepared_at',b.prepared_at,'corrected_prepared_at',b.corrected_prepared_at,'recorded_at',b.uploaded_at,'server_now',private.clock_now(),'deadline',b.advisory_deadline,'remaining',b.remaining_quantity,'status',case when b.inventory_state<>'available' then b.inventory_state when b.advisory_deadline<=private.clock_now() then 'expired' when blocked then 'needs-information' else b.status end,'eligible',coalesce(not blocked and b.status='active' and b.inventory_state='available' and b.advisory_deadline>private.clock_now() and b.remaining_quantity>0,false),'storage_review_required',blocked,'policy_approval','synthetic-demo-only','handling_record_count',(select count(*) from private.batch_handling_records where batch_id=p_batch),'temperature_record_count',(select count(*) from private.batch_handling_records where batch_id=p_batch and data->>'kind'='temperature'),'cumulative_exposure',null);
end $$;
revoke all on function public.batch_handling_record(uuid,jsonb,uuid),public.batch_handling_history(uuid) from public,anon;
grant execute on function public.batch_handling_record(uuid,jsonb,uuid),public.batch_handling_history(uuid) to authenticated;
revoke all on function public.batch_passport(uuid) from public;
grant execute on function public.batch_passport(uuid) to anon,authenticated;
notify pgrst,'reload schema';
commit;
