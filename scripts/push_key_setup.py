"""Generate local VAPID settings without printing private keys or contacting providers."""

import argparse
import base64
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject", required=True, help="mailto: operator contact")
    args = parser.parse_args()
    if (
        not args.subject.startswith("mailto:")
        or "@" not in args.subject
        or "\n" in args.subject
        or "\r" in args.subject
    ):
        raise SystemExit("Use a single-line mailto: operator contact")
    target = Path(__file__).resolve().parents[1] / "apps/api/.env.push"

    def encode(value: bytes) -> str:
        return base64.urlsafe_b64encode(value).decode().rstrip("=")

    private = ec.generate_private_key(ec.SECP256R1())
    secret = encode(
        private.private_bytes(
            serialization.Encoding.DER,
            serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption(),
        )
    )
    public = encode(
        private.public_key().public_bytes(
            serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint
        )
    )
    with target.open("x", encoding="utf-8") as file:
        file.write(
            f"PUSH_MODE=enrolled-test\nVAPID_PRIVATE_KEY={secret}\nVAPID_PUBLIC_KEY={public}\nVAPID_SUBJECT={args.subject}\n"
        )
    print(
        "Created apps/api/.env.push. Merge into private server environment; never commit or share it."
    )
