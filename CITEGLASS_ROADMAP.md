# Citeglass Learning Programme Roadmap

Status: Published v0.1; awaiting external validation; no external interaction authorized

Citeglass is a named programme inside the Local Assistant Reliability Lab. It
turns recurring reliability problems into small, runnable, model-neutral
application boundaries. It is not a standalone framework or package in v0.1.

## Audience And Goal

The primary audience is technical builders making local and small-model agents.
Non-technical operators are the secondary audience when a component can be
explained and run safely without application development. Organizational use
is a later possibility only after the work becomes product-like and repeated
external need justifies the additional deployment burden.

The working question is: **what must an application prove before it trusts a
small model's answer, context, or proposed action?**

## Two-Way Roadmap Contract

Alfred and LSAL may provide sanitized problem statements and reusable lessons.
Citeglass public use may provide reproducible failures, integration needs, and
maintainer feedback. Neither direction promotes work automatically.

Every candidate receives exactly one disposition:

- `dual_track`: valuable to Alfred and external builders;
- `lsal_only`: private value with no safe or useful public transfer;
- `citeglass_only`: public value without enough Alfred relevance;
- `parked`: plausible but insufficiently evidenced or not timely; or
- `rejected`: unsafe, duplicative, unsupported, or outside the programme.

The maintainer owns priority, promotion, publication, and
external-interaction decisions. One active LSAL research question remains the
private sequencing rule.

## Public-Safe Transfer Card

Before a private lesson becomes a Citeglass candidate, record:

1. User problem and likely builder segment.
2. Reusable lesson and smallest useful artifact.
3. Synthetic reproduction that contains no private prompts, logs, paths,
   identities, credentials, model weights, or frozen private evidence.
4. Claims and non-claims.
5. Discovery terms and the surface where builders already look.
6. Privacy review, disposition, decision owner, and revisit trigger.

The public record may describe a failure class. It must not expose the private
run that revealed it or imply external demand before evidence exists.

## Initial Problem Ledger

