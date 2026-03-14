#!/usr/bin/env python3
"""Fetch real BMRS FUELHH/WINDFOR January 2024 data and store raw JSON files."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch BMRS datasets for Jan 2024")
    parser.add_argument("--out-dir", default="data/raw")
    return parser.parse_args()


def request_json(endpoint: str, params: dict[str, Any]) -> Any:
    headers = {"Accept": "application/json"}

    response = requests.get(
        f"{BASE_URL}/{endpoint}",
        params=params,
        headers=headers,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def main() -> None:
    args = parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    jan_start = "2024-01-01"
    jan_end = "2024-01-31"

    fuelhh = request_json(
        "datasets/FUELHH/stream",
        {
            "settlementDateFrom": jan_start,
            "settlementDateTo": jan_end,
            "fuelType": "WIND",
            "format": "application/json",
        },
    )

    windfor = request_json(
        "datasets/WINDFOR/stream",
        {
            "publishDateTimeFrom": "2023-12-30T00:00:00Z",
            "publishDateTimeTo": "2024-02-01T23:59:59Z",
            "format": "application/json",
        },
    )

    stamp = datetime.now(timezone.utc).isoformat()
    (out_dir / "fuelhh_wind_jan2024.json").write_text(json.dumps(fuelhh, indent=2), encoding="utf-8")
    (out_dir / "windfor_jan2024.json").write_text(json.dumps(windfor, indent=2), encoding="utf-8")
    (out_dir / "_fetch_meta.json").write_text(
        json.dumps(
            {
                "fetchedAt": stamp,
                "janWindow": [jan_start, jan_end],
                "sources": {
                    "actual": "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream",
                    "forecast": "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream",
                },
                "rowCounts": {
                    "fuelhh": len(fuelhh) if isinstance(fuelhh, list) else None,
                    "windfor": len(windfor) if isinstance(windfor, list) else None,
                },
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print("Saved raw BMRS files to", out_dir)


if __name__ == "__main__":
    main()
