from pathlib import Path

import pytest
from demo_db import target_configuration, verify_marker
from pglast import ast, parse_sql

ROOT = Path(__file__).resolve().parents[3]


@pytest.mark.parametrize(
    "path", sorted((ROOT / "supabase/migrations").glob("*.sql")), ids=lambda p: p.name
)
def test_postgres_migration_syntax_and_unique_columns(path):
    statements = parse_sql(path.read_text(encoding="utf-8"))
    assert statements
    for item in statements:
        if isinstance(item.stmt, ast.CreateStmt):
            columns = [
                column.colname
                for column in item.stmt.tableElts or ()
                if isinstance(column, ast.ColumnDef)
            ]
            assert len(columns) == len(set(columns)), (
                f"Duplicate columns in {item.stmt.relation.relname}"
            )


@pytest.mark.parametrize(
    "change",
    [
        {"APP_ENV": "production"},
        {"DEMO_PROJECT_REF": "other"},
        {"DATABASE_URL": "postgresql://operator:fake@other.invalid:54322/postgres"},
        {"SUPABASE_URL": "http://169.254.169.254:54321"},
    ],
)
def test_operator_target_refuses_wrong_environment(monkeypatch, change):
    for key, value in {
        "APP_ENV": "demo",
        "DEMO_PROJECT_REF": "local",
        "SUPABASE_URL": "http://127.0.0.1:54321",
        "DATABASE_URL": "postgresql://operator:fake@127.0.0.1:54322/postgres",
        **change,
    }.items():
        monkeypatch.setenv(key, value)
    with pytest.raises(ValueError):
        target_configuration()


def test_seed_refuses_missing_marker(monkeypatch):
    monkeypatch.delenv("DEMO_DATABASE_ID", raising=False)
    with pytest.raises(ValueError, match="DEMO_DATABASE_ID"):
        verify_marker(None)
