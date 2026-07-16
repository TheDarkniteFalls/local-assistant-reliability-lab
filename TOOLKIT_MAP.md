# Public Toolkit Map

This page is generated from `toolkit_index.json`. It is a problem-first map
of the public guides, tools, and teaching patterns in this toolkit.

> All examples use synthetic data. Maturity describes the public contract,
> not external adoption or a claim that a check proves the whole system safe.

## Maturity

- **Flagship:** The most complete public implementation in the toolkit, with a documented integration surface.
- **Stable:** A focused example with deterministic checks and a deliberately narrow public contract.
- **Experimental:** A tested teaching pattern whose contract may still change as outside use reveals better boundaries.

## Start and direct

Describe the outcome, name trusted sources, set authority boundaries, and create a reviewable project shape.

| Project | Kind | Maturity | Time | Runtime | Use it when | First check |
| --- | --- | --- | --- | --- | --- | --- |
| [Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook) | guide | stable | 5 min | No code; Python optional | Turn an idea or recurring job into bounded, reviewable work. | `python3 scripts/check_starter_bundle.py` |
| [Reliable AI Work Starter](https://github.com/TheDarkniteFalls/reliable-ai-work-starter) | starter | experimental | 10 min | No code; Python optional | Create a private file-based workspace with explicit sources, authority, review, and handoff state. | `python3 -B check_starter.py` |
| [Codex Project Instructions Starter](https://github.com/TheDarkniteFalls/codex-project-instructions-starter) | guide | stable | 10 min | No code; Python optional | Give a coding agent clear project rules before it works. | `python3 check_templates.py` |

### Trust boundaries

#### [Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook)

- **For:** People who want to direct AI-assisted work without reading all the code.
- **First-use estimate:** 5 minutes; No code; Python optional.
- **A pass establishes:** The starter bundle contains the declared source, authority, review, and handoff files and passes its structural checks.
- **It does not establish:** Guidance and templates do not enforce permissions or verify a live project.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/agent-operator-handbook/actions/workflows/checks.yml)

#### [Reliable AI Work Starter](https://github.com/TheDarkniteFalls/reliable-ai-work-starter)

- **For:** People who want one private, bounded recurring workflow without building an app first.
- **First-use estimate:** 10 minutes; No code; Python optional.
- **A pass establishes:** The declared starter files, setup boundary, template links, and public-safety text pass deterministic structural checks.
- **It does not establish:** The starter does not run an agent, enforce permissions, inspect sources, or prove that a live workflow is useful.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/reliable-ai-work-starter/actions/workflows/checks.yml)

#### [Codex Project Instructions Starter](https://github.com/TheDarkniteFalls/codex-project-instructions-starter)

- **For:** Repository owners who want clear rules for a coding agent before work begins.
- **First-use estimate:** 10 minutes; No code; Python optional.
- **A pass establishes:** The required instruction templates and examples are present and structurally valid.
- **It does not establish:** Written instructions guide behavior but do not technically enforce it.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/codex-project-instructions-starter/actions/workflows/checks.yml)


## Bound and prove

Keep proposed work inside evidence and authority boundaries, then leave inspectable proof.

| Project | Kind | Maturity | Time | Runtime | Use it when | First check |
| --- | --- | --- | --- | --- | --- | --- |
| [Public Repo Safety Kit](https://github.com/TheDarkniteFalls/public-repo-safety-kit) | tool | stable | 5 min | Python 3 | Check a public-candidate repo before publishing. | `python3 public_repo_guard.py --self-test` |
| [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) | tool | flagship | 5 min | Python 3 | Leave a compact review receipt for AI-assisted work. | `python3 -B examples/run-v1-reference.py` |
| [Local Model Reliability Example](https://github.com/TheDarkniteFalls/local-model-reliability-example) | pattern | stable | 5 min | Python 3 | Validate structured local-model output before trusting it. | `python3 reliability_demo.py --self-test` |
| [Context Boundary Examples](https://github.com/TheDarkniteFalls/context-boundary-examples) | pattern | stable | 5 min | Python 3 | Check that answers stay inside supplied evidence. | `python3 context_boundary_check.py --self-test` |
| [Agent Action Authority Examples](https://github.com/TheDarkniteFalls/agent-action-authority-examples) | pattern | stable | 5 min | Python 3 | Classify model or agent actions before execution. | `python3 action_authority_check.py --self-test` |

### Trust boundaries

#### [Public Repo Safety Kit](https://github.com/TheDarkniteFalls/public-repo-safety-kit)

- **For:** People preparing a repository for public GitHub publication.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** The checked tree avoids the kit's known private-path, credential, identity, and publication-risk cases.
- **It does not establish:** A pass is not a complete security review and does not grant permission to publish.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/public-repo-safety-kit/actions/workflows/checks.yml)

#### [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate)

- **For:** Reviewers and integrators who need revision-bound evidence for AI-assisted changes.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** Declared claims, checks, changed paths, review, and public-safety fields are tied to the exact Git revision supplied to the verifier.
- **It does not establish:** It does not authenticate a reviewer, prove semantic correctness, or approve publication.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/evidencegate/actions/workflows/checks.yml)

#### [Local Model Reliability Example](https://github.com/TheDarkniteFalls/local-model-reliability-example)

- **For:** Builders placing deterministic validation around local or small-model output.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** Synthetic outputs satisfy the declared shape, citation, confidence, and no-write contracts.
- **It does not establish:** The example calls no model and does not measure live-model quality.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/local-model-reliability-example/actions/workflows/checks.yml)

#### [Context Boundary Examples](https://github.com/TheDarkniteFalls/context-boundary-examples)

- **For:** Builders testing whether answers stay inside supplied evidence.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** Expected answers cite only allowed sources and known unsupported or uncited outputs fail.
- **It does not establish:** Grounding to supplied snippets does not establish that those snippets are true or current.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/context-boundary-examples/actions/workflows/checks.yml)

