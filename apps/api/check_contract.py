"""Phase 1 gate for the API's small public contract."""

from datetime import datetime

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert health.json()["service"] == "pasarmalam-api"
    assert datetime.fromisoformat(health.json()["timestamp"]).utcoffset() is not None

    config = client.get("/api/v1/config")
    assert config.status_code == 200
    assert config.json()["api_version"] == "v1"
    assert config.json()["business_integration_mode"] == "simulated"
    assert set(config.json()["supported_locales"]) == {"en", "ms"}

    schema = client.get("/openapi.json")
    assert schema.status_code == 200
    assert schema.json()["info"]["title"] == "PasarMalam API"
    assert "/health" in schema.json()["paths"]
    assert "/api/v1/config" in schema.json()["paths"]
    cors = client.options(
        "/api/v1/config",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert cors.status_code == 200
    assert cors.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
    assert client.get("/admin").status_code == 404
    print("API health, config, OpenAPI, local CORS, restricted route: 5/5 PASS")


if __name__ == "__main__":
    main()
