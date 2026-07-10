# Local Assistant Reliability Lab

Start here for public, runnable examples of practical harnesses for reliable,
human-accountable AI work.

This is an overview repo, not a platform. EvidenceGate is the flagship pattern
for leaving a revision-bound, human-reviewed receipt, while the wider toolkit
explores small models, coding-agent boundaries, structured output, context,
action authority, repeatable QA, and public-safe publishing.

**Want to see the pieces work together?** [Reviewing an AI-Assisted Change from
Instructions to Publication](REVIEWING_AN_AI_ASSISTED_CHANGE.md) follows one
small, synthetic Python CLI bug fix from the first project rule to the final
publication decision.

## Start Here

- Start with [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate)
  for the core idea and its one-command detached v1 reference run.
- Choose a repository from the problem-based table below when you need a
  specific runnable pattern.
- Use the 15-minute walkthrough and command matrix for a quick tour of the
  complete toolkit.

## Latest Lessons

- [AI-assisted work should leave a revision-bound, reviewable receipt](https://github.com/TheDarkniteFalls/evidencegate),
  not just a chat history or an ungrounded summary.
- [A model may suggest an action without owning the authority to execute it](https://github.com/TheDarkniteFalls/agent-action-authority-examples).
- [Reliable harnesses validate model output before trusting or applying it](https://github.com/TheDarkniteFalls/local-model-reliability-example).

## Which Repo Should I Use?

| If you need to... | Start with |
| --- | --- |
| Check a repo before making it public | [Public Repo Safety Kit](https://github.com/TheDarkniteFalls/public-repo-safety-kit) |
| Give a coding agent project rules | [Codex Project Instructions Starter](https://github.com/TheDarkniteFalls/codex-project-instructions-starter) |
| Leave a reviewable receipt for AI-assisted work | [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) |
| Validate structured local-model output | [Local Model Reliability Example](https://github.com/TheDarkniteFalls/local-model-reliability-example) |
| Check that answers stay inside supplied evidence | [Context Boundary Examples](https://github.com/TheDarkniteFalls/context-boundary-examples) |
| Classify agent actions before execution | [Agent Action Authority Examples](https://github.com/TheDarkniteFalls/agent-action-authority-examples) |
| Keep one important workflow obviously healthy | [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern) |

## 15-Minute Walkthrough

1. Spend 2 minutes with Public Repo Safety Kit to see the public/private gate.
2. Spend 2 minutes with Codex Project Instructions Starter to see the repo rules.
3. Spend 2 minutes with EvidenceGate to run a detached v1 receipt against real
   temporary Git revisions.
4. Spend 3 minutes with Local Model Reliability Example to see validation before trust.
5. Spend 2 minutes with Context Boundary Examples to see evidence-only answers.
6. Spend 2 minutes with Agent Action Authority Examples to see action classification.
7. Spend 2 minutes with Green-Spine QA Pattern to see one compact health check.

## Command Matrix

| Repo | Runnable check |
| --- | --- |
| Public Repo Safety Kit | `python3 public_repo_guard.py --self-test` |
| Codex Project Instructions Starter | `python3 check_templates.py` |
| EvidenceGate | `python3 -B examples/run-v1-reference.py` |
| Local Model Reliability Example | `python3 reliability_demo.py --self-test` |
| Context Boundary Examples | `python3 context_boundary_check.py --self-test` |
| Agent Action Authority Examples | `python3 action_authority_check.py --self-test` |
| Green-Spine QA Pattern | `python3 spine_green.py` |

## Toolkit Index

This repo keeps the navigation data in `toolkit_index.json` and validates it
with:

```sh
python3 check_toolkit_index.py
```

Expected result:

```text
PASS toolkit_index
PASS required_repos
PASS evidencegate_v1_reference
PASS public_safe_text
```

## Public/Private Boundary

All examples linked here use synthetic data. Do not add private assistant logs,
connector exports, credentials, local machine paths, personal notes, or real
customer/user data to these public repos.

## Scope

This lab is a visitor-facing map. Each linked repo owns its own runnable example.
If this README gets too long, move the tables into a separate `TOOLKIT_MAP.md`
instead of turning this repo into a framework.

## Quality Checks

```sh
python3 check_toolkit_index.py
python3 -m py_compile check_toolkit_index.py
```
