begin;
create table private.voice_requests(actor_id uuid not null,request_id uuid not null,fingerprint text not null,result uuid not null,primary key(actor_id,request_id));
create table private.voice_attempts(actor_id uuid not null,at timestamptz not null default now());
create function public.reserve_voice_attempt() returns void language plpgsql security definer set search_path='' as $$ begin
 if not(private.has_role('vendor') or private.has_role('admin')) then raise exception 'Vendor required' using errcode='42501';end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 if (select count(*) from private.voice_attempts where actor_id=auth.uid() and at>now()-interval '1 hour')>=20 then raise exception 'Voice quota reached' using errcode='P0001';end if;
 insert into private.voice_attempts(actor_id) values(auth.uid());end $$;
create function public.confirm_voice_listing(p_food jsonb,p_batch jsonb,p_transcript text,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;fingerprint text;previous private.voice_requests;begin
 if not(private.has_role('vendor') or private.has_role('admin')) or length(p_transcript)>1000 or p_batch->>'food_item_id' is distinct from p_food->>'id' or p_batch->'handling'->>'storage' is distinct from 'ambient' then raise exception 'Invalid confirmed voice listing' using errcode='42501';end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 fingerprint=encode(extensions.digest(jsonb_build_array(p_food,p_batch,p_transcript)::text,'sha256'),'hex');
 select * into previous from private.voice_requests where actor_id=auth.uid() and request_id=p_request;
 if found then if previous.fingerprint<>fingerprint then raise exception 'Retry conflict' using errcode='23505';end if;return previous.result;end if;
 perform public.vendor_command('food',p_food,p_request);
 result=public.vendor_command('batch',p_batch,md5(p_request::text||':batch')::uuid);
 perform public.confirm_advisory(result,array(select jsonb_array_elements_text(p_food->'ingredients')),true,true,md5(p_request::text||':declaration')::uuid);
 insert into private.voice_requests values(auth.uid(),p_request,fingerprint,result);
 insert into public.extraction_runs(owner_id,stall_id,transcript,extracted,confirmed_at,status,source_scenario) values(auth.uid(),(p_food->>'stall_id')::uuid,p_transcript,jsonb_build_object('food',p_food,'batch',p_batch,'batch_id',result,'confirmation_schema','CONFIRMED_LISTING_V1'),now(),'confirmed','phase6');
 return result;end $$;
revoke all on function public.reserve_voice_attempt(),public.confirm_voice_listing(jsonb,jsonb,text,uuid) from public;
grant execute on function public.reserve_voice_attempt(),public.confirm_voice_listing(jsonb,jsonb,text,uuid) to authenticated;
alter function private.closing_tick() rename to closing_tick_v5;
revoke execute on function private.closing_tick_v5() from pasarmalam_agent;
create function private.closing_tick() returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.closing_tick_v5();
 delete from private.voice_attempts where at<now()-interval '1 hour';
 delete from public.extraction_runs where source_scenario='phase6' and confirmed_at<now()-interval '30 days';end $$;
revoke all on function private.closing_tick() from public;
grant execute on function private.closing_tick() to pasarmalam_agent;
commit;
