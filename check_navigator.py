#!/usr/bin/env python3
"""Check the static Navigator's structure, access paths, and failure boundary."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DOCS = ROOT / "docs"


class NavigatorParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.tags: list[tuple[str, dict[str, str | None], bool]] = []
        self.label_depth = 0
        self.inputs_outside_labels: list[dict[str, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "label":
            self.label_depth += 1
        if tag == "input" and self.label_depth == 0:
            self.inputs_outside_labels.append(attributes)
        self.tags.append((tag, attributes, self.label_depth > 0))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        if tag == "label":
            self.label_depth -= 1


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> int:
    html = (DOCS / "index.html").read_text(encoding="utf-8")
    css = (DOCS / "styles.css").read_text(encoding="utf-8")
    app = (DOCS / "app.js").read_text(encoding="utf-8")
    robots = (DOCS / "robots.txt").read_text(encoding="utf-8")
    sitemap = (DOCS / "sitemap.xml").read_text(encoding="utf-8")
    parser = NavigatorParser()
    parser.feed(html)

    tags = parser.tags
    names = [attrs.get("name") for tag, attrs, _ in tags if tag == "input"]
    types = {
        attrs.get("name"): attrs.get("type") for tag, attrs, _ in tags if tag == "input"
    }
    ids = [attrs["id"] for _, attrs, _ in tags if attrs.get("id")]

    require(sum(tag == "h1" for tag, _, _ in tags) == 1, "expected one H1")
    require(sum(tag == "fieldset" for tag, _, _ in tags) == 4, "expected four fieldsets")
    require(sum(tag == "legend" for tag, _, _ in tags) == 4, "expected four legends")
    require(len(ids) == len(set(ids)), "element ids must be unique")
    require(
        {"journey", "help_type", "runtime", "local", "no_model", "read_only"}
        <= set(names),
        "missing a Navigator input group",
    )
    require(types["journey"] == types["help_type"] == types["runtime"] == "radio", "choice groups must be radios")
    require(types["local"] == types["no_model"] == types["read_only"] == "checkbox", "constraints must be checkboxes")
    print("PASS navigator_structure")

    canonical = next(attrs for tag, attrs, _ in tags if tag == "link" and attrs.get("rel") == "canonical")
    require(
        canonical.get("href") == "https://thedarknitefalls.github.io/local-assistant-reliability-lab/",
        "canonical Navigator URL is missing or stale",
    )
    require('name="robots" content="index, follow"' in html, "search indexing metadata missing")
    require('property="og:title"' in html, "social discovery title missing")
    require('rel="icon" href="favicon.svg"' in html, "Navigator favicon missing")
    require("no sign-up, analytics, saved answers" in html, "passive privacy explanation missing")
    require("Choose without JavaScript" in html, "no-JavaScript routes missing")
    require("More from Mike" in html and "View source" in html, "project discovery links missing")
    require("Allow: /" in robots and "sitemap.xml" in robots, "search crawler routes missing")
    require(canonical["href"] in sitemap, "sitemap canonical URL is missing or stale")
    require((DOCS / "favicon.svg").is_file(), "favicon asset missing")
    print("PASS navigator_discovery")

    require(not parser.inputs_outside_labels, "every input must have a visible wrapping label")
    result = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "result")
    toggle = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "details-toggle")
    details = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "proof-details")
    require(result.get("aria-live") == "polite", "result must announce changes politely")
    require(result.get("aria-busy") == "true", "loading state must be explicit")
    require(toggle.get("type") == "button", "details toggle must not submit the form")
    require(toggle.get("aria-controls") == "proof-details", "details relationship missing")
    require(toggle.get("aria-expanded") == "false", "details must start collapsed")
    require("hidden" in details, "proof detail must start hidden")
    print("PASS navigator_accessibility")

    require("@media (max-width: 1040px)" in css, "tablet breakpoint missing")
    require("@media (max-width: 680px)" in css, "mobile breakpoint missing")
    require("@media (max-width: 420px)" in css, "narrow-mobile breakpoint missing")
    require("@media (max-width: 380px)" in css, "small-phone header breakpoint missing")
    require(".choice input:focus-visible + span" in css, "keyboard focus style missing")
    require("@media (prefers-reduced-motion: reduce)" in css, "reduced-motion path missing")
    print("PASS navigator_responsive")

    require('await fetch("toolkit-data.json")' in app, "generated data is not loaded")
    require('setText("#result-name", "Toolkit unavailable")' in app, "failure state missing")
    require("local-assistant-reliability-lab/blob/main/TOOLKIT_MAP.md" in app, "failure fallback must remain usable")
    print("PASS navigator_failure_path")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
