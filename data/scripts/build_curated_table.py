#!/usr/bin/env python3
"""Build curated target/publish table consumed by dashboard and notebook."""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path


JAN_START = datetime(2024, 1, 1, 0, 0, tzinfo=timezone.utc)
JAN_END = datetime(2024, 1, 31, 23, 30, tzinfo=timezone.utc)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build curated JSON table")
    parser.add_argument("--in-dir", default="data/processed")
    parser.add_argument("--out-file", default="data/processed/curated_jan2024.json")
    return parser.parse_args()


def parse_iso_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def iso_utc(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def main() -> None:
    args = parse_args()
    in_dir = Path(args.in_dir)
    out_file = Path(args.out_file)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    actual_map: dict[str, float] = {}
    with (in_dir / "actual_jan2024.csv").open("r", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            target_dt = parse_iso_datetime(row["targetTime"])
            if JAN_START <= target_dt <= JAN_END:
                actual_map[iso_utc(target_dt)] = float(row["actualGeneration"])

    forecast_rows: list[dict[str, object]] = []
    forecast_targets: set[str] = set()
    with (in_dir / "forecast_jan2024.csv").open("r", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            target_dt = parse_iso_datetime(row["targetTime"])
            if not (JAN_START <= target_dt <= JAN_END):
                continue

            target_iso = iso_utc(target_dt)
            forecast_targets.add(target_iso)
            forecast_rows.append(
                {
                    "targetTime": target_iso,
                    "publishTime": iso_utc(parse_iso_datetime(row["publishTime"])),
                    "actualGeneration": actual_map.get(target_iso),
                    "forecastGeneration": float(row["forecastGeneration"]),
                }
            )

    for target_iso, actual_generation in actual_map.items():
        if target_iso in forecast_targets:
            continue
        forecast_rows.append(
            {
                "targetTime": target_iso,
                "publishTime": None,
                "actualGeneration": actual_generation,
                "forecastGeneration": None,
            }
        )

    rows = sorted(
        forecast_rows,
        key=lambda row: (
            row["targetTime"],
            row["publishTime"] is None,
            "" if row["publishTime"] is None else row["publishTime"],
        ),
    )

    out_file.write_text(json.dumps({"rows": rows}, indent=2), encoding="utf-8")
    print(f"Wrote {len(rows)} rows to {out_file}")


if __name__ == "__main__":
    main()
