import importlib.util
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.partner_readiness import (
    DRAFT_FIELDS,
    KINDS,
    REQUIREMENTS,
    Evidence,
    assess,
    authority_draft,
)

NOW = datetime(2026, 10, 8, tzinfo=timezone.utc)


def ready(kind="authority"):
    return Evidence(
        kind=kind,
        partner_identity="Synthetic test identity",
        owner="Test owner",
        agreement_reference="test/agreement",
        source_reference="test/source",
        reviewed_at=NOW - timedelta(days=1),
        expires_at=NOW + timedelta(days=1),
        reviewer="Test reviewer",
        fictional=False,
        checks=dict.fromkeys(REQUIREMENTS[kind], True),
        allowed_fields=list(DRAFT_FIELDS),
        sample_reference="test/sample",
        adapter_test_reference="test/results",
    )


@pytest.mark.parametrize("kind", KINDS)
def test_complete_references_never_activate_or_certify(kind):
    result = assess(ready(kind), NOW)
    assert result["status"] == "references_ready_for_human_review"
    assert result["external_transmission_enabled"] is False
    assert "not been authenticated" in result["warning"]


@pytest.mark.parametrize(
    "changes, reason",
    [
        ({"fictional": True}, "real_evidence"),
        ({"revoked": True}, "revoked"),
        ({"expires_at": NOW}, "current_expiry"),
        ({"reviewed_at": NOW + timedelta(days=2)}, "valid_review_date"),
        ({"checks": {}}, "consent_procedure"),
        ({"allowed_fields": []}, "approved_data_scope"),
        ({"agreement_reference": None}, "agreement_reference"),
    ],
)
def test_missing_or_stale_evidence(changes, reason):
    assert reason in assess(ready().model_copy(update=changes), NOW)["missing"]


@pytest.mark.parametrize(
    "changes",
    [
        {"fictional": "false"},
        {"checks": {"consent_procedure": "true"}},
        {"checks": {"unknown": True}},
        {"reviewed_at": "2026-10-08T10:00:00"},
        {"allowed_fields": ["reporter_email"]},
        {"endpoint": "https://example.org"},
        {"allowed_fields": ["case_reference", "case_reference"]},
    ],
)
def test_contract_rejects_coercion_identifiers_and_unknown_fields(changes):
    with pytest.raises(ValidationError):
        Evidence.model_validate({**ready().model_dump(), **changes})


def test_authority_projection_consent_and_exact_scope():
    payload = dict.fromkeys(DRAFT_FIELDS, "Synthetic redacted draft")
    assert authority_draft(ready(), payload, reviewed=True, consent=True)["fields"] == payload
    for reviewed, consent in [(False, True), (True, False), (True, "true")]:
        with pytest.raises(ValueError):
            authority_draft(ready(), payload, reviewed=reviewed, consent=consent)
    with pytest.raises(ValueError):
        authority_draft(ready(), {**payload, "original": "private"}, reviewed=True, consent=True)


def test_private_templates_preserve_existing_and_review_redacts_errors(tmp_path):
    path = Path(__file__).resolve().parents[3] / "scripts/cp10_prepare.py"
    spec = importlib.util.spec_from_file_location("cp10_prepare", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    assert len(module.prepare(tmp_path)) == 6
    original = (tmp_path / "media.json").read_bytes()
    assert module.prepare(tmp_path) == []
    assert (tmp_path / "media.json").read_bytes() == original
    result = module.review(tmp_path, NOW)
    assert all(item["status"] == "missing_evidence" for item in result["results"])
    (tmp_path / "media.json").write_text('{"private": "do-not-print"}', encoding="utf-8")
    assert "do-not-print" not in json.dumps(module.review(tmp_path, NOW))
