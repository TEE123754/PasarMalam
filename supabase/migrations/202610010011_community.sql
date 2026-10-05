begin;
alter table public.reviews add column photo_description text not null default '';
alter table public.complaints add column category text not null default 'hygiene'
 check(category in ('hygiene','handling','misleading','other'));
alter table public.complaints add column incident_at timestamptz not null default now();
alter table public.complaints add column approved_summary text not null default '';
alter table public.complaints add column independent boolean not null default false;
alter table public.complaints add column blocked boolean not null default false;
alter table public.complaints add column independence_group text not null default '';
alter table public.complaints add column reply_due timestamptz not null default now()+interval '48 hours';
create table private.community_requests(actor uuid, request uuid, hash text not null,result text not null,
 created_at timestamptz not null default now(),primary key(actor,request));
create table private.community_audit(id uuid primary key default gen_random_uuid(),target text not null,
 actor uuid not null,kind text not null,body text not null,created_at timestamptz not null default now());
create table private.community_replies(stall uuid primary key references public.stalls(id),body text not null,
 approved boolean not null default false);
create table private.community_flags(stall uuid primary key references public.stalls(id),expires timestamptz not null,
 reason text not null);
create table private.community_uploads(key text primary key,owner uuid not null,ready boolean not null default false,
 expires timestamptz not null default now()+interval '20 minutes');
create index community_actor_time on private.community_audit(actor,created_at);
create index community_incident on public.complaints(reporter_id,stall_id,incident_at,category);
revoke all on private.community_requests,private.community_audit,private.community_replies,
 private.community_flags,private.community_uploads from public,anon,authenticated;

create function private.community_redact(value text) returns text language sql immutable set search_path='' as $$
 select regexp_replace(regexp_replace(value,'[[:alnum:]_.+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}',
 '[redacted]','g'),'[0-9][0-9 -]{8,}[0-9]','[redacted]','g')
$$;
create function private.community_eligible(target uuid) returns setof public.complaints
 language sql stable security definer set search_path='' as $$
 select c.* from public.complaints c where c.stall_id=target and c.independent and not c.blocked
 and c.status<>'dismissed' and c.created_at>now()-interval '14 days' and c.independence_group<>''
 and exists(select 1 from public.profiles p where p.id=c.reporter_id and p.verified_at is not null)
 and c.id=(select x.id from public.complaints x where x.stall_id=c.stall_id and x.independent
 and not x.blocked and x.status<>'dismissed' and x.created_at>now()-interval '14 days'
 and (x.reporter_id=c.reporter_id or x.independence_group=c.independence_group)
 order by x.created_at,x.id limit 1)
$$;

create function public.community_public() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('reviews',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'stall',r.stall_id,
 'rating',r.rating,'body',r.body,'photo',r.photo_description)) from public.reviews r
 join public.stalls s on s.id=r.stall_id where r.status='published' and s.published),'[]'::jsonb),
 'flags',coalesce((select jsonb_agg(jsonb_build_object('stall',f.stall,'expires',f.expires,
 'reply',coalesce((select body from private.community_replies where stall=f.stall and approved),'')))
 from private.community_flags f join public.stalls s on s.id=f.stall where s.published and f.expires>now()
 and (select count(*) from private.community_eligible(f.stall))>=3),'[]'::jsonb))
$$;

create function public.community_workspace() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare is_admin boolean:=private.has_role('admin');
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 return jsonb_build_object(
 'reviews',coalesce((select jsonb_agg(jsonb_build_object('id',id,'stall',stall_id,'author',customer_id,
 'rating',rating,'body',body,'photo',photo_description,'status',status)) from public.reviews
 where is_admin or customer_id=auth.uid()),'[]'::jsonb),
 'reports',coalesce((select jsonb_agg(jsonb_build_object('id',id,'stall',stall_id,'reporter',reporter_id,
 'category',category,'incident',incident_at,'body',body,'evidence',evidence_keys,'status',status,
 'created',created_at,'summary',approved_summary,'independent',independent,'blocked',blocked,
 'group',independence_group,'replyDue',reply_due)) from public.complaints where is_admin or reporter_id=auth.uid()),'[]'::jsonb),
 'redacted',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'stall',c.stall_id,'category',c.category,
 'status',c.status,'summary',case when c.approved_summary='' then 'Confidential report pending review.' else c.approved_summary end,'replyDue',c.reply_due)) from public.complaints c
 join public.stalls s on s.id=c.stall_id where
 ((c.approved_summary<>'' and private.has_role('vendor') and exists(select 1 from public.stall_memberships where stall_id=s.id and user_id=auth.uid()))
 or (private.has_role('organiser') and private.organises(s.market_id)))),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'target',a.target,'kind',a.kind,'body',a.body,'at',a.created_at))
 from private.community_audit a where is_admin or exists(select 1 from public.complaints c
 where c.id::text=a.target and c.reporter_id=auth.uid())),'[]'::jsonb),
 'replies',coalesce((select jsonb_agg(jsonb_build_object('stall',stall,'body',body,'approved',approved))
 from private.community_replies where is_admin or (private.has_role('vendor') and private.owns_stall(stall))),'[]'::jsonb),
 'flags',case when is_admin then (select coalesce(jsonb_agg(to_jsonb(f)),'[]'::jsonb) from private.community_flags f) else '[]'::jsonb end,
 'markets',case when is_admin then (select coalesce(jsonb_agg(to_jsonb(m)),'[]'::jsonb) from public.market_schedules m) else '[]'::jsonb end,
 'dietary',case when is_admin then (select coalesce(jsonb_agg(to_jsonb(d)),'[]'::jsonb) from public.dietary_claims d) else '[]'::jsonb end,
 'stalls',case when is_admin then (select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'published',published)),'[]'::jsonb) from public.stalls) else '[]'::jsonb end);
