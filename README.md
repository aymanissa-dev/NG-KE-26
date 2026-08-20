# NG-KE-26

Everything for my talk at **NG Kenya 2026**: _"From Idea to MVP: Building AI-Powered Angular Apps with Firebase."_

This repo has three parts:

```
NG-KE-26/
├── decode/ # The working demo app — see decode/README.md for setup
├── codelab/ # A self-guided, step-by-step walkthrough for rebuilding it yourself
└── slides/ # The talk deck
```

## decode/

De{c0}dE — an AI-powered code analysis app. Angular 22, Firebase Authentication, Cloud Firestore, and the Hugging Face Inference API. Paste a code snippet, get back a structured breakdown: explanation, issues, suggestions, a before/after refactor, a quality score, and follow-up Q&A.

Full setup instructions, prerequisites, and architecture notes are in [`decode/README.md`](./decode/README.md).

## codelab/

**[Live: aymanissa-dev.github.io/NG-KE-26/codelab/](https://aymanissa-dev.github.io/NG-KE-26/codelab/)**

A 22-chapter, self-contained walkthrough that rebuilds `decode/` from an empty folder — the same path taken while actually building it, including the real detours (a Gemini API access issue that never resolved, and the pivot to Hugging Face that came out of it). Five phases: scaffolding, auth & data, the full UI, the AI layer, and wrap-up (persistence, history, delete account) — ending in a full end-to-end test checklist. No prior Angular or Firebase experience required.

## slides/

The talk deck for the NG Kenya 2026 session.

_In progress — content coming._

## Talk

**"From Idea to MVP: Building AI-Powered Angular Apps with Firebase"**
NG Kenya 2026 — 40-minute session

## Author

**Ayman Issa**
[aymanissa.dev](https://aymanissa.dev) · [@aymanissa-dev](https://github.com/aymanissa-dev) · [@aymanissa_dev](https://x.com/aymanissa_dev)

## License

MIT — see [LICENSE](./LICENSE).
