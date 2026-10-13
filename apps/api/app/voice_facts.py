"""Conservative spoken-value parsing. Never infer facts from an expected recording script."""

import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

MY = timezone(timedelta(hours=8))
ONES = dict(
    zip(
        "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
        "fifteen sixteen seventeen eighteen nineteen".split(),
        range(20),
        strict=True,
    )
)
ONES.update(
    dict(
        zip(
            "kosong satu dua tiga empat lima enam tujuh lapan sembilan sepuluh sebelas".split(),
            range(12),
            strict=True,
        )
    )
)
ONES["delapan"] = 8
TENS = dict(
    zip(
        "twenty thirty forty fifty sixty seventy eighty ninety".split(),
        range(20, 100, 10),
        strict=True,
    )
)
WORD = "|".join(
    sorted(
        [
            *ONES,
            *TENS,
            "belas",
            "puluh",
            "ratus",
            "hundred",
            "seratus",
            "ribu",
            "thousand",
            "seribu",
        ],
        key=len,
        reverse=True,
    )
)
NUM = rf"(?:\d+(?:\.\d{{1,2}})?|(?:{WORD})(?:[ -]+(?:{WORD}))*)"
UNITS = {
    "batang": "stick",
    "stick": "stick",
    "sticks": "stick",
    "bungkus": "pack",
    "pack": "pack",
    "packs": "pack",
    "packet": "pack",
    "packets": "pack",
    "portion": "portion",
    "portions": "portion",
    "unit": "unit",
    "units": "unit",
    "biji": "piece",
    "potong": "piece",
    "piece": "piece",
    "pieces": "piece",
    "cawan": "cup",
    "cup": "cup",
    "cups": "cup",
    "mangkuk": "bowl",
    "bowl": "bowl",
    "bowls": "bowl",
}
UNIT = "|".join(sorted(UNITS, key=len, reverse=True))


def number(value: str) -> int | None:
    """Strict BM/English integers; malformed sequences are unknown, not partial matches."""
    value = value.lower().strip().replace("-", " ")
    if re.fullmatch(r"\d+", value):
        return int(value) if int(value) <= 100000 else None
    tokens = value.split()
    if not tokens:
        return None
    if len(tokens) == 1:
        return ONES.get(
            tokens[0], TENS.get(tokens[0], {"seratus": 100, "seribu": 1000}.get(tokens[0]))
        )
    if tokens[0] in {"seratus", "seribu"}:
        tail = number(" ".join(tokens[1:]))
        base = 100 if tokens[0] == "seratus" else 1000
        return base + tail if tail is not None and tail < base else None
    for scale, multiplier in [("thousand", 1000), ("ribu", 1000), ("hundred", 100), ("ratus", 100)]:
        if scale in tokens:
            index = tokens.index(scale)
            head = number(" ".join(tokens[:index]))
            tail = number(" ".join(tokens[index + 1 :])) if tokens[index + 1 :] else 0
            if head is not None and tail is not None and 1 <= head < 100 and tail < multiplier:
                result = head * multiplier + tail
                return result if result <= 100000 else None
            return None
    head = ONES.get(tokens[0])
    if len(tokens) == 2 and tokens[1] == "belas" and head is not None and 1 <= head <= 9:
        return 10 + head
    if tokens[1] == "puluh" and head is not None and 1 <= head <= 9:
        tail = number(" ".join(tokens[2:])) if tokens[2:] else 0
        return head * 10 + tail if tail is not None and 0 <= tail <= 9 else None
    if tokens[0] in TENS and len(tokens) == 2 and tokens[1] in ONES and ONES[tokens[1]] < 10:
        return TENS[tokens[0]] + ONES[tokens[1]]
    return None


@dataclass(frozen=True)
class Fact:
    value: object
    quote: str


def unique(rows: list[Fact]) -> Fact | None:
    return rows[0] if rows and all(row.value == rows[0].value for row in rows) else None


def money(value: str) -> int | None:
    value = value.lower().strip()
    if re.fullmatch(r"\d+(?:\.\d{1,2})?", value):
        ringgit, _, fraction = value.partition(".")
        return int(ringgit) * 100 + int(fraction.ljust(2, "0") or "0")
    # Explicit currency/each context permits Malaysian shorthand: four fifty = RM4.50.
    parts = value.split()
    for split in range(1, len(parts)):
        whole, cents = number(" ".join(parts[:split])), number(" ".join(parts[split:]))
        if whole is not None and cents is not None and 1 <= whole <= 9 and cents in TENS.values():
            return whole * 100 + cents
    integer = number(value)
    return integer * 100 if integer is not None else None


