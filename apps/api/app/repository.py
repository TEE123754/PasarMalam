"""Supabase REST requests always use the caller JWT and a public key, preserving RLS."""

from typing import Any

import httpx
from fastapi import HTTPException

from .settings import Settings


class Repository:
    def __init__(self, settings: Settings, token: str | None = None):
        if not settings.configured:
            raise HTTPException(503, "Connected data is not configured")
        self.url = settings.url
        self.headers = {"apikey": settings.publishable_key, "Accept": "application/json"}
        if token:
            self.headers["Authorization"] = f"Bearer {token}"

    async def request(self, method: str, path: str, **kwargs: Any) -> Any:
        try:
            async with httpx.AsyncClient(timeout=10, follow_redirects=False) as client:
                response = await client.request(
                    method, f"{self.url}/rest/v1/{path}", headers=self.headers, **kwargs
                )
            if response.is_error:
                # Do not leak upstream SQL, tokens, private rows or request bodies to logs/UI.
                code = (
                    response.json().get("code", "")
                    if "json" in response.headers.get("content-type", "")
                    else ""
                )
                status = {"42501": 403, "23505": 409, "23514": 422, "22023": 422, "P0001": 429}.get(
                    code
                )
                raise HTTPException(
                    status or (401 if response.status_code == 401 else 502),
                    "Data request denied or unavailable",
                )
            return response.json() if response.content else None
        except (httpx.HTTPError, ValueError) as error:
            raise HTTPException(503, "Connected data unavailable") from error

    async def read(self, table: str, select: str, **filters: str) -> list[dict[str, Any]]:
        return await self.request("GET", table, params={"select": select, **filters})

    async def rpc(self, name: str, payload: dict[str, Any]) -> Any:
        return await self.request("POST", f"rpc/{name}", json=payload)
