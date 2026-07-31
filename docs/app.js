import {
  NOT_LISTED_PROBLEM,
  eligibleReposForJourney,
  proofPresentation,
  recommendRepos,
} from "./ranking.js";

const form = document.querySelector("#navigator-form");
const problemSelect = document.querySelector("#problem-select");
const result = document.querySelector("#result");
const resultLabel = document.querySelector("#result-label");
const detailsToggle = document.querySelector("#details-toggle");
const details = document.querySelector("#proof-details");
const noCodeFirstAction = document.querySelector("#no-code-first-action");
const noCodeFirstActionText = document.querySelector("#result-no-code-action");
const commandLabel = document.querySelector("#result-command-label");
const boundaryNote = document.querySelector("#boundary-note");
const shortlist = document.querySelector("#shortlist");
const shortlistTitle = document.querySelector("#shortlist-title");
const shortlistSummary = document.querySelector("#shortlist-summary");
const shortlistList = document.querySelector("#shortlist-list");
const mobileResultLink = document.querySelector(".mobile-result-link");

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
  const noMatchOption = document.createElement("option");
  noMatchOption.value = NOT_LISTED_PROBLEM;
  noMatchOption.textContent = "My need is not listed";
  problemSelect.append(noMatchOption);
  if (repos.some((repo) => repo.slug === preferredSlug)) {
    problemSelect.value = preferredSlug;
  } else if (preferredSlug === NOT_LISTED_PROBLEM) {
    problemSelect.value = NOT_LISTED_PROBLEM;
  }
}

function renderShortlist(alternatives, mode) {
  shortlist.hidden = mode === "exact";
  shortlistList.replaceChildren();
  if (mode === "exact") return;

  shortlistTitle.textContent = mode === "semantic_mismatch"
    ? "Nearby technical fits"
    : "Eligible alternatives";

  if (alternatives.length === 0) {
    shortlistSummary.textContent = mode === "semantic_mismatch"
      ? "No route in this journey meets the current technical and boundary choices."
      : "No route meets every current selection. Adjust the help type, runtime, or constraints to continue.";
    return;
  }

  shortlistSummary.textContent = mode === "semantic_mismatch"
    ? "These routes meet the technical and boundary choices, but solve different problems. Browse them if useful; they are not recommendations for the unlisted need."
    : "These routes meet every current technical and boundary requirement, but solve a different outcome:";
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
  if (recommendation.match === "semantic_mismatch") {
    showNoPurposeMatch(recommendation.alternatives);
    return;
  }
  const repo = recommendation.selectedRepo;
  if (!repo) {
    showUnavailable("The selected outcome is no longer available in the generated toolkit data.");
    return;
  }

  resultLabel.textContent = recommendation.exact
    ? "Purpose and requirements match"
    : "Purpose matches; requirements differ";
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

  const proof = proofPresentation(repo, state);
  noCodeFirstAction.hidden = !proof.showNoCodeFirstAction;
  noCodeFirstActionText.textContent = proof.noCodeFirstAction;
  commandLabel.textContent = `${proof.commandLabel}:`;

  boundaryNote.hidden = recommendation.exact;
  boundaryNote.textContent = recommendation.exact
    ? ""
    : `This purpose maps to ${repo.name}, but it does not meet every current selection: ${recommendation.issues
        .map((issue) => issue.message)
        .join(" ")}`;
  renderShortlist(recommendation.alternatives, recommendation.match);
  detailsToggle.hidden = false;
  document.querySelector(".trust-list").hidden = false;
  result.setAttribute("aria-busy", "false");
}

function showNoPurposeMatch(alternatives) {
  result.setAttribute("aria-busy", "false");
  resultLabel.textContent = "Need not listed";
  setText("#result-name", "No purpose match");
  setText(
    "#result-summary",
    "The Navigator only recommends a project when one of the listed outcomes genuinely describes your need.",
  );
  const primary = document.querySelector("#primary-action");
  primary.textContent = "View complete toolkit";
  primary.href =
    "https://github.com/TheDarkniteFalls/local-assistant-reliability-lab/blob/main/TOOLKIT_MAP.md";
  primary.rel = "noreferrer";
  boundaryNote.hidden = false;
  boundaryNote.textContent =
    "This is an honest stop, not a technical failure. Nearby routes may fit your runtime and boundaries, but their purpose is different.";
  detailsToggle.hidden = true;
  detailsToggle.setAttribute("aria-expanded", "false");
  detailsToggle.textContent = "See proof and limits";
  details.hidden = true;
  document.querySelector(".trust-list").hidden = true;
  renderShortlist(alternatives, "semantic_mismatch");
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
  if (event.target.name === "journey") populateProblems(problemSelect.value);
  updateResult();
});

mobileResultLink.addEventListener("click", () => {
  requestAnimationFrame(() => result.focus({ preventScroll: true }));
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
