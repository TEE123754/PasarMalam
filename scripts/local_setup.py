"""Generate private local runtime settings; no provider writes or deployment."""

import secrets
from urllib.parse import quote, urlparse

from demo_db import ROOT, target_configuration
from dotenv import dotenv_values, set_key


def configure():
    ref, _, database = target_configuration()
    path = ROOT / "apps/api/.env"
    values = dotenv_values(path)
    for key in [
        "DEMO_SEED_PASSWORD",
        "MEDIA_SIGNING_SECRET",
        "AGENT_DISPATCH_SECRET",
        "AGENT_DATABASE_PASSWORD",
    ]:
        if not values.get(key):
            value = secrets.token_urlsafe(32)
            set_key(path, key, value)
            values[key] = value
    parsed = urlparse(database)
    username = "pasarmalam_agent" + (
        "." + ref if (parsed.hostname or "").endswith(".pooler.supabase.com") else ""
    )
    suffix = "?" + parsed.query if parsed.query else ""
    agent_url = f"postgresql://{username}:{quote(values['AGENT_DATABASE_PASSWORD'], safe='')}@{parsed.hostname}:{parsed.port or 5432}/postgres{suffix}"
    set_key(path, "AGENT_DATABASE_URL", agent_url)
    set_key(path, "AGENT_DISPATCH_URL", "http://127.0.0.1:8010/api/v1/agent/dispatch")
    print(
        "Local secrets and scoped connection saved privately; run guarded media/agent setup after migrations."
    )


if __name__ == "__main__":
    configure()
