"""CP5 deterministic stock/sale accounting. Integer sen; no pricing or safety LLM."""

import math
from datetime import datetime
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Query, Response
from pydantic import BaseModel, ConfigDict, Field, StrictInt, model_validator

from .routes import Member, require

router = APIRouter(prefix="/api/v1/accounting", tags=["session-accounting"])


def milliseconds(at):
    return datetime.fromisoformat(at.replace("Z", "+00:00")).timestamp() * 1000


def monetary(m):
    known = m["original_total"] is not None and m["total"] is not None
    net = max(0, m["total"] - m.get("refunded", 0)) if known else None
    kept = (
        (m["original_total"] * net // m["total"] if m["total"] > 0 else m["original_total"])
        if known
        else None
    )
    return {
        "revenue": net,
        "savings": max(0, kept - net) if known and not m.get("disputed", False) else None,
    }


def report(raw):
    moves = list({m["id"]: m for m in raw["movements"]}.values())
    batches = []
    for b in raw["batches"]:
        consumed = sum(m["units"] for m in moves if m["batch"] == b["id"])
        diff = (
            None
            if any(b[k] is None for k in ["prepared", "transfer_in", "remaining"])
            else b["prepared"] + b["transfer_in"] - consumed - b["remaining"]
        )
        closing = next((c for c in raw["closings"] if c["batch"] == b["id"]), None)
        batches.append(
            {
                **b,
                "consumed": consumed,
                "difference": diff,
                "reconciled": diff == 0,
                "closing": closing["remaining"] if closing else None,
                "closed": closing is not None,
                "closing_at": closing["at"] if closing else None,
            }
        )
    sessions = []
    for key in dict.fromkeys(f"{b['stall']}|{b['session']}" for b in batches):
        bs = [b for b in batches if f"{b['stall']}|{b['session']}" == key]
        ids = {b["id"] for b in bs}
        rows = [m for m in moves if m["batch"] in ids]
        confirmed = [
            m for m in rows if m["kind"] == "clearance" and m["source"] == "confirmed-collection"
        ]
        reported = [
            m for m in rows if m["kind"] == "clearance" and m["source"] == "vendor-reported"
        ]
        sums = {
            k: sum(m["units"] for m in rows if m["kind"] == k)
            for k in ["normal", "clearance", "giveaway", "donation", "discard", "compost", "bsf"]
        }
        sessions.append(
            {
                "key": key,
                "stall": bs[0]["stall"],
                "date": bs[0]["session"],
                "prepared": None
                if any(b["prepared"] is None for b in bs)
                else sum(b["prepared"] for b in bs),
                **sums,
                "confirmed_clearance": sum(m["units"] for m in confirmed),
                "reported_clearance": sum(m["units"] for m in reported),
                "remaining": None
                if any(b["remaining"] is None for b in bs)
                else sum(b["remaining"] for b in bs),
                "closing_leftovers": sum(b["closing"] for b in bs)
                if all(b["closed"] and b["closing"] is not None for b in bs)
                else None,
                "closed": all(b["closed"] for b in bs),
                "reconciled": all(b["reconciled"] for b in bs),
                "unknown_batches": sum(b["difference"] is None for b in bs),
                "unattributed": None
                if any(b["difference"] is None for b in bs)
                else sum(b["difference"] for b in bs),
                "confirmed_revenue": sum(monetary(m)["revenue"] or 0 for m in confirmed),
                "confirmed_savings": sum(monetary(m)["savings"] or 0 for m in confirmed),
                "reported_revenue": sum(monetary(m)["revenue"] or 0 for m in reported),
                "excluded_price_records": sum(monetary(m)["revenue"] is None for m in confirmed),
                "disputed_collections": sum(bool(m.get("disputed", False)) for m in confirmed),
            }
        )
    return {"batches": batches, "sessions": sessions, "movements": moves}


def recommendation(raw, batch, eta):
    b = next((b for b in raw["batches"] if b["id"] == batch), None)
    now = milliseconds(raw["now"])
    unheld = (
        None
        if b and b["remaining"] is None
        else max(0, (b["remaining"] or 0) - b["held"])
        if b
        else 0
    )
    minutes = (
        max(0, math.floor((milliseconds(b["cutoff"]) - now) / 60000)) if b and b["cutoff"] else 0
    )
    rows = [
        m
        for m in {m["id"]: m for m in raw["movements"]}.values()
        if m["kind"] == "clearance"
        and m["source"] == "confirmed-collection"
        and not m.get("disputed", False)
        and m.get("refunded", 0) == 0
        and m["original_total"] is not None
        and m["total"] is not None
        and now - 1800000 <= milliseconds(m["at"]) <= now
        and any(
            x["id"] == m["batch"] and x["food"] == (b["food"] if b else None)
            for x in raw["batches"]
        )
    ]
    span = (
        max(milliseconds(m["at"]) for m in rows) - min(milliseconds(m["at"]) for m in rows)
        if rows
        else 0
    )
    reconciled = {b["id"] for b in report(raw)["batches"] if b["reconciled"]}
    reliable = (
        len(rows) >= 3
        and span >= 300000
        and all(m["batch"] in reconciled for m in rows)
        and batch in reconciled
    )
    rate = sum(m["units"] for m in rows) / 30 if reliable else None
    eta_valid = (
        eta is not None and isinstance(eta, int) and not isinstance(eta, bool) and 0 <= eta <= 60
    )
    reachable = eta_valid and minutes > eta + 2
    reason = (
        "Batch is closed or ineligible"
        if not b or not b["eligible"] or minutes <= 0
        else "Stock count is unknown"
        if unheld is None
        else "All stock is held or consumed"
        if not unheld
        else "Enter collection ETA; travel time is unknown"
        if not eta_valid
        else "ETA plus 2-minute uncertainty exceeds the collection cutoff"
        if not reachable
        else "Too few independent completed sales over at least 5 minutes in the last 30 minutes"
        if not reliable
        else "Use completed-sale pace, unheld stock and collection time"
    )
    suggest = bool(b and b["eligible"] and unheld and reachable and reliable)
    expected = (
        math.ceil(rate * max(0, minutes - eta - 2)) if rate is not None and eta_valid else None
    )
    return {
        "batch": batch,
        "eligible": bool(b and b["eligible"]),
        "unheld": unheld,
        "minutes": minutes,
        "eta": eta,
        "eta_source": "shopper-entered" if eta_valid else "unknown",
        "uncertainty_minutes": 2,
        "fulfilment_buffer_minutes": 15,
        "samples": len(rows),
        "reliable": reliable,
        "units_per_minute": rate,
        "expected_sales": expected,
        "suggested_discount": (50 if minutes <= 30 else 25)
        if suggest and unheld > expected
        else None,
        "reason": reason,
        "cutoff": b["cutoff"] if b else None,
        "approval_required": True,
    }


class Command(BaseModel):
    model_config = ConfigDict(extra="forbid")
    batch: UUID
    kind: Literal["normal", "giveaway", "discard", "close"]
    units: StrictInt | None = Field(default=None, ge=1, le=100000)
    note: str = Field(min_length=2, max_length=250)
    request_id: UUID

    @model_validator(mode="after")
    def quantities(self):
        if (self.kind == "close") != (self.units is None) or len(self.note.strip()) < 2:
            raise ValueError(
                "Closing has no movement quantity; other records require units and note"
            )
        return self


@router.get("/workspace")
async def workspace(
    member: Member, response: Response, eta: int | None = Query(default=None, ge=0, le=60)
):
    require(member, "vendor", "admin")
    raw = await member.repository.rpc("cp5_workspace", {})
    response.headers["Cache-Control"] = "no-store"
    return {
        "raw": raw,
        "report": report(raw),
        "recommendations": [recommendation(raw, b["id"], eta) for b in raw["batches"]],
    }


@router.post("/command")
async def command(body: Command, member: Member):
    require(member, "vendor", "admin")
    result = await member.repository.rpc(
        "cp5_command",
        {
            "p_batch": str(body.batch),
            "p_kind": body.kind,
            "p_units": body.units,
            "p_note": body.note,
            "p_request": str(body.request_id),
        },
    )
    return {"id": result}
