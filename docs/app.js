import {
  NOT_LISTED_PROBLEM,
  connectedPathsForRepo,
  eligibleReposForJourney,
  parseNavigatorState,
  proofPresentation,
  recommendRepos,
  resolveConnectedPath,
  serializeNavigatorState,
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
const connectedPath = document.querySelector("#connected-path");
const pathSelect = document.querySelector("#path-select");
const connectedPathTitle = document.querySelector("#connected-path-title");
const connectedPathDescription = document.querySelector("#connected-path-description");
const connectedPathSteps = document.querySelector("#connected-path-steps");
const steps = [...document.querySelectorAll(".navigator-step")];
const progressSteps = [...document.querySelectorAll("[data-progress-step]")];
const backButton = document.querySelector("#back-button");
const continueButton = document.querySelector("#continue-button");
const stepStatus = document.querySelector("#step-status");
const previewName = document.querySelector("#preview-name");
const previewFit = document.querySelector("#preview-fit");
const fitTitle = document.querySelector("#fit-title");
const fitSummary = document.querySelector("#fit-summary");
const resultFit = document.querySelector("#result-fit");
const nextStopName = document.querySelector("#next-stop-name");
const nextStopCoordinate = document.querySelector("#next-stop-coordinate");

const routeStops = [
  ["Outcome", "40.7138° N", "74.0020° W"],
  ["Help", "40.7148° N", "73.9975° W"],
  ["Runtime", "40.7156° N", "73.9930° W"],
  ["Limits", "40.7164° N", "73.9885° W"],
  ["Destination", "40.7172° N", "73.9850° W"],
];

let toolkit;
let preferredPathId = null;
let currentStep = 0;

function boundedStep(step) {
  return Math.max(0, Math.min(steps.length - 1, Number(step) || 0));
}

function historyStateFor(step) {
  return { ...(window.history.state ?? {}), navigatorStep: boundedStep(step) };
}

function requestPreviousStep(step, historyObject) {
  if (step <= 0) return false;
  historyObject.back();
  return true;
}

function seedStepHistoryThrough(step) {
  const targetStep = boundedStep(step);
  window.history.replaceState(historyStateFor(0), "", window.location.href);
  for (let index = 1; index <= targetStep; index += 1) {
    window.history.pushState(historyStateFor(index), "", window.location.href);
  }
}

function setCurrentStep(step, { focus = true, historyMode = "replace" } = {}) {
  currentStep = boundedStep(step);
  for (const [index, panel] of steps.entries()) {
    panel.hidden = index !== currentStep;
  }
  for (const [index, item] of progressSteps.entries()) {
    if (index === currentStep) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
    item.classList.toggle("complete", index < currentStep);
  }
  backButton.disabled = currentStep === 0;
  continueButton.firstChild.textContent = currentStep === steps.length - 1
    ? "View recommendation "
    : "Continue ";
  nextStopName.textContent = routeStops[currentStep][0];
  nextStopCoordinate.replaceChildren(
    document.createTextNode(routeStops[currentStep][1]),
    document.createElement("br"),
    document.createTextNode(routeStops[currentStep][2]),
  );
  stepStatus.textContent = `Question ${currentStep + 1} of ${steps.length}`;
  const state = historyStateFor(currentStep);
  if (historyMode === "push") window.history.pushState(state, "", window.location.href);
  else if (historyMode === "replace") window.history.replaceState(state, "", window.location.href);
  if (focus) steps[currentStep].querySelector(".step-question").focus();
}

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

function applyFormState(state) {
  form.elements.journey.value = state.journey;
  form.elements.help_type.value = state.help_type;
  form.elements.runtime.value = state.runtime;
  form.elements.local.checked = state.local;
  form.elements.no_model.checked = state.no_model;
  form.elements.read_only.checked = state.read_only;
}

function syncNavigatorUrl(state, pathId) {
  const query = serializeNavigatorState(state, pathId);
  const nextUrl = `${window.location.pathname}?${query}${window.location.hash}`;
  window.history.replaceState(historyStateFor(currentStep), "", nextUrl);
}

function clearNavigatorUrl() {
  window.history.replaceState(
    historyStateFor(currentStep),
    "",
    `${window.location.pathname}${window.location.hash}`,
  );
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

function appendBoundary(label, value, item) {
  const paragraph = document.createElement("p");
  const heading = document.createElement("strong");
  heading.textContent = `${label}: `;
  paragraph.append(heading, value);
  item.append(paragraph);
}

function renderConnectedPath(repo, requestedPathId) {
  const paths = connectedPathsForRepo(toolkit.connected_paths, repo.slug);
  const selectedPath = resolveConnectedPath(toolkit.connected_paths, repo.slug, requestedPathId);
  if (!selectedPath) {
    connectedPath.hidden = true;
    return null;
  }

  pathSelect.replaceChildren();
  for (const path of paths) {
    const option = document.createElement("option");
    option.value = path.id;
    option.textContent = path.name;
    pathSelect.append(option);
  }
  pathSelect.value = selectedPath.id;
  connectedPathTitle.textContent = selectedPath.name;
  connectedPathDescription.textContent = selectedPath.description;
  connectedPathSteps.replaceChildren();

  for (const step of selectedPath.steps) {
    const item = document.createElement("li");
    item.className = "connected-path-step";
    const link = document.createElement("a");
    link.href = step.url;
    link.rel = "noreferrer";
    link.textContent = step.name;
    if (step.slug === repo.slug) {
      item.classList.add("current");
      link.setAttribute("aria-current", "step");
    }
    const role = document.createElement("p");
    role.className = "path-role";
    role.textContent = step.role;
    item.append(link, role);
    appendBoundary("Proves", step.proof, item);
    appendBoundary("Limit", step.limitation, item);
    connectedPathSteps.append(item);
  }

  connectedPath.hidden = false;
  return selectedPath.id;
}

function updateResult({ syncUrl = true } = {}) {
  if (!toolkit) return;
  const state = stateFromForm();
  const recommendation = recommendRepos(toolkit.repos, state);
  if (recommendation.match === "semantic_mismatch") {
    if (syncUrl) clearNavigatorUrl();
    showNoPurposeMatch(recommendation.alternatives);
    return;
  }
  const repo = recommendation.selectedRepo;
  if (!repo) {
    if (syncUrl) clearNavigatorUrl();
    showUnavailable("The selected outcome is no longer available in the generated toolkit data.");
    return;
  }

  resultLabel.textContent = "Destination";
  setText("#result-name", repo.name);
  setText("#result-summary", `${repo.use_when} About ${repo.minutes} minutes to start.`);
  setText("#result-proof", repo.proof);
  setText("#result-limit", repo.limitation);
  setText("#result-command", repo.command);
  setText("#fact-maturity", repo.maturity[0].toUpperCase() + repo.maturity.slice(1));
  setText("#fact-operation", repo.operation);
  resultFit.classList.toggle("mismatch", !recommendation.exact);
  fitTitle.textContent = recommendation.exact ? "Good fit" : "Setup differs";
  fitSummary.textContent = recommendation.exact
    ? "This route matches the selected purpose and operating limits."
    : recommendation.issues[0].message;
  previewName.textContent = repo.name;
  previewFit.textContent = recommendation.exact
    ? "Good fit for the current choices."
    : "The purpose fits, but one or more setup choices differ.";

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
  preferredPathId = renderConnectedPath(repo, preferredPathId);
  if (syncUrl && preferredPathId) syncNavigatorUrl(state, preferredPathId);
  detailsToggle.hidden = false;
  document.querySelector(".trust-list").hidden = false;
  result.setAttribute("aria-busy", "false");
}

function showNoPurposeMatch(alternatives) {
  result.setAttribute("aria-busy", "false");
  resultLabel.textContent = "Destination unavailable";
  setText("#result-name", "No purpose match");
  resultFit.classList.add("mismatch");
  fitTitle.textContent = "Honest stop";
  fitSummary.textContent = "The listed outcomes do not describe this need.";
  previewName.textContent = "No purpose match";
  previewFit.textContent = "Review nearby technical routes without forcing a recommendation.";
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
  connectedPath.hidden = true;
  preferredPathId = null;
  renderShortlist(alternatives, "semantic_mismatch");
}

function showUnavailable(message) {
  result.setAttribute("aria-busy", "false");
  resultLabel.textContent = "Destination unavailable";
  setText("#result-name", "Toolkit unavailable");
  resultFit.classList.add("mismatch");
  fitTitle.textContent = "Unavailable";
  fitSummary.textContent = "The generated toolkit data could not be used.";
  previewName.textContent = "Toolkit unavailable";
  previewFit.textContent = "Open the complete toolkit map instead.";
  setText("#result-summary", message);
  const primary = document.querySelector("#primary-action");
  primary.textContent = "View complete toolkit";
  primary.href =
    "https://github.com/TheDarkniteFalls/local-assistant-reliability-lab/blob/main/TOOLKIT_MAP.md";
  detailsToggle.hidden = true;
  details.hidden = true;
  document.querySelector(".trust-list").hidden = true;
  connectedPath.hidden = true;
  preferredPathId = null;
  boundaryNote.hidden = true;
  shortlist.hidden = true;
}

detailsToggle.addEventListener("click", () => {
  const expanded = detailsToggle.getAttribute("aria-expanded") === "true";
  detailsToggle.setAttribute("aria-expanded", String(!expanded));
  details.hidden = expanded;
  detailsToggle.textContent = expanded ? "See proof and limits" : "Hide proof and limits";
});

backButton.addEventListener("click", () => {
  requestPreviousStep(currentStep, window.history);
});

continueButton.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1, { historyMode: "push" });
    return;
  }
  result.focus();
  result.scrollIntoView({ block: "start" });
});

