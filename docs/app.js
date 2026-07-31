import { eligibleReposForJourney, recommendRepos } from "./ranking.js";

const form = document.querySelector("#navigator-form");
const problemSelect = document.querySelector("#problem-select");
const result = document.querySelector("#result");
const resultLabel = document.querySelector("#result-label");
const detailsToggle = document.querySelector("#details-toggle");
const details = document.querySelector("#proof-details");
const boundaryNote = document.querySelector("#boundary-note");
const shortlist = document.querySelector("#shortlist");
const shortlistSummary = document.querySelector("#shortlist-summary");
const shortlistList = document.querySelector("#shortlist-list");

let toolkit;

function selectedValue(name) {
  return form.elements[name].value;
}

function stateFromForm() {
  return {
    journey: selectedValue("journey"),
    problem: selectedValue("problem"),
    help_type: selectedValue("help_type"),
    runtime: selectedValue("runtime"),
    local: form.elements.local.checked,
    no_model: form.elements.no_model.checked,
    read_only: form.elements.read_only.checked,
  };
}

function setText(selector, value) {
  document.querySelector(selector).textContent = value;
}

function populateProblems(preferredSlug) {
  const repos = eligibleReposForJourney(toolkit.repos, selectedValue("journey"));
  problemSelect.replaceChildren();
  for (const repo of repos) {
    const option = document.createElement("option");
    option.value = repo.slug;
    option.textContent = repo.problem_label;
    problemSelect.append(option);
  }
  if (repos.some((repo) => repo.slug === preferredSlug)) {
    problemSelect.value = preferredSlug;
  }
}

function renderShortlist(alternatives, exact) {
  shortlist.hidden = exact;
  shortlistList.replaceChildren();
  if (exact) return;

  if (alternatives.length === 0) {
    shortlistSummary.textContent =
      "No route meets every current selection. Adjust the help type, runtime, or constraints to continue.";
    return;
  }

  shortlistSummary.textContent =
    "These routes meet every current technical and boundary requirement, but solve a different outcome:";
  for (const repo of alternatives) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const name = document.createElement("strong");
    const summary = document.createElement("span");
    link.href = repo.action.url;
    link.rel = "noreferrer";
    name.textContent = repo.name;
    summary.textContent = repo.use_when;
    link.append(name, summary);
    item.append(link);
    shortlistList.append(item);
  }
}

function updateResult() {
  if (!toolkit) return;
  const state = stateFromForm();
  const recommendation = recommendRepos(toolkit.repos, state);
  const repo = recommendation.selectedRepo;
  if (!repo) {
    showUnavailable("The selected outcome is no longer available in the generated toolkit data.");
    return;
  }

  resultLabel.textContent = recommendation.exact
    ? "Exact starting point"
    : "Requirements differ";
  setText("#result-name", repo.name);
  setText("#result-summary", `${repo.use_when} About ${repo.minutes} minutes to start.`);
  setText("#result-proof", repo.proof);
  setText("#result-limit", repo.limitation);
  setText("#result-command", repo.command);
  setText("#fact-maturity", repo.maturity[0].toUpperCase() + repo.maturity.slice(1));
  setText("#fact-operation", repo.operation);

  const primary = document.querySelector("#primary-action");
  primary.textContent = recommendation.exact
    ? repo.action.label
    : `Review ${repo.name} requirements`;
  primary.href = repo.action.url;
  primary.rel = "noreferrer";

  boundaryNote.hidden = recommendation.exact;
  boundaryNote.textContent = recommendation.exact
    ? ""
    : `This problem maps to ${repo.name}, but it does not meet every current selection: ${recommendation.issues
        .map((issue) => issue.message)
        .join(" ")}`;
  renderShortlist(recommendation.alternatives, recommendation.exact);
  detailsToggle.hidden = false;
  document.querySelector(".trust-list").hidden = false;
  result.setAttribute("aria-busy", "false");
}

function showUnavailable(message) {
  result.setAttribute("aria-busy", "false");
  resultLabel.textContent = "Navigator unavailable";
  setText("#result-name", "Toolkit unavailable");
  setText("#result-summary", message);
  const primary = document.querySelector("#primary-action");
  primary.textContent = "View complete toolkit";
  primary.href =
    "https://github.com/TheDarkniteFalls/local-assistant-reliability-lab/blob/main/TOOLKIT_MAP.md";
  detailsToggle.hidden = true;
  details.hidden = true;
  document.querySelector(".trust-list").hidden = true;
  boundaryNote.hidden = true;
  shortlist.hidden = true;
}

detailsToggle.addEventListener("click", () => {
  const expanded = detailsToggle.getAttribute("aria-expanded") === "true";
  detailsToggle.setAttribute("aria-expanded", String(!expanded));
  details.hidden = expanded;
  detailsToggle.textContent = expanded ? "See proof and limits" : "Hide proof and limits";
});

form.addEventListener("change", (event) => {
  if (event.target.name === "journey") populateProblems();
  updateResult();
});

try {
  const response = await fetch("toolkit-data.json");
  if (!response.ok) throw new Error(`Toolkit data returned ${response.status}`);
  toolkit = await response.json();
  populateProblems();
  updateResult();
} catch (error) {
  showUnavailable(
    "The generated toolkit data could not be loaded. Open the complete toolkit map instead.",
  );
  console.error(error);
}
