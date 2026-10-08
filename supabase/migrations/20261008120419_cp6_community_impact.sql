begin;
alter table public.complaints drop constraint complaints_category_check;
alter table public.complaints add constraint complaints_category_check check(category in ('hygiene','handling','misleading','other','spoiled-food','pests','cross-contamination','unhygienic-handling'));
create table private.cp6_records(id uuid primary key default gen_random_uuid(),kind text not null,actor uuid not null references public.profiles(id),stall uuid not null references public.stalls(id) on delete cascade,review uuid references public.reviews(id) on delete cascade,data jsonb not null,at timestamptz not null default now());
create index cp6_records_scope on private.cp6_records(stall,kind,at);
create unique index cp6_review_reply on private.cp6_records(review) where kind='review-reply';
create table private.cp6_requests(actor uuid,request uuid,hash text not null,result text not null,primary key(actor,request));
create table private.cp6_events(actor uuid not null,session uuid not null,stall uuid not null references public.stalls(id) on delete cascade,kind text not null,target text not null,bucket timestamptz not null,source text not null check(source in ('consented','confirmed-batch')),at timestamptz not null default now(),primary key(actor,session,stall,kind,target,bucket));
create index cp6_events_scope on private.cp6_events(stall,bucket);
alter table private.cp6_records enable row level security;
alter table private.cp6_requests enable row level security;
alter table private.cp6_events enable row level security;
revoke all on private.cp6_records,private.cp6_requests,private.cp6_events from public,anon,authenticated;