window.addEventListener("popstate", (event) => {
  if (Number.isInteger(event.state?.navigatorStep)) {
    setCurrentStep(event.state.navigatorStep, { historyMode: "none" });
  }
});

form.addEventListener("change", (event) => {
  if (event.target.name === "journey") populateProblems(problemSelect.value);
  preferredPathId = null;
  updateResult();
});

pathSelect.addEventListener("change", () => {
  preferredPathId = renderConnectedPath(
    recommendRepos(toolkit.repos, stateFromForm()).selectedRepo,
    pathSelect.value,
  );
  if (preferredPathId) syncNavigatorUrl(stateFromForm(), preferredPathId);
});

mobileResultLink.addEventListener("click", () => {
  requestAnimationFrame(() => result.focus({ preventScroll: true }));
});

try {
  const response = await fetch("toolkit-data.json");
  if (!response.ok) throw new Error(`Toolkit data returned ${response.status}`);
  toolkit = await response.json();
  const deepLink = parseNavigatorState(
    new URLSearchParams(window.location.search),
    toolkit.repos,
    toolkit.connected_paths,
  );
  if (deepLink) {
    applyFormState(deepLink.state);
    populateProblems(deepLink.state.problem);
    problemSelect.value = deepLink.state.problem;
    preferredPathId = deepLink.pathId;
    const restoredStep = Number.isInteger(window.history.state?.navigatorStep)
      ? boundedStep(window.history.state.navigatorStep)
      : null;
    currentStep = restoredStep ?? steps.length - 1;
    if (restoredStep === null) seedStepHistoryThrough(currentStep);
  } else {
    populateProblems();
    if (window.location.search) clearNavigatorUrl();
  }
  setCurrentStep(currentStep, {
    focus: false,
    historyMode: deepLink && window.history.state?.navigatorStep === currentStep
      ? "none"
      : "replace",
  });
  updateResult({ syncUrl: false });
} catch (error) {
  showUnavailable(
    "The generated toolkit data could not be loaded. Open the complete toolkit map instead.",
  );
  console.error(error);
}
