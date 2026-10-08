"""CP6: private moderator drafts and reproducible, labelled impact aggregates."""

import json
from datetime import date, datetime
from uuid import UUID

import httpx
from fastapi import APIRouter, HTTPException, Response
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StrictInt

from .accounting import report
from .routes import Member, require
from .voice import extraction_provider

router = APIRouter(prefix="/api/v1/impact", tags=["impact"])
CATEGORIES = {
    "hygiene",
    "handling",
    "misleading",
    "other",
    "spoiled-food",
    "pests",
    "cross-contamination",
    "unhygienic-handling",
}


def summary_template(source: dict) -> str:
    category = source.get("category") if source.get("category") in CATEGORIES else "other"
    return (
        f"One reported {category} concern; status {source.get('status', 'submitted')}. "
        "Unverified allegation. Review privately; no public flag or referral is authorised."
    )


def impact(raw: dict, start: str, end: str, market: str | None = None) -> dict:
    """Closed, fully reconciled preparation-date cohorts only; empty denominators stay unknown."""
    sessions = raw.get("sessions")
    if sessions is None:
        sessions = report(raw)["sessions"]
        stalls = {s["id"]: s for s in raw["stalls"]}
        sessions = [{**s, "market": stalls[s["stall"]]["market"]} for s in sessions]
    rows = [
        s
        for s in sessions
        if start <= s["date"] <= end and (market is None or s["market"] == market)
    ]
    eligible = [
        s
        for s in rows
        if s["closed"]
        and s["reconciled"]
        and s["prepared"] is not None
        and s["prepared"] > 0
        and s["closing_leftovers"] is not None
        and not s.get("suppressed", False)
    ]
    prepared = sum(s["prepared"] for s in eligible)
    leftovers = sum(s["closing_leftovers"] for s in eligible)
    weights = []
    for m in raw.get("movements", []):
        if m["kind"] == "transfer-out":
            continue
        batch = next((b for b in raw["batches"] if b["id"] == m["batch"]), None)
        if not batch or not (start <= batch["session"] <= end):
            continue
        if market and not any(
            s["id"] == batch["stall"] and s["market"] == market for s in raw["stalls"]
        ):
            continue
        samples = [
            w
            for w in raw.get("weights", [])
            if w["data"].get("food") == batch["food"]
            and (
                w["data"].get("movement") == m["id"]
                or w["data"]["measured_at"] <= m["at"]
                and 0
                <= (
                    datetime.fromisoformat(m["at"].replace("Z", "+00:00"))
                    - datetime.fromisoformat(w["data"]["measured_at"].replace("Z", "+00:00"))
                ).total_seconds()
                <= 30 * 86400
            )
        ]
        weighed = next(
            (
                w
                for w in samples
                if w["data"].get("movement") == m["id"] and w["data"]["method"] == "weighed-route"
            ),
            None,
        )
        sample = max(
            (w for w in samples if w["data"]["method"] == "portion-sample"),
            key=lambda w: w["data"]["measured_at"],
            default=None,
        )
        chosen = weighed or sample
        grams = (
            (
                float(chosen["data"]["grams"])
                * (1 if weighed else m["units"] / int(chosen["data"]["portions"]))
            )
            if chosen
            else None
        )
        weights.append(
            {
                "source": m["id"],
                "route": m["kind"],
                "portions": m["units"],
                "method": "weighed" if weighed else "estimated" if sample else "unknown",
                "kg": round(grams / 1000, 4) if grams is not None else None,
                "uncertainty_pct": chosen["data"]["uncertainty_pct"] if chosen else None,
                "sample_count": chosen["data"]["portions"] if chosen else None,
                "sample_date": chosen["data"]["measured_at"] if chosen else None,
            }
        )

    weights.extend(
        w
        for w in raw.get("aggregate_weights", [])
        if start <= w["date"] <= end and (market is None or w["market"] == market)
    )

    def scoped(kind, threshold, key):
        return [
            {
                **{k: v for k, v in r.items() if k not in ("actors", "reporters")},
                key: r[key] if r[threshold] >= 5 else None,
                **(
                    {
                        "active_users": r.get("active_users", r[threshold])
                        if r[threshold] >= 5
                        else None
                    }
                    if kind == "engagement"
                    else {}
                ),
                "suppressed": r[threshold] < 5,
            }
            for r in raw.get(kind, [])
            if start <= r["date"] <= end and (market is None or r["market"] == market)
        ]

    return {
        "start": start,
        "end": end,
        "market": market,
        "definition": "Closed reconciled stall sessions by Malaysia preparation date; "
        "compare the same market and equal-length baseline/trial periods.",
        "sessions": rows,
        "included_sessions": len(eligible),
        "excluded_sessions": len(rows) - len(eligible),
        "prepared_denominator": prepared,
        "leftovers": leftovers,
        "leftovers_per_100": round(leftovers * 100 / prepared, 2) if prepared else None,
        "weights": weights,
        "engagement": scoped("engagement", "actors", "events"),
        "concerns": scoped("concerns", "reporters", "reports"),
        "posting": [
            r
            for r in raw.get("posting", [])
            if start <= r["date"] <= end and (market is None or r["market"] == market)
        ],
        "active_window": "Distinct consenting accounts per market/day and event type; "
        "15-minute server buckets per account/session/target. "
        "30-day retained event window. Posting counts unique confirmed batches.",
        "claim": "Reported concerns are unverified. "
        "Estimates are not weighed food or proven diversion.",
    }


