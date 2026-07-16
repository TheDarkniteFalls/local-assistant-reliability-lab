import { rankRepos } from "./ranking.js";

const form = document.querySelector("#navigator-form");
const result = document.querySelector("#result");
const detailsToggle = document.querySelector("#details-toggle");
const details = document.querySelector("#proof-details");

let toolkit;

function selectedValue(name) {
  return form.elements[name].value;
}

function stateFromForm() {
  return {
    journey: selectedValue("journey"),
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

function updateResult() {
  if (!toolkit) return;
  const state = stateFromForm();
  const repo = rankRepos(toolkit.repos, state);
  if (!repo) return;

  setText("#result-name", repo.name);
  setText("#result-summary", `${repo.use_when} About ${repo.minutes} minutes to start.`);
  setText("#result-proof", repo.proof);
  setText("#result-limit", repo.limitation);
  setText("#result-command", repo.command);
  setText("#fact-maturity", repo.maturity[0].toUpperCase() + repo.maturity.slice(1));
  setText("#fact-operation", repo.operation);

  const primary = document.querySelector("#primary-action");
  primary.textContent = repo.action.label;
  primary.href = repo.action.url;
  primary.rel = "noreferrer";

  const note = document.querySelector("#boundary-note");
  if (state.read_only && !repo.constraints.read_only) {
    note.hidden = false;
    note.textContent =
      "This is the closest starter match. Its setup prompt changes three named local files; it does not take external action.";
  } else {
    note.hidden = true;
    note.textContent = "";
  }
  result.setAttribute("aria-busy", "false");
}

detailsToggle.addEventListener("click", () => {
  const expanded = detailsToggle.getAttribute("aria-expanded") === "true";
  detailsToggle.setAttribute("aria-expanded", String(!expanded));
  details.hidden = expanded;
  detailsToggle.textContent = expanded ? "See proof and limits" : "Hide proof and limits";
});

form.addEventListener("change", updateResult);

try {
  const response = await fetch("toolkit-data.json");
  if (!response.ok) throw new Error(`Toolkit data returned ${response.status}`);
  toolkit = await response.json();
  updateResult();
} catch (error) {
  result.setAttribute("aria-busy", "false");
  setText("#result-name", "Toolkit unavailable");
  setText(
    "#result-summary",
    "The generated toolkit data could not be loaded. Open the complete toolkit map instead.",
  );
  const primary = document.querySelector("#primary-action");
  primary.textContent = "View complete toolkit";
  primary.href = "https://github.com/TheDarkniteFalls/local-assistant-reliability-lab/blob/main/TOOLKIT_MAP.md";
  detailsToggle.hidden = true;
  document.querySelector(".trust-list").hidden = true;
  console.error(error);
}
