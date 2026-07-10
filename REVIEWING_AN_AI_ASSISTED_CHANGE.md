# Reviewing an AI-Assisted Change from Instructions to Publication

Here is a practical way to see the public toolkit work as a whole. We will
follow one small, synthetic change from its project instructions to its final
publication decision. This is a review path, not a framework, so feel free to
borrow the questions that help and leave the rest.

## Scenario

Imagine that a small Python CLI, `docs_export.py`, has an export-path
regression. A maintainer asks an AI coding agent to fix it using only the
supplied issue, reproduction, and synthetic fixture. The scope is deliberately
small: the CLI, its regression test, the synthetic fixture, and the changelog.
The agent may edit those files and run local checks, while a human keeps the
authority to approve and publish the result.

EvidenceGate's
[`examples/run-v1-reference.py`](https://github.com/TheDarkniteFalls/evidencegate/blob/main/examples/run-v1-reference.py)
recreates the receipt portion of this scenario with actual temporary Git
revisions and a detached v1 receipt. The commands below exercise the public
examples around that same review. Run each command from the root of the named
repository unless the step says otherwise. None of them calls a model.

## 1. Start with clear project instructions

**Practical question:** Before anyone touched the code, did the project clearly
state the allowed files, public/private boundary, required checks, and human
handoff?

**Relevant repository:** [Codex Project Instructions
Starter](https://github.com/TheDarkniteFalls/codex-project-instructions-starter)

**Runnable command:**

```sh
python3 check_templates.py
```

**Expected output:**

```text
PASS templates
```

**What the check proves:** A pass confirms that the starter's instruction,
boundary, handoff, and check templates are present and structurally valid. For
this bug fix, those are the natural places to declare the four expected files,
synthetic-data rule, local test commands, and human publication boundary.

**What it does not prove:** A passing template check cannot tell you whether the
CLI repository adopted those templates, whether its instructions fit the
change, or whether the agent followed them.

## 2. Check who is allowed to do what

**Practical question:** Was the agent allowed to edit the expected files, while
the final publication decision stayed with a human?

**Relevant repository:** [Agent Action Authority
Examples](https://github.com/TheDarkniteFalls/agent-action-authority-examples)

**Runnable command:**

```sh
python3 action_authority_check.py examples/action_cases.jsonl
```

**Expected output:**

```text
PASS read_only_report_allowed allowed
PASS expected_public_write_needs_approval requires_approval
PASS expected_public_write_with_authority allowed
PASS protected_path_write_rejected rejected
PASS destructive_command_rejected rejected
PASS credential_export_rejected rejected
PASS network_publish_needs_confirmation requires_human_confirmation
```

**What the check proves:** A pass shows that the example classifier can tell
read-only work, expected writes, protected or destructive actions, and network
publication apart. In this scenario, the declared source/test/fixture/changelog
edits can receive explicit write authority while a push still requires human
confirmation.

**What it does not prove:** The classifier is a decision example, not a
sandbox. It does not execute actions or confirm that a real host application
enforced the decision.

## 3. Keep the diagnosis grounded in the supplied evidence

**Practical question:** Can the reviewer trace the agent's explanation back to
the supplied issue, reproduction, and test evidence?

**Relevant repository:** [Context Boundary
Examples](https://github.com/TheDarkniteFalls/context-boundary-examples)

**Runnable command:**

```sh
python3 context_boundary_check.py examples/context_outputs.jsonl
```

**Expected output:**

```text
PASS valid_grounded_answer
PASS valid_missing_evidence_refusal
PASS invalid_answers_without_evidence
PASS invalid_missing_required_citation
PASS invalid_unknown_citation
```

**What the check proves:** A pass confirms a simple structural rule in the
synthetic cases: answer with known source IDs when evidence is present, and
decline to answer when required evidence is missing. Applied here, the bug
diagnosis should point back to the supplied reproduction and regression
evidence.

**What it does not prove:** Citations are helpful, but this check cannot
establish that a claim is true, that the supplied evidence is complete, or that
the actual agent used only that evidence.

## 4. Validate a model proposal before trusting it

**Practical question:** If a model proposed the diagnosis or review summary,
did the application check its shape, citations, confidence, and no-write
contract before accepting it?

**Relevant repository:** [Local Model Reliability
Example](https://github.com/TheDarkniteFalls/local-model-reliability-example)

**Runnable command:**

```sh
python3 reliability_demo.py examples/model_outputs.jsonl
```

**Expected output:**

```text
PASS helpful_summary
PASS ask_for_source
```

**What the check proves:** A pass shows that the sample outputs satisfy a
deterministic contract before the application accepts them. The same boundary
can keep a model in a helpful proposal role while the coding workflow owns file
writes and command execution.

**What it does not prove:** This check does not call or evaluate a live model,
measure answer quality, validate the patch, or authorize any write.

## 5. Give the important path one simple check

**Practical question:** After the patch, can the reviewer quickly confirm that
the workflow that matters is still healthy, including its known-bad cases?

**Relevant repository:** [Green-Spine QA
Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern)

**Runnable command:**

```sh
python3 spine_green.py
```

**Expected output:**

```text
PASS happy_path_contract
PASS happy_path_answer
PASS known_bad_outputs
PASS green_spine
```

**What the check proves:** A pass shows that the example's chosen happy path
parses, stays inside its source and write boundaries, returns the expected
result, and continues to reject known-bad outputs. For the CLI fix, the
equivalent green spine would combine the export-path regression and one
synthetic export smoke test behind one small command.

**What it does not prove:** One green spine is intentionally modest. It does
not test this synthetic CLI, cover every platform or edge case, or replace
focused unit tests and diff review.

## 6. Leave the reviewer a useful receipt

**Practical question:** Can the reviewer see what changed, which check supports
each bounded claim, whether the receipt targets the exact final revision, what
risk remains, and whether review was recorded for that same head?

**Relevant repository:**
[EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate)

**Runnable command:**

```sh
python3 -B examples/run-v1-reference.py
```

**Expected output:**

```text
PASS focused_check
PASS receipt_structure
PASS repository_verification
PASS stale_head_rejected
PASS omitted_path_rejected
PASS protected_path_rejected
PASS v1_reference_run
```

**What the check proves:** The reference run creates real temporary base and
head commits, runs the focused regression check, writes the receipt outside the
synthetic repository, and confirms that its revision, complete diff, allowed
paths, evidence references, and recorded review heads agree. It also confirms
that stale evidence, an omitted changed path, and a protected-path change are
rejected.

**What it does not prove:** The human and public-safety decisions in this demo
are explicitly simulated. A pass does not authenticate those identities,
generalize beyond the temporary repository, prove the fix correct or secure,
or authorize publication. EvidenceGate does not rerun commands from arbitrary
receipts; the demo itself runs the focused check before recording it.

## 7. Give the publication candidate a final safety check

**Practical question:** After the technical and human review, is the candidate
repository free of the common public-release mistakes this kit knows how to
spot?

**Relevant repository:** [Public Repo Safety
Kit](https://github.com/TheDarkniteFalls/public-repo-safety-kit)

With the safety kit and candidate repository checked out beside each other,
you can run this from the candidate repository:

**Runnable command:**

```sh
python3 ../public-repo-safety-kit/public_repo_guard.py .
```

**Expected output:** For a clean candidate:

```text
No public-repo guard findings.
```

**What the check proves:** A clean result means the publishable tree has no
findings from the kit's checks for environment files, symlinks, private-key or
token-like text, and raw export-style filenames. If it does find something,
pause for manual review before publishing.

**What it does not prove:** This friendly last check is still only one layer. It
is not a complete secret scanner, privacy audit, license review, dependency
audit, commit-history review, or authorization to push.

## The review decision

Together, these checks tell a useful, reviewable story. They do not turn
publication into autopilot:

1. The project said what the agent could do.
2. The host kept edits and publication behind explicit authority.
3. The diagnosis and any model proposal stayed inside reviewable contracts.
4. Focused tests and the green spine passed.
5. The detached receipt matched the final revision and made the work and
   residual risk reviewable.
6. The publication candidate passed a final public-safety check.
7. A human reviewed the diff, evidence, remaining risk, and publication action.

If one of those links is missing, that is useful information too. The right
outcome is simply "not ready yet" until the gap is understood or resolved.

## Copy the workflow, not the toolkit

You do not need all seven repositories to benefit from the approach. A small
project can copy the review shape directly:

```text
[ ] Write down allowed files, protected areas, required checks, and who may publish.
[ ] Reproduce the bug from public or synthetic evidence before changing code.
[ ] Keep model suggestions separate from file-write and network authority.
[ ] Review the complete diff; run the focused regression and one critical-path check.
[ ] Record the exact revision, summary, checks, claims, touched files, risks, and human decision.
[ ] Verify the detached receipt against a clean checkout of that final revision.
[ ] Scan the publishable tree and inspect repository history before publication.
[ ] Let a human make the final publish decision.
```

That checklist is the heart of the workflow. The linked repositories are
small, runnable references for the individual checks, not components a project
must install.