create function private.cp6_scope(sid uuid) returns boolean language sql stable security definer set search_path='' as $$
select auth.uid() is not null and (private.owns_stall(sid) or (private.has_role('organiser') and exists(select 1 from public.stalls s where s.id=sid and private.organises(s.market_id))))
$$;
create function public.cp6_command(p_kind text,p_data jsonb,p_request uuid) returns text language plpgsql security definer set search_path='' as $$
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
result=coalesce(row.id,gen_random_uuid());hist=coalesce(row.data->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('body',body,'actor',actor,'at',now(),'status','pending'));
insert into private.cp6_records(id,kind,actor,stall,review,data) values(result,p_kind,actor,sid,rid,jsonb_build_object('body',body,'status','pending','history',hist)) on conflict(id) do update set data=excluded.data,at=now();
elsif p_kind in ('reply-moderate','reply-report') then
select * into row from private.cp6_records where id=(p_data->>'target')::uuid and kind='review-reply' for update;sid=row.stall;result=row.id;
if row.id is null or length(body) not between 1 and 500 then raise exception 'Reply and reason required' using errcode='22023';end if;
if p_kind='reply-moderate' then
if not private.has_role('admin') or coalesce(p_data->>'status','') not in ('published','hidden') then raise exception 'Moderator required' using errcode='42501';end if;
update private.cp6_records set data=jsonb_set(jsonb_set(data,'{status}',p_data->'status'),'{history}',data->'history'||jsonb_build_array(jsonb_build_object('body',body,'actor',actor,'at',now(),'status',p_data->>'status'))),at=now() where id=result;
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
create function public.cp6_workspace() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
if auth.uid() is null then raise exception 'Member required' using errcode='42501';end if;
return jsonb_build_object('records',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'kind',r.kind,'stall',r.stall,'review',r.review,'data',r.data,'at',r.at)) from private.cp6_records r where private.has_role('admin') or (r.kind='review-reply' and private.owns_stall(r.stall)) or (r.kind='weight-sample' and private.owns_stall(r.stall)) or (r.kind='summary-draft' and exists(select 1 from public.stalls s where s.id=r.stall and private.has_role('organiser') and private.organises(s.market_id))) or (r.kind='reply-report' and r.actor=auth.uid())),'[]'::jsonb));
end $$;
create function public.cp6_summary_source(p_report uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare c public.complaints;market uuid;
begin
select * into c from public.complaints where id=p_report;select market_id into market from public.stalls where id=c.stall_id;
if c.id is null or not (private.has_role('admin') or (private.has_role('organiser') and private.organises(market))) then raise exception 'Scoped moderator required' using errcode='42501';end if;
return jsonb_build_object('category',c.category,'status',c.status,'count',1);
end $$;
alter function public.community_command(text,jsonb,uuid) set schema private;
alter function private.community_command(text,jsonb,uuid) rename to cp6_community_delegate;
revoke all on function private.cp6_community_delegate(text,jsonb,uuid) from public,anon,authenticated;
create function public.community_command(p_kind text,p_data jsonb,p_request uuid) returns text language plpgsql security definer set search_path='' as $$
declare cat text:=p_data->>'category';result text;prior private.cp6_requests;fingerprint text;
begin
if p_kind='report' then
perform 1 from public.profiles where id=auth.uid() for update;
fingerprint=encode(extensions.digest((p_kind||p_data::text)::bytea,'sha256'),'hex');
select * into prior from private.cp6_requests where actor=auth.uid() and request=p_request;
if found then if prior.hash<>fingerprint then raise exception 'Retry conflict' using errcode='23505';end if;return prior.result;end if;
end if;
if p_kind='report' and cat in ('spoiled-food','pests','cross-contamination','unhygienic-handling') then
result=private.cp6_community_delegate(p_kind,jsonb_set(p_data,'{category}',to_jsonb(case when cat in ('cross-contamination','unhygienic-handling') then 'handling'::text else 'hygiene'::text end)),p_request);
update public.complaints set category=cat where id=result::uuid;
insert into private.cp6_requests values(auth.uid(),p_request,fingerprint,result);return result;
end if;
result=private.cp6_community_delegate(p_kind,p_data,p_request);
if p_kind='report' then insert into private.cp6_requests values(auth.uid(),p_request,fingerprint,result);end if;return result;
end $$;
alter function public.community_public() set schema private;
alter function private.community_public() rename to cp6_public_delegate;
revoke all on function private.cp6_public_delegate() from public,anon,authenticated;
create function public.community_public() returns jsonb language sql stable security definer set search_path='' as $$
select private.cp6_public_delegate()||jsonb_build_object('reviewReplies',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'review',r.review,'body',r.data->>'body')) from private.cp6_records r join public.reviews v on v.id=r.review join public.stalls s on s.id=r.stall where r.kind='review-reply' and r.data->>'status'='published' and v.status='published' and s.published),'[]'::jsonb))
$$;
create function private.cp6_batch_post() returns trigger language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
if new.kind='declaration-confirmed' and coalesce((new.details->>'confirmed')::boolean,false) and new.actor_id is not null then
select f.stall_id into sid from public.batches b join public.food_items f on f.id=b.food_item_id where b.id=new.batch_id;
insert into private.cp6_events(actor,session,stall,kind,target,bucket,source) values(new.actor_id,new.batch_id,sid,'batch-post',new.batch_id::text,timestamptz '2000-01-01','confirmed-batch') on conflict do nothing;
end if;return new;
end $$;
create trigger cp6_confirmed_post after insert on public.batch_events for each row execute function private.cp6_batch_post();
revoke all on function private.cp6_scope(uuid),private.cp6_batch_post() from public,anon,authenticated;
revoke all on function public.cp6_command(text,jsonb,uuid),public.cp6_workspace(),public.cp6_summary_source(uuid),public.community_command(text,jsonb,uuid),public.community_public() from public,anon,authenticated;
grant execute on function public.cp6_command(text,jsonb,uuid),public.cp6_workspace(),public.cp6_summary_source(uuid),public.community_command(text,jsonb,uuid) to authenticated;
grant execute on function public.community_public() to anon,authenticated;
create function private.cp6_impact_raw() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
if auth.uid() is null or not(private.has_role('admin') or private.has_role('organiser') or private.has_role('vendor')) then raise exception 'Impact role required' using errcode='42501';end if;
 return jsonb_build_object('now',private.clock_now(),
 'batches',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'food',f.id,'dish',f.name,'stall',f.stall_id,'session',(b.prepared_at at time zone 'Asia/Kuala_Lumpur')::date,'prepared',case when exists(select 1 from public.batch_events e where e.batch_id=b.id and e.kind='merged-from') then 0 else b.original_quantity end,'transfer_in',case when exists(select 1 from public.batch_events e where e.batch_id=b.id and e.kind='merged-from') then b.original_quantity else 0 end,'remaining',case when b.status='merged' then 0 else b.remaining_quantity end,'status',b.status,'deadline',private.effective_deadline(b.id),'cutoff',least(private.effective_deadline(b.id)-interval '15 minutes',private.market_close(s.market_id)),'eligible',coalesce((a.result->>'eligible')::boolean,false) and b.status='active' and s.published and s.open and f.published,'held',private.commerce_held(b.id))) from public.batches b join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id left join public.batch_advisories a on a.batch_id=b.id where private.cp6_scope(f.stall_id)),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'batch',m.batch,'kind',m.kind,'units',m.units,'at',m.at,'source',m.source,'original_total',m.original_total,'total',m.total,'bundle',m.bundle,'basis',m.basis,'refunded',case when m.order_id is not null then coalesce((r.data->>'refunded')::bigint,0) else 0 end,'disputed',coalesce((r.data->>'disputed')::boolean,false))) from private.cp5_movements m join public.batches b on b.id=m.batch join public.food_items f on f.id=b.food_item_id left join private.commerce_records r on r.id=m.order_id where private.cp6_scope(f.stall_id)),'[]'::jsonb),
 'closings',coalesce((select jsonb_agg(jsonb_build_object('batch',c.batch,'remaining',c.remaining,'at',c.at,'source',c.source)) from private.cp5_closings c join public.batches b on b.id=c.batch join public.food_items f on f.id=b.food_item_id where private.cp6_scope(f.stall_id)),'[]'::jsonb)) || jsonb_build_object(
'stalls',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'market',s.market_id,'name',s.name)) from public.stalls s where private.cp6_scope(s.id)),'[]'::jsonb),
'weights',coalesce((select jsonb_agg(jsonb_build_object('id',id,'stall',stall,'data',data,'at',at)) from private.cp6_records where kind='weight-sample' and private.cp6_scope(stall)),'[]'::jsonb),
'engagement',coalesce((select jsonb_agg(to_jsonb(x)) from (select s.market_id as market,(e.bucket at time zone 'Asia/Kuala_Lumpur')::date as date,e.kind,e.source,count(*) as events,count(distinct e.actor) as actors from private.cp6_events e join public.stalls s on s.id=e.stall where private.cp6_scope(s.id) and e.kind<>'batch-post' and e.bucket>now()-interval '30 days' group by s.market_id,(e.bucket at time zone 'Asia/Kuala_Lumpur')::date,e.kind,e.source)x),'[]'::jsonb),
'posting',coalesce((select jsonb_agg(to_jsonb(x)) from (select s.market_id as market,(b.prepared_at at time zone 'Asia/Kuala_Lumpur')::date as date,count(distinct e.target) as batches,min(e.at) as first_posted_at,round(avg(extract(epoch from (e.at-b.uploaded_at))/60)::numeric,2) as posting_delay_minutes from private.cp6_events e join public.stalls s on s.id=e.stall join public.batches b on b.id=e.session where private.cp6_scope(s.id) and e.kind='batch-post' group by s.market_id,(b.prepared_at at time zone 'Asia/Kuala_Lumpur')::date)x),'[]'::jsonb),
'concerns',coalesce((select jsonb_agg(to_jsonb(x)) from (select s.market_id as market,(c.created_at at time zone 'Asia/Kuala_Lumpur')::date as date,c.category,count(*) as reports,count(distinct c.reporter_id) as reporters from public.complaints c join public.stalls s on s.id=c.stall_id where private.cp6_scope(s.id) group by s.market_id,(c.created_at at time zone 'Asia/Kuala_Lumpur')::date,c.category)x),'[]'::jsonb));
end $$;

