#!/usr/bin/env python3
"""Render the static Navigator data from toolkit_index.json."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from check_toolkit_index import load_index, validate_index
from toolkit_contract import TEMPLATE_CREATE_URL, navigator_entry


ROOT = Path(__file__).resolve().parent
INDEX_PATH = ROOT / "toolkit_index.json"
OUTPUT_PATH = ROOT / "docs" / "toolkit-data.json"


def render(index: dict) -> str:
    payload = {
        "site_name": "Reliability Navigator",
        "generated_from": "toolkit_index.json",
        "boundary": index["boundary"],
        "template_create_url": TEMPLATE_CREATE_URL,
        "journeys": index["journeys"],
        "maturity_definitions": index["maturity_definitions"],
        "repos": [navigator_entry(repo) for repo in index["repos"]],
    }
    return json.dumps(payload, indent=2, ensure_ascii=False) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail if docs/toolkit-data.json is missing or out of date",
    )
    args = parser.parse_args()

    index = load_index(INDEX_PATH)
    validate_index(index)
    expected = render(index)
    if args.check:
        try:
            actual = OUTPUT_PATH.read_text(encoding="utf-8")
        except OSError as exc:
            raise SystemExit(f"FAIL cannot read {OUTPUT_PATH}: {exc}") from exc
        if actual != expected:
            raise SystemExit("FAIL Navigator data is out of date")
        print("PASS navigator_data")
        return 0

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(expected, encoding="utf-8")
    print(f"WROTE {OUTPUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
