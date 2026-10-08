-- Keep new disposable profiles invite-only even if a provider signup endpoint is reachable.
begin;
create or replace function public.onboard_customer(p_display_name text,p_locale text) returns uuid
language plpgsql security definer set search_path='' as $$
declare confirmed timestamptz;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 select email_confirmed_at into confirmed from auth.users where id=auth.uid();
 if confirmed is null then raise exception 'Verified email required' using errcode='42501'; end if;
 if not exists(select 1 from public.profiles where id=auth.uid()) and not exists(select 1 from auth.users where id=auth.uid() and invited_at is not null) then raise exception 'Organiser invitation required' using errcode='42501'; end if;
 if length(trim(coalesce(p_display_name,''))) not between 2 and 80 or coalesce(p_locale,'') not in ('en','ms') then raise exception 'Invalid profile' using errcode='22023'; end if;
 -- Never read browser mode, requested roles or raw user metadata to grant privileges.
 insert into public.profiles(id,display_name,locale,verified_at,source_scenario)
 values(auth.uid(),trim(p_display_name),p_locale,confirmed,'cp1-invited-fictional')
 on conflict(id) do update set display_name=excluded.display_name,locale=excluded.locale;
 insert into public.user_roles(user_id,role) values(auth.uid(),'customer') on conflict do nothing;
 insert into private.profile_onboarding_acceptance(user_id,notice_version) values(auth.uid(),'cp1-draft-2026-10-08') on conflict do nothing;
 return auth.uid();
end $$;

notify pgrst, 'reload schema';
commit;
