import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  NOT_LISTED_PROBLEM,
  compatibilityIssues,
  connectedPathsForRepo,
  eligibleReposForJourney,
  parseNavigatorState,
  proofPresentation,
  recommendRepos,
  resolveConnectedPath,
  serializeNavigatorState,
} from "../docs/ranking.js";

const toolkit = JSON.parse(
  await readFile(new URL("../docs/toolkit-data.json", import.meta.url), "utf8"),
);

const helpTypes = ["guide", "starter", "runnable_check"];
const runtimes = ["no_code", "python", "node"];
const flags = [false, true];

function exactState(repo) {
  return {
    journey: repo.journey,
    problem: repo.slug,
    help_type: repo.help_type,
    runtime: repo.runtimes[0],
    local: repo.constraints.local,
    no_model: repo.constraints.no_model,
    read_only: repo.constraints.read_only,
  };
}

assert.equal(toolkit.repos.length, 16);
assert.ok(toolkit.repos.every((repo) => typeof repo.navigator_eligible === "boolean"));
assert.ok(
  toolkit.repos
    .filter((repo) => !repo.navigator_eligible)
    .every((repo) => repo.navigator_ineligible_reason?.trim()),
);

const reachable = new Set();
for (const repo of toolkit.repos.filter((entry) => entry.navigator_eligible)) {
  assert.ok(repo.problem_label?.trim(), `${repo.slug} needs a problem label`);
  assert.ok(
    eligibleReposForJourney(toolkit.repos, repo.journey).some(
      (entry) => entry.slug === repo.slug,
    ),
    `${repo.slug} must appear in its journey selector`,
  );
  const recommendation = recommendRepos(toolkit.repos, exactState(repo));
  assert.equal(recommendation.selectedRepo.slug, repo.slug);
  assert.equal(recommendation.exact, true, `${repo.slug} must have an exact state`);
  assert.equal(recommendation.match, "exact");
  assert.equal(recommendation.semanticMatch, true);
  assert.equal(recommendation.technicalMatch, true);
  assert.deepEqual(recommendation.issues, []);
  reachable.add(repo.slug);
}
assert.equal(reachable.size, 16, "all eligible projects must be exactly reachable");

const connectedCoverage = new Set();
for (const path of toolkit.connected_paths) {
  assert.ok(path.id?.trim());
  assert.ok(path.name?.trim());
  assert.ok(path.description?.trim());
  assert.ok(path.steps.length >= 3 && path.steps.length <= 5);
  assert.equal(new Set(path.steps.map((step) => step.slug)).size, path.steps.length);
  for (const step of path.steps) {
    assert.ok(step.role?.trim());
    assert.ok(step.proof?.trim());
    assert.ok(step.limitation?.trim());
    assert.match(step.url, new RegExp(`/TheDarkniteFalls/${step.slug}$`));
    connectedCoverage.add(step.slug);
  }
}
assert.deepEqual(connectedCoverage, reachable);

for (const repo of toolkit.repos.filter((entry) => entry.navigator_eligible)) {
  const paths = connectedPathsForRepo(toolkit.connected_paths, repo.slug);
  assert.ok(paths.length > 0, `${repo.slug} needs a connected path`);
  const selected = resolveConnectedPath(toolkit.connected_paths, repo.slug);
  assert.equal(selected.id, paths[0].id);
  assert.ok(selected.steps.some((step) => step.slug === repo.slug));

  const query = serializeNavigatorState(exactState(repo), selected.id);
  const parsed = parseNavigatorState(
    new URLSearchParams(query),
    toolkit.repos,
    toolkit.connected_paths,
  );
  assert.deepEqual(parsed, { state: exactState(repo), pathId: selected.id });
}

assert.equal(
  parseNavigatorState(new URLSearchParams(), toolkit.repos, toolkit.connected_paths),
  null,
  "the default URL must retain the current default behavior",
);

const validEvidenceState = exactState(
  toolkit.repos.find((repo) => repo.slug === "evidencegate"),
);
const validEvidencePath = resolveConnectedPath(
  toolkit.connected_paths,
  "evidencegate",
).id;
const validEvidenceQuery = serializeNavigatorState(validEvidenceState, validEvidencePath);
for (const invalidQuery of [
  validEvidenceQuery.replace("local=1", "local=yes"),
  validEvidenceQuery.replace(`path=${validEvidencePath}`, "path=missing-path"),
  validEvidenceQuery.replace("problem=evidencegate", "problem=missing-repo"),
  `${validEvidenceQuery}&path=${validEvidencePath}`,
  validEvidenceQuery.replace(/&read_only=[01]/, ""),
  `${validEvidenceQuery}&campaign=example`,
]) {
  assert.equal(
    parseNavigatorState(
      new URLSearchParams(invalidQuery),
      toolkit.repos,
      toolkit.connected_paths,
    ),
    null,
    `invalid deep link must fail closed: ${invalidQuery}`,
  );
}