end $$;

create function public.community_command(p_kind text,p_data jsonb,p_request uuid) returns text
 language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();result text:=gen_random_uuid()::text;fingerprint text;
 old private.community_requests;c public.complaints;sid uuid;target uuid;b text;reason text;
 incident timestamptz;key text;eligible integer;expires_at timestamptz;market uuid;
begin
 perform 1 from public.profiles where id=actor for update;
 if not found or p_request is null or p_data is null then raise exception 'Member required' using errcode='42501';end if;
 fingerprint:=encode(extensions.digest((p_kind||p_data::text)::bytea,'sha256'),'hex');
 select * into old from private.community_requests where community_requests.actor=auth.uid() and request=p_request;
 if found then if old.hash<>fingerprint then raise exception 'Retry conflict' using errcode='23505';end if;return old.result;end if;
 if (select count(*) from private.community_audit where community_audit.actor=auth.uid() and created_at>now()-interval '1 hour')>=30
 then raise exception 'Rate limit' using errcode='P0001';end if;
 sid:=nullif(p_data->>'stall','')::uuid;target:=nullif(p_data->>'target','')::uuid;
 b:=trim(coalesce(p_data->>'body',''));reason:=trim(coalesce(p_data->>'reason',''));
 if length(b)>2000 or length(reason)>500 then raise exception 'Invalid length' using errcode='22023';end if;
 if sid is not null then perform 1 from public.stalls where id=sid for update;
 if not found then raise exception 'Stall unavailable' using errcode='22023';end if;end if;
 if target is not null then select * into c from public.complaints where id=target for update;end if;
 if p_kind in ('review','report','review_report') and
 (not private.has_role('customer') or not exists(select 1 from public.profiles where id=auth.uid() and verified_at is not null))
 then raise exception 'Verified customer required' using errcode='42501';end if;
 if p_kind in ('status','flag','remove_flag','review_status','approve_reply','referral','stall_status','schedule','dietary')
 and not private.has_role('admin') then raise exception 'Moderator required' using errcode='42501';end if;
 if p_kind in ('triage','status','flag','remove_flag','review_status','approve_reply','referral','stall_status','schedule','dietary')
 and reason='' then raise exception 'Decision reason required' using errcode='22023';end if;
 if p_kind='review' then
 if sid is null or exists(select 1 from public.stall_memberships where stall_id=sid and user_id=actor)
 or not exists(select 1 from public.stalls where id=sid and published) or length(b) not between 1 and 1500
 or (p_data->>'rating')::integer not between 1 and 5 then raise exception 'Review denied' using errcode='22023';end if;
 if (select count(*) from private.community_audit where community_audit.actor=auth.uid() and kind='review'
 and created_at>=date_trunc('day',now() at time zone 'Asia/Kuala_Lumpur') at time zone 'Asia/Kuala_Lumpur')>=5
 then raise exception 'Review rate limit' using errcode='P0001';end if;
 insert into public.reviews(stall_id,customer_id,rating,body,photo_description)
 values(sid,actor,(p_data->>'rating')::integer,b,left(coalesce(p_data->>'photo',''),200))
 on conflict(stall_id,customer_id) do update set rating=excluded.rating,body=excluded.body,
 photo_description=excluded.photo_description,status='pending' returning id::text into result;
 elsif p_kind='report' then
 incident:=date_trunc('minute',(p_data->>'incident')::timestamptz);
 if sid is null or incident is null or incident>now() or length(b) not between 10 and 2000
 or coalesce(p_data->>'category','') not in ('hygiene','handling','misleading','other')
 or not exists(select 1 from public.stalls where id=sid and published)
 or jsonb_typeof(coalesce(p_data->'evidence','[]'))<>'array' or jsonb_array_length(coalesce(p_data->'evidence','[]'))>3
 then raise exception 'Report fields invalid' using errcode='22023';end if;
 for key in select jsonb_array_elements_text(coalesce(p_data->'evidence','[]')) loop
 if not exists(select 1 from private.community_uploads u join storage.objects o on o.name=u.key
 and o.bucket_id='complaint-evidence' where u.key=key and u.owner=actor and u.ready)
 then raise exception 'Evidence denied' using errcode='42501';end if;end loop;
 select * into c from public.complaints where reporter_id=actor and stall_id=sid and incident_at=incident
 and status<>'dismissed' order by created_at limit 1;
 if found then update public.complaints set body=b,category=p_data->>'category',status='submitted',evidence_keys=array(select jsonb_array_elements_text(coalesce(p_data->'evidence','[]'))),
 independent=false,independence_group='',approved_summary='',reply_due=now()+interval '48 hours' where id=c.id;result:=c.id::text;
 else
 if (select count(*) from public.complaints where reporter_id=actor
 and created_at>=date_trunc('day',now() at time zone 'Asia/Kuala_Lumpur') at time zone 'Asia/Kuala_Lumpur')>=3
 then raise exception 'Three reports per day' using errcode='P0001';end if;
 insert into public.complaints(stall_id,reporter_id,body,evidence_keys,request_id,category,incident_at)
 values(sid,actor,b,array(select jsonb_array_elements_text(coalesce(p_data->'evidence','[]'))),p_request,
 p_data->>'category',incident) returning id::text into result;end if;
 elsif p_kind='followup' then
 if c.id is null or c.reporter_id<>actor or b='' then raise exception 'Reporter required' using errcode='42501';end if;result:=c.id::text;
 elsif p_kind='triage' then
 select market_id into market from public.stalls where id=c.stall_id;
 if c.id is null or not (private.has_role('admin') or (private.has_role('organiser') and private.organises(market)))
 then raise exception 'Market access denied' using errcode='42501';end if;
 if length(coalesce(p_data->>'summary','')) not between 10 and 500 then raise exception 'Approved summary required' using errcode='22023';end if;
 update public.complaints set status='triaged',approved_summary=private.community_redact(p_data->>'summary'),
 independent=case when private.has_role('admin') then coalesce((p_data->>'independent')::boolean,false) else independent end,
 blocked=case when private.has_role('admin') then coalesce((p_data->>'blocked')::boolean,false) else blocked end,
 independence_group=case when private.has_role('admin') then left(coalesce(p_data->>'group',''),100) else independence_group end
 where id=c.id;result:=c.id::text;
 elsif p_kind='status' then
 if c.id is null or coalesce(p_data->>'status','') not in ('triaged','dismissed','escalated') then raise exception 'Invalid status' using errcode='22023';end if;
 update public.complaints set status=p_data->>'status',independent=case when p_data->>'status'='dismissed' then false else independent end where id=c.id;result:=c.id::text;
 elsif p_kind in ('reply','appeal') then
 if sid is null or not private.has_role('vendor') or not exists(select 1 from public.stall_memberships where stall_id=sid and user_id=actor)
 or length(b) not between 1 and 1000 then raise exception 'Hawker required' using errcode='42501';end if;
 if p_kind='reply' then insert into private.community_replies(stall,body) values(sid,b)
 on conflict(stall) do update set body=excluded.body,approved=false;end if;result:=sid::text;
 elsif p_kind='approve_reply' then
 update private.community_replies set approved=true,body=private.community_redact(body) where stall=sid;
 if not found then raise exception 'Reply missing' using errcode='22023';end if;result:=sid::text;
 elsif p_kind='flag' then
 select count(*),min(created_at+interval '14 days') into eligible,expires_at from private.community_eligible(sid);
 if eligible<3 or exists(select 1 from private.community_eligible(sid) where reply_due>now())
 then raise exception 'Independent reports and reply opportunity required' using errcode='22023';end if;
 insert into private.community_flags values(sid,expires_at,reason) on conflict(stall) do update set expires=excluded.expires,reason=excluded.reason;result:=sid::text;
 elsif p_kind='remove_flag' then delete from private.community_flags where stall=sid;result:=sid::text;
 elsif p_kind='review_status' then
 if coalesce(p_data->>'status','') not in ('published','hidden') then raise exception 'Invalid status' using errcode='22023';end if;
 update public.reviews set status=p_data->>'status' where id=target;if not found then raise exception 'Review missing' using errcode='22023';end if;result:=target::text;
 elsif p_kind='review_report' then
 if b='' or not exists(select 1 from public.reviews where id=target and status='published') then raise exception 'Review unavailable' using errcode='22023';end if;result:=target::text;
 elsif p_kind='referral' then
 if c.id is null or c.approved_summary='' then raise exception 'Approved summary required' using errcode='22023';end if;
 b:=jsonb_build_object('mode','simulated','destination','fictional-authority','stall',c.stall_id,
 'category',c.category,'incident',c.incident_at,'approved_summary',c.approved_summary)::text;
 result:=c.id::text; -- Private simulated draft only; never contact an authority.
 elsif p_kind='stall_status' then
 update public.stalls set published=(p_data->>'published')::boolean where id=sid;result:=sid::text;
 elsif p_kind='schedule' then
 update public.market_schedules set opens_at=(p_data->>'opens')::time,closes_at=(p_data->>'closes')::time,
 closes_next_day=coalesce((p_data->>'next_day')::boolean,false) where market_id=(p_data->>'market')::uuid
 and weekday=(p_data->>'weekday')::integer;if not found then raise exception 'Schedule missing' using errcode='22023';end if;result:=p_data->>'market';
 elsif p_kind='dietary' then
 if coalesce(p_data->>'status','') not in ('declared','non-halal','not-declared') then
 raise exception 'Certification requires separate evidence review' using errcode='22023';end if;
 update public.dietary_claims set status=p_data->>'status',reviewed_at=now() where id=target;
 if not found then raise exception 'Claim missing' using errcode='22023';end if;result:=target::text;
 else raise exception 'Unsupported command' using errcode='22023';end if;
 insert into private.community_audit(target,actor,kind,body) values(result,actor,p_kind,
 private.community_redact(case when p_kind='referral' then b when p_kind in ('followup','reply','appeal','review_report') then b else reason end));
 insert into private.community_requests values(actor,p_request,fingerprint,result,now());return result;
