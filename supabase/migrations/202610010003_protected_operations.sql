begin;
-- These functions use a definer only because raw protected writes are revoked.
-- Every function checks auth.uid() against trusted tables, uses a fixed empty path,
-- and is granted only to authenticated. Metadata never supplies a business role.
create function public.update_profile(p_display_name text,p_locale text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  update public.profiles set display_name=p_display_name,locale=p_locale where id=auth.uid();
  if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
end $$;

create function public.create_batch(p_food_item_id uuid,p_prepared_at timestamptz,p_quantity integer,
  p_handling jsonb,p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare item public.food_items; previous public.batches; result uuid; fingerprint text;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  select * into item from public.food_items where id=p_food_item_id for update;
  if not found or not private.owns_stall(item.stall_id) then
    raise exception 'Stall access denied' using errcode='42501'; end if;
  if p_prepared_at is null or p_prepared_at>now() or p_quantity is null or p_quantity<=0
    or p_handling is null or jsonb_typeof(p_handling)<>'object' or p_request_id is null then
    raise exception 'Invalid batch input' using errcode='22023'; end if;
  fingerprint=encode(extensions.digest(jsonb_build_array(p_prepared_at,p_quantity,p_handling)::text,'sha256'),'hex');
  select * into previous from public.batches where food_item_id=p_food_item_id and request_id=p_request_id;
  if found then
    if previous.request_hash<>fingerprint then raise exception 'Idempotency key conflict' using errcode='23505'; end if;
    return previous.id;
  end if;
  insert into public.batches(food_item_id,batch_number,prepared_at,original_quantity,remaining_quantity,
    handling,request_id,request_hash)
    values(item.id,item.next_batch_number,p_prepared_at,p_quantity,p_quantity,p_handling,p_request_id,fingerprint)
    returning id into result;
  update public.food_items set next_batch_number=next_batch_number+1 where id=item.id;
  insert into public.batch_events(batch_id,actor_id,kind,request_id)
    values(result,auth.uid(),'created-needs-policy',p_request_id);
  -- No guessed advisory deadline: Phase 5 supplies deterministic policy decisions.
  return result;
end $$;

create function public.change_inventory(p_batch_id uuid,p_delta integer,p_request_id uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare target public.batches; stall uuid; previous public.batch_events; remaining integer;
begin
  select * into target from public.batches where id=p_batch_id for update;
  select stall_id into stall from public.food_items where id=target.food_item_id;
  if auth.uid() is null or not found or not private.owns_stall(stall) then
    raise exception 'Stall access denied' using errcode='42501'; end if;
  select * into previous from public.batch_events where batch_id=p_batch_id and request_id=p_request_id;
  if found then
    if previous.kind<>'inventory' or (previous.details->>'delta')::integer is distinct from p_delta then
      raise exception 'Idempotency key conflict' using errcode='23505'; end if;
    return (previous.details->>'remaining')::integer;
  end if;
  if p_delta is null or p_delta>=0 or p_request_id is null or target.remaining_quantity+p_delta<0 then
    raise exception 'Stock change must consume existing units' using errcode='22023'; end if;
  remaining=target.remaining_quantity+p_delta;
  update public.batches set remaining_quantity=remaining,
    status=case when remaining=0 then 'sold-out' else status end where id=p_batch_id;
  if remaining=0 then update public.promotions set status='withdrawn' where batch_id=p_batch_id and status='active'; end if;
  insert into public.batch_events(batch_id,actor_id,kind,request_id,details)
    values(p_batch_id,auth.uid(),'inventory',p_request_id,jsonb_build_object('delta',p_delta,'remaining',remaining));
  return remaining;
end $$;

create function public.create_promotion(p_batch_id uuid,p_title text,p_price_sen integer,
  p_quantity integer,p_ends_at timestamptz,p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare target public.batches; stall uuid; previous public.promotions; result uuid; fingerprint text;
begin
  select * into target from public.batches where id=p_batch_id for update;
  select stall_id into stall from public.food_items where id=target.food_item_id;
  if auth.uid() is null or not found or not private.owns_stall(stall) then
    raise exception 'Stall access denied' using errcode='42501'; end if;
  fingerprint=encode(extensions.digest(jsonb_build_array(p_title,p_price_sen,p_quantity,p_ends_at)::text,'sha256'),'hex');
  select * into previous from public.promotions where batch_id=p_batch_id and request_id=p_request_id;
  if found then
    if previous.request_hash<>fingerprint then raise exception 'Idempotency key conflict' using errcode='23505'; end if;
    return previous.id;
  end if;
  if target.status<>'active' or target.policy_id is null or target.advisory_deadline is null
    or target.advisory_deadline<=now()+interval '15 minutes' or p_ends_at is null
    or p_ends_at>target.advisory_deadline or p_ends_at<=now() or p_quantity is null
    or p_quantity<1 or p_quantity>target.remaining_quantity or p_price_sen is null or p_price_sen<0
    or p_request_id is null then
    raise exception 'Batch or offer is ineligible' using errcode='22023'; end if;
  update public.promotions set status='expired' where batch_id=p_batch_id and status='active' and ends_at<=now();
  insert into public.promotions(batch_id,title,price_sen,quantity_limit,ends_at,request_id,request_hash)
    values(p_batch_id,p_title,p_price_sen,p_quantity,p_ends_at,p_request_id,fingerprint) returning id into result;
  return result;
end $$;

-- Review publication remains a moderation operation; submitting never self-publishes.
create function public.submit_review(p_stall_id uuid,p_rating integer,p_body text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  if not private.has_role('customer') or private.owns_stall(p_stall_id) then
    raise exception 'Customer review access required' using errcode='42501'; end if;
  if not exists(select 1 from public.stalls where id=p_stall_id and published) then
    raise exception 'Stall unavailable' using errcode='22023'; end if;
  insert into public.reviews(stall_id,customer_id,rating,body)
    values(p_stall_id,auth.uid(),p_rating,p_body)
    on conflict(stall_id,customer_id) do update set rating=excluded.rating,body=excluded.body,status='pending'
    returning id into result;
  return result;
end $$;

create function public.submit_complaint(p_stall_id uuid,p_body text,p_evidence_keys text[],p_request_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor public.profiles; previous public.complaints; result uuid; object_key text;
begin
  select * into actor from public.profiles where id=auth.uid() for update;
  if not found or actor.verified_at is null or not private.has_role('customer') then
    raise exception 'Verified customer required' using errcode='42501'; end if;
  select * into previous from public.complaints where reporter_id=auth.uid() and request_id=p_request_id;
  if found then
    if previous.stall_id<>p_stall_id or previous.body<>p_body or previous.evidence_keys is distinct from p_evidence_keys then
      raise exception 'Idempotency key conflict' using errcode='23505'; end if;
    return previous.id;
  end if;
  if p_request_id is null or p_evidence_keys is null or cardinality(p_evidence_keys)>3 then
    raise exception 'Invalid report input' using errcode='22023'; end if;
  if (select count(*) from public.complaints where reporter_id=auth.uid() and created_at>now()-interval '1 hour')>=3 then
    raise exception 'Report limit reached' using errcode='P0001'; end if;
  foreach object_key in array p_evidence_keys loop
    if not exists(select 1 from storage.objects o where o.bucket_id='complaint-evidence'
      and o.name=object_key and (storage.foldername(o.name))[1]=auth.uid()::text) then
      raise exception 'Evidence access denied' using errcode='42501'; end if;
  end loop;
  insert into public.complaints(stall_id,reporter_id,body,evidence_keys,request_id)
    values(p_stall_id,auth.uid(),p_body,p_evidence_keys,p_request_id) returning id into result;
  return result;
end $$;

create function public.moderate_complaint(p_complaint_id uuid,p_status text,p_request_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare previous public.complaint_events;
begin
  if not private.has_role('admin') then raise exception 'Admin required' using errcode='42501'; end if;
  perform 1 from public.complaints where id=p_complaint_id for update;
  if not found then raise exception 'Report unavailable' using errcode='22023'; end if;
  select * into previous from public.complaint_events where complaint_id=p_complaint_id and request_id=p_request_id;
  if found then
    if previous.status<>p_status then raise exception 'Idempotency key conflict' using errcode='23505'; end if;
    return;
  end if;
  if p_status is null or p_status not in ('triaged','dismissed','escalated') or p_request_id is null then
    raise exception 'Invalid moderation action' using errcode='22023'; end if;
  update public.complaints set status=p_status where id=p_complaint_id;
  insert into public.complaint_events(complaint_id,actor_id,status,request_id)
    values(p_complaint_id,auth.uid(),p_status,p_request_id);
end $$;

-- Organisers see early reports through a redacted projection, never raw complaints/evidence.
create function public.organiser_report_inbox(p_market_id uuid)
returns table(id uuid,stall_id uuid,body text,status text,created_at timestamptz)
language plpgsql security definer set search_path='' as $$
begin
  if not private.organises(p_market_id) then raise exception 'Market access denied' using errcode='42501'; end if;
  return query select c.id,c.stall_id,'Confidential hygiene report; moderator review pending.'::text,c.status,c.created_at
    from public.complaints c join public.stalls s on s.id=c.stall_id where s.market_id=p_market_id;
end $$;

-- Remove potentially inherited/default PUBLIC EXECUTE on every application RPC.
revoke execute on function public.update_profile(text,text),
  public.create_batch(uuid,timestamptz,integer,jsonb,uuid), public.change_inventory(uuid,integer,uuid),
  public.create_promotion(uuid,text,integer,integer,timestamptz,uuid), public.submit_review(uuid,integer,text),
  public.submit_complaint(uuid,text,text[],uuid), public.moderate_complaint(uuid,text,uuid),
  public.organiser_report_inbox(uuid) from public, anon, authenticated;
grant execute on function public.update_profile(text,text),
  public.create_batch(uuid,timestamptz,integer,jsonb,uuid), public.change_inventory(uuid,integer,uuid),
  public.create_promotion(uuid,text,integer,integer,timestamptz,uuid), public.submit_review(uuid,integer,text),
  public.submit_complaint(uuid,text,text[],uuid), public.moderate_complaint(uuid,text,uuid),
  public.organiser_report_inbox(uuid) to authenticated;
commit;
