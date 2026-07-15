#!/usr/bin/env python3
"""Run and replay one synthetic, end-to-end reliable-agent workflow."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


BUNDLE_VERSION = "reliable_agent_workflow_bundle_v1"
TRACE_EXTENSION = (
    "https://github.com/TheDarkniteFalls/local-assistant-reliability-lab/"
    "workflow-trace/v1"
)
REQUIRED_CASES = {
    "source_read_allowed",
    "authorized_write_allowed",
    "single_use_grant_replay_rejected",
    "protected_write_rejected",
    "scope_change_stale_grant_rejected",
    "scope_change_fresh_grant_allowed",
    "focused_check_passed",
}
PROTECTED_PREFIXES = (".env", ".git", "private")


class DemoError(RuntimeError):
    """Raised when the synthetic workflow or its replay contract fails."""


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def digest_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def pretty_json(value: Any) -> str:
    return json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def run_git(repo: Path, *arguments: str) -> str:
    result = subprocess.run(
        [
            "git",
            "-c",
            "core.fsmonitor=false",
            "-c",
            "core.pager=cat",
            "-C",
            str(repo),
            *arguments,
        ],
        check=False,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=20,
    )
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "unknown Git error"
        raise DemoError(f"git {' '.join(arguments)} failed: {detail}")
    return result.stdout.strip()


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def action_binding(action: dict[str, Any]) -> str:
    bound = {
        "kind": action["kind"],
        "targets": action.get("targets", []),
        "payload_digest": action.get("payload_digest", ""),
        "proposal_version": action["proposal_version"],
    }
    return digest_text(canonical_json(bound))


def is_protected(target: str) -> bool:
    return any(
        target == prefix or target.startswith(f"{prefix}/")
        for prefix in PROTECTED_PREFIXES
    )


class AuthorityGate:
    def __init__(self) -> None:
        self.used_grants: set[str] = set()

    def decide(
        self, action: dict[str, Any], grant: dict[str, str] | None = None
    ) -> str:
        if action["kind"] == "read":
            return "allowed"
        if any(is_protected(target) for target in action.get("targets", [])):
            return "rejected_protected"
        if grant is None:
            return "requires_authority"
        binding = action_binding(action)
        if grant.get("binding") != binding:
            return "requires_fresh_authority"
        if binding in self.used_grants:
            return "rejected_grant_replay"
        self.used_grants.add(binding)
        return "allowed"


def trace_event(
    case_id: str,
    action: dict[str, Any],
    decision: str,
    grant: dict[str, str] | None = None,
) -> dict[str, Any]:
    return {
        "case_id": case_id,
        "kind": action["kind"],
        "targets": action.get("targets", []),
        "proposal_version": action["proposal_version"],
        "action_binding": action_binding(action),
        "grant_binding": grant.get("binding") if grant else None,
        "decision": decision,
    }


def trace_text(events: list[dict[str, Any]]) -> str:
    return "".join(canonical_json(event) + "\n" for event in events)


def receipt_errors(receipt: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = {
        "schema_version",
        "summary",
        "subject",
        "scope",
        "files_touched",
        "checks",
        "claims",
        "risks",
        "human_review",
        "public_safety",
        "extensions",
    }
    missing = sorted(required - set(receipt))
    if missing:
        errors.append("receipt fields missing: " + ", ".join(missing))
        return errors
    if receipt["schema_version"] != 1:
        errors.append("receipt schema_version must be 1")
    subject = receipt.get("subject", {})
    head_sha = subject.get("head_sha")
    if subject.get("type") != "git_change":
        errors.append("receipt subject.type must be git_change")
    if not isinstance(head_sha, str) or len(head_sha) != 40:
        errors.append("receipt subject.head_sha must be a full Git SHA")
    checks = {
        check.get("id"): check
        for check in receipt.get("checks", [])
        if isinstance(check, dict)
    }
    for check in checks.values():
        if check.get("revision") != head_sha:
            errors.append(f"check {check.get('id')} targets a stale revision")
    for claim in receipt.get("claims", []):
        for reference in claim.get("evidence_refs", []):
            check = checks.get(reference)
            if check is None:
                errors.append(f"claim references unknown check: {reference}")
            elif check.get("status") != "passed":
                errors.append(f"claim references non-passing check: {reference}")
    return errors


def bundle_errors(
    events: list[dict[str, Any]],
    receipt: dict[str, Any],
    manifest: dict[str, Any],
    repo: Path | None = None,
) -> list[str]:
    errors = receipt_errors(receipt)
    if manifest.get("schema_version") != BUNDLE_VERSION:
        errors.append("unsupported workflow bundle version")
    event_cases = {event.get("case_id") for event in events}
    missing_cases = sorted(REQUIRED_CASES - event_cases)
    if missing_cases:
        errors.append("required trace events missing: " + ", ".join(missing_cases))
    actual_trace_digest = digest_text(trace_text(events))
    if manifest.get("trace_sha256") != actual_trace_digest:
        errors.append("trace digest does not match manifest")
    receipt_digest = digest_text(canonical_json(receipt))
    if manifest.get("receipt_sha256") != receipt_digest:
        errors.append("receipt digest does not match manifest")
    extension = receipt.get("extensions", {}).get(TRACE_EXTENSION, {})
    if extension.get("trace_sha256") != actual_trace_digest:
        errors.append("receipt trace extension does not match the replayed trace")
    if sorted(receipt.get("files_touched", [])) != sorted(
        manifest.get("files_touched", [])
    ):
        errors.append("receipt files_touched does not match manifest")
    if receipt.get("subject", {}).get("head_sha") != manifest.get("head_sha"):
        errors.append("receipt head does not match manifest")

    if repo is not None:
        if not repo.is_dir():
            errors.append("synthetic repository is missing")
            return errors
        try:
            head_sha = run_git(repo, "rev-parse", "HEAD")
            if head_sha != manifest.get("head_sha"):
                errors.append("synthetic repository head does not match manifest")
            if run_git(repo, "status", "--porcelain=v1", "--untracked-files=all"):
                errors.append("synthetic repository is not clean")
            base_sha = receipt["subject"]["base_sha"]
            changed = sorted(
                path
                for path in run_git(
                    repo,
                    "diff",
                    "--name-only",
                    "--no-renames",
                    base_sha,
                    head_sha,
                ).splitlines()
                if path
            )
            if changed != sorted(receipt["files_touched"]):
                errors.append("synthetic Git diff does not match receipt")
        except (DemoError, KeyError) as exc:
            errors.append(f"could not replay synthetic repository: {exc}")
    return errors


def make_report(
    events: list[dict[str, Any]], receipt: dict[str, Any], manifest: dict[str, Any]
) -> str:
    rows = [
        ("Supplied-source read", "allowed"),
        ("Explicitly authorized write", "allowed"),
        ("Single-use grant replay", "rejected"),
        ("Protected-path write", "rejected"),
        ("Changed scope with stale grant", "rejected"),
        ("Changed scope after a fresh grant", "allowed"),
        ("Focused regression check", "passed"),
    ]
    lines = [
        "# Complete reliable-agent workflow report",
        "",
        "> Synthetic demonstration only. No model, network, credential, private data, "
        "or publication action is used.",
        "",
        "## Result",
        "",
        "| Case | Result |",
        "| --- | --- |",
        *[f"| {name} | `{result}` |" for name, result in rows],
        "",
        "## Revision-bound evidence",
        "",
        f"- Base revision: `{receipt['subject']['base_sha']}`",
        f"- Head revision: `{receipt['subject']['head_sha']}`",
        f"- Trace SHA-256: `{manifest['trace_sha256']}`",
        f"- Receipt SHA-256: `{manifest['receipt_sha256']}`",
        "- Changed files: " + ", ".join(f"`{path}`" for path in receipt["files_touched"]),
        "",
        "## What replay checks",
        "",
        "- every required allowed or rejected authority case remains in the trace;",
        "- trace and receipt digests match the manifest;",
        "- claims reference passing checks recorded for the exact head revision; and",
        "- the clean synthetic Git diff matches the receipt's recorded files.",
        "",
        "## What it does not prove",
        "",
        "The human and public-safety decisions are simulated. The trace digest is "
        "recorded under a non-authoritative EvidenceGate extension. This Lab replay "
        "does not authenticate an actor, replace the full EvidenceGate validator, "
        "evaluate a live model, or authorize publication.",
        "",
        f"Recorded trace events: {len(events)}.",
    ]
    return "\n".join(lines) + "\n"


def build_bundle(root: Path) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    repo = root / "synthetic-repo"
    repo.mkdir(parents=True, exist_ok=True)
    run_git(repo, "init", "-q")
    run_git(repo, "config", "user.name", "Synthetic Maintainer")
    run_git(repo, "config", "user.email", "synthetic-maintainer.invalid")
    write_text(repo / "README.md", "# Synthetic Docs Export\n")
    write_text(
        repo / "docs_export.py",
        "from pathlib import Path\n\n"
        "def export_path(root: Path, name: str) -> Path:\n"
        "    return root / name\n",
    )
    run_git(repo, "add", "--", "README.md", "docs_export.py")
    run_git(repo, "commit", "-q", "-m", "synthetic base")
    base_sha = run_git(repo, "rev-parse", "HEAD")

    gate = AuthorityGate()
    events: list[dict[str, Any]] = []

    read_action = {
        "kind": "read",
        "targets": ["README.md"],
        "proposal_version": 1,
        "payload_digest": digest_text("read supplied synthetic issue"),
    }
    read_decision = gate.decide(read_action)
    events.append(trace_event("source_read_allowed", read_action, read_decision))
    if read_decision != "allowed":
        raise DemoError("supplied-source read was not allowed")

    write_action = {
        "kind": "write",
        "targets": ["docs_export.py", "tests/test_docs_export.py"],
        "proposal_version": 1,
        "payload_digest": digest_text("append .md and add focused regression"),
    }
    write_grant = {"binding": action_binding(write_action)}
    write_decision = gate.decide(write_action, write_grant)
    events.append(
        trace_event(
            "authorized_write_allowed", write_action, write_decision, write_grant
        )
    )
    if write_decision != "allowed":
        raise DemoError("expected write grant was not accepted")
    write_text(
        repo / "docs_export.py",
        "from pathlib import Path\n\n"
        "def export_path(root: Path, name: str) -> Path:\n"
        "    return root / f\"{name}.md\"\n",
    )
    write_text(
        repo / "tests" / "test_docs_export.py",
        "from pathlib import Path\n"
        "import sys\n\n"
        "sys.path.insert(0, str(Path(__file__).resolve().parents[1]))\n"
        "from docs_export import export_path\n\n"
        "assert export_path(Path('out'), 'weekly') == Path('out/weekly.md')\n"
        "print('PASS synthetic_export_path')\n",
    )

    replay_decision = gate.decide(write_action, write_grant)
    events.append(
        trace_event(
            "single_use_grant_replay_rejected",
            write_action,
            replay_decision,
            write_grant,
        )
    )
    if replay_decision != "rejected_grant_replay":
        raise DemoError("single-use grant replay was not rejected")

    protected_action = {
        "kind": "write",
        "targets": ["private/customer-export.txt"],
        "proposal_version": 1,
        "payload_digest": digest_text("synthetic protected content"),
    }
    protected_grant = {"binding": action_binding(protected_action)}
    protected_decision = gate.decide(protected_action, protected_grant)
    events.append(
        trace_event(
            "protected_write_rejected",
            protected_action,
            protected_decision,
            protected_grant,
        )
    )
    if protected_decision != "rejected_protected":
        raise DemoError("protected-path write was not rejected")

    original_scope = {
        "kind": "write",
        "targets": ["CHANGELOG.md"],
        "proposal_version": 2,
        "payload_digest": digest_text("document the synthetic fix"),
    }
    original_grant = {"binding": action_binding(original_scope)}
    changed_scope = {
        "kind": "write",
        "targets": ["CHANGELOG.md", "docs/USAGE.md"],
        "proposal_version": 3,
        "payload_digest": digest_text("document the fix and usage"),
    }
    stale_decision = gate.decide(changed_scope, original_grant)
    events.append(
        trace_event(
            "scope_change_stale_grant_rejected",
            changed_scope,
            stale_decision,
            original_grant,
        )
    )
    if stale_decision != "requires_fresh_authority":
        raise DemoError("changed scope did not invalidate the stale grant")
    fresh_grant = {"binding": action_binding(changed_scope)}
    fresh_decision = gate.decide(changed_scope, fresh_grant)
    events.append(
        trace_event(
            "scope_change_fresh_grant_allowed",
            changed_scope,
            fresh_decision,
            fresh_grant,
        )
    )
    if fresh_decision != "allowed":
        raise DemoError("fresh scope grant was not accepted")
    write_text(repo / "CHANGELOG.md", "# Changelog\n\n- Fixed synthetic export paths.\n")
    write_text(
        repo / "docs" / "USAGE.md",
        "# Usage\n\nSynthetic exports use a `.md` suffix.\n",
    )

    changed_paths = [
        "CHANGELOG.md",
        "docs/USAGE.md",
        "docs_export.py",
        "tests/test_docs_export.py",
    ]
    run_git(repo, "add", "--", *changed_paths)
    run_git(repo, "commit", "-q", "-m", "fix synthetic export path")
    head_sha = run_git(repo, "rev-parse", "HEAD")

    check = subprocess.run(
        [sys.executable, "-B", "tests/test_docs_export.py"],
        cwd=repo,
        check=False,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=20,
    )
    check_action = {
        "kind": "check",
        "targets": ["tests/test_docs_export.py"],
        "proposal_version": 1,
        "payload_digest": digest_text("python3 -B tests/test_docs_export.py"),
    }
    check_decision = "passed" if check.returncode == 0 else "failed"
    events.append(
        trace_event("focused_check_passed", check_action, check_decision)
    )
    if check.returncode != 0 or "PASS synthetic_export_path" not in check.stdout:
        raise DemoError(check.stderr.strip() or check.stdout.strip() or "focused check failed")

    trace_sha256 = digest_text(trace_text(events))
    receipt: dict[str, Any] = {
        "schema_version": 1,
        "summary": "Fixed a synthetic export-path regression inside explicit scope.",
        "subject": {
            "type": "git_change",
            "base_sha": base_sha,
            "head_sha": head_sha,
        },
        "scope": {
            "allowed_paths": changed_paths,
            "protected_prefixes": list(PROTECTED_PREFIXES),
        },
        "files_touched": changed_paths,
        "checks": [
            {
                "id": "check:focused-regression",
                "name": "Synthetic export-path regression",
                "command": "python3 -B tests/test_docs_export.py",
                "status": "passed",
                "summary": "The expected Markdown export path passed.",
                "scope": "Synthetic export-path behavior",
                "revision": head_sha,
                "required": True,
            },
            {
                "id": "check:authority-trace",
                "name": "Authority trace completeness",
                "command": "python3 -B run_complete_workflow.py --replay <bundle>",
                "status": "passed",
                "summary": "Required allowed and rejected authority cases were recorded.",
                "scope": "Synthetic authority lifecycle",
                "revision": head_sha,
                "required": True,
            },
        ],
        "claims": [
            {
                "id": "claim:export-path-fixed",
                "text": "The synthetic exporter now appends the expected Markdown suffix.",
                "evidence_refs": ["check:focused-regression"],
            },
            {
                "id": "claim:authority-cases-recorded",
                "text": "The run records allowed, rejected, replay, and regrant decisions.",
                "evidence_refs": ["check:authority-trace"],
            },
        ],
        "risks": [
            "All authority, review, and publication decisions are synthetic.",
            "The Lab replay is narrower than the full EvidenceGate verifier.",
        ],
        "human_review": {
            "status": "approved",
            "reviewer": "synthetic-reviewer",
            "reviewed_head_sha": head_sha,
            "summary": "Simulated review for a public synthetic demonstration.",
        },
        "public_safety": {
            "status": "reviewed",
            "reviewed_head_sha": head_sha,
            "summary": "Confirmed that the demo contains synthetic data only.",
        },
        "extensions": {
            TRACE_EXTENSION: {
                "trace_sha256": trace_sha256,
                "authority": "non-authoritative",
            }
        },
    }
    manifest = {
        "schema_version": BUNDLE_VERSION,
        "head_sha": head_sha,
        "files_touched": changed_paths,
        "required_case_ids": sorted(REQUIRED_CASES),
        "trace_sha256": trace_sha256,
        "receipt_sha256": digest_text(canonical_json(receipt)),
    }
    return events, receipt, manifest


def write_bundle(
    root: Path,
    events: list[dict[str, Any]],
    receipt: dict[str, Any],
    manifest: dict[str, Any],
) -> None:
    write_text(root / "trace.jsonl", trace_text(events))
    write_text(root / "evidencegate-receipt.json", pretty_json(receipt))
    write_text(root / "manifest.json", pretty_json(manifest))
    write_text(root / "report.md", make_report(events, receipt, manifest))


def load_bundle(root: Path) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    events = [
        json.loads(line)
        for line in (root / "trace.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    receipt = json.loads(
        (root / "evidencegate-receipt.json").read_text(encoding="utf-8")
    )
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    return events, receipt, manifest


def run_and_check(root: Path) -> None:
    events, receipt, manifest = build_bundle(root)
    write_bundle(root, events, receipt, manifest)
    errors = bundle_errors(events, receipt, manifest, root / "synthetic-repo")
    if errors:
        raise DemoError("; ".join(errors))

    omitted = [
        event for event in events if event["case_id"] != "protected_write_rejected"
    ]
    omitted_receipt = copy.deepcopy(receipt)
    omitted_manifest = copy.deepcopy(manifest)
    omitted_digest = digest_text(trace_text(omitted))
    omitted_receipt["extensions"][TRACE_EXTENSION]["trace_sha256"] = omitted_digest
    omitted_manifest["trace_sha256"] = omitted_digest
    omitted_manifest["receipt_sha256"] = digest_text(canonical_json(omitted_receipt))
    omitted_errors = bundle_errors(omitted, omitted_receipt, omitted_manifest)
    if not any("required trace events missing" in error for error in omitted_errors):
        raise DemoError("an omitted terminal event was not rejected")

    for name in (
        "source_boundary",
        "authorized_write",
        "single_use_grant_replay_rejected",
        "protected_write_rejected",
        "scope_change_requires_regrant",
        "focused_regression",
        "receipt_relationships",
        "omitted_event_rejected",
        "replayable_bundle",
        "complete_workflow",
    ):
        print(f"PASS {name}")


def replay(root: Path) -> None:
    events, receipt, manifest = load_bundle(root)
    errors = bundle_errors(events, receipt, manifest, root / "synthetic-repo")
    if errors:
        raise DemoError("; ".join(errors))
    print("PASS replayable_bundle")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--output-dir",
        help="retain the synthetic repository, trace, receipt, manifest, and report",
    )
    group.add_argument("--replay", help="replay a previously retained bundle")
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="run the complete temporary workflow (the default behavior)",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.replay:
            replay(Path(args.replay).resolve())
            return 0
        if args.output_dir:
            root = Path(args.output_dir).resolve()
            if root.exists() and any(root.iterdir()):
                raise DemoError("output directory must be absent or empty")
            root.mkdir(parents=True, exist_ok=True)
            run_and_check(root)
            print(f"Artifacts retained in {root}")
            return 0
        with tempfile.TemporaryDirectory(prefix="reliable-agent-workflow-") as directory:
            run_and_check(Path(directory))
        return 0
    except (DemoError, OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"FAIL complete_workflow: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
