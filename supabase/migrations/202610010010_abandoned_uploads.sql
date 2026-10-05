begin;
alter table private.listing_uploads add column abandoned_at timestamptz;
-- Explicit cancellation resolves a pending client save before cleanup is permitted.
-- Both vendor commands and cleanup lock the same profile row before attachment checks.
create or replace function public.check_listing_cleanup(p_key text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.profiles where id=auth.uid() for update;
 update private.listing_uploads set abandoned_at=coalesce(abandoned_at,now())
 where object_key=p_key and actor_id=auth.uid() and not attached;
 if not found then raise exception 'Photo is attached or unavailable' using errcode='42501';end if;
end $$;
create or replace function private.attach_listing_photo(p_key text,p_stall uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_key is null then return;end if;
 update private.listing_uploads set attached=true
 where object_key=p_key and stall_id=p_stall and actor_id=auth.uid() and ready and abandoned_at is null;
 if not found then raise exception 'Photo is not an approved upload for this stall' using errcode='42501';end if;
end $$;
revoke all on function public.check_listing_cleanup(text) from public;
grant execute on function public.check_listing_cleanup(text) to authenticated;
create index listing_sweep_due on private.listing_uploads(expires_at) where not attached;
commit;
