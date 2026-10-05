"""Caller-scoped community RPCs; private evidence is validated before Storage writes."""

import asyncio
import hashlib
import hmac
import json
import math
import shutil
import subprocess
from os import getenv
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Literal
from uuid import UUID, uuid4

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from .routes import Member, PublicRepository, require
from .vendor import normalize_photo, storage_request

router = APIRouter(prefix="/api/v1/community", tags=["community"])
media_slot = asyncio.Semaphore(1)


class CommunityCommand(BaseModel):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[
        "review",
        "report",
        "followup",
        "triage",
        "status",
        "reply",
        "appeal",
        "flag",
        "remove_flag",
        "approve_reply",
        "review_status",
        "review_report",
        "referral",
        "stall_status",
        "schedule",
        "dietary",
    ]
    data: dict = Field(max_length=20)
    request_id: UUID


@router.get("/public")
async def public(repo: PublicRepository):
    return await repo.rpc("community_public", {})


@router.get("/workspace")
async def workspace(member: Member):
    return await member.repository.rpc("community_workspace", {})


@router.post("/command")
async def command(body: CommunityCommand, member: Member):
    if len(json.dumps(body.data)) > 10000:
        raise HTTPException(422, "Community command too large")
    result = await member.repository.rpc(
        "community_command",
        {"p_kind": body.kind, "p_data": body.data, "p_request": str(body.request_id)},
    )
    return {"id": result}


def normalize_video(content: bytes) -> bytes:
    if not shutil.which("ffprobe") or not shutil.which("ffmpeg"):
        raise HTTPException(503, "Video validator unavailable; use an image or text report")
    if len(content) > 5242880 or content[4:8] != b"ftyp":
        raise HTTPException(422, "Only MP4 video up to 10 seconds and 5 MB")
    try:
        with TemporaryDirectory(prefix="pasar-evidence-") as folder:
            source, dest = Path(folder) / "input.mp4", Path(folder) / "sanitized.mp4"
            source.write_bytes(content)
            probe = subprocess.run(
                [
                    "ffprobe",
                    "-v",
                    "error",
                    "-protocol_whitelist",
                    "file,pipe",
                    "-show_streams",
                    "-show_format",
                    "-of",
                    "json",
                    str(source),
                ],
                capture_output=True,
                timeout=10,
                check=True,
            )
            info = json.loads(probe.stdout)
            duration = float(info["format"]["duration"])
            streams = [s for s in info["streams"] if s["codec_type"] == "video"]
            if not math.isfinite(duration) or not 0 < duration <= 10 or len(streams) != 1:
                raise ValueError("duration/streams")
            if not 32 <= streams[0]["width"] <= 1920 or not 32 <= streams[0]["height"] <= 1080:
                raise ValueError("dimensions")
            subprocess.run(
                [
                    "ffmpeg",
                    "-v",
                    "error",
                    "-nostdin",
                    "-protocol_whitelist",
                    "file,pipe",
                    "-i",
                    str(source),
                    "-map",
                    "0:v:0",
                    "-an",
                    "-map_metadata",
                    "-1",
                    "-c:v",
                    "libx264",
                    "-threads",
                    "1",
                    "-preset",
                    "ultrafast",
                    "-crf",
                    "30",
                    "-pix_fmt",
                    "yuv420p",
                    "-r",
                    "24",
                    "-t",
                    "10",
                    "-fs",
                    "5242880",
                    str(dest),
                ],
                capture_output=True,
                timeout=20,
                check=True,
            )
            result = dest.read_bytes()
            if not result or len(result) >= 5242880:
                raise ValueError("output")
            return result
    except (ValueError, KeyError, OSError, subprocess.SubprocessError) as error:
        raise HTTPException(422, "Invalid or unsupported video contents") from error


@router.post("/evidence")
async def evidence(request: Request, member: Member):
    require(member, "customer")
    if not member.actor.verified:
        raise HTTPException(403, "Verified account required")
    secret = getenv("MEDIA_SIGNING_SECRET", "")
    if len(secret) < 32:
        raise HTTPException(503, "Media validation is not configured")
    async with media_slot:
        chunks = bytearray()
        async for chunk in request.stream():
            chunks.extend(chunk)
            if len(chunks) > 5242880:
                raise HTTPException(413, "Evidence exceeds 5 MB")
        video = request.headers.get("content-type", "") == "video/mp4"
        output = await asyncio.to_thread(
            normalize_video if video else normalize_photo, bytes(chunks)
        )
        key = f"{member.actor.id}/{uuid4()}.{'mp4' if video else 'jpg'}"
        for stage in ["authorize", "complete"]:
            signature = hmac.new(
                secret.encode(), f"community:{stage}:{key}".encode(), hashlib.sha256
            ).hexdigest()
            await member.repository.rpc(
                "authorize_community_evidence",
                {
                    "p_key": key,
                    "p_stage": stage,
                    "p_signature": signature,
                },
            )
            if stage == "authorize":
                headers = dict(member.repository.headers)
                headers["Content-Type"] = "video/mp4" if video else "image/jpeg"
                try:
                    async with httpx.AsyncClient(timeout=30, follow_redirects=False) as client:
                        response = await client.post(
                            f"{member.repository.url}/storage/v1/object/complaint-evidence/{key}",
                            headers=headers,
                            content=output,
                        )
                    if response.is_error:
                        raise HTTPException(503, "Evidence upload unavailable")
                except httpx.HTTPError as error:
                    raise HTTPException(503, "Evidence upload unavailable") from error
        return {"key": key, "private": True}


class EvidenceKey(BaseModel):
    key: str = Field(pattern=r"^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|mp4)$")


@router.post("/evidence-access")
async def evidence_access(body: EvidenceKey, member: Member):
    # Caller JWT reaches Storage RLS: organisers/vendors cannot sign another user's evidence.
    response = await storage_request(
        member, "POST", f"object/sign/complaint-evidence/{body.key}", json={"expiresIn": 60}
    )
    signed = response.json().get("signedURL", "")
    if not signed.startswith("/object/sign/complaint-evidence/"):
        raise HTTPException(502, "Evidence link unavailable")
    return {"url": f"{member.repository.url}/storage/v1{signed}", "expires_in": 60}
