"""Install media authorization secret only in the explicitly guarded disposable database."""

import os

import psycopg
from demo_db import target_configuration, verify_marker

if __name__ == "__main__":
    _, _, database = target_configuration()
    secret = os.getenv("MEDIA_SIGNING_SECRET", "")
    if len(secret) < 32:
        raise SystemExit("Set a random MEDIA_SIGNING_SECRET of at least 32 characters.")
    with psycopg.connect(database) as connection:
        verify_marker(connection)
        connection.execute(
            "insert into private.media_secret(singleton,secret) values(true,%s) "
            "on conflict(singleton) do update set secret=excluded.secret",
            (secret,),
        )
    print(
        "Media authorization installed in the verified disposable target; secret not printed."
    )
