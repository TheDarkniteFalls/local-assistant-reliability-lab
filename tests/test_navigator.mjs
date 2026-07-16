import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { rankRepos } from "../docs/ranking.js";

const toolkit = JSON.parse(
  await readFile(new URL("../docs/toolkit-data.json", import.meta.url), "utf8"),
);

const defaults = {
  journey: "start_and_direct",
  help_type: "guide",
  runtime: "no_code",
  local: true,
  no_model: true,
  read_only: true,
};

assert.equal(rankRepos(toolkit.repos, defaults).slug, "agent-operator-handbook");
assert.equal(
  rankRepos(toolkit.repos, { ...defaults, help_type: "starter" }).slug,
  "reliable-ai-work-starter",
);
assert.equal(
  rankRepos(toolkit.repos, {
    ...defaults,
    journey: "bound_and_prove",
    help_type: "runnable_check",
    runtime: "python",
  }).slug,
  "evidencegate",
);
assert.equal(
  rankRepos(toolkit.repos, {
    ...defaults,
    journey: "evaluate_and_operate",
    help_type: "runnable_check",
    runtime: "node",
  }).slug,
  "ai-game-state-machine-pattern",
);

console.log("PASS navigator_ranking");
