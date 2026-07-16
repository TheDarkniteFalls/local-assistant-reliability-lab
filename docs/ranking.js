const MATURITY_WEIGHT = {
  flagship: 3,
  stable: 2,
  experimental: 1,
};

export function scoreRepo(repo, state) {
  let score = 0;
  if (repo.journey === state.journey) score += 10;
  if (repo.help_type === state.help_type) score += 8;
  if (repo.runtimes.includes(state.runtime)) score += 4;

  for (const name of ["local", "no_model", "read_only"]) {
    if (!state[name]) continue;
    score += repo.constraints[name] ? 1 : -3;
  }
  return score;
}

export function rankRepos(repos, state) {
  return [...repos]
    .map((repo) => ({ repo, score: scoreRepo(repo, state) }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const maturity =
        (MATURITY_WEIGHT[right.repo.maturity] ?? 0) -
        (MATURITY_WEIGHT[left.repo.maturity] ?? 0);
      if (maturity !== 0) return maturity;
      if (left.repo.minutes !== right.repo.minutes) {
        return left.repo.minutes - right.repo.minutes;
      }
      return left.repo.name.localeCompare(right.repo.name);
    })[0]?.repo;
}
