# Public Toolkit Map

This page is generated from `toolkit_index.json`. It is a problem-first map
of the public guides, tools, and teaching patterns in this toolkit.

> All examples use synthetic data. Maturity describes the public contract,
> not external adoption or a claim that a check proves the whole system safe.

## Maturity

- **Flagship:** The most complete public implementation in the toolkit, with a documented integration surface.
- **Stable:** A focused example with deterministic checks and a deliberately narrow public contract.
- **Experimental:** A tested teaching pattern whose contract may still change as outside use reveals better boundaries.

## Connected paths

Each path shows how several focused assets can support one workflow. The
role is connective guidance, not a guarantee that the tools integrate
automatically or establish the whole workflow safe.

### Guide bounded AI work

Turn an idea into a private, authority-aware workflow with an inspectable review receipt.

1. [Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook) — Define the task, evidence, approval points, and human decision boundary.
2. [Reliable AI Work Starter](https://github.com/TheDarkniteFalls/reliable-ai-work-starter) — Keep the working sources, authority, review, and handoff state in a private folder.
3. [Agent Action Authority Examples](https://github.com/TheDarkniteFalls/agent-action-authority-examples) — Classify proposed actions before execution and require a fresh grant when scope changes.
4. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) — Bind the claims, checks, changed paths, and review to the exact Git revision.

### Govern coding-agent work

Set repository rules, compile only allowed context, test one important path, and leave revision-bound evidence.

1. [Codex Project Instructions Starter](https://github.com/TheDarkniteFalls/codex-project-instructions-starter) — Write clear repository rules before a coding agent starts.
2. [Context Contract Compiler](https://github.com/TheDarkniteFalls/context-contract-compiler) — Select only allowed context and detect when a later change makes the receipt stale.
3. [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern) — Exercise one representative workflow with a memorable deterministic check.
4. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) — Tie the review claim and check results to the exact change under review.

### Ground model output

Keep an answer inside supplied evidence, reject unsupported output, and record uncertainty without overstating it.

1. [Context Boundary Examples](https://github.com/TheDarkniteFalls/context-boundary-examples) — Check that the answer cites only the evidence supplied for the task.
2. [Local Model Reliability Example](https://github.com/TheDarkniteFalls/local-model-reliability-example) — Reject unsupported, malformed, or hostile output before it enters trusted context.
3. [Earned Confidence](https://github.com/TheDarkniteFalls/earned-confidence) — Preserve the available evidence, unknowns, and policy-defined decision band.
4. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) — Leave a revision-bound receipt for the checks and human review.

### Prepare a public release

Review public-candidate material, run a meaningful product check, and preserve what was reviewed.

1. [Public Repo Safety Kit](https://github.com/TheDarkniteFalls/public-repo-safety-kit) — Inspect the candidate tree and Git metadata for common public-safety risks.
2. [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern) — Run one named check that exercises the release's most important workflow.
3. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) — Record the checked revision and the human publication review without granting publication authority.

### Evaluate model routes

Protect scarce evaluation material, compare like-for-like workloads, and retain uncertainty and provenance.

1. [Sealed Evaluation Pattern](https://github.com/TheDarkniteFalls/sealed-evaluation-pattern) — Separate learning, calibration, and sealed material and retire revealed holdouts.
2. [Model Workload Telemetry](https://github.com/TheDarkniteFalls/model-workload-telemetry) — Compare model runs only within shared workload classes and preserve route provenance.
3. [Earned Confidence](https://github.com/TheDarkniteFalls/earned-confidence) — Record what the evaluation supports, what remains unknown, and the decision snapshot.
4. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) — Bind the evaluation claims, checks, and review to the exact revision.

### Verify a generated workflow

Check generated structure, preserve legal state transitions, and exercise a representative journey.

1. [Generated-System QA Pattern](https://github.com/TheDarkniteFalls/generated-system-qa-pattern) — Check freshness, integrity, reachability, services, and one declared journey.
2. [AI Game State Machine Pattern](https://github.com/TheDarkniteFalls/ai-game-state-machine-pattern) — Keep legal actions, obligations, save state, and replay deterministic.
3. [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern) — Expose the most important end-to-end journey as one memorable health check.
4. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) — Preserve the exact revision, check evidence, and human review boundary.

### Compare agent options

Compare publisher-scoped agent evidence, frame a bounded decision, and gate any resulting action.

1. [Agent Evidence Catalog](https://github.com/TheDarkniteFalls/agent-evidence-catalog) — Compare exact versions, publisher claims, authority boundaries, and explicit unknowns.
2. [Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook) — Turn the comparison into a bounded task with named evidence and human decisions.
3. [Agent Action Authority Examples](https://github.com/TheDarkniteFalls/agent-action-authority-examples) — Separate a proposed tool or agent action from permission to execute it.
4. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) — Record what was compared, checked, and reviewed at the exact revision.

## Plan work or set rules

Define an AI-assisted task, private workspace, or coding-agent instructions before work begins.

| Project | Kind | Maturity | Time | Runtime | Use it when | First check |
| --- | --- | --- | --- | --- | --- | --- |
| [Agent Operator Handbook](https://github.com/TheDarkniteFalls/agent-operator-handbook) | guide | stable | 5 min | No code; Python optional | Turn an idea or recurring job into bounded, reviewable work. | `python3 scripts/check_starter_bundle.py` |
| [Reliable AI Work Starter](https://github.com/TheDarkniteFalls/reliable-ai-work-starter) | starter | experimental | 10 min | No code; Python optional | Set up a private AI-work folder with clear sources, permissions, review, and handoff state. | `python3 -B check_starter.py` |
| [Codex Project Instructions Starter](https://github.com/TheDarkniteFalls/codex-project-instructions-starter) | starter | stable | 10 min | No code; Python optional | Give a coding agent clear project rules before it starts. | `python3 check_templates.py` |

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


## Check boundaries or evidence

Check publication safety, evidence scope, model output, or action authority and leave inspectable proof.

| Project | Kind | Maturity | Time | Runtime | Use it when | First check |
| --- | --- | --- | --- | --- | --- | --- |
| [Public Repo Safety Kit](https://github.com/TheDarkniteFalls/public-repo-safety-kit) | tool | stable | 5 min | Python 3; Git for repository checks | Check a repository for publication risks before making it public. | `python3 public_repo_guard.py --self-test` |
| [Earned Confidence](https://github.com/TheDarkniteFalls/earned-confidence) | pattern | experimental | 5 min | Node.js 22.6+ | Record available evidence, remaining uncertainty, and what was known when a decision was made. | `npm run check` |
| [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) | tool | flagship | 5 min | Python 3 | Create a compact review receipt for AI-assisted work. | `python3 -B examples/run-v1-reference.py` |
| [Local Model Reliability Example](https://github.com/TheDarkniteFalls/local-model-reliability-example) | pattern | experimental | 5 min | Python 3 | Prevent an ungrounded web answer from entering trusted agent context. | `python3 grounded_answer_gate.py examples/grounded_answer_cases.json` |
| [Context Boundary Examples](https://github.com/TheDarkniteFalls/context-boundary-examples) | pattern | stable | 5 min | Python 3 | Check that an answer stays within the evidence you supplied. | `python3 context_boundary_check.py --self-test` |
| [Agent Action Authority Examples](https://github.com/TheDarkniteFalls/agent-action-authority-examples) | pattern | stable | 5 min | Python 3 | Classify a model or agent action before allowing it to run. | `python3 action_authority_check.py --self-test` |
| [Agent Evidence Catalog](https://github.com/TheDarkniteFalls/agent-evidence-catalog) | tool | experimental | 10 min | Node.js 20+ | Compare exact agent versions, authority boundaries, publisher claims, and known gaps. | `node scripts/catalog.mjs test` |

### Trust boundaries

#### [Public Repo Safety Kit](https://github.com/TheDarkniteFalls/public-repo-safety-kit)

- **For:** People preparing a repository for public GitHub publication.
- **First-use estimate:** 5 minutes; Python 3; Git for repository checks.
- **A pass establishes:** The ordinary scan checks the supplied tree; Git-aware mode checks tracked and nonignored untracked candidates plus reachable commit author and committer email identities.
- **It does not establish:** It does not scan historical file contents, replace a dedicated secret scanner or manual review, or grant permission to publish.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/public-repo-safety-kit/actions/workflows/checks.yml)

#### [Earned Confidence](https://github.com/TheDarkniteFalls/earned-confidence)

- **For:** Builders who need decisions from incomplete evidence without turning unknown values into false certainty.
- **First-use estimate:** 5 minutes; Node.js 22.6+.
- **A pass establishes:** Type checking, behavioral tests, and the synthetic example preserve unknown state, evidence-key isolation, policy-defined bands, immutable snapshots, and deterministic serialization.
- **It does not establish:** Observations are not authenticated, bands are not statistical, and the package supplies no persistence or authorization.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/earned-confidence/actions/workflows/checks.yml)

#### [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate)

- **For:** Reviewers and integrators who need revision-bound evidence for AI-assisted changes.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** Declared claims, checks, changed paths, review, and public-safety fields are tied to the exact Git revision supplied to the verifier.
- **It does not establish:** It does not authenticate a reviewer, prove semantic correctness, or approve publication.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/evidencegate/actions/workflows/checks.yml)

#### [Local Model Reliability Example](https://github.com/TheDarkniteFalls/local-model-reliability-example)

- **For:** Builders preventing unsupported local or small-model answers from entering trusted agent context.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** The frozen synthetic cases accept only the source-bound answer and reject missing or unapproved citations, unsupported release facts, false metadata, hostile echoes, raw source content, and malformed shapes before downstream context is allowed.
- **It does not establish:** The gate calls no model or network, covers only the declared software-release fact profile and canaries, and does not establish source truth, general semantic correctness, live-model quality, or external adoption.
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

#### [Agent Evidence Catalog](https://github.com/TheDarkniteFalls/agent-evidence-catalog)

- **For:** Researchers, builders, and maintainers comparing exact coding-agent versions and publisher claims.
- **First-use estimate:** 10 minutes; Node.js 20+.
- **A pass establishes:** The synthetic catalog validates its exact-version profiles and receipts and rejects deliberate version, arithmetic, and unsupported-verification errors.
- **It does not establish:** The check does not fetch publisher sources, run agents, verify live behavior, rank products, or establish suitability.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/agent-evidence-catalog/actions/workflows/checks.yml)


## Test or run a workflow

Exercise repeatable QA, evaluation, telemetry, generated systems, or deterministic state.

| Project | Kind | Maturity | Time | Runtime | Use it when | First check |
| --- | --- | --- | --- | --- | --- | --- |
| [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern) | pattern | stable | 5 min | Python 3 | Keep one important automated workflow visibly healthy. | `python3 spine_green.py` |
| [Context Contract Compiler](https://github.com/TheDarkniteFalls/context-contract-compiler) | pattern | experimental | 10 min | Python 3 | Build only the allowed context for an AI task and detect when a late change makes it stale. | `python3 -B context_compiler.py check` |
| [Sealed Evaluation Pattern](https://github.com/TheDarkniteFalls/sealed-evaluation-pattern) | pattern | experimental | 10 min | Python 3 | Keep evaluation answers hidden until scoring and retire calibration material after it is revealed. | `python3 -B sealed_eval.py --self-test` |
| [Generated-System QA Pattern](https://github.com/TheDarkniteFalls/generated-system-qa-pattern) | pattern | experimental | 10 min | Python 3 | Check generated data, required services, reachable content, and one representative user journey. | `python3 -B generated_system_qa.py --self-test` |
| [Model Workload Telemetry](https://github.com/TheDarkniteFalls/model-workload-telemetry) | tool | experimental | 10 min | Python 3 | Compare models on the same task while preserving provenance for every run. | `python3 -B model_workload_telemetry.py --self-test` |
| [AI Game State Machine Pattern](https://github.com/TheDarkniteFalls/ai-game-state-machine-pattern) | pattern | experimental | 10 min | Node.js 20+ | Keep valid actions and unresolved obligations consistent when an AI game is saved and replayed. | `npm test` |

### Trust boundaries

#### [Green-Spine QA Pattern](https://github.com/TheDarkniteFalls/green-spine-qa-pattern)

- **For:** Project owners who want one memorable check for an important workflow.
- **First-use estimate:** 5 minutes; Python 3.
- **A pass establishes:** One representative synthetic path and its known-bad cases satisfy the named checkpoint.
- **It does not establish:** A green spine deliberately does not prove every feature, path, or experience quality.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/green-spine-qa-pattern/actions/workflows/checks.yml)

#### [Context Contract Compiler](https://github.com/TheDarkniteFalls/context-contract-compiler)

- **For:** AI-agent builders evaluating deterministic context-selection boundaries, receipts, and stale-context handling.
- **First-use estimate:** 10 minutes; Python 3.
- **A pass establishes:** The synthetic compiler protects required records before ranking, explains every inclusion and exclusion, fails closed on invalid obligations, and rejects stale receipts deterministically.
- **It does not establish:** Structured metadata and changes are supplied; the project does not discover runtime changes, authorize actions, verify truth, or prove downstream model safety.
- **CI:** [checks workflow](https://github.com/TheDarkniteFalls/context-contract-compiler/actions/workflows/checks.yml)

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

- **For:** Teams auditing model-route evidence and decision-to-receipt provenance.
- **First-use estimate:** 10 minutes; Python 3.
- **A pass establishes:** The declared synthetic shared-task, receipt, and Phase 3 provenance checks pass.
- **It does not establish:** The checks do not prove live-routing safety, production reliability, causal model superiority, cost efficiency, or statistical significance.
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
