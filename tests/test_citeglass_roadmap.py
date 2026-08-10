#!/usr/bin/env python3
"""Structural checks for the public Citeglass learning contract."""

from __future__ import annotations

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
ROADMAP = ROOT / "CITEGLASS_ROADMAP.md"
REHEARSAL = ROOT / "docs" / "citeglass-feedback-rehearsal.md"
QUALIFICATION = ROOT / "docs" / "citeglass-gemma-qualification.md"


class CiteglassRoadmapTests(unittest.TestCase):
    def test_dispositions_and_public_to_alfred_routes_are_explicit(self) -> None:
        text = ROADMAP.read_text(encoding="utf-8")
        for disposition in (
            "dual_track",
            "lsal_only",
            "citeglass_only",
            "parked",
            "rejected",
        ):
            self.assertIn(f"`{disposition}`", text)
        for route in (
            "alfred_lived_use_probe",
            "lsal_research_candidate",
            "citeglass_only",
            "parked",
            "rejected",
            "none",
        ):
            self.assertIn(f"`{route}`", text)

    def test_seeded_problem_ledger_and_first_delivery_are_present(self) -> None:
        text = ROADMAP.read_text(encoding="utf-8")
        for problem_id in range(1, 8):
            self.assertIn(f"`CG-{problem_id:03d}`", text)
        self.assertIn("## Synthetic Disposition Rehearsal", text)
        for disposition in (
            "dual_track",
            "lsal_only",
            "citeglass_only",
            "parked",
            "rejected",
        ):
            self.assertIn(f"| `{disposition}` |", text)
        self.assertIn("Grounded Answer Gate v0.1", text)
        self.assertIn("downstream_context_allowed", text)
        self.assertIn("insufficient_external_evidence", text)

    def test_feedback_rehearsal_covers_three_distinct_decisions(self) -> None:
        text = REHEARSAL.read_text(encoding="utf-8")
        self.assertIn("`citeglass_only`", text)
        self.assertIn("`alfred_lived_use_probe`", text)
        self.assertIn("`lsal_research_candidate`", text)
        self.assertIn("`none`", text)
        self.assertIn("synthetic exercise", text)

    def test_gemma_candidate_remains_issue_first_and_not_posted(self) -> None:
        text = QUALIFICATION.read_text(encoding="utf-8")
        self.assertIn("not posted; no work claimed", text)
        self.assertIn("CONTRIBUTING.md", text)
        self.assertIn("issue before writing", text)
        self.assertIn("no pull request", text.lower())
        self.assertIn("Disclose OpenAI Codex assistance", text)

    def test_public_documents_exclude_private_workspace_markers(self) -> None:
        combined = "\n".join(
            path.read_text(encoding="utf-8")
            for path in (ROADMAP, REHEARSAL, QUALIFICATION)
        )
        for blocked in ("/Users/", "direct-use-", "logs/", "Mike", "family"):
            self.assertNotIn(blocked, combined)


if __name__ == "__main__":
    unittest.main()
