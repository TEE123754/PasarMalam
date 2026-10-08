"""Offline CP10 evidence review. Never activates a provider or sends a payload."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictBool, model_validator

KINDS = ("media", "badge", "authority", "permit", "collection", "expansion")
REQUIREMENTS = {
    "media": {"editorial_scope", "publication_rights"},
    "badge": {"approved_wording", "revocation_procedure", "commercial_disclosure"},
    "authority": {"intake_procedure", "redaction_review", "consent_procedure"},
    "permit": {"authoritative_source", "manual_verification", "dispute_procedure"},
    "collection": {"chain_of_custody", "receipt_procedure", "non_consumption_separation"},
    "expansion": {"verified_schedule", "organiser_approval", "stall_onboarding", "pilot_review"},
}


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    kind: Literal["media", "badge", "authority", "permit", "collection", "expansion"]
    partner_identity: str | None = Field(default=None, min_length=3, max_length=200)
    owner: str | None = Field(default=None, min_length=2, max_length=100)
    agreement_reference: str | None = Field(default=None, min_length=3, max_length=300)
    source_reference: str | None = Field(default=None, min_length=3, max_length=300)
    reviewed_at: datetime | None = None
    expires_at: datetime | None = None
    reviewer: str | None = Field(default=None, min_length=2, max_length=100)
    fictional: StrictBool = True
    revoked: StrictBool = False
    checks: dict[str, StrictBool] = Field(default_factory=dict)
    allowed_fields: list[str] = Field(default_factory=list, max_length=12)
    sample_reference: str | None = Field(default=None, min_length=3, max_length=300)
    adapter_test_reference: str | None = Field(default=None, min_length=3, max_length=300)

    @model_validator(mode="after")
    def strict_review(self):
        for date in (self.reviewed_at, self.expires_at):
            if date is not None and date.utcoffset() is None:
                raise ValueError("Evidence dates require a timezone")
        if set(self.checks) - REQUIREMENTS[self.kind]:
            raise ValueError("Unknown review check")
        if any(type(value) is not bool for value in self.checks.values()):
            raise ValueError("Review checks must be booleans")
        if len(set(self.allowed_fields)) != len(self.allowed_fields):
            raise ValueError("Duplicate data fields")
        if set(self.allowed_fields) - set(DRAFT_FIELDS):
            raise ValueError("Only minimised draft fields are supported")
        return self


DRAFT_FIELDS = ("case_reference", "market_reference", "stall_reference", "reviewed_summary")


def assess(evidence: Evidence, now: datetime) -> dict:
    """A references-only checklist is not proof that referenced documents are genuine."""
    if now.utcoffset() is None:
        raise ValueError("Review time requires a timezone")
    missing = []
    for name in (
        "partner_identity",
        "owner",
        "agreement_reference",
        "source_reference",
        "reviewer",
        "sample_reference",
        "adapter_test_reference",
    ):
        if not getattr(evidence, name):
            missing.append(name)
    if evidence.fictional:
        missing.append("real_evidence")
    if evidence.revoked:
        missing.append("revoked")
    if evidence.reviewed_at is None or evidence.reviewed_at > now:
        missing.append("valid_review_date")
    if evidence.expires_at is None or evidence.expires_at <= now:
        missing.append("current_expiry")
    if evidence.reviewed_at and evidence.expires_at and evidence.expires_at <= evidence.reviewed_at:
        missing.append("expiry_after_review")
    for name in sorted(REQUIREMENTS[evidence.kind]):
        if evidence.checks.get(name) is not True:
            missing.append(name)
    if evidence.kind == "authority" and not evidence.allowed_fields:
        missing.append("approved_data_scope")
    return {
        "kind": evidence.kind,
        "status": "missing_evidence" if missing else "references_ready_for_human_review",
        "missing": missing,
        "external_transmission_enabled": False,
        "warning": "References have not been authenticated; human approval is still required.",
    }


def authority_draft(evidence: Evidence, payload: dict, *, reviewed: bool, consent: bool) -> dict:
    """Explicit offline projection; deliberately excludes reporter/original evidence identifiers."""
    if evidence.kind != "authority" or reviewed is not True or consent is not True:
        raise ValueError("Authority draft needs reviewed content and explicit consent")
    if not evidence.allowed_fields:
        raise ValueError("Approved data scope is required")
    if set(payload) != set(evidence.allowed_fields):
        raise ValueError("Draft must match the exact approved data scope")
    if any(
        not isinstance(value, str) or not value.strip() or len(value) > 1500
        for value in payload.values()
    ):
        raise ValueError("Draft fields must be bounded, nonempty text")
    return {"status": "DRAFT ONLY; NOT SENT", "fields": dict(payload)}
