from datetime import datetime, timezone

from test_voice import draft

from app.voice import check_result


def test_local_bundle_is_not_a_unit_price():
    r = check_result(
        draft(price_sen=100, evidence={"price_sen": ["dua seringgit"]}),
        "dua seringgit",
        ["Chicken satay"],
        datetime.now(timezone.utc),
    )
    assert r["draft"]["price_sen"] is None
    assert r["draft"]["price_basis"] == "bundle"


def test_stock_intent_and_ambiguous_second_pan():
    now = datetime.now(timezone.utc)
    r = check_result(
        draft(), "Chicken satay batch 1 tinggal sepuluh bungkus", ["Chicken satay"], now
    )
    assert r["draft"]["action"] == "update_stock"
    assert r["draft"]["batch_reference"] == 1
    r = check_result(draft(), "kuali kedua", ["Chicken satay"], now)
    assert r["draft"]["action"] == "unsupported"
    assert r["draft"]["batch_reference"] is None
