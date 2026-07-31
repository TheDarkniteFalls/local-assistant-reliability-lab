#!/usr/bin/env python3
"""Focused tests for stable-profile repository-link validation."""

from __future__ import annotations

import unittest

from check_toolkit_index import (
    unexpected_stable_profile_links,
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


if __name__ == "__main__":
    unittest.main()
