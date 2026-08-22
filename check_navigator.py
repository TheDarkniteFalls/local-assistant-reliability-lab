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
    require(sum(tag == "fieldset" for tag, _, _ in tags) == 5, "expected five fieldsets")
    require(sum(tag == "legend" for tag, _, _ in tags) == 5, "expected five legends")
    require(
        sum(tag == "fieldset" and "hidden" not in attrs for tag, attrs, _ in tags) == 1,
        "exactly one question must start visible",
    )
    require(len(ids) == len(set(ids)), "element ids must be unique")
    require(
        {"journey", "help_type", "runtime", "local", "no_model", "read_only"}
        <= set(names),
        "missing a Navigator input group",
    )
    require(types["journey"] == types["help_type"] == types["runtime"] == "radio", "choice groups must be radios")
    require(types["local"] == types["no_model"] == types["read_only"] == "checkbox", "constraints must be checkboxes")
    problem = next(attrs for tag, attrs, _ in tags if tag == "select" and attrs.get("name") == "problem")
    require(problem.get("id") == "problem-select", "problem selector is missing")
    require(
        any(tag == "label" and attrs.get("for") == "problem-select" for tag, attrs, _ in tags),
        "problem selector needs a visible label",
    )
    print("PASS navigator_structure")

    canonical = next(attrs for tag, attrs, _ in tags if tag == "link" and attrs.get("rel") == "canonical")
    require(
        canonical.get("href") == "https://thedarknitefalls.github.io/local-assistant-reliability-lab/",
        "canonical Navigator URL is missing or stale",
    )
    catalog = next(
        attrs
        for tag, attrs, _ in tags
        if tag == "link" and attrs.get("rel") == "alternate"
    )
    require(
        catalog.get("type") == "application/json"
        and catalog.get("href") == "toolkit-data.json"
        and catalog.get("title") == "Machine-readable toolkit catalog",
        "machine-readable catalog metadata is missing or stale",
    )
    require('name="robots" content="index, follow"' in html, "search indexing metadata missing")
    require('property="og:title"' in html, "social discovery title missing")
    require('rel="icon" href="favicon.svg"' in html, "Navigator favicon missing")
    require("Nothing is saved or sent" in html, "passive privacy explanation missing")
    require("five quick questions" in html, "newcomer action guidance missing")
    require("Question 1 of 5" in html, "focused-question progress copy missing")
    require('class="route-map"' in html, "Transit Atlas route spine missing")
    require('class="route-corridor"' in html, "Transit Atlas destination corridor missing")
    require(
        "coordinate" not in html.lower()
        and "coordinate" not in css.lower()
        and "coordinate" not in app.lower(),
        "decorative coordinate markup, styles, and data must remain absent",
    )
    require("° N" not in html and "° W" not in html and "° N" not in app and "° W" not in app, "coordinate annotations must remain absent")
    require('class="destination-node" aria-hidden="true"' in html, "destination marker missing")
    require('class="connected-path-visual" aria-hidden="true"' in html, "compact connected route missing")
    require("Choose without JavaScript" in html, "no-JavaScript routes missing")
    require(
        "More from Mike" in html
        and "View source" in html
        and "Machine-readable catalog" in html,
        "project discovery links missing",
    )
    require("Allow: /" in robots and "sitemap.xml" in robots, "search crawler routes missing")
    require(canonical["href"] in sitemap, "sitemap canonical URL is missing or stale")
    require((DOCS / "favicon.svg").is_file(), "favicon asset missing")
    require((DOCS / "toolkit-data.json").is_file(), "machine-readable catalog missing")
    print("PASS navigator_discovery")

    require(not parser.inputs_outside_labels, "every input must have a visible wrapping label")
    progress = [attrs for _, attrs, _ in tags if attrs.get("data-progress-step") is not None]
    require(len(progress) == 5, "five-step progress rail missing")
    require(progress[0].get("aria-current") == "step", "initial progress state missing")
    require(
        sum(attrs.get("aria-current") == "step" for attrs in progress) == 1,
        "progress rail must expose one current step",
    )
    back = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "back-button")
    onward = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "continue-button")
    require(back.get("type") == onward.get("type") == "button", "flow controls must not submit")
    require("disabled" in back, "Back must start disabled")
    require(
        all(
            attrs.get("aria-labelledby") == f"step-title-{index}"
            for index, (tag, attrs, _) in enumerate(
                (entry for entry in tags if entry[0] == "fieldset"), start=1
            )
        ),
        "question headings must label every fieldset",
    )
    result = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "result")
    toggle = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "details-toggle")
    details = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "proof-details")
    shortlist = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "shortlist")
    connected_path = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "connected-path")
    path_select = next(attrs for tag, attrs, _ in tags if attrs.get("id") == "path-select")
    require(result.get("aria-live") == "polite", "result must announce changes politely")
    require(result.get("aria-busy") == "true", "loading state must be explicit")
    require(result.get("tabindex") == "-1", "mobile result target must accept focus")
    require(toggle.get("type") == "button", "details toggle must not submit the form")
    require(toggle.get("aria-controls") == "proof-details", "details relationship missing")
    require(toggle.get("aria-expanded") == "false", "details must start collapsed")
    require("hidden" in details, "proof detail must start hidden")
    require(shortlist.get("aria-labelledby") == "shortlist-title", "shortlist heading relationship missing")
    require("hidden" in shortlist, "shortlist must start hidden")
    require(
        connected_path.get("aria-labelledby") == "connected-path-title",
        "connected path heading relationship missing",
    )
    require("hidden" in connected_path, "connected path must start hidden")
    require(
        any(tag == "label" and attrs.get("for") == "path-select" for tag, attrs, _ in tags),
        "connected path selector needs a visible label",
    )
    require(path_select.get("class") == "path-select", "connected path selector is missing")
    print("PASS navigator_accessibility")

    require("@media (max-width: 1040px)" in css, "tablet breakpoint missing")
    require("@media (max-width: 680px)" in css, "mobile breakpoint missing")
    require("@media (max-width: 420px)" in css, "narrow-mobile breakpoint missing")
    require("@media (max-width: 380px)" in css, "small-phone header breakpoint missing")
    require("[aria-current=\"step\"]" in css, "current progress styling missing")
    require("grid-template-columns: minmax(0, 1fr) 62px 342px" in css, "desktop Transit Atlas column rhythm missing")
    require("--yellow: #ffdc00" in css, "active route-node color missing")
    require(".route-map path" in css, "route spine styling missing")
    require(".choice input:focus-visible + span" in css, "keyboard focus style missing")
    require(".problem-select:focus-visible" in css, "problem selector focus style missing")
    require(".path-select:focus-visible" in css, "connected path selector focus style missing")
    require(".connected-path-step.current" in css, "current path step style missing")
    require("[hidden]" in css and "display: none !important;" in css, "hidden controls must stay hidden")
    require("flex-wrap: wrap;" in css, "footer discovery links must wrap")
    require("@media (prefers-reduced-motion: reduce)" in css, "reduced-motion path missing")
    require("min-height: 44px" in css, "minimum touch-target contract missing")
    print("PASS navigator_responsive")

    require('await fetch("toolkit-data.json")' in app, "generated data is not loaded")
    require("recommendRepos(toolkit.repos, state)" in app, "explicit recommendation contract is missing")
    require("recommendation.issues" in app, "mismatch disclosure is missing")
    require("renderConnectedPath(repo, preferredPathId)" in app, "connected path rendering is missing")
    require('link.setAttribute("aria-current", "step")' in app, "current step announcement is missing")
    require("parseNavigatorState(" in app, "deep-link parser is not used")
    require("syncNavigatorUrl(state, preferredPathId)" in app, "deep-link URL update is missing")
    require("function setCurrentStep(" in app, "progressive question controller missing")
    require('resultLabel.textContent = "Destination"' in app, "destination result label missing")
    require("const routeStops = [" in app, "next-stop route labels missing")
    require('window.history.pushState(state, "", window.location.href)' in app, "step history is missing")
    require('window.addEventListener("popstate"' in app, "browser Back restoration is missing")
    require('.querySelector(".step-question").focus()' in app, "step focus handoff is missing")
    require("NOT_LISTED_PROBLEM" in app, "explicit need-not-listed path is missing")
    require("showNoPurposeMatch" in app, "semantic mismatch state is missing")
    require(
        'recommendation.exact ? "Good fit" : "Setup differs"' in app
        and "recommendation.issues[0].message" in app,
        "semantic and technical match states must be distinct",
    )
    require("Start without code" in html, "no-code first action is missing")
    require("result-command-label" in html, "optional command label is missing")
    require("result.focus({ preventScroll: true })" in app, "mobile result focus handoff is missing")
    require("result.focus();" in app, "final result focus handoff is missing")
    require("AI workflow" in html, "newcomer-facing AI scope is missing")
    require('setText("#result-name", "Toolkit unavailable")' in app, "failure state missing")
    require("local-assistant-reliability-lab/blob/main/TOOLKIT_MAP.md" in app, "failure fallback must remain usable")
    require(app.count("fetch(") == 1 and 'fetch("toolkit-data.json")' in app, "only generated static data may be fetched")
    for forbidden in ("localStorage", "sessionStorage", "document.cookie", "sendBeacon", "XMLHttpRequest"):
        require(forbidden not in app, f"passive Navigator must not use {forbidden}")
    print("PASS navigator_failure_path")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
