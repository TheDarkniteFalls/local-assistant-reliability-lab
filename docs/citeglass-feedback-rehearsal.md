# Citeglass Public-Feedback Rehearsal

Status: synthetic exercise; not user evidence; no public interaction occurred

This rehearsal proves that public observations can suggest Citeglass or Alfred
work without automatically changing either roadmap. The URLs and people below
are fictional.

## Case 1 — Citeglass-Only Integration Gap

- **Observation:** A framework maintainer reports that the receipt lacks a
  stable code for distinguishing an unknown source reference from an
  unapproved URL.
- **Affected job:** Map gate outcomes into the framework's own error types.
- **Synthetic evidence:** `https://example.com/citeglass/reports/receipt-code-gap`
- **Reproducibility:** Exact synthetic input and receipt supplied.
- **Possible Alfred relevance:** None demonstrated; Alfred can already
  distinguish the two current rows internally.
- **Privacy and authority:** Public synthetic schema only; no new authority.
- **Smallest question:** Does one additional stable public reason code remove
  adapter-specific parsing without weakening the gate?
- **Route:** `citeglass_only`.
- **Decision:** Park until a real maintainer or adopter supplies equivalent
  evidence.

## Case 2 — Candidate Alfred Product Problem

- **Observation:** A builder reproduces the correct rejection receipt but
  discovers their chat application still appends the rejected wording to later
  model context.
- **Affected job:** Keep rejected answers visible to a user without allowing
  them to influence later turns.
- **Synthetic evidence:** `https://example.com/citeglass/reports/rejected-context-leak`
- **Reproducibility:** Clean-checkout gate receipt plus an application-level
  context trace.
- **Possible Alfred relevance:** Plausible; Alfred should preserve the same
  separation between truthful display and trusted context.
- **Privacy and authority:** Validate with synthetic or development-only turns;
  do not inspect private conversations or enable writes.
- **Smallest question:** Does Alfred's accepted-context owner exclude every
  rejected turn while the UI still renders the wording truthfully?
- **Route:** `alfred_lived_use_probe` first; move to
  `lsal_research_candidate` only if the probe exposes a gap and the maintainer
  selects it after the current active question closes.
- **Decision:** Candidate only; no automatic feature or research activation.

## Case 3 — No Roadmap Signal

- **Observation:** Someone stars the repository and writes “nice project.”
- **Affected job:** None stated.
- **Synthetic evidence:** `https://example.com/citeglass/reports/generic-praise`
- **Reproducibility:** None.
- **Possible Alfred relevance:** None.
- **Privacy and authority:** No impact.
- **Smallest question:** None justified.
- **Route:** `none`.
- **Decision:** Record no adoption, validation, Citeglass change, or Alfred
  suggestion.

## Rehearsal Result

The same programme can route strong public evidence toward Citeglass, suggest
a bounded Alfred problem, or deliberately do nothing. Public interaction is
evidence for a decision, not authority to make the change.
