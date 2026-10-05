"""Build reproducible public-safe fictional content. No remote writes or real identities."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ANCHOR = "2026-10-02T20:30:00+08:00"


def write(path, value):
    (ROOT / path).write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def build():
    base = json.loads(
        (ROOT / "contracts/discovery-fixture.json").read_text(encoding="utf-8")
    )
    markets = base["markets"][:]
    names = [
        "Cahaya Rimba",
        "Senja Kenari",
        "Bintang Mutiara",
        "Pagi Sutera",
        "Embun Melati",
        "Pagi Teratai",
        "Senja Angsana",
    ]
    for i, name in enumerate(names):
        night = i in [0, 1, 2, 6]
        markets.append(
            dict(
                id=f"demo-market-{i + 4}",
                name=name + " (Demo)",
                area=[
                    "Klang",
                    "Kajang",
                    "Subang Jaya",
                    "Selayang",
                    "Ampang",
                    "Bangi",
                    "Puchong",
                ][i],
                type="night" if night else "day",
                days="Weekly Friday (fictional)",
                hours="17:00–22:30" if night else "07:00–12:00",
                cover="placeholder",
                stallCount=0,
                status="upcoming",
                latitude=3.25 + i * 0.015,
                longitude=101.45 + i * 0.018,
                schedules=[
                    dict(
                        weekday=5,
                        opens="17:00" if night else "07:00",
                        closes="22:30" if night else "12:00",
                        nextDay=False,
                    )
                ],
                exceptions=[
                    dict(date="2026-10-02", cancelled=True, opens=None, closes=None)
                ]
                if i == 6
                else [],
                popularity=12 + i,
                version=1,
            )
        )
    stalls = base["stalls"][:]
    specialties = [
        "Popia sayur",
        "Apam jagung",
        "Teh bunga",
        "Ubi bakar",
        "Pisang goreng",
        "Tauhu rangup",
    ]
    categories = [
        "Rice & noodles",
        "Desserts",
        "Drinks",
        "Bread",
        "Desserts",
        "Rice & noodles",
    ]
    for i in range(22):
        market = markets[0] if i < 6 else markets[3 + (i - 6) % 7]
        stalls.append(
            dict(
                id=f"demo-stall-{i + 9}",
                marketId=market["id"],
                name=f"{['Dapur', 'Gerai', 'Rasa', 'Kedai'][i % 4]} {names[i % 7]} {i + 9} (Demo)",
                category=categories[i % 6],
                specialty=specialties[i % 6],
                priceSen=250 + (i % 8) * 50,
                rating=0,
                reviews=0,
                image="placeholder",
                halal=["declared", "non-halal", "not-declared"][i % 3],
                open=i % 9 != 8,
                aliases=[specialties[i % 6]],
                photoUrl=None,
                latitude=market["latitude"] + 0.0001,
                longitude=market["longitude"] + 0.0001,
                lot=f"D{i + 9:02}",
                opens="17:00" if market["type"] == "night" else "07:00",
                closes="22:30" if market["type"] == "night" else "12:00",
                claims=[],
            )
        )
    menu = []
    batches = []
    reviews = []
    bodies = [
        "Sedap, portion sesuai. Ini ulasan demo rekaan.",
        "Friendly stall, clear menu. Fictional review.",
        "Harga okay lah, datang awal next time. Ulasan demo.",
        "Rasa menarik dan layanan baik. Data rekaan.",
        "Nice flavours, a little queue. Generated demo review.",
    ]
    for i, stall in enumerate(stalls):
        originals = [f for f in base["menu"] if f["stallId"] == stall["id"]]
        for j in range(3):
            food = (
                originals[0]
                if j == 0 and originals
                else dict(
                    id=f"{stall['id']}-menu-{j + 1}",
                    stallId=stall["id"],
                    name=stall["specialty"] + ["", " · small", " · sharing"][j],
                    priceSen=stall["priceSen"] + j * 100,
                    ingredients=["flour", "potato"] if i % 3 else ["rice", "chicken"],
                    photoUrl=None,
                )
            )
            menu.append(food)
        for j in range(5):
            batches.append(
                dict(
                    id=f"DEMO-batch-{i + 1:02}-{j + 1}",
                    food=menu[-3 + j % 3]["id"],
                    number=j // 3 + 1,
                    ageMinutes=[5, 45, 10, 180, 1560][j],
                    status=[
                        "active",
                        "active",
                        "needs-information",
                        "sold-out",
                        "discarded",
                    ][j],
                    quantity=0 if j >= 3 else 20,
                    confirmed=j < 2,
                    storage="unknown" if j == 2 else "ambient",
                    image=f"FOOD-{i + 1:02}",
                    is_demo=True,
                )
            )
        for j in range(5):
            reviews.append(
                dict(
                    id=f"DEMO-review-{i + 1:02}-{j + 1}",
                    stallId=stall["id"],
                    rating=3 + (i + j) % 3,
                    body=bodies[j],
                    author=f"DEMO-customer-{(i * 5 + j) % 50 + 1:02}",
                    status="published",
                    is_demo=True,
                )
            )
        own = [r for r in reviews if r["stallId"] == stall["id"]]
        stall["reviews"] = len(own)
        stall["rating"] = sum(r["rating"] for r in own) / len(own)
    for m in markets:
        m["stallCount"] = sum(s["marketId"] == m["id"] for s in stalls)
    discovery = {
        **base,
        "markets": markets,
        "stalls": stalls,
        "menu": menu,
        "publicReviews": [
            {k: r[k] for k in ["id", "stallId", "rating", "body"]} for r in reviews
        ],
        "updatedAt": ANCHOR,
        "offers": base["offers"],
    }

    def records(kind, count, states):
        return [
            dict(
                id=f"DEMO-{kind}-{i + 1:02}",
                kind=kind,
                stall=stalls[i % 30]["id"],
                market=stalls[i % 30]["marketId"],
                status=states[i % len(states)],
                is_demo=True,
                body=f"Fictional {kind} example {i + 1}. No external action.",
                image=f"PARTNER-{i % 6 + 1:02}",
            )
            for i in range(count)
        ]

    data = dict(
        version=1,
        seed=1101,
        anchor=ANCHOR,
        provenance="Original deterministic fictional data; no real people, business records or performance evidence",
        discovery=discovery,
        batches=batches,
        reviews=reviews,
        owners=[
            dict(
                id=f"DEMO-owner-{i + 1:02}",
                name=f"{['Aina', 'Bala', 'Chun', 'Devi', 'Ehsan'][i % 5]} Demo {i + 1}",
                stall=s["id"],
                is_demo=True,
            )
            for i, s in enumerate(stalls)
        ],
        customers=[
            dict(
                id=f"DEMO-customer-{i + 1:02}",
                name=f"Neighbour Demo {i + 1}",
                is_demo=True,
            )
            for i in range(50)
        ],
        administrator=dict(
            id="DEMO-private-admin", name="Private fixture moderator", is_demo=True
        ),
        complaints=records(
            "complaint", 8, ["submitted", "triaged", "dismissed", "resolved"]
        ),
        organisations=records("organisation", 12, ["fictional-directory"]),
        partnerPersonas=records("partner-persona", 18, ["scoped-fixture"]),
        mediaFeatures=records(
            "media-feature", 6, ["published", "approved", "rejected"]
        ),
        trails=records("trail", 3, ["published"]),
        collaborations=records(
            "collaboration", 6, ["requested", "approved", "rejected"]
        ),
        referrals=records("referral", 6, ["acknowledged", "timeout", "resolved"]),
        inspections=records(
            "inspection", 4, ["scheduled", "inspected", "follow-up", "resolved"]
        ),
        permits=records("permit", 10, ["submitted", "approved", "rejected", "expired"]),
        orders=records("order", 24, ["completed", "cancelled", "rejected", "failed"]),
        reservations=records(
            "reservation", 8, ["reserved", "accepted", "expired", "cancelled"]
        ),
        payments=records("payment", 24, ["success", "failure", "timeout", "pending"]),
        refunds=records("refund", 6, ["completed"]),
        subscriptions=records("subscription", 8, ["free", "premium", "renewal-failed"]),
        deliveries=records(
            "delivery", 12, ["assigned", "accepted", "arrived", "failed"]
        ),
        collections=records(
            "collection", 8, ["requested", "scheduled", "collected", "missed"]
        ),
        notifications=records(
            "notification", 30, ["queued", "sent", "failed", "retried", "suppressed"]
        ),
        sensors=[
            dict(
                id=f"DEMO-sensor-{i + 1}",
                storage=storage,
                readings=[
                    dict(
                        minute=j * 10,
                        temperature=None
                        if j % 13 == 0
                        else [65, 4, 28][i] + (8 if j % 11 == 0 else 0),
                        simulated=True,
                    )
                    for j in range(48)
                ],
            )
            for i, storage in enumerate(["hot", "cold", "ambient"])
        ],
        weather=records("weather", 3, ["mild", "hot-humid", "missing"]),
        aiDrafts=records(
            "ai-draft", 6, ["confirmed-preview", "ambiguous", "quota", "failure"]
        ),
        campaigns=records("campaign", 8, ["approved", "pending", "rejected", "paused"]),
        offers=records("offer", 12, ["percentage", "bundle", "free"]),
        adCreatives=[
            dict(
                id=f"AD-{i + 1:02}",
                description=f"Fictional campaign creative {i + 1}; image to be supplied",
            )
            for i in range(6)
        ],
    )
    data["pilot"] = [
        dict(
            id=f"DEMO-pilot-{week}-{i + 1}",
            week=week,
            stall=[s for s in stalls if s["marketId"] == markets[0]["id"]][i]["id"],
            market=markets[0]["id"],
            participated=not (week == 2 and i == 9),
            grossSen=0 if week == 1 else 2000 + i * 100,
            refundSen=0 if week == 1 else (200 if i % 4 == 0 else 0),
            commissionSen=0 if week == 1 else (2000 + i * 100) * 3 // 100,
            incrementalSen=0 if week == 1 else 150,
            weighedHumanGrams=0 if week == 1 else 800 + i * 20,
            estimatedHumanGrams=0 if week == 1 else 1000 + i * 30,
            compostGrams=250,
            bsfGrams=150,
            is_demo=True,
        )
        for week in range(1, 5)
        for i in range(10)
    ]
    write("contracts/demo-catalog.json", data)
    prompts = (ROOT / "IMAGE_GENERATION_PROMPTS.md").read_text(encoding="utf-8")
    manifest = []
    for match in re.finditer(
        r"### ((?:HERO|MARKET|STALL|FOOD|PERSONA|PARTNER|AD|EVIDENCE)-\d{2}) — ([^\n]+)\n.*?\*\*Save as:\*\* `([^`]+)`.*?```text\n(.*?)\n```",
        prompts,
        re.S,
    ):
        key, title, filename, prompt = match.groups()
        group, number = key.split("-")
        n = int(number) - 1
        entity = (
            markets[n]["id"]
            if group == "MARKET"
            else stalls[n]["id"]
            if group == "STALL"
            else menu[n * 3]["id"]
            if group == "FOOD"
            else f"demo-{group.lower()}-{number}"
        )
        reference_prompt = prompt
        if group in ["MARKET", "STALL", "FOOD"]:
            subject = (
                markets[n]["name"]
                if group == "MARKET"
                else stalls[n]["name"]
                if group == "STALL"
                else menu[n * 3]["name"]
            )
            title = f"{subject} — fictional {group.lower()} scene"
            prompt = f"Create one photo-style image of {subject}, a fictional Malaysian {group.lower()} scene for PasarMalam. No identifiable people, logos, certification seals, claims of affiliation or text. Natural light, accessible clear composition. One image only."
        manifest.append(
            dict(
                id=key,
                description=title,
                alt=f"Image placeholder: {title}; user image pending",
                originalFilename=filename,
                optimisedFilename=filename.replace(".png", ".webp"),
                entity=entity,
                status="awaiting-user-image",
                method="described-placeholder",
                license="No raster image supplied yet",
                prompt=prompt,
                referencePrompt=reference_prompt,
            )
        )
    if len(manifest) != 100:
        raise ValueError("Expected 100 individual prompt slots")
    write("docs/asset-manifest.json", manifest)
    write("apps/web/src/presentation/assets.json", manifest)
    print(
        "Built fictional catalog and 100-slot placeholder manifest. No remote action."
    )


if __name__ == "__main__":
    build()
