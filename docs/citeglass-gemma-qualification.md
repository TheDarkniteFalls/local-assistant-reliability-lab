# Gemma Cookbook Qualification — Grounded Answer Acceptance

Status: qualified candidate; component published; not posted; no work claimed

Live qualification date: 2026-08-10

## Recommended Target

The Grounded Answer Gate now has a
[stable public URL](https://github.com/TheDarkniteFalls/local-model-reliability-example).
Open a new issue in
[`google-gemma/cookbook`](https://github.com/google-gemma/cookbook) only after
separate posting approval and a fresh live qualification. Ask whether
maintainers would find a small deterministic acceptance cell or companion
example useful for
[`tutorials/On_Device_AI.ipynb`](https://github.com/google-gemma/cookbook/blob/main/tutorials/On_Device_AI.ipynb).

Why this is a plausible fit:

- the repository describes itself as guides and examples for Gemma and was
  active on the qualification date;
- the live notebook describes its generated answer as strictly grounded in the
  retrieved context;
- repository code searches on the qualification date found that phrase but no
  `citation`, `validate`, or `source_refs` match in that notebook; this suggests
  a narrow example gap but does not prove that no differently named check
  exists; and
- the public Gate demonstrates the downstream acceptance boundary without
  adding a model, provider, framework, or live service dependency.

## Contribution Boundary

The live `CONTRIBUTING.md` requires a Google CLA, formatting and linting for
notebooks, and an issue before writing a large change or new notebook. The
repository has no GitHub Discussions enabled. Therefore:

- ask for fit and preferred shape before writing or offering a pull request;
- offer either one small validation cell or a linkable standalone pattern;
- do not propose replacing retrieval, changing the notebook's runtime, or
  claiming general grounding;
- do not start notebook work until maintainers respond; and
- re-check the repository, notebook, issue list, contributor rules, and
  possible overlapping work immediately before any authorized post.

Do not use [issue #372](https://github.com/google-gemma/cookbook/issues/372) as
the initial route: it reports an Ollama web-search tool failure and does not
establish the post-generation acceptance problem. Do not pile onto
[issue #273](https://github.com/google-gemma/cookbook/issues/273): it concerns
FunctionGemma fine-tuning output drift and already has a substantive offer of a
format-validation cell from another contributor.

## Draft Issue Shape

**Title:** Would a deterministic grounded-answer acceptance cell be useful in
the on-device RAG example?

**Body outline:**

1. Point to the notebook's strictly-grounded expectation.
2. Explain the narrow failure: retrieved evidence can exist while generated
   wording still lacks approved provenance or contradicts a bounded fact.
3. Link the released synthetic Gate and its clean-checkout command.
4. State exactly what it checks and that it does not prove source truth,
   general semantic correctness, or live Gemma quality.
5. Ask whether maintainers prefer a small notebook cell, a linked companion
   example, or no addition.
6. State that no pull request or notebook work will begin without guidance.
7. Disclose OpenAI Codex assistance.

## Posting Gate

Before any post: the component must be release-complete and public, live
qualification must still pass, the exact draft must receive approval, and the
external follow-up ledger must be updated in the same turn after a verified
successful post. None of those external actions occurred in this slice.
