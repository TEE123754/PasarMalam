begin;
create table private.cp5_movements(id text primary key,batch uuid not null references public.batches(id) on delete cascade,kind text not null check(kind in ('normal','clearance','giveaway','donation','discard','compost','bsf','transfer-out')),units integer not null check(units>0),at timestamptz not null,source text not null,original_total bigint,total bigint,bundle integer,basis text,order_id uuid);
create index cp5_movements_batch_time on private.cp5_movements(batch,at);
create table private.cp5_closings(batch uuid primary key references public.batches(id) on delete cascade,remaining integer,at timestamptz not null,source text not null,note text not null);
create table private.cp5_requests(actor uuid not null,request uuid not null,hash text not null,result text not null,primary key(actor,request));
alter table private.cp5_movements enable row level security;
alter table private.cp5_closings enable row level security;
alter table private.cp5_requests enable row level security;
revoke all on private.cp5_movements,private.cp5_closings,private.cp5_requests from public,anon,authenticated;
-- Capture at reservation, then retain exact prices through later menu edits/refunds.
create function private.cp5_order_snapshot() returns trigger language plpgsql security definer set search_path='' as $$
declare p public.promotions;f public.food_items;
begin
 if new.kind='order' then
  if tg_op='INSERT' then
   select * into p from public.promotions where id=(new.data->>'offer')::uuid;
   select * into f from public.food_items where id=(select food_item_id from public.batches where id=p.batch_id);
   new.data=new.data||jsonb_build_object('accounting',jsonb_build_object('original_total',f.price_sen::bigint*(new.data->>'units')::integer,'total',(new.data->>'total')::bigint,'bundle',p.bundle_units,'basis',case when p.bundle_units=2 then 'two-unit-bundle' else 'unit' end,'captured_at',private.clock_now()));
  else new.data=jsonb_set(new.data,'{accounting}',coalesce(old.data->'accounting','null'::jsonb));end if;
 end if;return new;
end $$;
create trigger cp5_order_snapshot before insert or update on private.commerce_records for each row execute function private.cp5_order_snapshot();
create function private.cp5_order_capture() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.kind='order' and new.data->>'status'='completed' and (tg_op='INSERT' or old.data->>'status' is distinct from 'completed') then
 insert into private.cp5_movements(id,batch,kind,units,at,source,original_total,total,bundle,basis,order_id) values('order:'||new.id,(new.data->>'batch')::uuid,'clearance',(new.data->>'units')::integer,private.clock_now(),'confirmed-collection',(new.data->'accounting'->>'original_total')::bigint,(new.data->'accounting'->>'total')::bigint,(new.data->'accounting'->>'bundle')::integer,new.data->'accounting'->>'basis',new.id) on conflict do nothing;
 end if;return new;
end $$;
create trigger cp5_order_capture after insert or update on private.commerce_records for each row execute function private.cp5_order_capture();
create function private.cp5_partner_capture() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.kind='collection' and new.data->>'status'='collected' and (tg_op='INSERT' or old.data->>'status' is distinct from 'collected') then
 insert into private.cp5_movements(id,batch,kind,units,at,source) values('partner:'||new.id,(new.data->>'batch')::uuid,new.data->>'route',(new.data->>'units')::integer,private.clock_now(),'confirmed-partner-collection') on conflict do nothing;
 end if;return new;
end $$;
create trigger cp5_partner_capture after insert or update on private.partner_records for each row execute function private.cp5_partner_capture();
create function private.cp5_event_capture() returns trigger language plpgsql security definer set search_path='' as $$
declare u integer;price bigint;b public.batches;
begin
 select * into b from public.batches where id=new.batch_id;
 if new.kind in ('consume','inventory') and (new.details ? 'consumed' or new.details ? 'quantity') and not new.details ? 'source' then
 u=coalesce((new.details->>'consumed')::integer,(new.details->>'quantity')::integer);
 select price_sen into price from public.food_items where id=b.food_item_id;
 if u>0 then insert into private.cp5_movements(id,batch,kind,units,at,source,original_total,total,bundle,basis) values('event:'||new.id,new.batch_id,'normal',u,private.clock_now(),'vendor-reported',price*u,price*u,1,'unit') on conflict do nothing;end if;
 elsif new.kind='merged-into' and b.remaining_quantity>0 then
 insert into private.cp5_movements(id,batch,kind,units,at,source) values('event:'||new.id,new.batch_id,'transfer-out',b.remaining_quantity,private.clock_now(),'batch-transfer') on conflict do nothing;
 end if;return new;