def spoken_clock(value: str) -> tuple[int, int] | None:
    value = value.strip().lower()
    if re.fullmatch(r"\d{1,2}(?::\d{2})?", value):
        hour, _, minute = value.partition(":")
        clock = int(hour), int(minute or 0)
    elif value.endswith(" setengah"):
        hour = number(value.removesuffix(" setengah"))
        clock = (hour, 30)
    elif number(value) is not None and number(value) <= 12:
        clock = (number(value), 0)
    else:
        parts = value.split()
        clock = None
        for split in range(1, len(parts)):
            hour, minute = number(" ".join(parts[:split])), number(" ".join(parts[split:]))
            if hour is not None and minute is not None and 1 <= hour <= 12 and 0 <= minute < 60:
                clock = (hour, minute)
                break
    return (
        clock
        if clock and clock[0] is not None and 1 <= clock[0] <= 12 and 0 <= clock[1] <= 59
        else None
    )


def transcript_facts(text: str, now: datetime) -> tuple[dict[str, Fact], list[str]]:
    """Parse unambiguous observed spans; retain their original quotes for review."""
    facts: dict[str, Fact] = {}
    flags = []
    unit_rows = []
    bundle_rows = []
    bundle_spans = []
    # Bundle quantity and total price are preserved separately; never divide automatically.
    bundle_pattern = (
        rf"\b({NUM})\s*(?:({UNIT})\s+)?(?:for|untuk)\s+"
        rf"(?:rm\s*)?({NUM})\s*(?:ringgit)?\b"
    )
    bm_bundle = rf"\b({NUM})\s+({UNIT})\s+({NUM})\s+ringgit\b"
    for pattern in [bundle_pattern, bm_bundle]:
        for match in re.finditer(pattern, text, re.I):
            quantity, price = number(match[1]), money(match[3])
            if quantity and price is not None:
                bundle_rows.append(Fact((quantity, price), match[0]))
                bundle_spans.append(match.span())
    if re.search(r"\bdua seringgit\b", text, re.I):
        match = re.search(r"\bdua seringgit\b", text, re.I)
        bundle_rows.append(Fact((2, 100), match[0]))
    if bundle_rows:
        bundle = unique(bundle_rows)
        facts["price_basis"] = Fact("bundle", bundle_rows[0].quote)
        facts["price_sen"] = Fact(None, bundle_rows[0].quote)
        flags.append("Clarify bundle pricing; confirm the price for one menu unit.")
        if bundle:
            facts["bundle_quantity"] = Fact(bundle.value[0], bundle.quote)
            facts["bundle_price_sen"] = Fact(bundle.value[1], bundle.quote)
    for match in re.finditer(rf"(?<![\w.])({NUM})\s+({UNIT})\b", text, re.I):
        if any(start <= match.start() < end for start, end in bundle_spans):
            continue
        n = number(match[1])
        if n is not None:
            unit_rows.append(Fact((n, UNITS[match[2].lower()]), match[0]))
    # Stock phrases take priority over references to another batch's unchanged quantity.
    stock = []
    stock_pattern = (
        rf"\b(?:tinggal|remaining|baki|stok|stock(?:\s+to)?|to)\s+({NUM})"
        rf"(?:\s+remaining)?(?:\s+({UNIT}))?\b"
    )
    is_stock = bool(re.search(r"\b(?:tinggal|remaining|baki|stok|stock)\b", text, re.I))
    if is_stock:
        for match in re.finditer(stock_pattern, text, re.I):
            n = number(match[1])
            if n is not None:
                stock.append(Fact((n, UNITS.get((match[2] or "").lower())), match[0]))
    candidates = stock or unit_rows
    quantity = unique(candidates)
    if quantity:
        facts["quantity"] = Fact(quantity.value[0], quantity.quote)
        if quantity.value[1]:
            spoken = quantity.value[1]
            facts["spoken_unit"] = Fact(spoken, quantity.quote)
            facts["unit"] = Fact(
                spoken if spoken in {"stick", "pack", "portion"} else "unit", quantity.quote
            )
    elif candidates:
        facts["quantity"] = Fact(None, candidates[0].quote)
        flags.append("Conflicting quantities; confirm the intended stock count.")
    prices = []
    currency_spans = []
    composite = rf"\b({NUM})\s+ringgit\s+({NUM})\s+(?:sen|cents?)\b"
    for match in re.finditer(composite, text, re.I):
        whole, cents = number(match[1]), number(match[2])
        if whole is not None and cents is not None and 0 <= cents < 100:
            prices.append(Fact(whole * 100 + cents, match[0]))
            currency_spans.append(match.span())
    for match in re.finditer(rf"\bseringgit\s+({NUM})\s+(?:sen|cents?)\b", text, re.I):
        cents = number(match[1])
        if cents is not None and 0 <= cents < 100:
            prices.append(Fact(100 + cents, match[0]))
            currency_spans.append(match.span())
    patterns = [
        rf"\brm\s*({NUM})(?![\w.%])",
        rf"\b({NUM})\s+ringgit\b",
        rf"\b({NUM})\s*(?:sen|cents?)\b",
        rf"\bseringgit(?:\s+({NUM}))?\b",
    ]
    for index, pattern in enumerate(patterns):
        for match in re.finditer(pattern, text, re.I):
            if any(start <= match.start() < end for start, end in bundle_spans + currency_spans):
                continue
            value = number(match[1]) if index == 2 else money(match[1]) if index < 2 else 100
            if index == 3 and match[1]:
                cents = number(match[1])
                value = 100 + cents if cents is not None and 0 <= cents < 100 else None
            if value is not None:
                prices.append(Fact(value, match[0]))
    # "satu fifty each" needs an explicit price context, never a bare number.
    for match in re.finditer(
        rf"\b({NUM})\s+(?:each|satu\s+(?:cup|piece)|sebungkus|secawan)\b", text, re.I
    ):
        value = money(match[1])
        if value is not None:
            prices.append(Fact(value, match[0]))
    if prices and "price_basis" not in facts:
        price = unique(prices)
        facts["price_sen"] = price or Fact(None, prices[0].quote)
        facts["price_basis"] = Fact("unit" if price else "unknown", prices[0].quote)
        if not price:
            flags.append("Conflicting prices; confirm the price for one menu unit.")
    # A percent/range is not a monetary amount. Do not turn 350% into RM3.50.
    if re.search(r"\d\s*%|\b(?:hingga|between|percent|peratus)\b", text, re.I):
        facts["price_sen"] = Fact(None, "")
        flags.append("Price is unclear; enter the amount for one menu unit.")
    if re.search(r"\bseringgit\s+(?:[a-z]+\s+)*puluh satu\b", text, re.I):
        facts["price_sen"] = Fact(None, "")
        flags.append("Price is ambiguous; confirm whether satu means each or one sen.")
    batch_rows = []
    for match in re.finditer(rf"\b(?:batch|kelompok)\s+({NUM})\b", text, re.I):
        if re.search(
            r"(?:do not change|jangan ubah|keep unchanged)\s*$", text[: match.start()], re.I
        ):
            continue
        if re.match(r"\s+(?:keep|jangan|do not|unchanged)", text[match.end() :], re.I):
            continue
        n = number(match[1])
        if n and n <= 100000:
            batch_rows.append(Fact(n, match[0]))
    batch = unique(batch_rows)
    facts["batch_reference"] = batch or Fact(None, "")
    if batch_rows and not batch:
        flags.append("Choose the exact batch; multiple batch references were spoken.")
    if is_stock:
        facts["action"] = Fact("update_stock", "")
    elif re.search(r"\b(?:new batch|kelompok (?:baharu|baru)|tambah kelompok)\b", text, re.I):
        facts["action"] = Fact("create_batch", "")
    time_rows = []
    clock_pattern = rf"\b({NUM}(?:\s+setengah)?|\d{{1,2}}:\d{{2}})\s*(am|pm|pagi|petang|malam)\b"
    for match in re.finditer(clock_pattern, text, re.I):
        clock = spoken_clock(match[1])
        if clock:
            hour, minute = clock
            hour = hour % 12 + (12 if match[2].lower() in {"pm", "petang", "malam"} else 0)
            date = now.astimezone(MY).date()
            if re.search(r"\b(?:yesterday|semalam)\b", text, re.I):
                date -= timedelta(days=1)
            date_match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", text)
            if date_match:
                try:
                    date = datetime.fromisoformat(date_match[0]).date()
                except ValueError:
                    continue
            value = datetime(date.year, date.month, date.day, hour, minute, tzinfo=MY)
            time_rows.append(Fact(value, match[0]))
    if time_rows:
        clock = unique(time_rows)
        facts["cook_time"] = clock or Fact(None, time_rows[0].quote)
        if not clock:
            flags.append("Preparation time conflicts with transcript; choose date and time.")
    if re.search(
        r"tak (?:ingat|pasti)|don't know|do not know|not sure|nanti saya|harga nanti", text, re.I
    ):
        if re.search(r"time|masa|pukul", text, re.I):
            facts["cook_time"] = Fact(None, "")
        if re.search(r"price|harga", text, re.I):
            facts["price_sen"] = Fact(None, "")
        if re.search(r"batch|kelompok", text, re.I):
            facts["batch_reference"] = Fact(None, "")
    return facts, flags
