begin;
create or replace function public.confirm_voice_workflow(p_action text,p_food jsonb,p_batch jsonb,p_batch_id uuid,p_expected integer,p_remaining integer,p_unit text,p_transcript text,p_history jsonb,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; fingerprint text; previous private.cp3_voice_requests; target public.batches; item public.food_items;
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 if p_request is null or p_action is null or p_unit is null or jsonb_typeof(p_food) is distinct from 'object' or p_action not in ('create_batch','update_food','update_stock') or p_unit not in ('portion','unit','stick','pack') or p_transcript is null or length(p_transcript)>1000 or jsonb_typeof(p_history) is distinct from 'array' or jsonb_array_length(p_history)>30 or length(p_history::text)>12000 then raise exception 'Invalid voice command' using errcode='22023';end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 fingerprint=encode(extensions.digest(jsonb_build_array(p_action,p_food,p_batch,p_batch_id,p_expected,p_remaining,p_unit,p_transcript,p_history)::text,'sha256'),'hex');
 select * into previous from private.cp3_voice_requests where actor_id=auth.uid() and request_id=p_request;
 if found then if previous.fingerprint<>fingerprint then raise exception 'Retry conflict' using errcode='23505';end if;return previous.result;end if;
 select * into item from public.food_items where id=(p_food->>'id')::uuid for update;
 if not found or item.stall_id is distinct from (p_food->>'stall_id')::uuid or not private.owns_stall(item.stall_id) then raise exception 'Exact owned dish required' using errcode='42501';end if;
 if p_action='create_batch' then
  result=public.confirm_voice_listing(p_food-'allergens'-'plant_diet'-'allergens_recorded_at'-'plant_diet_recorded_at',p_batch,p_transcript,md5(p_request::text||':create')::uuid);
 elsif p_action='update_food' then
  result=public.vendor_command('food',p_food-'allergens'-'plant_diet'-'allergens_recorded_at'-'plant_diet_recorded_at',md5(p_request::text||':menu')::uuid);
 else
  select * into target from public.batches where id=p_batch_id and food_item_id=item.id for update;
  if not found then raise exception 'Exact owned batch required' using errcode='42501';end if;
  if p_expected is null or p_remaining is null or target.remaining_quantity is distinct from p_expected or p_remaining<0 or p_remaining>p_expected or target.status not in ('active','needs-information') or target.advisory_deadline<=now() then raise exception 'Stock changed, unknown or batch closed; refresh' using errcode='40001';end if;
  result=target.id;
  if p_remaining<p_expected then perform public.vendor_command('action',jsonb_build_object('batch_id',target.id,'action','consume','quantity',p_expected-p_remaining),md5(p_request::text||':stock')::uuid);end if;
  insert into public.batch_events(batch_id,actor_id,kind,request_id,details) values(target.id,auth.uid(),'voice-stock-confirmed',p_request,jsonb_build_object('remaining',p_remaining,'unit',p_unit,'original_prepared_at',target.prepared_at));
 end if;
 insert into private.cp3_voice_requests values(auth.uid(),p_request,fingerprint,result);
 insert into public.extraction_runs(owner_id,stall_id,transcript,extracted,confirmed_at,status,source_scenario) values(auth.uid(),item.stall_id,p_transcript,jsonb_build_object('action',p_action,'result',result,'history',p_history,'unit',p_unit,'confirmation_schema','CONFIRMED_WORKFLOW_V3'),now(),'confirmed','phase6');
 return result;
end $$;
notify pgrst,'reload schema';
commit;