end $$;
create trigger cp5_event_capture after insert on public.batch_events for each row execute function private.cp5_event_capture();
create function private.cp5_outcome_capture() returns trigger language plpgsql security definer set search_path='' as $$
declare p public.promotions;price bigint;
begin
 if new.sold_quantity>0 then
 select * into p from public.promotions where id=new.promotion_id;
 select f.price_sen into price from public.food_items f join public.batches b on b.food_item_id=f.id where b.id=new.batch_id;
 insert into private.cp5_movements(id,batch,kind,units,at,source,original_total,total,bundle,basis) values('outcome:'||new.id,new.batch_id,'clearance',new.sold_quantity,private.clock_now(),'vendor-reported',price*new.sold_quantity,case when p.bundle_units>0 then p.price_sen::bigint*new.sold_quantity/p.bundle_units end,p.bundle_units,case when p.bundle_units=2 then 'two-unit-bundle' else 'unit' end) on conflict do nothing;
 end if;return new;
end $$;
create trigger cp5_outcome_capture after insert on public.inventory_outcomes for each row execute function private.cp5_outcome_capture();
-- A closing count is a physical inventory snapshot, never a sale or waste estimate.
create function private.cp5_closed_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from private.cp5_closings where batch=old.id) and (new.remaining_quantity is distinct from old.remaining_quantity or new.status is distinct from old.status and new.status in ('active','merged')) then raise exception 'Closing count is final; create a new batch' using errcode='22023';end if;return new;
end $$;
create trigger cp5_closed_guard before update on public.batches for each row execute function private.cp5_closed_guard();
create function private.cp5_hold_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (new.kind='order' or new.kind='collection') and exists(select 1 from private.cp5_closings where batch=(new.data->>'batch')::uuid) then raise exception 'Closing count is final; no new stock holds' using errcode='22023';end if;return new;
end $$;
create trigger cp5_hold_guard before insert on private.commerce_records for each row execute function private.cp5_hold_guard();
create trigger cp5_hold_guard before insert on private.partner_records for each row execute function private.cp5_hold_guard();
revoke all on function private.cp5_hold_guard() from public,anon,authenticated;
create function public.cp5_command(p_batch uuid,p_kind text,p_units integer,p_note text,p_request uuid) returns text language plpgsql security definer set search_path='' as $$
declare b public.batches;f public.food_items;r private.cp5_requests;fingerprint text;decision jsonb;
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 if p_request is null or p_note is null or length(trim(p_note)) not between 2 and 250 or p_kind not in ('normal','giveaway','discard','close') or (p_kind<>'close' and (p_units is null or p_units not between 1 and 100000)) or (p_kind='close' and p_units is not null) then raise exception 'Invalid accounting record' using errcode='22023';end if;
 -- Same ordering as existing commerce/partner commands, then food and batch locks.
 perform pg_advisory_xact_lock(824008);
 select * into f from public.food_items where id=(select food_item_id from public.batches where id=p_batch) for update;
 if f.id is null or not private.owns_stall(f.stall_id) then raise exception 'Owned batch required' using errcode='42501';end if;
 select * into b from public.batches where id=p_batch for update;
 fingerprint=jsonb_build_object('batch',p_batch,'kind',p_kind,'units',p_units,'note',p_note)::text;
 select * into r from private.cp5_requests where actor=auth.uid() and request=p_request;
 if found then if r.hash<>fingerprint then raise exception 'Retry conflict' using errcode='23505';end if;return r.result;end if;
 if exists(select 1 from private.cp5_closings where batch=p_batch) or b.status in ('merged','recalled') or (p_kind<>'close' and b.status in ('sold-out','discarded')) then raise exception 'Batch already closed' using errcode='22023';end if;
 if p_kind='close' then
  if private.commerce_held(p_batch)>0 then raise exception 'Resolve stock holds before closing' using errcode='22023';end if;
  insert into private.cp5_closings values(p_batch,b.remaining_quantity,private.clock_now(),'vendor-reported',p_note);
  update public.batches set status='withdrawn',inventory_state='withdrawn' where id=p_batch;
  update public.promotions set status='withdrawn' where batch_id=p_batch and status='active';
 else
  if b.remaining_quantity is null or p_units>b.remaining_quantity-private.commerce_held(p_batch) then raise exception 'Known unheld stock required' using errcode='22023';end if;
  if p_kind in ('normal','giveaway') then
   decision=private.evaluate_batch(p_batch);
   if not coalesce((decision->>'eligible')::boolean,false) or private.effective_deadline(p_batch)<=private.clock_now()+interval '15 minutes' then raise exception 'Human-consumption window closed' using errcode='22023';end if;
  end if;
  update public.batches set remaining_quantity=remaining_quantity-p_units,status=case when remaining_quantity=p_units then case when p_kind='discard' then 'discarded' else 'sold-out' end else status end where id=p_batch;
  insert into private.cp5_movements(id,batch,kind,units,at,source,original_total,total,bundle,basis) values('manual:'||auth.uid()||':'||p_request,p_batch,p_kind,p_units,private.clock_now(),'vendor-reported',case when p_kind in ('normal','giveaway') then f.price_sen::bigint*p_units end,case when p_kind='normal' then f.price_sen::bigint*p_units when p_kind='giveaway' then 0 end,1,'unit');
 end if;
 insert into private.cp5_requests values(auth.uid(),p_request,fingerprint,p_batch::text);return p_batch::text;