end $$;

-- Existing endpoints cannot bypass the new daily quota and evidence attestation.
revoke execute on function public.submit_complaint(uuid,text,text[],uuid),public.submit_review(uuid,integer,text),
 public.moderate_complaint(uuid,text,uuid) from authenticated;
revoke all on function private.community_redact(text),private.community_eligible(uuid) from public,anon,authenticated;
revoke all on function public.community_command(text,jsonb,uuid),public.community_workspace(),public.community_public() from public,anon,authenticated;
grant execute on function public.community_command(text,jsonb,uuid),public.community_workspace() to authenticated;
grant execute on function public.community_public() to anon,authenticated;

-- Evidence is private and can only be inserted after server content validation.
create function public.authorize_community_evidence(p_key text,p_stage text,p_signature text) returns void
 language plpgsql security definer set search_path='' as $$
declare secret text;expected text;
begin
 if not private.has_role('customer') or not exists(select 1 from public.profiles where id=auth.uid() and verified_at is not null)
 or split_part(p_key,'/',1)<>auth.uid()::text or p_key !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|mp4)$'
 then raise exception 'Verified owner required' using errcode='42501';end if;
 select m.secret into secret from private.media_secret m where singleton;
 if secret is null then raise exception 'Media unavailable' using errcode='42501';end if;
 expected:=encode(extensions.hmac(('community:'||p_stage||':'||p_key)::bytea,secret::bytea,'sha256'),'hex');
 if p_signature is distinct from expected then raise exception 'Validation denied' using errcode='42501';end if;
 if p_stage='authorize' then
 perform 1 from public.profiles where id=auth.uid() for update;
 if (select count(*) from private.community_uploads where owner=auth.uid() and expires>now())>=6 then raise exception 'Upload quota' using errcode='P0001';end if;
 insert into private.community_uploads(key,owner) values(p_key,auth.uid());
 elsif p_stage='complete' then update private.community_uploads set ready=true where key=p_key and owner=auth.uid() and expires>now();
 if not found then raise exception 'Upload expired' using errcode='22023';end if;
 else raise exception 'Invalid stage' using errcode='22023';end if;
end $$;
revoke all on function public.authorize_community_evidence(text,text,text) from public,anon,authenticated;
grant execute on function public.authorize_community_evidence(text,text,text) to authenticated;
create function private.community_upload_allowed(object_name text) returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.community_uploads where key=object_name and owner=auth.uid() and not ready and expires>now())
$$;
revoke all on function private.community_upload_allowed(text) from public,anon,authenticated;
grant execute on function private.community_upload_allowed(text) to authenticated;
drop policy evidence_insert on storage.objects;
create policy evidence_insert on storage.objects for insert to authenticated with check(
 (bucket_id='complaint-evidence' and private.community_upload_allowed(name)) or
 (bucket_id='certifications' and (storage.foldername(name))[1]=auth.uid()::text and private.has_role('vendor')));
update storage.buckets set allowed_mime_types=array['image/jpeg','video/mp4'] where id='complaint-evidence';
commit;
