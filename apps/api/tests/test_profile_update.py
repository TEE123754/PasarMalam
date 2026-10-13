"""Authenticated profile edits have no caller-controlled identity or role fields."""

from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.contracts import Actor
from app.main import app
from app.routes import access


def test_signed_out_profile_edit_is_denied():
    assert (
        TestClient(app)
        .post("/api/v1/me/profile", json={"display_name": "Fictional", "locale": "en"})
        .status_code
        == 401
    )


@pytest.mark.parametrize("extra", [{"id": str(uuid4())}, {"roles": ["admin"]}, {"verified": True}])
def test_identity_roles_and_verified_status_are_not_editable(extra):
    repository = SimpleNamespace(rpc=AsyncMock())
    actor = Actor(
        id=uuid4(), display_name="Fictional", locale="en", verified=False, roles=["customer"]
    )
    app.dependency_overrides[access] = lambda: SimpleNamespace(actor=actor, repository=repository)
    try:
        response = TestClient(app).post(
            "/api/v1/me/profile", json={"display_name": "Fictional", "locale": "en", **extra}
        )
        assert response.status_code == 422
        repository.rpc.assert_not_awaited()
    finally:
        app.dependency_overrides.pop(access, None)


def test_only_bounded_display_name_and_supported_locale_are_changed():
    repository = SimpleNamespace(rpc=AsyncMock())
    actor = Actor(
        id=uuid4(), display_name="Fictional", locale="en", verified=False, roles=["customer"]
    )
    app.dependency_overrides[access] = lambda: SimpleNamespace(actor=actor, repository=repository)
    try:
        client = TestClient(app)
        for name, locale in [(" ", "en"), ("x" * 81, "ms"), ("Fictional", "admin")]:
            assert (
                client.post(
                    "/api/v1/me/profile", json={"display_name": name, "locale": locale}
                ).status_code
                == 422
            )
        response = client.post(
            "/api/v1/me/profile", json={"display_name": "  Updated fictional  ", "locale": "ms"}
        )
        assert response.status_code == 200
        assert response.json() == {
            **actor.model_dump(mode="json"),
            "display_name": "Updated fictional",
            "locale": "ms",
        }
        repository.rpc.assert_awaited_once_with(
            "update_profile", {"p_display_name": "Updated fictional", "p_locale": "ms"}
        )
    finally:
        app.dependency_overrides.pop(access, None)
