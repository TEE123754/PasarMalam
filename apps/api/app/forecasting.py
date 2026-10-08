"""CP8 frozen chronological sales forecast; no safety or automatic cooking decisions."""

import math
from datetime import date
from statistics import mean, median


def evaluate_history(rows, target, planned=None):
    target = date.fromisoformat(target)
    seen = set()
    usable, excluded = [], {}
    for row in sorted(rows, key=lambda x: x["date"]):
        day = date.fromisoformat(row["date"])
        reason = None
        if day >= target:
            reason = "future-or-target"
        elif row["date"] in seen:
            raise ValueError("Duplicate stall/date history")
        elif not row.get("closed") or not row.get("reconciled"):
            reason = "incomplete-or-unreconciled"
        elif any(
            type(row.get(k)) is not int or row[k] < 0
            for k in ["prepared", "normal", "clearance", "closing_leftovers"]
        ):
            reason = "unknown-counts"
        elif row["prepared"] <= 0 or row["normal"] + row["clearance"] > row["prepared"]:
            reason = "invalid-denominator"
        elif row["closing_leftovers"] == 0:
            reason = "zero-leftovers-demand-censored"
        elif day.weekday() != target.weekday():
            reason = "different-weekday"
        seen.add(row["date"])
        if reason:
            excluded[reason] = excluded.get(reason, 0) + 1
        else:
            usable.append({**row, "sold": row["normal"] + row["clearance"]})
    result = {
        "target": target.isoformat(),
        "samples": len(usable),
        "excluded": excluded,
        "planning_only": True,
        "approval_required": True,
        "definition": (
            "Closed reconciled same-stall, same-weekday sessions; normal + clearance sales. Zero "
            "closing leftovers conservatively censor demand. No weather effect is inferred."
        ),
        "quantity": None,
        "likely_unsold": None,
        "interval": None,
        "benchmark": None,
    }
    if len(usable) < 30:
        return {
            **result,
            "state": "Manual planning — insufficient history",
            "recent_observation": {
                "date": usable[-1]["date"],
                "sold": usable[-1]["sold"],
                "prepared": usable[-1]["prepared"],
                "closing_leftovers": usable[-1]["closing_leftovers"],
            }
            if usable
            else None,
            "recommendation": (
                "Review the latest reconciled observation and plan a small first batch manually; "
                "no precise cooking quantity is recommended."
            )
            if usable
            else (
                "Record preparation, sales and closing leftovers first; choose quantities manually."
            ),
        }
    n = len(usable)
    nt = max(8, int(n * 0.4))
    nv = max(4, int(n * 0.15))
    nc = max(10, int(n * 0.25))
    # Reserve at least four untouched test sessions. Large sets retain fixed chronology.
    if nt + nv + nc + 4 > n:
        nc = n - nt - nv - 4
    train = usable[:nt]
    validation = usable[nt : nt + nv]
    calibration = usable[nt + nv : nt + nv + nc]
    holdout = usable[nt + nv + nc :]
    origin = date.fromisoformat(train[0]["date"]).toordinal()
    xs = [date.fromisoformat(r["date"]).toordinal() - origin for r in train]
    ys = [r["sold"] for r in train]
    mx, my = mean(xs), mean(ys)
    denominator = sum((x - mx) ** 2 for x in xs)
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / denominator if denominator else 0

    def prediction(kind, row):
        if kind == "historical-average":
            return mean(ys)
        if kind == "historical-median":
            return median(ys)
        return max(
            0,
            min(
                max(ys) * 1.25,
                my + slope * (date.fromisoformat(row["date"]).toordinal() - origin - mx),
            ),
        )

    def mae(kind, subset):
        return mean(abs(r["sold"] - prediction(kind, r)) for r in subset)

    candidates = ["historical-median", "historical-average", "bounded-trend"]
    baseline = min(candidates[:2], key=lambda k: mae(k, validation))
    selected = min(candidates, key=lambda k: mae(k, validation))
    # No fitting or parameter tuning uses holdout; failure gate can demote trend to baseline.
    released = (
        selected
        if selected != "bounded-trend" or mae(selected, holdout) < mae(baseline, holdout)
        else baseline
    )
    residuals = sorted(abs(r["sold"] - prediction(released, r)) for r in calibration)
    rank = math.ceil((len(residuals) + 1) * 0.9)
    radius = residuals[rank - 1] if rank <= len(residuals) else None
    p = prediction(released, {"date": target.isoformat()})
    covered = (
        sum(abs(r["sold"] - prediction(released, r)) <= radius for r in holdout)
        if radius is not None
        else None
    )
    return {
        **result,
        "state": "History-based planning forecast",
        "method": released,
        "quantity": round(p),
        "likely_unsold": max(0, round(planned - p)) if planned is not None else None,
        "planned": planned,
        "recent_observation": None,
        "interval": {
            "lower": max(0, math.floor(p - radius)),
            "upper": math.ceil(p + radius),
            "nominal_coverage": 0.9,
            "holdout_covered": covered,
            "holdout_count": len(holdout),
            "empirical_coverage": covered / len(holdout),
            "calibration_samples": len(calibration),
            "caveat": (
                "Split residual interval; time-series exchangeability is not assured. Empirical t"
                "est coverage is descriptive, not a guarantee."
            ),
        }
        if radius is not None
        else None,
        "benchmark": {
            "train": len(train),
            "validation": len(validation),
            "calibration": len(calibration),
            "holdout": len(holdout),
            "boundaries": {
                "train_end": train[-1]["date"],
                "validation_end": validation[-1]["date"],
                "calibration_end": calibration[-1]["date"],
                "holdout_start": holdout[0]["date"],
                "holdout_end": holdout[-1]["date"],
            },
            "validation_mae": {k: mae(k, validation) for k in candidates},
            "holdout_mae": {k: mae(k, holdout) for k in candidates},
            "selected_on_validation": selected,
            "release_method": released,
            "release_gate": (
                "Trend must improve the preselected baseline on holdout; otherwise display baseli"
                "ne. Holdout is used for this release decision, not training."
            ),
        },
        "recommendation": (
            "Review the forecast and unsold estimate before choosing preparation; it does not cha"
            "nge a batch or safety deadline."
        ),
    }
