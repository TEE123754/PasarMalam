# Supabase Preview migration history recovery

The GitHub check on 8 October 2026 failed with `Remote migration versions not found in local migrations directory.` The first 14 migrations had been applied through the Management API, which recorded application-time versions (`20261006172435` through `20261006172824`). Git contained the original versions (`202610010001` through `20261002104837`).

All 14 remote application SQL bodies were compared with the repository files. Differences were limited to outer transaction statements and appended `private.schema_migrations` bookkeeping. The guarded repair in [repair_supabase_migration_history.sql](../scripts/repair_supabase_migration_history.sql) aligns Supabase's recorded versions with the existing files. It preserves recorded statements and the operator ledger, and does not replay schema changes or reset data. A second run leaves the repaired versions unchanged.

This is an operator recovery script, deliberately outside `supabase/migrations`. Run it only against the affected guarded PasarMalam demo database, after backing up its migration history and verifying application SQL equivalence. Its guards check the known names, versions and operator ledger evidence; they do not replace that SQL comparison. Validate afterward that every remote version has a matching local file, then check the new GitHub commit's Supabase Preview result.

For future connected changes, use the Supabase CLI with the committed migration files so the recorded versions stay consistent with Git. Discover the installed commands with `supabase migration --help` and `supabase db --help`. Do not apply an existing file through an API operation that generates a fresh migration version. The custom `scripts/demo_db.py` operator runner tracks its own private ledger; it is not a substitute for Supabase's deployment history.

Reference: [Supabase migration repair](https://supabase.com/docs/reference/cli/supabase-migration-repair).
