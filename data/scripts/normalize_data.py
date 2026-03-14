#!/usr/bin/env python3
"""Normalize raw BMRS payloads into tidy CSV files using the standard library."""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Normalize BMRS raw data")
    parser.add_argument("--raw-dir", default="data/raw")
    parser.add_argument("--out-dir", default="data/processed")
    return parser.parse_args()


def extract_rows(payload: object, fallback_keys: list[str]) -> list[dict]:
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]

    if not isinstance(payload, dict):
        return []

    for key in fallback_keys:
        rows = payload.get(key)
        if isinstance(rows, list):
            return rows
    return []


def parse_iso_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def iso_utc(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def main() -> None:
    args = parse_args()
    raw_dir = Path(args.raw_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    fuelhh_payload = json.loads((raw_dir / "fuelhh_wind_jan2024.json").read_text(encoding="utf-8"))
    windfor_payload = json.loads((raw_dir / "windfor_jan2024.json").read_text(encoding="utf-8"))

    fuelhh_rows = extract_rows(fuelhh_payload, ["data", "result", "records"])
    windfor_rows = extract_rows(windfor_payload, ["data", "result", "records"])

    actual_groups: dict[str, list[float]] = {}
    for row in fuelhh_rows:
        target_time = row.get("startTime")
        generation = row.get("generation")
        if target_time is None or generation is None:
            continue

        target_iso = iso_utc(parse_iso_datetime(str(target_time)))
        actual_groups.setdefault(target_iso, []).append(float(generation))

    actual_rows = [
        {
            "targetTime": target_time,
            "actualGeneration": round(sum(values) / len(values), 6),
        }
        for target_time, values in sorted(actual_groups.items())
    ]

    forecast_map: dict[tuple[str, str], float] = {}
    for row in windfor_rows:
        target_time = row.get("startTime")
        publish_time = row.get("publishTime")
        generation = row.get("generation")
        if target_time is None or publish_time is None or generation is None:
            continue

        key = (
            iso_utc(parse_iso_datetime(str(target_time))),
            iso_utc(parse_iso_datetime(str(publish_time))),
        )
        forecast_map[key] = float(generation)

    forecast_rows = [
        {
            "targetTime": target_time,
            "publishTime": publish_time,
            "forecastGeneration": generation,
        }
        for (target_time, publish_time), generation in sorted(forecast_map.items())
    ]

    with (out_dir / "actual_jan2024.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["targetTime", "actualGeneration"])
        writer.writeheader()
        writer.writerows(actual_rows)

    with (out_dir / "forecast_jan2024.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["targetTime", "publishTime", "forecastGeneration"])
        writer.writeheader()
        writer.writerows(forecast_rows)

    print(f"Normalized actual rows: {len(actual_rows)}")
    print(f"Normalized forecast rows: {len(forecast_rows)}")


if __name__ == "__main__":
    main()
