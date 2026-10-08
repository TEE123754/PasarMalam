import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.accounting import Command, monetary, recommendation, report

vectors = json.loads(
    (Path(__file__).resolve().parents[3] / "contracts/cp5-accounting-vectors.json").read_text()
)


@pytest.mark.parametrize("case", vectors["cases"])
def test_shared_vectors(case):
    value = recommendation(vectors["raw"], "b", case["eta"])
    assert all(value[k] == v for k, v in case["expected"].items())


def test_reconcile_and_missing_data():
    raw = json.loads(json.dumps(vectors["raw"]))
    assert report(raw)["sessions"][0]["confirmed_savings"] == 1500
    raw["movements"].append(raw["movements"][1])
    assert report(raw)["sessions"][0]["confirmed_revenue"] == 1500
    raw["batches"][0]["prepared"] = None
    assert report(raw)["sessions"][0]["unattributed"] is None
    assert recommendation(raw, "b", 5)["suggested_discount"] is None


@pytest.mark.parametrize(
    "total,refund,disputed,expected",
    [
        (500, 0, False, {"revenue": 500, "savings": 500}),
        (500, 250, False, {"revenue": 250, "savings": 250}),
        (500, 500, False, {"revenue": 0, "savings": 0}),
        (0, 0, False, {"revenue": 0, "savings": 1000}),
        (500, 0, True, {"revenue": 500, "savings": None}),
    ],
)
def test_integer_money(total, refund, disputed, expected):
    assert (
        monetary(
            {
                **vectors["raw"]["movements"][1],
                "total": total,
                "refunded": refund,
                "disputed": disputed,
            }
        )
        == expected
    )


@pytest.mark.parametrize(
    "patch",
    [
        {"units": True},
        {"units": 1.5},
        {"units": 0},
        {"units": None},
        {"kind": "close", "units": 2},
        {"note": " "},
        {"source": "confirmed-collection"},
    ],
)
def test_commands_reject_ambiguous_records(patch):
    with pytest.raises(ValidationError):
        Command.model_validate(
            {
                "batch": "00000000-0000-0000-0000-000000000001",
                "kind": "normal",
                "units": 2,
                "note": "Report",
                "request_id": "00000000-0000-0000-0000-000000000002",
                **patch,
            }
        )
