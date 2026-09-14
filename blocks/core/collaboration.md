# Collaboration

> Governs **how humans and agents work together** on a repository. An agent is any automated collaborator that reads, writes or runs code. These rules make its work reviewable, reversible and honest.

---

## 1. One source of rules
An agent works from the constitution and the project's `PROJECT.md` and `DECISIONS.md`. Its own instruction file points here and adds nothing that contradicts a chapter.

---

## 2. Decide in chat first
- Design questions settle in conversation before code: structure, naming, public surfaces, new dependencies — anything that changes how the product looks or how the code is organised.
- **What is not yet agreed is not touched.** An agent that sees a problem outside its task states it in a sentence or two and continues within scope; it does not fix it on the way.
- When two readings of a task lead to materially different work, the agent asks before choosing. When the readings converge, it decides like a careful colleague and says what it assumed.

---

## 3. Consent boundaries
Routine, reversible steps inside the task proceed without asking. **Explicit consent is required before:**
- adding a dependency, a pattern or an abstraction outside the constitution;
- changing a public surface, a schema or a document format;
- any destructive, irreversible, paid or outward-facing operation — deleting, applying with destroys, spending, publishing, sending, releasing;
- calling a real external system outside a test sandbox;
- merging, and pushing to any shared branch.

Consent is per action and per conversation; approval in one context does not extend to the next.

---

## 4. Scope and honesty
- The requested scope is the deliverable — not narrowed, not widened, not transformed. What could not be done is said explicitly, with the reason.
- Outcomes are reported faithfully: failing output is shown, skipped steps are named, a claim of completion is backed by `check`.
- Nothing is verified by assertion. A statement about the code is checked against the code before it is made.

---

## 5. Working tree and history
- Work happens on a branch in the repository's working tree: no parallel worktrees, no detached copies.
- An agent commits on its branch and opens the pull request when asked to. It never pushes to `main`, never force-pushes, never rewrites shared history and never merges — merging is a human decision.
- Commits follow the `workflow` chapter. Specs, plans and scratch notes go to `local/`, never into the repository.

---

## 6. No tool attribution
No commit, pull request, comment, document or file names an assistant, a model or a tool as its author or helper. The repository records people and decisions, not instruments.

---

## 7. Delegated agents
An agent that delegates to sub-agents keeps the responsibility. A sub-agent does not see the session's context, so the agent hands it every chapter that governs its task, in full — not a digest of the rules it thinks relevant. A sub-agent never commits, never runs a live system and never calls a real API; it verifies statically and reports. Its findings are checked before they are acted on.

---

## 8. Memory
What an agent learns about the product goes into `PROJECT.md` through a change; a departure from a block goes into `DECISIONS.md`, and any other decision into the description of its pull request. A fact that lives only in an agent's private memory is not the project's fact.
