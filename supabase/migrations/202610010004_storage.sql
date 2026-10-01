begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('listing-media','listing-media',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('complaint-evidence','complaint-evidence',false,5242880,array['image/jpeg','image/png','application/pdf']),
 ('certifications','certifications',false,5242880,array['image/jpeg','image/png','application/pdf'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create function private.listing_path_owned(object_name text) returns boolean language sql stable
security definer set search_path='' as $$
  select case when split_part(object_name,'/',1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then private.owns_stall(split_part(object_name,'/',1)::uuid) and split_part(object_name,'/',2)=auth.uid()::text
    else false end
$$;
revoke all on function private.listing_path_owned(text) from public;
grant execute on function private.listing_path_owned(text) to authenticated;
create policy listing_read on storage.objects for select to anon,authenticated using(bucket_id='listing-media');
create policy listing_insert on storage.objects for insert to authenticated
  with check(bucket_id='listing-media' and private.listing_path_owned(name));
create policy listing_update on storage.objects for update to authenticated
  using(bucket_id='listing-media' and private.listing_path_owned(name))
  with check(bucket_id='listing-media' and private.listing_path_owned(name));
create policy listing_delete on storage.objects for delete to authenticated
  using(bucket_id='listing-media' and private.listing_path_owned(name));
create policy evidence_read on storage.objects for select to authenticated
  using(bucket_id in ('complaint-evidence','certifications') and
    ((storage.foldername(name))[1]=auth.uid()::text or private.has_role('admin')));
create policy evidence_insert on storage.objects for insert to authenticated
  with check((storage.foldername(name))[1]=auth.uid()::text and
    ((bucket_id='complaint-evidence' and private.has_role('customer') and
      exists(select 1 from public.profiles where id=auth.uid() and verified_at is not null))
     or (bucket_id='certifications' and private.has_role('vendor'))));
-- Evidence is append-only for browser clients. Moderated deletion/retention comes in Phase 7.
commit;
