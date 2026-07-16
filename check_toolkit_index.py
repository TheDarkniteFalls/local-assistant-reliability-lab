#!/usr/bin/env python3
"""Validate the public toolkit index."""

from __future__ import annotations

import json
import sys
from pathlib import Path


REQUIRED_REPOS = {
    "agent-operator-handbook",
    "reliable-ai-work-starter",
    "public-repo-safety-kit",
    "codex-project-instructions-starter",
    "evidencegate",
    "local-model-reliability-example",
    "context-boundary-examples",
    "agent-action-authority-examples",
    "green-spine-qa-pattern",
    "sqlite-context-retrieval-example",
    "sealed-evaluation-pattern",
    "generated-system-qa-pattern",
    "model-workload-telemetry",
    "ai-game-state-machine-pattern",
}

REQUIRED_JOURNEYS = {
    "start_and_direct",
    "bound_and_prove",
    "evaluate_and_operate",
}
ALLOWED_KINDS = {"guide", "starter", "tool", "pattern"}
ALLOWED_MATURITY = {"flagship", "stable", "experimental"}
TRUST_FIELDS = {
    "audience",
    "proof",
    "limitation",
    "ci_url",
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
    journeys = index.get("journeys")
    if not isinstance(journeys, list):
        fail("journeys must be a list")
    journey_ids = {
        journey.get("id")
        for journey in journeys
        if isinstance(journey, dict)
    }
    if journey_ids != REQUIRED_JOURNEYS:
        fail("journey ids are incomplete or unexpected")

    maturity_definitions = index.get("maturity_definitions")
    if not isinstance(maturity_definitions, dict):
        fail("maturity definitions must be an object")
    if set(maturity_definitions) != ALLOWED_MATURITY:
        fail("maturity definitions are incomplete or unexpected")

    repos = index.get("repos")
    if not isinstance(repos, list) or not repos:
        fail("repos must be a non-empty list")

    slugs = []
    for repo in repos:
        if not isinstance(repo, dict):
            fail("repo entries must be objects")
        for field in (
            "slug",
            "name",
            "url",
            "journey",
            "kind",
            "maturity",
            "minutes",
            "use_when",
            "commands",
            *sorted(TRUST_FIELDS),
        ):
            if field not in repo:
                fail(f"missing {field}")
            if field == "minutes":
                if not isinstance(repo[field], int) or not 1 <= repo[field] <= 120:
                    fail(f"minutes must be an integer from 1 to 120 for {repo.get('slug', 'unknown')}")
                continue
            if field != "commands" and not isinstance(repo[field], str):
                fail(f"{field} must be text for {repo.get('slug', 'unknown')}")
            if field != "commands" and not repo[field].strip():
                fail(f"{field} must not be empty for {repo.get('slug', 'unknown')}")
        if not repo["url"].startswith("https://github.com/TheDarkniteFalls/"):
            fail(f"unexpected url for {repo['slug']}")
        if repo["journey"] not in REQUIRED_JOURNEYS:
            fail(f"unexpected journey for {repo['slug']}")
        if repo["kind"] not in ALLOWED_KINDS:
            fail(f"unexpected kind for {repo['slug']}")
        if repo["maturity"] not in ALLOWED_MATURITY:
            fail(f"unexpected maturity for {repo['slug']}")
        expected_ci = (
            f"https://github.com/TheDarkniteFalls/{repo['slug']}/"
            "actions/workflows/checks.yml"
        )
        if repo["ci_url"] != expected_ci:
            fail(f"unexpected CI URL for {repo['slug']}")
        if not isinstance(repo["commands"], list) or not repo["commands"]:
            fail(f"missing commands for {repo['slug']}")
        if not all(isinstance(command, str) and command.strip() for command in repo["commands"]):
            fail(f"commands must be non-empty strings for {repo['slug']}")
        slugs.append(repo["slug"])

    if len(slugs) != len(set(slugs)):
        fail("duplicate repo slug")

    missing = REQUIRED_REPOS - set(slugs)
    if missing:
        fail("missing required repos: " + ", ".join(sorted(missing)))

    evidencegate = next(repo for repo in repos if repo["slug"] == "evidencegate")
    if EVIDENCEGATE_REFERENCE_COMMAND not in evidencegate["commands"]:
        fail("EvidenceGate entry must include the detached v1 reference run")
    if evidencegate["maturity"] != "flagship":
        fail("EvidenceGate must remain the flagship entry")

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
    print("PASS visitor_journeys")
    print("PASS trust_signals")
    print("PASS evidencegate_v1_reference")
    print("PASS public_safe_text")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
