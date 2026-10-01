from io import BytesIO
from uuid import uuid4

import pytest
from app.main import app
from app.vendor import NewBatch, StallInput, normalize_photo
from fastapi import HTTPException
from fastapi.testclient import TestClient
from PIL import Image
from pydantic import ValidationError


def image_bytes(format="JPEG", size=(160, 80), metadata=False):
    image = Image.new("RGB", size, "green")
    output = BytesIO()
    if metadata:
        exif = Image.Exif()
        exif[270] = "Private original metadata"
        exif[274] = 6
        image.save(output, format, exif=exif)
    else:
        image.save(output, format)
    return output.getvalue()


@pytest.mark.parametrize("format", ["JPEG", "PNG", "WEBP"])
def test_decode_resize_and_strip_metadata(format):
    result = normalize_photo(image_bytes(format, (2000, 1000), metadata=True))
    with Image.open(BytesIO(result)) as image:
        assert image.format == "JPEG"
        assert max(image.size) <= 1280
        assert not image.getexif()
        assert "Private original".encode() not in result
    assert len(result) <= 1048576


@pytest.mark.parametrize("content", [b"not a photo", b"\xff\xd8\xfffake", image_bytes("GIF")])
def test_spoofed_or_unsupported_photo_rejected(content):
    with pytest.raises(HTTPException) as error:
        normalize_photo(content)
    assert error.value.status_code == 422


def test_large_body_rejected_before_decode():
    with pytest.raises(HTTPException) as error:
        normalize_photo(b"x" * 5242881)
    assert error.value.status_code == 413


@pytest.mark.parametrize("size", [(16, 16), (5000, 4000)])
def test_dimension_limits(size):
    with pytest.raises(HTTPException):
        normalize_photo(image_bytes(size=size))


def test_quantity_optional_but_not_fractional_or_boolean():
    value = dict(
        food_item_id=uuid4(),
        prepared_at="2026-10-01T10:00:00Z",
        quantity=None,
        handling={"storage": "unknown", "note": ""},
        photo=None,
    )
    assert NewBatch(**value).quantity is None
    for quantity in (True, -1, 0, 1.5):
        with pytest.raises(ValidationError):
            NewBatch(**{**value, "quantity": quantity})


def test_stall_coordinate_and_time_validation():
    value = dict(
        id=uuid4(),
        market_id=uuid4(),
        name="Demo stall",
        category="Rice",
        specialty="Rice",
        price_sen=500,
        halal="declared",
        open=True,
        lot="A1",
        opens="17:00",
        closes="22:00",
        latitude=3,
        longitude=101,
        photo=None,
    )
    assert StallInput(**value).latitude == 3
    for change in ({"longitude": None}, {"opens": "25:00"}, {"latitude": 91}):
        with pytest.raises(ValidationError):
            StallInput(**{**value, **change})


def test_vendor_routes_require_identity_and_demo_environment_is_explicit():
    client = TestClient(app)
    assert client.get("/api/v1/vendor/workspace").status_code == 401
    assert (
        client.post(
            "/api/v1/vendor/command",
            json={
                "kind": "merge",
                "data": {"source_ids": []},
                "request_id": str(uuid4()),
            },
        ).status_code
        == 401
    )
    assert client.post(f"/api/v1/vendor/photos/{uuid4()}", content=b"fake").status_code == 401
    assert client.get("/api/v1/config").json()["data_environment"] == "disposable-demo"