let exhaustiveStates = 0;
let mismatchStates = 0;
for (const repo of toolkit.repos.filter((entry) => entry.navigator_eligible)) {
  for (const help_type of helpTypes) {
    for (const runtime of runtimes) {
      for (const local of flags) {
        for (const no_model of flags) {
          for (const read_only of flags) {
            const state = {
              journey: repo.journey,
              problem: repo.slug,
              help_type,
              runtime,
              local,
              no_model,
              read_only,
            };
            const recommendation = recommendRepos(toolkit.repos, state);
            const expectedIssues = compatibilityIssues(repo, state);
            assert.equal(recommendation.selectedRepo.slug, repo.slug);
            assert.equal(recommendation.exact, expectedIssues.length === 0);
            assert.equal(
              recommendation.match,
              expectedIssues.length === 0 ? "exact" : "requirements_mismatch",
            );
            assert.equal(recommendation.semanticMatch, true);
            assert.equal(recommendation.technicalMatch, expectedIssues.length === 0);
            assert.deepEqual(recommendation.issues, expectedIssues);
            assert.ok(recommendation.alternatives.length <= 3);
            assert.ok(
              recommendation.alternatives.every(
                (alternative) =>
                  alternative.slug !== repo.slug &&
                  compatibilityIssues(alternative, state).length === 0,
              ),
              "shortlists may contain only fully compatible alternatives",
            );
            if (!recommendation.exact) {
              mismatchStates += 1;
              assert.ok(recommendation.issues.length > 0, "every mismatch must be explicit");
            }
            exhaustiveStates += 1;
          }
        }
      }
    }
  }
}
assert.equal(exhaustiveStates, 1152);
assert.ok(mismatchStates > 0);

let semanticMismatchStates = 0;
for (const journey of toolkit.journeys.map((entry) => entry.id)) {
  for (const help_type of helpTypes) {
    for (const runtime of runtimes) {
      for (const local of flags) {
        for (const no_model of flags) {
          for (const read_only of flags) {
            const state = {
              journey,
              problem: NOT_LISTED_PROBLEM,
              help_type,
              runtime,
              local,
              no_model,
              read_only,
            };
            const recommendation = recommendRepos(toolkit.repos, state);
            assert.equal(recommendation.selectedRepo, null);
            assert.equal(recommendation.match, "semantic_mismatch");
            assert.equal(recommendation.semanticMatch, false);
            assert.equal(recommendation.technicalMatch, null);
            assert.equal(recommendation.exact, false);
            assert.deepEqual(
              recommendation.issues.map((issue) => issue.code),
              ["semantic_fit"],
            );
            assert.ok(
              recommendation.alternatives.every(
                (repo) => compatibilityIssues(repo, state).length === 0,
              ),
            );
            semanticMismatchStates += 1;
          }
        }
      }
    }
  }
}
assert.equal(semanticMismatchStates, 216);

const publicSafety = toolkit.repos.find((repo) => repo.slug === "public-repo-safety-kit");
assert.equal(recommendRepos(toolkit.repos, exactState(publicSafety)).exact, true);

const projectInstructions = toolkit.repos.find(
  (repo) => repo.slug === "codex-project-instructions-starter",
);
assert.equal(projectInstructions.kind, "starter");
assert.equal(projectInstructions.help_type, "starter");
assert.equal(projectInstructions.constraints.read_only, true);
assert.equal(recommendRepos(toolkit.repos, exactState(projectInstructions)).exact, true);

const noCodeRepos = toolkit.repos.filter((repo) => repo.runtimes.includes("no_code"));
assert.equal(noCodeRepos.length, 3);
for (const repo of noCodeRepos) {
  assert.ok(repo.no_code_first_action?.trim(), `${repo.slug} needs a no-code first action`);
  assert.doesNotMatch(repo.no_code_first_action, /\b(?:python|node|npm)\b/i);
  const presentation = proofPresentation(repo, {
    ...exactState(repo),
    runtime: "no_code",
  });
  assert.equal(presentation.showNoCodeFirstAction, true);
  assert.equal(presentation.noCodeFirstAction, repo.no_code_first_action);
  assert.equal(presentation.commandLabel, "Optional automated check");
}

