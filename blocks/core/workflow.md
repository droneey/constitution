# Workflow

> Governs **how work is done** on a repository — by humans and agents alike. It protects history, verifies output and keeps changes honest.
> *What* to build with is the `stack` chapter; *how* to write is the `code` chapter; *structure* is the `architecture` chapter.

---

## 1. Read before you write
Before writing or moving code, read the chapter that governs the change (`intro` maps them). The rules are binding defaults. Deviating requires explicit human consent recorded in the change and in `DECISIONS.md` — no silent exceptions.

---

## 2. Move files with `mv`; never delete-and-recreate
When relocating or renaming a file or folder, use `mv` (or `git mv` when working with staged changes). Deleting a file and recreating its contents at the new path is forbidden — it destroys rename detection, blame and history.

- Move single files and whole folders with `mv`, then edit imports in place.
- Do not rewrite a moved file from scratch unless its content genuinely changes.

```bash
mv old/path/card new/path/card     # ✓ preserves history, then fix imports
# rm -rf old/path/card  +  recreate # ✗ destroys history
```

---

## 3. Verify before handing back
Every repository exposes **one script, `check`**, that runs everything a change must pass: the linter and formatter in check mode, the type checker, the tests with their coverage gate, the dependency checker, and any build or validation the stack adds. The `stack` chapter says what `check` runs and how it is invoked; the name never changes.

After writing or modifying code, run `check` and resolve every error and warning before reporting the work complete.

- Treat any non-empty output as a required fix, not a warning to defer.
- Silencing a check without a concrete justification recorded in the code is forbidden (`code` chapter).
- **Claiming completion without running `check` is forbidden.**

---

## 4. Keep boundaries green
The dependency rules are part of `check`. A change that introduces a boundary violation is not done. Run `check` after any change that adds, moves or re-wires modules; it must pass.

---

## 5. Scope discipline
- Change only what the task requires. Do not refactor or reformat unrelated code in the same change — it hides the real diff.
- Do not introduce a new library, pattern or abstraction outside the constitution without explicit consent recorded in the change.
- Delete dead code rather than commenting it out; version control preserves history.
- Specs, plans and scratch notes live in `local/`, ignored by version control. They never land in the repository.

---

## 6. Branches and commits
- Branch names match **`(feature|fix|hotfix)/<id>-<kebab-name>`**, where `<id>` is the issue the branch resolves. Hook-enforced.
- **One logical change per commit** — a refactor and a behaviour change are two, never the same commit, so a rollback never drags structural cleanup with it. The subject states **what** changed, not a narration of files touched.
- **Format — one line, enforced by the `commit-msg` hook: `type: Subject`.** No scope. Header **≤ 100 characters**. The subject is **sentence-case** (capitalised first word) and imperative (`Add…`, `Fix…`). The **body and footer are empty**. Allowed types: `feat`, `fix`, `perf`, `refactor`, `style`, `test`, `docs`, `build`, `ci`, `chore`.
- The **why** lives in the pull request description — and in `DECISIONS.md` when the change is a decision.
- **No tool attribution.** A commit, a pull request or a file never names an assistant, a model or a tool as its author or helper: no trailers, no generated-by lines.
- Never commit a change that fails `check`. Never commit a second lockfile or a generated artefact the build produces.

---

## 7. Pull requests
- **Every change reaches `main` through a pull request.** No direct pushes, no force pushes, no history rewrites on shared branches.
- A pull request is **squash-merged**; its title becomes the commit subject and follows the commit format.
- The required check is the repository's `check` run in CI. A red check blocks the merge.
- The merged branch prefix decides the version: `feature` bumps minor, `fix` and `hotfix` bump patch. The tag and the pre-release are cut by the shared workflows; a human promotes a pre-release to a release.
- Small and reviewable beats big and complete: split a pull request that mixes concerns.

---

## 8. Decisions move with the change
A change that contradicts or extends a rule ships the amendment **and its `DECISIONS.md` entry** in the same change. For a block, the entry goes into the constitution's log with the pull request; for a project departure, into the project's log with a `Deviates:` line. A rule edit without its entry — or code that silently diverges — is an incomplete change. This rule is what keeps the documents the truth instead of a wish.

---

## 9. Repository conventions
- `README.md` is the front door: what the repository is, how to run it, where the rest lives.
- `docs/` holds documentation **for the users and integrators of the product** — nothing about how it is built.
- `PROJECT.md` and `DECISIONS.md` sit at the root. `local/` is ignored.
- Root files that tools or people look for keep their conventional uppercase names; everything inside folders is **kebab-case**.
