---
name: check
description: Run the project's check command, then review the changed files — or the whole project — against the rules of the active blocks that govern them, with the reviewer agent. Use before handing work back, when the hand-back reminder names changed blocks, or when the owner asks for a review by a lens such as security or a11y.
argument-hint: "[all|edits] [lens]"
---

# Check the work against the rules

Arguments: $ARGUMENTS — a scope, `edits` (the default) or `all`, and an optional lens, one of the tags: `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux`.

The session's state, saved at session start:

!`awk -F '\t' '$1 == "project" || $1 == "check" || $1 == "active"' "/tmp/droneey-constitution-$(id -u)/${CLAUDE_SESSION_ID}/active.tsv" 2>/dev/null || echo "(no state for this session)"`

If there is no state, the session did not start in a repository with `constitution.yaml`: stop and say so, or suggest `/ratify`.

## 1. Run the check

The `check` line above names the project's command; an empty one means `check: null`, and there is nothing to run. Otherwise run it from the project root, exactly as written, and read its output whole.

- It fails: report the failures and fix them, in the code, never by loosening a check or a suppression without its reason; then run it again. The review waits for a passing check.
- It passes: go on.

## 2. Gather the files

`edits`: the files that differ from `HEAD`, untracked files included:

```bash
git -C "<project>" diff --name-only HEAD; git -C "<project>" ls-files --others --exclude-standard
```

`all`: every file `git ls-files` lists, reviewed in batches of one block each.

For each file, the blocks whose `governs` globs match it — the `active` lines above hold the globs, relative to the project, or to the application's path when the file lies under one. Core governs every file. A file no block governs is left out of the review.

## 3. Review

Dispatch the `constitution:reviewer` agent once, through the Agent tool, with:

- the project root;
- the files, each with the blocks that govern it;
- the rule files to read: core's files and, for each block named, its files from the `active` lines;
- the lens, when given: it reviews only the rules tagged with it;
- the overrides from the digest, so a lowered rule is judged at its lowered level.

It returns findings, one per line: `<path>:<line> — <slug> — <what is wrong> — <the fix>`, and `no findings` when there are none.

## 4. Report

When the reviewer finishes, a hook records the review, so the hand-back reminder goes quiet until the tree changes again.

Report the findings to the owner as the agent returned them, grouped by file, and fix what they ask for. A finding against a rule the owner does not want in this repository is a case for `/amend`, never for a silent exception.
