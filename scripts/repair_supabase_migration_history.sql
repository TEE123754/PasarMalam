-- One-time history repair for the guarded PasarMalam demo project.
-- Application SQL was compared with all 14 repository files before this repair.
-- This changes migration version metadata only; it does not replay any migration.
begin;
lock table supabase_migrations.schema_migrations in exclusive mode;

create temporary table migration_version_repair (
  remote_version text primary key,
  local_version text unique not null,
  migration_name text not null
) on commit drop;

insert into migration_version_repair values
  ('20261006172435', '202610010001', 'foundation'),
  ('20261006172512', '202610010002', 'future_records'),
  ('20261006172520', '202610010003', 'protected_operations'),
  ('20261006172527', '202610010004', 'storage'),
  ('20261006172535', '202610010005', 'discovery'),
  ('20261006172606', '202610010006', 'vendor_workflows'),
  ('20261006172722', '202610010007', 'freshness_agent'),
  ('20261006172730', '202610010008', 'agent_runtime'),
  ('20261006172738', '202610010009', 'voice_confirmation'),
  ('20261006172745', '202610010010', 'abandoned_uploads'),
  ('20261006172753', '202610010011', 'community'),
  ('20261006172802', '20261002051951', 'commerce_simulation'),
  ('20261006172808', '20261002060812', 'partner_simulation'),
  ('20261006172824', '20261002104837', 'test_push');

do $$
begin
  if not exists (
    select 1 from private.environment_guard
    where product = 'pasarmalam' and mode = 'disposable-demo'
  ) then
    raise exception 'Requires the guarded PasarMalam demo database';
  end if;
  if exists (
    select 1 from migration_version_repair r
    where (
      select count(*) from supabase_migrations.schema_migrations m
      where m.version in (r.remote_version, r.local_version)
        and m.name = r.migration_name
    ) <> 1
  ) then
    raise exception 'Unexpected migration history; inspect before repairing';
  end if;
  if exists (
    select 1 from migration_version_repair r
    where not exists (
      select 1 from private.schema_migrations p
      where p.version = r.local_version || '_' || r.migration_name || '.sql'
    )
  ) then
    raise exception 'Missing operator ledger evidence for an applied migration';
  end if;
end $$;

update supabase_migrations.schema_migrations m
set version = r.local_version
from migration_version_repair r
where m.version = r.remote_version and m.name = r.migration_name;

select version, name from supabase_migrations.schema_migrations order by version;
commit;
