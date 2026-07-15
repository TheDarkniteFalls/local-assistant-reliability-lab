#!/usr/bin/env python3
"""Render the public toolkit map from toolkit_index.json."""

from __future__ import annotations

import argparse
from pathlib import Path

from check_toolkit_index import load_index, validate_index


ROOT = Path(__file__).resolve().parent
INDEX_PATH = ROOT / "toolkit_index.json"
OUTPUT_PATH = ROOT / "TOOLKIT_MAP.md"


def cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ").strip()


def render(index: dict) -> str:
    lines = [
        "# Public Toolkit Map",
        "",
        "This page is generated from `toolkit_index.json`. It is a problem-first map",
        "of the public guides, tools, and teaching patterns in this toolkit.",
        "",
        "> All examples use synthetic data. Maturity describes the public contract,",
        "> not external adoption or a claim that a check proves the whole system safe.",
        "",
        "## Maturity",
        "",
    ]
    for maturity, description in index["maturity_definitions"].items():
        lines.append(f"- **{maturity.title()}:** {description}")

    repos = index["repos"]
    for journey in index["journeys"]:
        lines.extend(
            [
                "",
                f"## {journey['name']}",
                "",
                journey["description"],
                "",
                "| Project | Kind | Maturity | Use it when | First check |",
                "| --- | --- | --- | --- | --- |",
            ]
        )
        journey_repos = [
            repo for repo in repos if repo["journey"] == journey["id"]
        ]
        for repo in journey_repos:
            command = repo["commands"][0]
            lines.append(
                "| "
                f"[{cell(repo['name'])}]({repo['url']}) | "
                f"{cell(repo['kind'])} | {cell(repo['maturity'])} | "
                f"{cell(repo['use_when'])} | `{cell(command)}` |"
            )

        lines.extend(["", "### Trust boundaries", ""])
        for repo in journey_repos:
            lines.extend(
                [
                    f"#### [{repo['name']}]({repo['url']})",
                    "",
                    f"- **For:** {repo['audience']}",
                    f"- **A pass establishes:** {repo['proof']}",
                    f"- **It does not establish:** {repo['limitation']}",
                    f"- **CI:** [checks workflow]({repo['ci_url']})",
                    "",
                ]
            )

    lines.extend(
        [
            "## Public boundary",
            "",
            index["boundary"],
            "",
            "Do not interpret inclusion here as permission to publish, deploy, send,",
            "purchase, delete, or change shared state. Those actions still require the",
            "authority defined by the real project and its human owner.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail if TOOLKIT_MAP.md is missing or out of date",
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
            raise SystemExit("FAIL TOOLKIT_MAP.md is out of date")
        print("PASS toolkit_map")
        return 0

    OUTPUT_PATH.write_text(expected, encoding="utf-8")
    print(f"WROTE {OUTPUT_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
