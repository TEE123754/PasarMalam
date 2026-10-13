"""Whitelist provider token counters; never infer billing from a successful request."""


def token_usage(value: object) -> dict[str, int | None]:
    usage = value if isinstance(value, dict) else {}

    def counter(name: str) -> int | None:
        count = usage.get(name)
        return count if type(count) is int and 0 <= count <= 1_000_000_000 else None

    return {
        "input_tokens": counter("prompt_tokens"),
        "output_tokens": counter("completion_tokens"),
    }
