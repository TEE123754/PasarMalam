# CP8 — collect real history and run the local benchmark

Deployment is excluded. Use the existing CP5 stock/sales workflow: record prepared quantities, normal sales, confirmed clearance collection, other disposal routes and a final closing count. Reconcile the complete batch ledger before considering a session usable. Never replace unknown stock counts with zero. Hawker consent and data-source review are required before using actual history.

## Collection

1. Select one consenting stall and a target market weekday. Record Malaysia preparation-date sessions and retain provenance privately. The current forecast is stall-level sales, not dish-level demand.
2. Keep sessions chronological. For each completed day retain integer `prepared`, `normal`, `clearance`, `closing_leftovers` and boolean `closed`, `reconciled`. Ledger closing leftovers are portions remaining before final disposition. Keep waste/donation records in the original ledger for audit; do not count them as sales.
3. Record missing sessions, stockout/sold-out conditions and disruptions separately. A zero-leftover day is conservatively excluded because observed sales may understate demand. Consented/reconciled is not proof that sales reports are accurate.
4. At least **30 usable same-weekday sessions** are needed by the current method. A four-week pilot will not meet that minimum. Use existing consented historical records or continue collection; do not invent additional sessions or lower the threshold just to produce numbers.
5. Keep raw history, consent evidence and reports in ignored `.local-evaluation/cp8/`; no names, contact details or credentials are needed in the benchmark input. Review the source before treating output as real evidence.

## Input and command

Use [the synthetic schema example](../contracts/cp8-forecast-fixture.json) as a format reference, replacing every session with actual reviewed records. One stall per file; one aggregate session per date. Do not change synthetic provenance to real without replacing the data.

```json
{
  "source": "consented-recorded",
  "consent_evidence": "Private consent register reference, reviewed by operator",
  "target": "2027-06-03",
  "planned": 30,
  "sessions": [
    {"date": "2027-05-27", "prepared": 30, "normal": 16,
     "clearance": 5, "closing_leftovers": 9,
     "closed": true, "reconciled": true}
  ]
}
```

This one-row format example will return manual planning, not a forecast. Use your actual future target; do not copy the illustrative dates as real observations.

```powershell
uv run --project apps/api python scripts/cp8_forecast.py --input .local-evaluation/cp8/history.json --output .local-evaluation/cp8/report.json
```

The offline Python command makes no provider calls and does not write to Supabase. Connected `/sandbox/hawker/planning` reads your owned stall's existing journal; download its report for review. Demo planning instead uses the fixed fictional 15 October 2026 scenario and 30 planned portions, independent of the visible stall/quantity selectors.

## Freeze and review

- Freeze the input/hash and method before looking at holdout results. Keep chronological train, validation, calibration and holdout boundaries from the report. No future/target-day records are training input.
- Compare mean, median and bounded trend MAE in portions. Validation selects the candidate/baseline; holdout gates release and is disclosed as doing so. If you tune after viewing holdout, collect a new untouched audit period.
- Record sample exclusions and reasons. Show all candidate errors, the released method, calibration sample count, nominal interval, actual covered/total holdout and coverage percentage. Do not hide poor coverage or claim causal waste reduction.
- Likely unsold is `max(planned - predicted_sales, 0)` and needs a planned quantity; it is a planning estimate, not a disposal or safety recommendation. Report actual leftover forecast error separately when judging pilot usefulness.
- Retain the CP7 interview/trial evidence independently. These synthetic smoke results do not complete CP7 or the four real-history CP8 requirements.
