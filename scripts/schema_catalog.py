"""Generate explicit minimal tables for later PRD modules; behavior stays in later phases.

Run only when editing this catalogue, then review/commit the resulting SQL migration.
Never regenerate an already-applied migration in a connected project.
"""

from pathlib import Path

USER = "uuid references public.profiles(id)"
STALL = "uuid references public.stalls(id)"
ORG = "uuid references public.organisations(id)"
BATCH = "uuid references public.batches(id)"
TABLES = {
    "media_assets": f"owner_id {USER} not null, stall_id {STALL}, complaint_id uuid references public.complaints(id), batch_id {BATCH}, bucket text not null check(bucket in ('listing-media','complaint-evidence','certifications')), object_key text not null, generated boolean not null default true, unique(bucket,object_key)",
    "dietary_claims": f"stall_id {STALL} not null, food_item_id uuid references public.food_items(id), status text not null check(status in ('declared','certified','non-halal','not-declared')), evidence_id uuid references public.media_assets(id), expires_at timestamptz, reviewed_at timestamptz",
    "alerts": f"owner_id {USER} not null, batch_id {BATCH}, threshold_minutes integer check(threshold_minutes>=0), read_at timestamptz, dedup_key text not null unique",
    "favourites": f"owner_id {USER} not null, stall_id {STALL} not null, unique(owner_id,stall_id)",
    "check_ins": f"owner_id {USER} not null, market_id uuid not null references public.markets(id), on_date date not null, unique(owner_id,market_id,on_date)",
    "review_reports": f"owner_id {USER} not null, review_id uuid not null references public.reviews(id), reason text not null, unique(owner_id,review_id)",
    "campaigns": f"organisation_id {ORG} not null, stall_id {STALL}, budget_sen integer not null default 0 check(budget_sen>=0), starts_at timestamptz, ends_at timestamptz",
    "ad_creatives": f"organisation_id {ORG} not null, campaign_id uuid not null references public.campaigns(id), media_id uuid references public.media_assets(id)",
    "inventory_outcomes": f"stall_id {STALL} not null, batch_id {BATCH}, sold_quantity integer not null default 0 check(sold_quantity>=0), waste_grams integer not null default 0 check(waste_grams>=0)",
    "analytics_daily": f"organisation_id {ORG}, stall_id {STALL}, on_date date not null, metrics jsonb not null default '{{}}'",
    "collaboration_requests": f"organisation_id {ORG} not null, stall_id {STALL} not null, request_id uuid not null unique",
    "media_features": f"organisation_id {ORG} not null, stall_id {STALL}, collaboration_id uuid references public.collaboration_requests(id), title text not null",
    "food_trails": f"organisation_id {ORG} not null, name text not null, feature_id uuid references public.media_features(id)",
    "referral_consents": f"owner_id {USER} not null, complaint_id uuid not null references public.complaints(id), organisation_id {ORG} not null, consented_at timestamptz not null, withdrawn_at timestamptz",
    "authority_cases": f"organisation_id {ORG} not null, consent_id uuid not null references public.referral_consents(id), stall_id {STALL} not null, reference text not null unique check(reference like 'DEMO-%'), redacted_summary text not null",
    "case_events": f"organisation_id {ORG} not null, case_id uuid not null references public.authority_cases(id), actor_id {USER}, kind text not null",
    "inspection_visits": f"organisation_id {ORG} not null, case_id uuid not null references public.authority_cases(id), scheduled_at timestamptz, redacted_findings text",
    "permits": f"organisation_id {ORG} not null, stall_id {STALL} not null, reference text not null unique check(reference like 'DEMO-%'), expires_at timestamptz",
    "orders": f"owner_id {USER} not null, stall_id {STALL} not null, total_sen integer not null check(total_sen>=0), request_id uuid not null unique, fulfilment text not null default 'pay-at-stall' check(fulfilment in ('pay-at-stall','demo-pickup','demo-delivery'))",
    "order_lines": f"owner_id {USER} not null, stall_id {STALL} not null, order_id uuid not null references public.orders(id), batch_id {BATCH} not null, quantity integer not null check(quantity>0), unit_price_sen integer not null check(unit_price_sen>=0)",
    "reservations": f"owner_id {USER} not null, stall_id {STALL} not null, order_id uuid references public.orders(id), batch_id {BATCH} not null, quantity integer not null check(quantity>0), expires_at timestamptz not null, released_at timestamptz, request_id uuid not null unique",
    "payments": f"owner_id {USER} not null, order_id uuid not null references public.orders(id), amount_sen integer not null check(amount_sen>=0), reference text not null unique check(reference like 'DEMO-%'), request_id uuid not null unique",
    "refunds": f"owner_id {USER} not null, payment_id uuid not null references public.payments(id), amount_sen integer not null check(amount_sen>0), request_id uuid not null unique",
    "subscriptions": f"owner_id {USER}, organisation_id {ORG}, tier text not null default 'basic', expires_at timestamptz",
    "invoices": f"owner_id {USER}, organisation_id {ORG}, subscription_id uuid references public.subscriptions(id), amount_sen integer not null check(amount_sen>=0), reference text not null unique check(reference like 'DEMO-%')",
    "ad_events": f"organisation_id {ORG} not null, campaign_id uuid not null references public.campaigns(id), kind text not null check(kind in ('impression','click','no-fill')), event_id uuid not null unique",
    "campaign_budgets": f"organisation_id {ORG} not null, campaign_id uuid not null unique references public.campaigns(id), allocated_sen integer not null check(allocated_sen>=0), spent_sen integer not null default 0 check(spent_sen>=0 and spent_sen<=allocated_sen)",
    "delivery_jobs": f"organisation_id {ORG} not null, owner_id {USER} not null, stall_id {STALL} not null, order_id uuid not null references public.orders(id), assigned_user_id {USER}, eta_at timestamptz",
    "collection_jobs": f"organisation_id {ORG} not null, stall_id {STALL} not null, batch_id {BATCH}, destination text not null check(destination in ('donation','compost','bsf')), weight_grams integer check(weight_grams>=0)",
    "collection_events": f"organisation_id {ORG} not null, stall_id {STALL} not null, collection_id uuid not null references public.collection_jobs(id), kind text not null, event_id uuid not null unique",
    "notification_preferences": f"owner_id {USER} not null unique, push_opt_in boolean not null default false, sms_opt_in boolean not null default false, email_opt_in boolean not null default false, coarse_cell text, location_expires_at timestamptz, quiet_start time, quiet_end time",
    "notification_outbox": f"owner_id {USER} not null, batch_id {BATCH}, channel text not null check(channel in ('in-app','test-push','simulated-sms','simulated-email')), dedup_key text not null unique, attempts integer not null default 0 check(attempts>=0)",
    "simulated_deliveries": f"owner_id {USER} not null, outbox_id uuid not null references public.notification_outbox(id), reference text not null unique check(reference like 'DEMO-%'), event_id uuid not null unique",
    "sensor_readings": f"stall_id {STALL} not null, batch_id {BATCH}, temperature_c numeric, observed_at timestamptz not null, synthetic boolean not null default true check(synthetic)",
    "weather_snapshots": "market_id uuid not null references public.markets(id), temperature_c numeric, humidity_pct numeric check(humidity_pct between 0 and 100), observed_at timestamptz not null, provider text not null check(provider in ('open-meteo','fixture')), synthetic boolean not null default true",
    "research_scenarios": f"owner_id {USER} not null, name text not null, inputs jsonb not null default '{{}}', operational boolean not null default false check(not operational)",
    "ai_drafts": f"owner_id {USER} not null, stall_id {STALL}, draft jsonb not null default '{{}}', scripted boolean not null default true",
    "demo_scenarios": "name text not null unique, outcome text not null check(outcome in ('success','pending','rejected','timeout'))",
    "integration_events": f"organisation_id {ORG}, owner_id {USER}, provider_key text not null check(provider_key in ('media','authority','payments','ads','delivery','collection','sms','email','sensors')), event_id uuid not null unique, reference text not null check(reference like 'DEMO-%'), outcome text not null check(outcome in ('success','pending','rejected','timeout'))",
    "asset_manifest": "prompt_id text not null unique, filename text not null unique, alt_text text not null, generation_method text not null, license text not null",
    "extraction_runs": f"owner_id {USER} not null, stall_id {STALL}, transcript text not null, extracted jsonb not null default '{{}}', confirmed_at timestamptz",
    "field_confidences": f"owner_id {USER} not null, extraction_id uuid not null references public.extraction_runs(id), field text not null, score numeric not null check(score between 0 and 1), unique(extraction_id,field)",
    "rule_decisions": f"stall_id {STALL} not null, batch_id {BATCH} not null, policy_id uuid not null references public.handling_policies(id), weather_id uuid references public.weather_snapshots(id), deadline timestamptz, reason_codes text[] not null default '{{}}'",
    "agent_runs": f"stall_id {STALL} not null, batch_id {BATCH}, dedup_key text not null unique, outcome text not null",
    "clearance_drafts": f"stall_id {STALL} not null, batch_id {BATCH} not null, agent_run_id uuid references public.agent_runs(id), price_sen integer not null check(price_sen>=0), confirmed_at timestamptz",
    "report_replies": f"stall_id {STALL} not null, complaint_id uuid not null references public.complaints(id), author_id {USER} not null, body text not null, unique(complaint_id,author_id)",
    "public_report_flags": f"stall_id {STALL} not null unique, independent_count integer not null check(independent_count>=3), approved_by {USER} not null, published boolean not null default false, reason text not null",
    "commission_entries": f"owner_id {USER} not null, stall_id {STALL} not null, order_id uuid not null references public.orders(id), amount_sen integer not null check(amount_sen>=0), entry_kind text not null check(entry_kind in ('earned','reversed')), event_id uuid not null unique",
    "forecast_runs": f"stall_id {STALL} not null, on_date date not null, recommendations jsonb not null default '{{}}', synthetic boolean not null default true",
    "pilot_sessions": "market_id uuid not null references public.markets(id), on_date date not null, synthetic boolean not null default true, unique(market_id,on_date,synthetic)",
    "pilot_measurements": f"stall_id {STALL} not null, session_id uuid not null references public.pilot_sessions(id), batch_id {BATCH}, diverted_grams integer not null check(diverted_grams>=0), saved_sen integer not null check(saved_sen>=0), synthetic boolean not null default true, event_id uuid not null unique",
    "push_subscriptions": f"owner_id {USER} not null, endpoint text not null unique, p256dh text not null, auth_key text not null, consented_at timestamptz not null, revoked_at timestamptz",
}


