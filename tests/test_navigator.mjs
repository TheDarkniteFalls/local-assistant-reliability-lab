import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  compatibilityIssues,
  eligibleReposForJourney,
  recommendRepos,
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

assert.equal(toolkit.repos.length, 15);
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
  assert.deepEqual(recommendation.issues, []);
  reachable.add(repo.slug);
}
assert.equal(reachable.size, 15, "all eligible projects must be exactly reachable");

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
assert.equal(exhaustiveStates, 1080);
assert.ok(mismatchStates > 0);

const publicSafety = toolkit.repos.find((repo) => repo.slug === "public-repo-safety-kit");
assert.equal(recommendRepos(toolkit.repos, exactState(publicSafety)).exact, true);

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

console.log("PASS navigator_reachability_15_of_15");
console.log(`PASS navigator_exhaustive_states_${exhaustiveStates}`);
console.log("PASS navigator_explicit_mismatch_contract");
console.log("PASS navigator_compatible_shortlists");
console.log("PASS navigator_explicit_ineligibility_contract");