revoke all on function private.cp6_impact_raw() from public,anon,authenticated;
create function public.cp6_impact_source() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare raw jsonb;rows jsonb;
begin
raw=private.cp6_impact_raw();
raw=jsonb_set(raw,'{engagement}',(select coalesce(jsonb_agg((e-'actors')||jsonb_build_object('active_users',case when (e->>'actors')::int>=5 then e->'actors' else 'null'::jsonb end,'actors',case when (e->>'actors')::int>=5 then 5 else 0 end,'events',case when (e->>'actors')::int>=5 then e->'events' else 'null'::jsonb end)),'[]'::jsonb) from jsonb_array_elements(raw->'engagement') e));
raw=jsonb_set(raw,'{concerns}',(select coalesce(jsonb_agg((e-'reporters')||jsonb_build_object('reporters',case when (e->>'reporters')::int>=5 then 5 else 0 end,'reports',case when (e->>'reporters')::int>=5 then e->'reports' else 'null'::jsonb end)),'[]'::jsonb) from jsonb_array_elements(raw->'concerns') e));
if private.has_role('vendor') or private.has_role('admin') then return raw;end if;
-- Organisers receive market/day aggregates only, never individual batch/source amounts.
with batches as (
 select b.*,s.value->>'market' as market from jsonb_array_elements(raw->'batches') v,
 jsonb_to_record(v.value) as b(id text,stall text,session text,prepared integer,transfer_in integer,remaining integer),
 jsonb_array_elements(raw->'stalls') s where s.value->>'id'=b.stall
), movements as (
 select m.batch,sum(m.units) as consumed from jsonb_array_elements(raw->'movements') v,
 jsonb_to_record(v.value) as m(batch text,units integer) group by m.batch
), close as (
 select c.batch,c.remaining from jsonb_array_elements(raw->'closings') v,
 jsonb_to_record(v.value) as c(batch text,remaining integer)
), sessions as (
 select b.market,b.stall,b.session,sum(b.prepared) as prepared,sum(c.remaining) as leftovers,
 bool_and(c.batch is not null and c.remaining is not null) as closed,
 bool_and(coalesce(b.prepared is not null and b.remaining is not null and b.prepared+coalesce(b.transfer_in,0)-coalesce(m.consumed,0)=b.remaining,false)) as reconciled
 from batches b left join movements m on m.batch=b.id left join close c on c.batch=b.id group by b.market,b.stall,b.session
), grouped as (
 select market,session,count(*) as n,count(*) filter(where closed and reconciled and prepared>0) as valid,
 sum(prepared) filter(where closed and reconciled and prepared>0) as prepared,
 sum(leftovers) filter(where closed and reconciled and prepared>0) as leftovers from sessions group by market,session
)
select coalesce(jsonb_agg(jsonb_build_object('market',market,'date',session,'stall','market aggregate',
'prepared',case when valid>=5 then prepared end,'closing_leftovers',case when valid>=5 then leftovers end,
'closed',valid>=5,'reconciled',valid>=5,'suppressed',valid<5,'included_stalls',case when valid>=5 then valid end,
'excluded_stalls',case when n>=5 then n-valid end)),'[]'::jsonb) into rows from grouped;
return jsonb_build_object('now',raw->'now','sessions',rows,'engagement',raw->'engagement','concerns',raw->'concerns',
'posting',(select coalesce(jsonb_agg(jsonb_build_object('market',p->>'market','date',p->>'date','batches',case when
(select count(*) from public.stalls s where s.market_id=(p->>'market')::uuid)>=5 then p->'batches' else 'null'::jsonb end)),'[]'::jsonb) from jsonb_array_elements(raw->'posting') p),
'weights','[]'::jsonb,'movements','[]'::jsonb);
end $$;
revoke all on function public.cp6_impact_source() from public,anon;
grant execute on function public.cp6_impact_source() to authenticated;
commit;
