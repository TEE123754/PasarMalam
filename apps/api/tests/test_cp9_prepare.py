import csv
import json

from cp9_prepare import prepare


def test_preparation_stays_unmeasured_and_never_overwrites(tmp_path):
    assert len(prepare(tmp_path)) == 3
    details = json.loads((tmp_path / "entry-details.json").read_text())
    assert details["students"] == [] and details["presenter"] is None
    assert details["competition"]["video_limit_seconds"] is None
    assert details["prior_version"]["exists"] is None
    for name in ["rehearsal.csv", "video-review.csv"]:
        with (tmp_path / name).open(newline="") as file:
            assert list(csv.DictReader(file)) == []
    (tmp_path / "rehearsal.csv").write_text("Operator's real observations\n")
    assert prepare(tmp_path) == []
    assert (tmp_path / "rehearsal.csv").read_text() == "Operator's real observations\n"