#### [Agent Action Authority Examples](https://github.com/TheDarkniteFalls/agent-action-authority-examples)

- **For:** Agent builders separating proposed actions from reusable execution authority.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** Synthetic actions and scoped grants receive the expected allow, reject, or reapproval decisions.
- **It does not establish:** The classifier does not execute actions, provide a sandbox, or infer security-relevant scope.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/agent-action-authority-examples/actions/workflows/checks.yml)


## Evaluate and operate

Test retrieval, generated systems, evaluation protocols, model workloads, and deterministic state.

| Project | Kind | Maturity | Time | Runtime | Use it when | First check |
| --- | --- | --- | --- | --- | --- | --- |
| [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern) | pattern | stable | 5 min | Python 3 | Keep one important workflow obviously healthy. | `python3 spine_green.py` |
| [SQLite Context Retrieval Example](https://github.com/TheDarkniteFalls/sqlite-context-retrieval-example) | pattern | experimental | 15 min | Python 3 | Turn wrong-scope, stale-source, and authority retrieval failures into regression buckets. | `python3 -B metadata_retrieval_demo.py failures` |
| [Sealed Evaluation Pattern](https://github.com/TheDarkniteFalls/sealed-evaluation-pattern) | pattern | experimental | 10 min | Python 3 | Check access order, frozen outputs, digests, and retirement of revealed calibration material. | `python3 -B sealed_eval.py --self-test` |
| [Generated-System QA Pattern](https://github.com/TheDarkniteFalls/generated-system-qa-pattern) | pattern | experimental | 10 min | Python 3 | Check generated-data freshness, integrity, reachability, required services, and a representative journey. | `python3 -B generated_system_qa.py --self-test` |
| [Model Workload Telemetry](https://github.com/TheDarkniteFalls/model-workload-telemetry) | tool | experimental | 10 min | Python 3 | Report completion, cost, time, quality, and revision burden within paired workload classes. | `python3 -B model_workload_telemetry.py --self-test` |
| [AI Game State Machine Pattern](https://github.com/TheDarkniteFalls/ai-game-state-machine-pattern) | pattern | experimental | 10 min | Node.js 20+ | Keep one authoritative set of legal commands and unresolved obligations across save and replay. | `npm test` |

### Trust boundaries

#### [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern)

- **For:** Project owners who want one memorable check for an important workflow.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** One representative synthetic path and its known-bad cases satisfy the named checkpoint.
- **It does not establish:** A green spine deliberately does not prove every feature, path, or experience quality.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/green-spine-qa-pattern/actions/workflows/checks.yml)

#### [SQLite Context Retrieval Example](https://github.com/TheDarkniteFalls/sqlite-context-retrieval-example)

- **For:** Builders evaluating deterministic metadata boundaries around SQLite FTS5 retrieval.
- **First-use estimate:** 15 minutes; Python 3.
- **A pass establishes:** The synthetic failure registry selects or refuses correctly and keeps critical buckets independently green.
- **It does not establish:** The fixtures are synthetic and natural-language-to-filter translation is outside the evaluated boundary.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/sqlite-context-retrieval-example/actions/workflows/checks.yml)

#### [Sealed Evaluation Pattern](https://github.com/TheDarkniteFalls/sealed-evaluation-pattern)

- **For:** Evaluators preserving a scarce holdout corpus across learning, calibration, and sealed zones.
- **First-use estimate:** 10 minutes; Python 3.
- **A pass establishes:** The supplied record preserves the declared information zones, freeze order, digests, and retirement rule.
- **It does not establish:** The checker is not a sandbox and cannot prove an access log is complete or authentic.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/sealed-evaluation-pattern/actions/workflows/checks.yml)

#### [Generated-System QA Pattern](https://github.com/TheDarkniteFalls/generated-system-qa-pattern)

- **For:** Builders checking generated worlds, workflows, maps, or other graph-shaped systems.
- **First-use estimate:** 10 minutes; Python 3.
- **A pass establishes:** The supplied artifact matches its blueprint and satisfies the declared structural and journey requirements.
- **It does not establish:** Structural readiness does not prove live UI freshness, domain quality, accessibility, or enjoyment.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/generated-system-qa-pattern/actions/workflows/checks.yml)

#### [Model Workload Telemetry](https://github.com/TheDarkniteFalls/model-workload-telemetry)

- **For:** Teams comparing model routes over shared task instances instead of raw aggregate token totals.
- **First-use estimate:** 10 minutes; Python 3.
- **A pass establishes:** Only task instances attempted by every compared model contribute to each workload report.
- **It does not establish:** The report does not prove causal model superiority, cost efficiency, or statistical significance.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/model-workload-telemetry/actions/workflows/checks.yml)

#### [AI Game State Machine Pattern](https://github.com/TheDarkniteFalls/ai-game-state-machine-pattern)

- **For:** Game builders protecting legal flow, persistence, and replay during AI-assisted development.
- **First-use estimate:** 10 minutes; Node.js 20+.
- **A pass establishes:** Illegal actions remain non-mutating, inspection is read-only, obligations persist, and seeded replay is deterministic.
- **It does not establish:** State-machine correctness does not prove that the game is understandable, balanced, emotional, or fun.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/ai-game-state-machine-pattern/actions/workflows/checks.yml)

## Public boundary

Synthetic public examples only. Do not add private logs, connector exports, credentials, local paths, or personal data.

Do not interpret inclusion here as permission to publish, deploy, send,
purchase, delete, or change shared state. Those actions still require the
authority defined by the real project and its human owner.
