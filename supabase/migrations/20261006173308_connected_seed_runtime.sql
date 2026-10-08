-- Operator-only seed generations. Resets retire records, never rewind a food timer.
begin;
create table private.demo_seed_runs (
  id uuid primary key default gen_random_uuid(),
  catalog_hash text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  retired_at timestamptz,
  counts jsonb not null default '{}'
);
create unique index demo_seed_one_current on private.demo_seed_runs((true))
  where retired_at is null;
revoke all on private.demo_seed_runs from public,anon,authenticated,pasarmalam_agent;
-- Local dispatch polls the scoped database; a hosted scheduler cannot reach localhost.
-- Existing hosted dispatcher support remains available for the final deployment phase.
commit;
