#!/usr/bin/env python3
"""Focused tests for stable-profile repository-link validation."""

from __future__ import annotations

import copy
from pathlib import Path
import unittest

from check_toolkit_index import (
    load_index,
    unexpected_stable_profile_links,
    validate_index,
)


ALLOWED = {"model-workload-telemetry"}
UNINDEXED_LINK = "https://github.com/TheDarkniteFalls/agent-evidence-catalog"


def unexpected_stable_links(profile_text: str) -> list[str]:
    return unexpected_stable_profile_links(profile_text, ALLOWED)


class StableProfileLinkTests(unittest.TestCase):
    def test_unindexed_link_under_open_work_is_allowed(self) -> None:
        profile = (
            "[Telemetry](https://github.com/TheDarkniteFalls/model-workload-telemetry)\n"
            "\n## Open Work and Contributions\n\n"
            f"[Experimental]({UNINDEXED_LINK})\n"
        )

        self.assertEqual(unexpected_stable_links(profile), [])

    def test_unindexed_link_in_stable_profile_section_fails(self) -> None:
        profile = (
            f"[Experimental]({UNINDEXED_LINK})\n"
            "\n## Open Work and Contributions\n"
        )

        self.assertEqual(unexpected_stable_links(profile), ["agent-evidence-catalog"])

    def test_profile_without_open_work_heading_is_fully_checked(self) -> None:
        profile = f"[Experimental]({UNINDEXED_LINK})\n"

        self.assertEqual(unexpected_stable_links(profile), ["agent-evidence-catalog"])


class ConnectedPathContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.index = load_index(Path(__file__).parents[1] / "toolkit_index.json")

    def assert_contract_fails(self, index: dict, message: str) -> None:
        with self.assertRaisesRegex(SystemExit, message):
            validate_index(index)

    def test_every_eligible_repo_is_covered(self) -> None:
        validate_index(self.index)
        eligible = {
            repo["slug"]
            for repo in self.index["repos"]
            if repo["navigator_eligible"]
        }
        covered = {
            step["slug"]
            for path in self.index["connected_paths"]
            for step in path["steps"]
        }
        self.assertEqual(len(eligible), 16)
        self.assertEqual(covered, eligible)

    def test_missing_repository_reference_fails(self) -> None:
        changed = copy.deepcopy(self.index)
        changed["connected_paths"][0]["steps"][0]["slug"] = "missing-repo"
        self.assert_contract_fails(changed, "references missing repository")

    def test_duplicate_repository_in_path_fails(self) -> None:
        changed = copy.deepcopy(self.index)
        changed["connected_paths"][0]["steps"][1]["slug"] = changed["connected_paths"][0]["steps"][0]["slug"]
        self.assert_contract_fails(changed, "contains a duplicate repository")

    def test_malformed_step_fails(self) -> None:
        changed = copy.deepcopy(self.index)
        changed["connected_paths"][0]["steps"][0] = {
            "slug": "agent-operator-handbook",
            "role": "",
        }
        self.assert_contract_fails(changed, "malformed role")

    def test_duplicate_path_id_fails(self) -> None:
        changed = copy.deepcopy(self.index)
        changed["connected_paths"][1]["id"] = changed["connected_paths"][0]["id"]
        self.assert_contract_fails(changed, "duplicate connected path id")

    def test_missing_eligible_coverage_fails(self) -> None:
        changed = copy.deepcopy(self.index)
        compare_path = next(
            path for path in changed["connected_paths"] if path["id"] == "compare-agent-options"
        )
        compare_path["steps"] = [
            step for step in compare_path["steps"] if step["slug"] != "agent-evidence-catalog"
        ]
        self.assert_contract_fails(changed, "missing a connected path")

if __name__ == "__main__":
    unittest.main()