| ID | Builder problem | Disposition | Public route | Evidence state | Next gate |
| --- | --- | --- | --- | --- | --- |
| `CG-001` | Prevent an ungrounded web answer from entering trusted agent context. | `dual_track` | [Grounded Answer Gate](https://github.com/TheDarkniteFalls/local-model-reliability-example) in `local-model-reliability-example`. | Published v0.1; synthetic fixture and exact-revision release proof; external validation pending. | Seek one qualifying independent reproduction or substantive maintainer response without expanding the component first. |
| `CG-002` | Detect structured-output drift before an application trusts a local-model response. | `citeglass_only` | Structured Output Canary in `local-model-reliability-example`. | Existing public stable pattern; external adoption unproven. | Reopen only from concrete user or maintainer evidence. |
| `CG-003` | Prove that a model-assisted workflow did not write outside its declared paths. | `citeglass_only` | Protected-path proof and EvidenceGate. | Existing public patterns; external adoption unproven. | Reopen only for a demonstrated integration gap. |
| `CG-004` | Keep missing, refused, errored, and unassessed evidence visible beside aggregate results. | `citeglass_only` | EvidenceGate missing-evidence research slice. | Existing synthetic public evidence. | Await substantive adopter or maintainer evidence. |
| `CG-005` | Detect when a late material change makes previously selected context stale. | `dual_track` | Context Contract Compiler. | Existing public experimental pattern; Alfred relevance is only a hypothesis. | Require a bounded Alfred need or qualifying public report. |
| `CG-006` | Separate a proposed action from the authority to perform it. | `dual_track` | Agent Action Authority Examples. | Existing public stable pattern; no automatic Alfred work. | Require a selected Alfred problem or qualifying public report. |
| `CG-007` | Preserve requested, attempted, responding, and selected model attribution across fallback or routing. | `citeglass_only` | Model Workload Telemetry. | Existing public experimental pattern and public issue learning. | Await maintainer direction or independent integration evidence. |

Private-only candidates do not enter this public ledger until they have a
genuinely public-safe problem statement and synthetic reproduction.

## Synthetic Disposition Rehearsal

These decisions exercise the contract; they are not adoption evidence or an
active-work queue.

| Rehearsal candidate | Disposition | Why |
| --- | --- | --- |
| Grounded-answer rejection boundary | `dual_track` | Alfred and external builders can both need a deterministic decision before retaining model wording. |
| Private runtime tokenizer-authority evidence | `lsal_only` | The lesson currently depends on private frozen evidence and has no safe generic public reproduction. |
| Reproducible framework adapter gap with no Alfred relevance | `citeglass_only` | External integration value does not need to become an Alfred feature. |
| Interesting request with no reproduction or affected job | `parked` | Plausibility alone does not justify implementation. |
| Request to publish private prompts or operational logs | `rejected` | The proposed evidence violates the public boundary and is unnecessary to demonstrate the pattern. |

## First Delivery: Grounded Answer Gate v0.1

The published [Grounded Answer Gate](https://github.com/TheDarkniteFalls/local-model-reliability-example)
accepts provider-neutral typed `software_release` facts and one exact
model-authored JSON answer. It emits a deterministic receipt with approved and
cited provenance, bounded factual checks, an answer hash and length, and
`downstream_context_allowed`.

Run the stable public proof:

```sh
python3 grounded_answer_gate.py examples/grounded_answer_cases.json
```

It fails closed on missing or unapproved citations, unknown provenance,
incorrect latest release facts, unsupported version claims, false source
metadata, direct-browsing claims, hostile-instruction canaries, raw source
content, non-zero instruction authority, malformed JSON, and unknown fields.
It never calls a model or network service and never repairs the answer.

The component release completed those gates at verified head
[`9c1ca3e`](https://github.com/TheDarkniteFalls/local-model-reliability-example/commit/9c1ca3ebc3d73a2af103e905a21778101fa0b4c6)
through [pull request #9](https://github.com/TheDarkniteFalls/local-model-reliability-example/pull/9):
clean public fixtures, unit and compatibility tests, detached-checkout
reproduction, a revision-bound EvidenceGate receipt, publication-safety scans,
remote CI, and explicit publication approval all passed. This synthetic
release evidence does not establish live-model quality, source truth, runtime
compatibility, surrounding-pipeline safety, or external adoption.

## Public Interaction And Alfred Suggestions

The first relevant Gemma example gap is qualified read-only in the linked
record below. Before any public interaction, refresh that qualification and
ask whether the bounded pattern is useful before offering implementation. Do
not claim work or open an unsolicited pull request.

Every substantive interaction records:

- public observation, affected job, and canonical evidence URL;
- reproducibility and the strength of the signal;
- possible Alfred relevance plus privacy and authority implications;
- route: `alfred_lived_use_probe`, `lsal_research_candidate`,
  `citeglass_only`, `parked`, `rejected`, or `none`;
- maintainer decision, owner, next action, and evidence boundary.

The external GitHub follow-up ledger remains the source of truth for any actual
third-party interaction. This roadmap is not a second interaction ledger.

The [synthetic feedback rehearsal](docs/citeglass-feedback-rehearsal.md)
verified the public-to-Alfred routes before publication. The first read-only
Gemma candidate qualification is recorded separately in
[Gemma Cookbook qualification](docs/citeglass-gemma-qualification.md); it is
not a posted issue, claim, or implementation commitment.

## Validation And Expansion

`validation_complete_positive` requires either an independent clean-checkout
reproduction of the expected receipt behavior or substantive maintainer
feedback identifying a real integration, missing behavior, or contribution
shape. Stars, impressions, generic praise, and silence do not qualify.

Review 30 and 60 days after publication. With no qualifying signal at 60 days,
record `insufficient_external_evidence`; do not call the release validated or
expand it merely to attract attention.

Consider a standalone Citeglass repository only when at least two public
components need the same stable evidence-and-decision contract and independent
use shows that a shared package would remove real integration work.

## Public Boundary

Use synthetic public data only. No analytics, signup, hidden telemetry,
participation quota, private source material, provider credential, model call,
or live retrieval belongs in v0.1. Publication and every external write remain
separately authorized actions.