class Command(BaseModel):
    model_config = ConfigDict(extra="forbid")
    kind: str = Field(min_length=1, max_length=30)
    data: dict = Field(max_length=12)
    request_id: UUID


class WeightInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    stall: UUID
    food: UUID
    method: str
    grams: float = Field(ge=1, le=1000000, allow_inf_nan=False, strict=True)
    portions: StrictInt = Field(ge=1, le=100000)
    uncertainty_pct: float = Field(ge=0, le=100, allow_inf_nan=False, strict=True)
    measured_at: AwareDatetime
    movement: str | None = Field(default=None, min_length=1, max_length=150)
    route: str | None = None


@router.post("/command")
async def command(body: Command, member: Member):
    if body.kind == "weight-sample":
        try:
            checked = WeightInput.model_validate(body.data)
        except ValueError as exc:
            raise HTTPException(422, "Check measured sample fields") from exc
        body.data = checked.model_dump(mode="json", exclude_none=True)
    result = await member.repository.rpc(
        "cp6_command", {"p_kind": body.kind, "p_data": body.data, "p_request": str(body.request_id)}
    )
    return {"id": result}


@router.get("/workspace")
async def workspace(member: Member, response: Response):
    response.headers["Cache-Control"] = "no-store"
    return await member.repository.rpc("cp6_workspace", {})


class Period(BaseModel):
    model_config = ConfigDict(extra="forbid")
    start: date
    end: date
    market: UUID | None = None


@router.post("/report")
async def metrics(period: Period, member: Member, response: Response):
    require(member, "vendor", "organiser", "admin")
    if period.end < period.start or (period.end - period.start).days > 90:
        raise HTTPException(422, "Choose a period of at most 91 days")
    response.headers["Cache-Control"] = "no-store"
    raw = await member.repository.rpc("cp6_impact_source", {})
    return impact(
        raw,
        period.start.isoformat(),
        period.end.isoformat(),
        str(period.market) if period.market else None,
    )


class SummaryInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    report: UUID
    external_consent: bool = False


@router.post("/summary")
async def summary(body: SummaryInput, member: Member, response: Response):
    require(member, "admin", "organiser")
    source = await member.repository.rpc("cp6_summary_source", {"p_report": str(body.report)})
    response.headers["Cache-Control"] = "no-store"
    draft, provider = summary_template(source), "category-template"
    # Only enumerated category/status and count may leave the server: never report prose,
    # identities, source IDs, location, evidence or a moderator's edited text.
    if body.external_consent:
        url, headers, model, provider = extraction_provider()
        safe = {
            "category": source["category"] if source["category"] in CATEGORIES else "other",
            "status": source["status"]
            if source["status"] in {"submitted", "triaged", "dismissed", "escalated"}
            else "submitted",
            "count": 1,
        }
        try:
            async with httpx.AsyncClient(timeout=20, follow_redirects=False) as client:
                r = await client.post(
                    url,
                    headers=headers,
                    json={
                        "model": model,
                        "max_tokens": 160,
                        "temperature": 0,
                        "messages": [
                            {
                                "role": "system",
                                "content": "Write a short neutral private moderation draft "
                                "from these enumerated metadata. Say the concern is unverified. "
                                "Do not invent names, evidence, guilt, safety, flags or referrals.",
                            },
                            {"role": "user", "content": json.dumps(safe)},
                        ],
                    },
                )
                r.raise_for_status()
                text = r.json()["choices"][0]["message"]["content"].strip()
                if not 10 <= len(text) <= 450:
                    raise ValueError("Invalid draft")
                draft = text + " Human review required; no public action authorised."
        except (httpx.HTTPError, ValueError, KeyError, IndexError):
            draft, provider = summary_template(source), "category-template-fallback"
    return {
        "body": draft[:500],
        "source": provider,
        "status": "private-draft",
        "shared_fields": ["category", "status", "count"] if body.external_consent else [],
    }
