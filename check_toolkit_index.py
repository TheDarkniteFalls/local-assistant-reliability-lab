#!/usr/bin/env python3
"""Validate the public toolkit index."""

from __future__ import annotations

import json
import sys
from pathlib import Path


REQUIRED_REPOS = {
    "public-repo-safety-kit",
    "codex-project-instructions-starter",
    "evidencegate",
    "local-model-reliability-example",
    "context-boundary-examples",
    "agent-action-authority-examples",
    "green-spine-qa-pattern",
}

BLOCKED_TEXT = (
    "/Users/",
    "sk-",
    "BEGIN PRIVATE KEY",
)
EVIDENCEGATE_REFERENCE_COMMAND = "python3 -B examples/run-v1-reference.py"
COMPLETE_WORKFLOW_COMMAND = "python3 -B run_complete_workflow.py"


def fail(message: str) -> None:
    raise SystemExit(f"FAIL {message}")


def load_index(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        fail(f"cannot read {path}: {exc}")
    except json.JSONDecodeError as exc:
        fail(f"invalid json: {exc}")


def validate_index(index: dict) -> None:
    if index.get("complete_workflow_command") != COMPLETE_WORKFLOW_COMMAND:
        fail("complete workflow command is missing or stale")
    repos = index.get("repos")
    if not isinstance(repos, list) or not repos:
        fail("repos must be a non-empty list")

    slugs = []
    for repo in repos:
        if not isinstance(repo, dict):
            fail("repo entries must be objects")
        for field in ("slug", "name", "url", "use_when", "commands"):
            if field not in repo:
                fail(f"missing {field}")
        if not repo["url"].startswith("https://github.com/TheDarkniteFalls/"):
            fail(f"unexpected url for {repo['slug']}")
        if not isinstance(repo["commands"], list) or not repo["commands"]:
            fail(f"missing commands for {repo['slug']}")
        slugs.append(repo["slug"])

    if len(slugs) != len(set(slugs)):
        fail("duplicate repo slug")

    missing = REQUIRED_REPOS - set(slugs)
    if missing:
        fail("missing required repos: " + ", ".join(sorted(missing)))

    evidencegate = next(repo for repo in repos if repo["slug"] == "evidencegate")
    if EVIDENCEGATE_REFERENCE_COMMAND not in evidencegate["commands"]:
        fail("EvidenceGate entry must include the detached v1 reference run")

    haystack = json.dumps(index, sort_keys=True)
    blocked = [text for text in BLOCKED_TEXT if text.lower() in haystack.lower()]
    if blocked:
        fail("public-safety review text found: " + ", ".join(blocked))


def main(argv: list[str]) -> int:
    path = Path(argv[1]) if len(argv) > 1 else Path(__file__).with_name("toolkit_index.json")
    index = load_index(path)
    validate_index(index)
    print("PASS toolkit_index")
    print("PASS complete_workflow_entry")
    print("PASS required_repos")
    print("PASS evidencegate_v1_reference")
    print("PASS public_safe_text")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
