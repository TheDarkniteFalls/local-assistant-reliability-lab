# Local Assistant Reliability Lab

AI-assisted work is easier to trust when you can see what it used, what it
was allowed to do, and how its result was checked. This Lab brings together
small public examples you can read, run, and adapt.

**Find your starting point:** answer five quick questions in the
[Toolkit Navigator](https://thedarknitefalls.github.io/local-assistant-reliability-lab/).
It suggests a guide, starter, or runnable check and explains where your setup
differs. Prefer to browse? The [complete toolkit map](TOOLKIT_MAP.md) shows
every project, its first command, and what its checks can and cannot tell you.

You do not need to be a developer to begin. Read the
[Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook)
for a practical way to direct the work, or
[create a private Reliable AI Work Starter](https://github.com/new?template_owner=TheDarkniteFalls&template_name=reliable-ai-work-starter&visibility=private)
to keep sources, permissions, and review notes together.

If you want to run an example now, try the complete workflow below. For a
receipt tied to the exact change you reviewed, start with
[EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate).

Each project is useful on its own. The Lab helps you find a route through them;
it does not run an agent or combine them into a platform. Agents and tools can
read the same catalog from the [toolkit index](toolkit_index.json).

## See It All Come Together

If you would like to see the ideas working together before exploring each
project, start here:

```sh
python3 -B run_complete_workflow.py
```

This friendly, self-contained demo creates a tiny fictional Git repository and
walks one small fix all the way through: reading the supplied sources, checking
the authority grant, rejecting unsafe writes and grant replay, asking again
when the scope changes, running a focused regression check, and leaving a
replayable receipt bundle. It calls no model or network service, and it tidies
up the temporary files when it is done.

At the end, you should see:

```text
PASS replayable_bundle
PASS complete_workflow
```

Curious about what the demo produced? Keep a copy of the synthetic repository,
trace, receipt, manifest, and static report outside your checkout, then replay
it whenever you like:

```sh
python3 -B run_complete_workflow.py --output-dir /tmp/reliable-agent-workflow
python3 -B run_complete_workflow.py --replay /tmp/reliable-agent-workflow
```

The receipt follows the EvidenceGate v1 shape. The Lab replay intentionally
checks only the relationships used in this demonstration; for real repository
verification, bring in the full
[EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) validator.

If you already have EvidenceGate installed, you can also run its full local
repository check against the retained receipt:

```sh
evidencegate verify /tmp/reliable-agent-workflow/evidencegate-receipt.json \
  --repo /tmp/reliable-agent-workflow/synthetic-repo --format json
```

If you would prefer a slower, guided tour, the longer
[review walkthrough](REVIEWING_AN_AI_ASSISTED_CHANGE.md) explains what every
toolkit component proves and what it deliberately leaves open.

## Start With The Problem You Want To Solve

| If this is getting in your way... | Start here | What you will see |
| --- | --- | --- |
| You want one useful private workflow without building an app | [Reliable AI Work Starter](https://github.com/TheDarkniteFalls/reliable-ai-work-starter) | Named sources, bounded authority, durable state, review evidence, and a clean handoff |
| You want to build with Codex without becoming a developer first | [Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook) | A Project Card, approval ladder, verification guide, and plain-English operating method |
| An agent exceeds the authority it was given | `python3 -B run_complete_workflow.py` | Protected writes, grant replay, and changed scope are rejected |
| You need to check a web-backed answer before an agent relies on it | `python3 grounded_answer_gate.py examples/grounded_answer_cases.json` in Local Model Reliability Example | One valid answer is accepted; unsupported citations, facts, metadata, hostile echoes, and malformed outputs fail closed |
| A receipt describes the wrong revision or evidence | `python3 -B examples/run-v1-reference.py` in EvidenceGate | Stale heads, omitted paths, and protected paths fail |
| An answer escapes the supplied evidence | `python3 context_boundary_check.py --self-test` in Context Boundary Examples | Unsupported answers and missing citations fail |
| You need to check which context an agent may use, and whether it is still current | `python3 -B context_compiler.py check` in Context Contract Compiler | Required records, explicit exclusions, fail-closed obligations, and stale receipts are checked deterministically |
| Generated content is stale, disconnected, or impossible to traverse | `python3 -B generated_system_qa.py --self-test` in Generated-System QA Pattern | Freshness, integrity, reachability, required services, and a representative journey are checked |
| Evaluation answers may have been seen before scoring | `python3 -B sealed_eval.py --self-test` in Sealed Evaluation Pattern | Access order, frozen outputs, digests, and retirement of revealed material are checked |
| You need to compare models on shared tasks and trace the resulting decision | `python3 -B model_workload_telemetry.py --self-test` in Model Workload Telemetry | Shared tasks stay paired, and the declared synthetic shadow decision is replayed and linked to its receipt |
| AI-assisted game changes can violate the legal flow | `npm test` in AI Game State Machine Pattern | Illegal actions, read-only inspection, save/restore obligations, and deterministic replay are checked |

```mermaid
flowchart LR
    A["Evidence you supplied"] --> B["A proposal with clear limits"]
    B --> C{"Does the authority still fit?"}
    C -->|"No"| D["Pause and ask for a fresh grant"]
    C -->|"Yes"| E["Work within the agreed scope"]
    E --> F["Run the right checks"]
    F --> G["Tie claims to the exact revision"]
    G --> H["Human review decides what happens next"]
```

## Start Here

- Use the [Toolkit Navigator](https://thedarknitefalls.github.io/local-assistant-reliability-lab/)
  when you want an exact route—or an honest explanation and compatible
  alternatives—based on your goal, outcome, runtime, and operating
  constraints.
- Begin with the [Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook)
  if you mostly want the agent to do the work and need a plain-language way to
  stay in control.
- Start with [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate)
  for the core idea and its one-command detached v1 reference run.
- Choose a repository from the problem-based table above when you need a
  specific runnable pattern.
- Use the 15-minute walkthrough and command matrix for a quick tour of the
  complete toolkit.

<a id="latest-lessons"></a>

## Ideas To Take Into Your Own Work

- [Keep a review receipt tied to the exact revision](https://github.com/TheDarkniteFalls/evidencegate),
  not just a chat history or an ungrounded summary.
- [Separate an agent's suggestion from permission to act](https://github.com/TheDarkniteFalls/agent-action-authority-examples).
- [Check model output before relying on it](https://github.com/TheDarkniteFalls/local-model-reliability-example).
- [Check a web-backed answer against its declared sources before an agent relies on it](https://github.com/TheDarkniteFalls/local-model-reliability-example).
- [Keep the evidence and policy behind each proposed model choice](https://github.com/TheDarkniteFalls/model-workload-telemetry),
  without granting authority to execute or promote that route.

## Complete Toolkit Map

The [complete public toolkit map](TOOLKIT_MAP.md) groups every current guide,
tool, and runnable pattern into three visitor journeys:

| Journey | Start here when you need to... |
| --- | --- |
| **Plan work or set rules** | Define an AI-assisted task, private workspace, or coding-agent instructions before work begins |
| **Check boundaries or evidence** | Check publication safety, evidence scope, model output, or action authority and leave inspectable proof |
| **Test or run a workflow** | Exercise repeatable QA, evaluation, telemetry, generated systems, or deterministic state |

Each entry shows who it is for, how to begin, what a passing check establishes,
what it leaves open, and where its automated checks run. It is generated from
`toolkit_index.json`, so the public catalog and its validation use one source
of truth. The same index defines seven short paths through related examples. These paths
show how the ideas fit together; the tools do not integrate automatically, and
combining them does not prove a whole system safe.

## Core 15-Minute Walkthrough

1. Spend 2 minutes with Public Repo Safety Kit to see the public/private gate.
2. Spend 2 minutes with Codex Project Instructions Starter to see the repo rules.
3. Spend 2 minutes with EvidenceGate to run a detached v1 receipt against real
   temporary Git revisions.
4. Spend 3 minutes with Local Model Reliability Example to see an ungrounded answer fail before trusted context.
5. Spend 2 minutes with Context Boundary Examples to see evidence-only answers.
6. Spend 2 minutes with Agent Action Authority Examples to see action classification.
7. Spend 2 minutes with Green-Spine QA Pattern to see one compact health check.

## Core Command Matrix

| Repo | Runnable check |
| --- | --- |
| Public Repo Safety Kit | `python3 public_repo_guard.py --self-test` |
| Codex Project Instructions Starter | `python3 check_templates.py` |
| EvidenceGate | `python3 -B examples/run-v1-reference.py` |
| Local Model Reliability Example | `python3 grounded_answer_gate.py examples/grounded_answer_cases.json` |
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
PASS complete_workflow_entry
PASS required_repos
PASS first_party_repository_links
PASS visitor_journeys
PASS trust_signals
PASS connected_paths
PASS evidencegate_v1_reference
PASS public_safe_text
PASS toolkit_map
PASS navigator_data
PASS navigator_ranking
PASS navigator_structure
PASS navigator_accessibility
PASS navigator_responsive
PASS navigator_failure_path
```

## Public/Private Boundary

All examples linked here use synthetic data. Do not add private assistant logs,
connector exports, credentials, local machine paths, personal notes, or real
customer/user data to these public repos.

## Scope

This lab is a visitor-facing map and static Navigator. Each linked repo owns
its own runnable example. `toolkit_index.json` remains the only catalog source;
the Markdown map, browser data, and connected-path relationships are generated
from it instead of becoming separate stores. Navigator choices can be copied as
a deterministic URL; invalid or incomplete URL state is ignored and the
ordinary default remains unchanged. Nothing is stored or sent.

## Quality Checks

```sh
python3 check_toolkit_index.py
python3 render_toolkit_map.py --check
python3 render_navigator.py --check
python3 check_navigator.py
node tests/test_navigator.mjs
python3 -B run_complete_workflow.py --self-test
python3 -m py_compile check_toolkit_index.py check_navigator.py render_toolkit_map.py render_navigator.py toolkit_contract.py run_complete_workflow.py
```
