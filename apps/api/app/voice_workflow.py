"""Explicit confirmed voice commands; references are owned IDs, never model permissions."""

from typing import Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, StrictInt

from .routes import Member, require
from .vendor import FoodInput, NewBatch
from .voice import redact

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


class WorkflowInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: Literal["create_batch", "update_food", "update_stock"]
    food: FoodInput
    batch: NewBatch | None = None
    batch_id: UUID | None = None
    expected_remaining: StrictInt | None = Field(default=None, ge=0, le=100000)
    remaining: StrictInt | None = Field(default=None, ge=0, le=100000)
    unit: Literal["portion", "unit", "stick", "pack"]
    transcript: str = Field(max_length=1000)
    history: list[dict] = Field(default_factory=list, max_length=30)
    confirmed: Literal[True]
    request_id: UUID


@router.post("/workflow-confirm")
async def confirm_workflow(body: WorkflowInput, member: Member):
    require(member, "vendor", "admin")
    if body.action == "create_batch" and (
        not body.batch
        or body.batch.food_item_id != body.food.id
        or body.batch.handling.storage != "ambient"
    ):
        raise HTTPException(422, "Confirm one matching ambient batch")
    if body.action == "update_stock" and (
        body.batch_id is None or body.expected_remaining is None or body.remaining is None
    ):
        raise HTTPException(422, "Exact batch and current stock required")
    food = body.food.model_dump(
        mode="json",
        exclude={"allergens", "allergens_recorded_at", "plant_diet", "plant_diet_recorded_at"},
    )
    history = [
        {
            "field": str(h.get("field", ""))[:40],
            "before": redact(str(h.get("before", "")))[:150],
            "after": redact(str(h.get("after", "")))[:150],
        }
        for h in body.history
    ]
    result = await member.repository.rpc(
        "confirm_voice_workflow",
        {
            "p_action": body.action,
            "p_food": food,
            "p_batch": body.batch.model_dump(mode="json") if body.batch else None,
            "p_batch_id": str(body.batch_id) if body.batch_id else None,
            "p_expected": body.expected_remaining,
            "p_remaining": body.remaining,
            "p_unit": body.unit,
            "p_transcript": redact(body.transcript),
            "p_history": history,
            "p_request": str(body.request_id),
        },
    )
    return {"id": result}
