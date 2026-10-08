from uuid import uuid4

import pytest
from app.vendor import FoodInput, StallInput
from pydantic import ValidationError


def test_plant_diet_is_explicit_and_timestamps_are_not_client_writable():
    f = FoodInput(
        id=uuid4(),
        stall_id=uuid4(),
        name="Fake meal",
        price_sen=500,
        ingredients=[],
        photo=None,
        plant_diet={"vegetarian": "no", "vegan": "yes"},
        plant_diet_recorded_at="2026-10-08T00:00:00Z",
    )
    assert f.plant_diet.vegetarian == "no"
    assert "plant_diet_recorded_at" not in f.model_dump()
    with pytest.raises(ValidationError):
        FoodInput(**{**f.model_dump(), "plant_diet": {"vegetarian": "maybe", "vegan": "yes"}})
    with pytest.raises(ValidationError):
        FoodInput(**{**f.model_dump(), "category_id": "made-up"})


def test_legacy_stall_input_and_readonly_confirmation_clock():
    s = StallInput(
        id=uuid4(),
        market_id=uuid4(),
        name="Fake stall",
        category="Rice",
        specialty="Rice",
        price_sen=0,
        halal="not-declared",
        open=False,
        lot="",
        opens="07:00",
        closes="12:00",
        latitude=None,
        longitude=None,
        photo=None,
        availability_confirmed_at="2026-10-08T00:00:00Z",
    )
    assert not s.confirm_availability
    assert "availability_confirmed_at" not in s.model_dump()