def migration() -> str:
    statements = [
        "-- Generated from scripts/schema_catalog.py; later modules are read-only foundations.",
        "begin;",
    ]
    for table, fields in TABLES.items():
        status = "" if "status text" in fields else "status text not null default 'pending',\n  "
        statements.append(
            f"create table public.{table} (\n  id uuid primary key default gen_random_uuid(),\n  {fields},\n  {status}created_at timestamptz not null default now(),\n  is_demo boolean not null default true check(is_demo),\n  source_scenario text not null default 'phase2'\n);"
        )
        statements.append(
            f"alter table public.{table} enable row level security;\nrevoke all on public.{table} from anon, authenticated;\ngrant select on public.{table} to authenticated;"
        )
        conditions = ["private.has_role('admin')"]
        if "owner_id " in fields:
            conditions.append("owner_id=auth.uid()")
        if "stall_id " in fields:
            conditions.append("private.owns_stall(stall_id)")
        if "organisation_id " in fields and table != "referral_consents":
            conditions.append("private.member_of(organisation_id)")
        if table == "report_replies":
            # A reply never exposes the original reporter/evidence. Moderation adds public output later.
            conditions.append("author_id=auth.uid()")
        if table == "media_assets":
            conditions = ["owner_id=auth.uid()", "private.has_role('admin')"]
        if table in {"asset_manifest", "demo_scenarios"}:
            conditions = ["true"]
        statements.append(
            f"create policy {table}_read on public.{table} for select to authenticated using ({' or '.join(conditions)});"
        )
        if table == "public_report_flags":
            statements.append(
                "revoke select on public.public_report_flags from authenticated;\ngrant select(id,stall_id,independent_count,published,reason,is_demo) on public.public_report_flags to anon, authenticated;\ncreate policy flags_public on public.public_report_flags for select to anon, authenticated using(published and independent_count>=3);"
            )
        for column in ("owner_id", "organisation_id", "stall_id", "batch_id", "market_id"):
            if f"{column} " in fields:
                statements.append(f"create index {table}_{column}_idx on public.{table}({column});")
    statements.append("commit;")
    return "\n\n".join(statements) + "\n"


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    target = root / "supabase/migrations/202610010002_future_records.sql"
    target.write_text(migration(), encoding="utf-8")
    print(f"Generated {len(TABLES)} foundation tables.")
