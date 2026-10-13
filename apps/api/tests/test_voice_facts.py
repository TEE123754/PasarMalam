import json
from datetime import datetime
from pathlib import Path

import pytest

from app.voice import Draft, check_result
from app.voice_facts import number, transcript_facts

NOW = datetime.fromisoformat("2026-10-08T20:00:00+08:00")


@pytest.mark.parametrize(
    "text, expected",
    [
        ("twenty four", 24),
        ("forty-nine", 49),
        ("dua puluh empat", 24),
        ("sebelas", 11),
        ("twelve", 12),
        ("seratus dua belas", 112),
        ("two hundred thirty six", 236),
        ("five five", None),
        ("dua puluh lima belas", None),
    ],
)
def test_strict_spoken_numbers(text, expected):
    assert number(text) == expected


@pytest.mark.parametrize(
    "text, expected",
    [
        ("12 bungkus, enam ringgit sebungkus", 600),
        ("RM four fifty satu cup", 450),
        ("satu fifty each", 150),
        ("tiga ringgit lima puluh sen setiap bungkus", 350),
        ("seringgit lima puluh sen", 150),
        ("350%", None),
        ("RM 4.50 or RM 6.00", None),
    ],
)
def test_prices_and_ambiguous_values(text, expected):
    facts, _ = transcript_facts(text, NOW)
    assert facts["price_sen"].value == expected


@pytest.mark.parametrize(
    "text, time",
    [
        ("siap pukul enam setengah petang", "18:30"),
        ("cooked seven forty five pm", "19:45"),
        ("siap tujuh lima belas malam", "19:15"),
        ("ready 6:30pm", "18:30"),
    ],
)
def test_spoken_clock(text, time):
    facts, _ = transcript_facts(text, NOW)
    assert facts["cook_time"].value.strftime("%H:%M") == time


def test_bundle_does_not_replace_total_stock_or_create_unit_price():
    facts, flags = transcript_facts("thirty sticks, five sticks for five ringgit", NOW)
    assert facts["quantity"].value == 30
    assert facts["bundle_quantity"].value == 5
    assert facts["bundle_price_sen"].value == 500
    assert facts["price_sen"].value is None
    assert flags


def test_batch_reference_excludes_explicit_unchanged_batch():
    facts, _ = transcript_facts(
        "Update satay batch two to nine remaining sticks. Do not change batch one.",
        NOW,
    )
    assert facts["batch_reference"].value == 2
    assert facts["quantity"].value == 9
    assert facts["action"].value == "update_stock"
    facts, _ = transcript_facts("batch one or batch two tinggal lima", NOW)
    assert facts["batch_reference"].value is None


def test_verified_script_requirements_are_development_regressions_only():
    root = Path(__file__).resolve().parents[3]
    pack = json.loads((root / "contracts/cp7-recording-pack.json").read_text(encoding="utf-8"))
    for sample in pack["samples"]:
        facts, _ = transcript_facts(sample["reference_transcript"], NOW)
        for field in ["quantity", "bundle_quantity", "bundle_price_sen", "cook_time"]:
            if field in sample["expected"]:
                actual = facts[field].value
                actual = actual.isoformat() if isinstance(actual, datetime) else actual
                assert actual == sample["expected"][field], (sample["id"], field)
        if sample["expected"].get("action") == "update-quantity":
            assert facts["quantity"].value == sample["expected"]["remaining_quantity"]
            assert facts["batch_reference"].value == sample["expected"]["batch_number"]


def test_no_unspoken_recipe_or_ambiguous_spoken_clock_survives_model_evidence():
    draft = Draft(
        dish="Chicken satay",
        quantity=None,
        unit=None,
        price_sen=None,
        ingredients=["chicken", "peanuts"],
        cook_time="2026-10-08T18:00:00+08:00",
        timezone="Asia/Kuala_Lumpur",
        action="create_batch",
        confidence=0,
        evidence={
            "dish": ["Chicken satay"],
            "ingredients": ["Chicken satay"],
            "cook_time": ["pukul enam"],
        },
    )
    result = check_result(draft, "Chicken satay siap pukul enam", ["Chicken satay"], NOW)
    assert result["draft"]["cook_time"] is None
    assert result["draft"]["ingredients"] == []


def test_exact_menu_alias_recovers_missing_dish_but_two_dishes_require_choice():
    value = dict(
        dish=None,
        quantity=None,
        unit=None,
        price_sen=None,
        ingredients=[],
        cook_time=None,
        timezone="Asia/Kuala_Lumpur",
        action="update_stock",
        confidence=0,
        evidence={},
    )
    result = check_result(
        Draft(**value),
        "Satay ayam batch two tinggal nine sticks",
        ["Chicken satay", "Kuih talam"],
        NOW,
    )
    assert result["draft"]["dish"] == "Chicken satay"
    assert result["draft"]["quantity"] == 9
    ambiguous = check_result(
        Draft(**value),
        "Chicken satay or Kuih talam tinggal five",
        ["Chicken satay", "Kuih talam"],
        NOW,
    )
    assert ambiguous["draft"]["dish"] is None