end $$;
create function public.cp5_workspace() returns jsonb language plpgsql security definer set search_path='' as $$
declare batchrow record;
begin
 if auth.uid() is null or not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 for batchrow in select b.id from public.batches b join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id) and b.status in ('active','needs-information') order by f.id,b.id loop perform private.inspect_batch(batchrow.id);end loop;
 return jsonb_build_object('now',private.clock_now(),
 'batches',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'food',f.id,'dish',f.name,'stall',f.stall_id,'session',(b.prepared_at at time zone 'Asia/Kuala_Lumpur')::date,'prepared',case when exists(select 1 from public.batch_events e where e.batch_id=b.id and e.kind='merged-from') then 0 else b.original_quantity end,'transfer_in',case when exists(select 1 from public.batch_events e where e.batch_id=b.id and e.kind='merged-from') then b.original_quantity else 0 end,'remaining',case when b.status='merged' then 0 else b.remaining_quantity end,'status',b.status,'deadline',private.effective_deadline(b.id),'cutoff',least(private.effective_deadline(b.id)-interval '15 minutes',private.market_close(s.market_id)),'eligible',coalesce((a.result->>'eligible')::boolean,false) and b.status='active' and s.published and s.open and f.published,'held',private.commerce_held(b.id))) from public.batches b join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id left join public.batch_advisories a on a.batch_id=b.id where private.owns_stall(f.stall_id)),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'batch',m.batch,'kind',m.kind,'units',m.units,'at',m.at,'source',m.source,'original_total',m.original_total,'total',m.total,'bundle',m.bundle,'basis',m.basis,'refunded',case when m.order_id is not null then coalesce((r.data->>'refunded')::bigint,0) else 0 end,'disputed',coalesce((r.data->>'disputed')::boolean,false))) from private.cp5_movements m join public.batches b on b.id=m.batch join public.food_items f on f.id=b.food_item_id left join private.commerce_records r on r.id=m.order_id where private.owns_stall(f.stall_id)),'[]'::jsonb),
 'closings',coalesce((select jsonb_agg(jsonb_build_object('batch',c.batch,'remaining',c.remaining,'at',c.at,'source',c.source,'note',c.note)) from private.cp5_closings c join public.batches b on b.id=c.batch join public.food_items f on f.id=b.food_item_id where private.owns_stall(f.stall_id)),'[]'::jsonb));
end $$;
revoke all on function public.cp5_workspace(),public.cp5_command(uuid,text,integer,text,uuid) from public,anon;
grant execute on function public.cp5_workspace(),public.cp5_command(uuid,text,integer,text,uuid) to authenticated;
revoke all on function private.cp5_order_snapshot(),private.cp5_order_capture(),private.cp5_partner_capture(),private.cp5_event_capture(),private.cp5_outcome_capture(),private.cp5_closed_guard() from public,anon,authenticated;
commit;
