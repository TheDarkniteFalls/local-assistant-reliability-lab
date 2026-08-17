const MATURITY_WEIGHT = {
  flagship: 3,
  stable: 2,
  experimental: 1,
};

const HELP_LABEL = {
  guide: "a guide",
  starter: "a starter",
  runnable_check: "a runnable check",
};

const RUNTIME_LABEL = {
  no_code: "no code",
  python: "Python",
  node: "Node",
};

const JOURNEY_LABEL = {
  start_and_direct: "Plan work or set rules",
  bound_and_prove: "Check boundaries or evidence",
  evaluate_and_operate: "Test or run a workflow",
};

export const NOT_LISTED_PROBLEM = "need_not_listed";

const DEEP_LINK_KEYS = [
  "journey",
  "problem",
  "help_type",
  "runtime",
  "local",
  "no_model",
  "read_only",
  "path",
];

export function eligibleReposForJourney(repos, journey) {
  return repos.filter(
    (repo) => repo.navigator_eligible && repo.journey === journey,
  );
}

export function compatibilityIssues(repo, state) {
  if (!repo) {
    return [{ code: "problem", message: "The selected outcome is unavailable." }];
  }

  const issues = [];
  if (!repo.navigator_eligible) {
    issues.push({
      code: "eligibility",
      message: repo.navigator_ineligible_reason || "This route is not available in the Navigator.",
    });
  }
  if (repo.journey !== state.journey) {
    issues.push({
      code: "journey",
      message: `This route belongs to “${JOURNEY_LABEL[repo.journey]}”, not “${JOURNEY_LABEL[state.journey]}”.`,
    });
  }
  if (repo.help_type !== state.help_type) {
    issues.push({
      code: "help_type",
      message: `It is ${HELP_LABEL[repo.help_type]}; you selected ${HELP_LABEL[state.help_type]}.`,
    });
  }
  if (!repo.runtimes.includes(state.runtime)) {
    issues.push({
      code: "runtime",
      message: `It supports ${repo.runtime_label}; you selected ${RUNTIME_LABEL[state.runtime]}.`,
    });
  }
  if (state.local && !repo.constraints.local) {
    issues.push({ code: "local", message: "It is not fully local." });
  }
  if (state.no_model && !repo.constraints.no_model) {
    issues.push({ code: "no_model", message: "It makes a model call." });
  }
  if (state.read_only && !repo.constraints.read_only) {
    issues.push({
      code: "read_only",
      message: `${repo.operation}; you selected read-only.`,
    });
  }
  return issues;
}

function rankEligibleRepos(repos, state) {
  return repos
    .filter((repo) => compatibilityIssues(repo, state).length === 0)
    .sort((left, right) => {
      const maturity =
        (MATURITY_WEIGHT[right.maturity] ?? 0) -
        (MATURITY_WEIGHT[left.maturity] ?? 0);
      if (maturity !== 0) return maturity;
      if (left.minutes !== right.minutes) return left.minutes - right.minutes;
      return left.name.localeCompare(right.name);
    });
}

export function recommendRepos(repos, state) {
  if (state.problem === NOT_LISTED_PROBLEM) {
    return {
      selectedRepo: null,
      match: "semantic_mismatch",
      semanticMatch: false,
      technicalMatch: null,
      exact: false,
      issues: [
        {
          code: "semantic_fit",
          message: "None of the listed outcomes describes this need.",
        },
      ],
      alternatives: rankEligibleRepos(repos, state).slice(0, 3),
    };
  }

  const selectedRepo = repos.find((repo) => repo.slug === state.problem);
  const issues = compatibilityIssues(selectedRepo, state);
  if (!selectedRepo) {
    return {
      selectedRepo,
      match: "unavailable",
      semanticMatch: null,
      technicalMatch: null,
      exact: false,
      issues,
      alternatives: [],
    };
  }
  const alternatives = rankEligibleRepos(
    repos.filter((repo) => repo.slug !== selectedRepo?.slug),
    state,
  ).slice(0, 3);
  const exact = issues.length === 0;

  return {
    selectedRepo,
    match: exact ? "exact" : "requirements_mismatch",
    semanticMatch: true,
    technicalMatch: exact,
    exact,
    issues,
    alternatives,
  };
}

export function proofPresentation(repo, state) {
  const selectedNoCode = state.runtime === "no_code";
  const supportsNoCode = repo.runtimes.includes("no_code");
  const showNoCodeFirstAction = selectedNoCode && supportsNoCode;

  return {
    showNoCodeFirstAction,
    noCodeFirstAction: showNoCodeFirstAction ? repo.no_code_first_action : "",
    commandLabel: showNoCodeFirstAction
      ? "Optional automated check"
      : selectedNoCode
        ? "Required automated check"
        : "First runnable check",
  };
}

export function connectedPathsForRepo(paths, slug) {
  return paths.filter((path) => path.steps.some((step) => step.slug === slug));
}

export function resolveConnectedPath(paths, slug, requestedPathId = null) {
  const available = connectedPathsForRepo(paths, slug);
  if (available.length === 0) return null;
  return available.find((path) => path.id === requestedPathId) ?? available[0];
}

export function serializeNavigatorState(state, pathId) {
  const params = new URLSearchParams();
  params.set("journey", state.journey);
  params.set("problem", state.problem);
  params.set("help_type", state.help_type);
  params.set("runtime", state.runtime);
  params.set("local", state.local ? "1" : "0");
  params.set("no_model", state.no_model ? "1" : "0");
  params.set("read_only", state.read_only ? "1" : "0");
  params.set("path", pathId);
  return params.toString();
}

export function parseNavigatorState(params, repos, paths) {
  const presentKeys = [...params.keys()];
  if (presentKeys.length === 0) return null;
  if (
    presentKeys.length !== DEEP_LINK_KEYS.length ||
    DEEP_LINK_KEYS.some((key) => params.getAll(key).length !== 1) ||
    presentKeys.some((key) => !DEEP_LINK_KEYS.includes(key))
  ) {
    return null;
  }

  const state = {
    journey: params.get("journey"),
    problem: params.get("problem"),
    help_type: params.get("help_type"),
    runtime: params.get("runtime"),
    local: params.get("local") === "1",
    no_model: params.get("no_model") === "1",
    read_only: params.get("read_only") === "1",
  };
  if (
    !["start_and_direct", "bound_and_prove", "evaluate_and_operate"].includes(state.journey) ||
    !["guide", "starter", "runnable_check"].includes(state.help_type) ||
    !["no_code", "python", "node"].includes(state.runtime) ||
    ["local", "no_model", "read_only"].some(
      (key) => !["0", "1"].includes(params.get(key)),
    )
  ) {
    return null;
  }

  const repo = repos.find(
    (entry) =>
      entry.slug === state.problem &&
      entry.navigator_eligible &&
      entry.journey === state.journey,
  );
  const pathId = params.get("path");
  if (!repo || !connectedPathsForRepo(paths, repo.slug).some((path) => path.id === pathId)) {
    return null;
  }
  return { state, pathId };
}
