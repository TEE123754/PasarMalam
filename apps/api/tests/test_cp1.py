from uuid import uuid4

import pytest
from app.listing_statements import AllergenStatement, BusinessDeclarations
from app.main import app
from app.onboarding import CustomerOnboarding
from app.vendor import FoodInput, StallInput
from fastapi.testclient import TestClient
from pydantic import ValidationError


@pytest.mark.parametrize(
    "change",
    [
        {"contains": ["milk", "milk"]},
        {"status": "unknown", "contains": ["milk"]},
        {"contains": ["safe"]},
    ],
)
def test_invalid_allergen_claim(change):
    with pytest.raises(ValidationError):
        AllergenStatement.model_validate(
            {"status": "confirmed", "contains": [], "cross_contact": "unknown", **change}
        )


def test_claims_and_profile_never_accept_inferred_identity_or_roles():
    with pytest.raises(ValidationError):
        BusinessDeclarations.model_validate(
            {
                "pork_free": "yes",
                "alcohol_free": "yes",
                "muslim_owned": "yes",
                "inferred_religion": "Muslim",
            }
        )
    with pytest.raises(ValidationError):
        CustomerOnboarding(display_name="Fictional", locale="en", accepted=True, role="vendor")
    with pytest.raises(ValidationError):
        CustomerOnboarding(display_name=" ", locale="en", accepted=True)
    assert (
        TestClient(app)
        .post(
            "/api/v1/me/onboard",
            json={"display_name": "Fictional", "locale": "ms", "accepted": True},
        )
        .status_code
        == 401
    )
    assert TestClient(app).get("/api/v1/config").json()["registration_policy"] == "invite-only"


def test_readonly_confirmation_time_does_not_enter_rpc_input():
    food = FoodInput(
        id=uuid4(),
        stall_id=uuid4(),
        name="Rice",
        price_sen=500,
        ingredients=["rice"],
        photo=None,
        allergens_recorded_at="2000-01-01T00:00:00Z",
    )
    assert "allergens_recorded_at" not in food.model_dump(mode="json")
    with pytest.raises(ValidationError):
        StallInput(
            id=uuid4(),
            market_id=uuid4(),
            name="Stall",
            category="Rice",
            specialty="Rice",
            price_sen=500,
            halal="not-declared",
            open=True,
            lot="",
            opens="17:00",
            closes="22:00",
            latitude=None,
            longitude=None,
            photo=None,
            description="x" * 1001,
        )