const localModel = toolkit.repos.find(
  (repo) => repo.slug === "local-model-reliability-example",
);
assert.equal(recommendRepos(toolkit.repos, exactState(localModel)).exact, true);

const sealedEvaluation = toolkit.repos.find(
  (repo) => repo.slug === "sealed-evaluation-pattern",
);
assert.equal(recommendRepos(toolkit.repos, exactState(sealedEvaluation)).exact, true);

const evidenceGate = toolkit.repos.find((repo) => repo.slug === "evidencegate");
const noCodeEvidence = recommendRepos(toolkit.repos, {
  ...exactState(evidenceGate),
  runtime: "no_code",
});
assert.equal(noCodeEvidence.exact, false);
assert.deepEqual(noCodeEvidence.issues.map((issue) => issue.code), ["runtime"]);
assert.equal(
  proofPresentation(evidenceGate, {
    ...exactState(evidenceGate),
    runtime: "no_code",
  }).commandLabel,
  "Required automated check",
);

const earnedConfidence = toolkit.repos.find(
  (repo) => repo.slug === "earned-confidence",
);
const pythonAlternative = recommendRepos(toolkit.repos, {
  ...exactState(earnedConfidence),
  runtime: "python",
});
assert.equal(pythonAlternative.exact, false);
assert.ok(pythonAlternative.alternatives.length > 0);
assert.ok(
  pythonAlternative.alternatives.every((repo) => repo.runtimes.includes("python")),
);

const invalidProblem = recommendRepos(toolkit.repos, {
  ...exactState(evidenceGate),
  problem: "not-in-the-catalog",
});
assert.equal(invalidProblem.exact, false);
assert.equal(invalidProblem.match, "unavailable");
assert.deepEqual(invalidProblem.issues.map((issue) => issue.code), ["problem"]);

const intentionallyIneligible = {
  ...evidenceGate,
  slug: "not-ready-for-navigation",
  navigator_eligible: false,
  navigator_ineligible_reason: "This route is not ready for visitors.",
};
const catalogWithIneligible = [...toolkit.repos, intentionallyIneligible];
assert.ok(
  !eligibleReposForJourney(catalogWithIneligible, evidenceGate.journey).some(
    (repo) => repo.slug === intentionallyIneligible.slug,
  ),
);
assert.deepEqual(
  recommendRepos(catalogWithIneligible, {
    ...exactState(evidenceGate),
    problem: intentionallyIneligible.slug,
  }).issues.map((issue) => issue.code),
  ["eligibility"],
);

const navigatorHtml = await readFile(
  new URL("../docs/index.html", import.meta.url),
  "utf8",
);
const navigatorApp = await readFile(
  new URL("../docs/app.js", import.meta.url),
  "utf8",
);
const navigatorCss = await readFile(
  new URL("../docs/styles.css", import.meta.url),
  "utf8",
);

