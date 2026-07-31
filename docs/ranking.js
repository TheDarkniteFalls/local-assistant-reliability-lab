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
  start_and_direct: "Start and direct",
  bound_and_prove: "Bound and prove",
  evaluate_and_operate: "Evaluate and operate",
};

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
  const selectedRepo = repos.find((repo) => repo.slug === state.problem);
  const issues = compatibilityIssues(selectedRepo, state);
  const alternatives = rankEligibleRepos(
    repos.filter((repo) => repo.slug !== selectedRepo?.slug),
    state,
  ).slice(0, 3);

  return {
    selectedRepo,
    exact: issues.length === 0,
    issues,
    alternatives,
  };
}
