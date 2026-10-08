begin;
create or replace function public.cp6_command(p_kind text,p_data jsonb,p_request uuid) returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();sid uuid;rid uuid;result uuid;row private.cp6_records;rev public.reviews;prior private.cp6_requests;fingerprint text;body text;hist jsonb;report public.complaints;market uuid;
begin
perform 1 from public.profiles where id=actor for update;
if not found or p_request is null or p_data is null or length(p_data::text)>12000 then raise exception 'Member required' using errcode='42501';end if;
fingerprint=encode(extensions.digest((p_kind||p_data::text)::bytea,'sha256'),'hex');
select * into prior from private.cp6_requests where cp6_requests.actor=auth.uid() and request=p_request;
if found then if prior.hash<>fingerprint then raise exception 'Retry conflict' using errcode='23505';end if;return prior.result;end if;
if (select count(*) from private.cp6_records where cp6_records.actor=auth.uid() and at>now()-interval '1 hour')>=30 then raise exception 'Action rate limit' using errcode='22023';end if;
body=trim(coalesce(p_data->>'body',''));
if p_kind='review-reply' then
rid=(p_data->>'review')::uuid;select * into rev from public.reviews where id=rid for update;sid=rev.stall_id;
if rev.id is null or rev.status<>'published' or not private.has_role('vendor') or not private.owns_stall(sid) or length(body) not between 1 and 1000 then raise exception 'Published owned review required' using errcode='42501';end if;
select * into row from private.cp6_records where kind='review-reply' and review=rid for update;
result=coalesce(row.id,gen_random_uuid());hist=coalesce(row.data->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('body',body,'actor',auth.uid(),'at',now(),'status','pending'));
insert into private.cp6_records(id,kind,actor,stall,review,data) values(result,p_kind,actor,sid,rid,jsonb_build_object('body',body,'status','pending','history',hist)) on conflict(id) do update set data=excluded.data,at=now();
elsif p_kind in ('reply-moderate','reply-report') then
select * into row from private.cp6_records where id=(p_data->>'target')::uuid and kind='review-reply' for update;sid=row.stall;result=row.id;
if row.id is null or length(body) not between 1 and 500 then raise exception 'Reply and reason required' using errcode='22023';end if;
if p_kind='reply-moderate' then
if not private.has_role('admin') or coalesce(p_data->>'status','') not in ('published','hidden') then raise exception 'Moderator required' using errcode='42501';end if;
update private.cp6_records set data=jsonb_set(jsonb_set(data,'{status}',p_data->'status'),'{history}',data->'history'||jsonb_build_array(jsonb_build_object('body',body,'actor',auth.uid(),'at',now(),'status',p_data->>'status'))),at=now() where id=result;
else
if not private.has_role('customer') or not exists(select 1 from public.profiles where id=actor and verified_at is not null) or row.data->>'status'<>'published' or not exists(select 1 from public.reviews where id=row.review and status='published') then raise exception 'Verified customer required' using errcode='42501';end if;
insert into private.cp6_records(kind,actor,stall,review,data) values('reply-report',actor,sid,row.review,jsonb_build_object('target',result,'body',body)) returning id into result;
end if;
elsif p_kind='summary-draft' then
select * into report from public.complaints where id=(p_data->>'report')::uuid;sid=report.stall_id;select market_id into market from public.stalls where id=sid;
if report.id is null or not(private.has_role('admin') or (private.has_role('organiser') and private.organises(market))) or length(body) not between 10 and 500 then raise exception 'Scoped moderator draft required' using errcode='42501';end if;
result=gen_random_uuid();insert into private.cp6_records(id,kind,actor,stall,data) values(result,p_kind,actor,sid,jsonb_build_object('report',report.id,'body',private.community_redact(body),'status','private-draft','source',case when p_data->>'source'='morpheus' then 'morpheus-unverified' else 'category-template' end));
elsif p_kind='weight-sample' then
sid=(p_data->>'stall')::uuid;
if not(p_data ?& array['stall','food','method','grams','portions','uncertainty_pct','measured_at']) or exists(select 1 from jsonb_each(p_data) x where x.value='null'::jsonb) or not private.has_role('vendor') or not private.owns_stall(sid) or not exists(select 1 from public.food_items where id=(p_data->>'food')::uuid and stall_id=sid) or coalesce(p_data->>'method','') not in ('portion-sample','weighed-route') or (p_data->>'grams')::numeric not between 1 and 1000000 or (p_data->>'portions')::integer not between 1 and 100000 or (p_data->>'uncertainty_pct')::numeric not between 0 and 100 or (p_data->>'measured_at')::timestamptz>now() or (p_data->>'measured_at')::timestamptz<now()-interval '90 days' then raise exception 'Owned measured sample required' using errcode='22023';end if;
if p_data->>'method'='weighed-route' and not(p_data ?& array['movement','route']) then raise exception 'Completed source required' using errcode='22023';end if;
if p_data->>'method'='weighed-route' and coalesce(p_data->>'route','') not in ('normal','clearance','giveaway','donation','discard','compost','bsf') then raise exception 'Route required' using errcode='22023';end if;
if p_data->>'method'='weighed-route' and not exists(select 1 from private.cp5_movements m join public.batches b on b.id=m.batch where m.id=p_data->>'movement' and b.food_item_id=(p_data->>'food')::uuid and m.kind=p_data->>'route' and m.units=(p_data->>'portions')::integer) then raise exception 'Matching completed source required' using errcode='22023';end if;
if p_data->>'method'='weighed-route' and exists(select 1 from private.cp6_records where kind='weight-sample' and data->>'movement'=p_data->>'movement') then raise exception 'Source already weighed' using errcode='23505';end if;
result=gen_random_uuid();insert into private.cp6_records(id,kind,actor,stall,data) values(result,p_kind,actor,sid,p_data-'body');
elsif p_kind='telemetry' then
sid=(p_data->>'stall')::uuid;
if coalesce((p_data->>'consent')::boolean,false) is not true or not exists(select 1 from public.stalls where id=sid and published) or coalesce(p_data->>'event','') not in ('stall-view','offer-engagement') then raise exception 'Opt-in public event required' using errcode='22023';end if;
if p_data->>'event'='offer-engagement' and not exists(select 1 from public.promotions p join public.batches b on b.id=p.batch_id join public.food_items f on f.id=b.food_item_id where p.id=(p_data->>'offer')::uuid and f.stall_id=sid and p.status='active' and p.ends_at>private.clock_now()) then raise exception 'Current offer required' using errcode='22023';end if;
if (select count(*) from private.cp6_events where cp6_events.actor=auth.uid() and bucket>now()-interval '1 hour')>=60 then raise exception 'Event rate limit' using errcode='22023';end if;
delete from private.cp6_events where source='consented' and bucket<now()-interval '30 days';
insert into private.cp6_events(actor,session,stall,kind,target,bucket,source) values(actor,(p_data->>'session')::uuid,sid,p_data->>'event',case when p_data->>'event'='offer-engagement' then p_data->>'offer' else sid::text end,date_bin(interval '15 minutes',now(),timestamptz '2000-01-01'),'consented') on conflict do nothing;result=p_request;
else raise exception 'Unsupported CP6 action' using errcode='22023';end if;
insert into private.cp6_requests values(actor,p_request,fingerprint,result::text);return result::text;
end $$;
commit;