assert.equal((navigatorHtml.match(/class="navigator-step"/g) ?? []).length, 5);
assert.equal((navigatorHtml.match(/data-progress-step=/g) ?? []).length, 5);
assert.equal((navigatorHtml.match(/aria-current="step"/g) ?? []).length, 1);
assert.match(navigatorHtml, /id="back-button"[^>]+type="button"[^>]+disabled/);
assert.match(navigatorHtml, /id="continue-button"[^>]+type="button"/);
assert.match(navigatorApp, /function setCurrentStep\(/);
assert.match(navigatorApp, /window\.history\.pushState\(state, "", window\.location\.href\)/);
assert.match(navigatorApp, /window\.addEventListener\("popstate"/);
assert.match(navigatorApp, /\.querySelector\("\.step-question"\)\.focus\(\)/);
assert.match(navigatorApp, /result\.focus\(\)/);
assert.match(navigatorApp, /result\.focus\(\{ preventScroll: true \}\)/);
assert.equal((navigatorApp.match(/fetch\(/g) ?? []).length, 1);
assert.match(navigatorApp, /fetch\("toolkit-data\.json"\)/);
for (const forbidden of [
  "localStorage",
  "sessionStorage",
  "document.cookie",
  "sendBeacon",
  "XMLHttpRequest",
]) {
  assert.equal(navigatorApp.includes(forbidden), false, `${forbidden} must stay absent`);
}
assert.match(navigatorCss, /\[aria-current="step"\]/);
assert.match(navigatorCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(navigatorCss, /min-height: 44px/);
assert.match(navigatorHtml, /class="route-map"/);
assert.match(navigatorHtml, /class="route-corridor"/);
for (const [name, source] of [
  ["HTML", navigatorHtml],
  ["CSS", navigatorCss],
  ["app data", navigatorApp],
]) {
  assert.equal(source.toLowerCase().includes("coordinate"), false, `${name} must not retain coordinate markup, styles, or data`);
  assert.doesNotMatch(source, /°\s*[NW]/, `${name} must not retain N/W coordinate annotations`);
}
assert.match(navigatorHtml, /class="destination-node" aria-hidden="true"/);
assert.match(navigatorHtml, /class="connected-path-visual" aria-hidden="true"/);
assert.match(navigatorCss, /grid-template-columns: minmax\(0, 1fr\) 62px 342px/);
assert.match(navigatorCss, /--yellow: #ffdc00/);
assert.match(navigatorCss, /\.route-map path/);
assert.match(navigatorApp, /resultLabel\.textContent = "Destination"/);
assert.match(navigatorApp, /const routeStops = \[/);

const previousStepHelper = navigatorApp.match(
  /function requestPreviousStep\(step, historyObject\) \{[\s\S]*?\n\}/,
);
assert.ok(previousStepHelper, "browser-history back helper missing");
const requestPreviousStep = Function(`"use strict"; return (${previousStepHelper[0]});`)();

const backHandler = navigatorApp.match(
  /backButton\.addEventListener\("click", \(\) => \{[\s\S]*?\n\}\);/,
);
assert.ok(backHandler, "UI Back handler missing");
assert.match(
  backHandler[0],
  /requestPreviousStep\(currentStep, window\.history\)/,
  "UI Back must traverse the browser's question history",
);
assert.doesNotMatch(
  backHandler[0],
  /historyMode:\s*"replace"/,
  "UI Back must not rewrite the current history entry",
);

class StepHistory {
  constructor(initialStep = 0) {
    this.entries = [initialStep];
    this.index = 0;
  }

  get step() {
    return this.entries[this.index];
  }

  push(step) {
    this.entries.splice(this.index + 1, Infinity, step);
    this.index += 1;
    return this.step;
  }

  back() {
    if (this.index > 0) this.index -= 1;
    return this.step;
  }

  forward() {
    if (this.index < this.entries.length - 1) this.index += 1;
    return this.step;
  }
}

const mixedHistory = new StepHistory();
mixedHistory.push(1);
mixedHistory.push(2);
assert.equal(mixedHistory.step, 2, "Continue, Continue must reach question 3");
assert.equal(
  requestPreviousStep(mixedHistory.step, mixedHistory),
  true,
  "UI Back must request browser history traversal",
);
assert.equal(mixedHistory.step, 1, "UI Back must reach question 2");
assert.equal(mixedHistory.back(), 0, "browser Back must reach question 1");
assert.equal(mixedHistory.forward(), 1, "first browser Forward must reach question 2");
assert.equal(mixedHistory.forward(), 2, "second browser Forward must reach question 3");
assert.equal(
  requestPreviousStep(0, mixedHistory),
  false,
  "UI Back must not traverse away from question 1",
);

console.log("PASS navigator_reachability_16_of_16");
console.log(`PASS navigator_exhaustive_states_${exhaustiveStates}`);
console.log(`PASS navigator_semantic_mismatch_states_${semanticMismatchStates}`);
console.log("PASS navigator_explicit_mismatch_contract");
console.log("PASS navigator_compatible_shortlists");
console.log("PASS navigator_explicit_ineligibility_contract");
console.log("PASS navigator_no_code_first_action_contract");
console.log("PASS navigator_starter_taxonomy_contract");
console.log("PASS navigator_connected_paths_16_of_16");
console.log("PASS navigator_deep_link_round_trip");
console.log("PASS navigator_invalid_deep_links_fail_closed");
console.log("PASS navigator_progressive_question_contract");
console.log("PASS navigator_browser_back_contract");
console.log("PASS navigator_mixed_ui_browser_history_regression");
console.log("PASS navigator_no_storage_or_network_write_contract");
console.log("PASS navigator_transit_atlas_visual_contract");
