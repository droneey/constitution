---
id: lefthook
kind: implementation
summary: Git hooks that check branch names, messages and staged changes.
chapters: []
requires: []
extends: git
abstract: false
checks: [commits]
owns: [Lefthook, lefthook, lefthook.yaml, lefthook-local.yaml, LEFTHOOK]
governs: ["lefthook.yaml"]
status: stable
---

# Lefthook

> Runs the git hooks. Its configuration holds every active rule whose check is `tool — commits` — the branch name in `pre-commit`, the message in `commit-msg` — starting from the devkit preset; a `commits` rule it cannot hold is reported, and needs review or an override.

## hooks-from-the-shared-preset · SHOULD
The hooks come from the shared preset, pinned, never from scripts copied into the repository.
**Why:** a fix to a hook reaches every repository with one update, and no copy drifts.
**Check:** review
**Tags:** workflow, security
**Implements:** `shared-tooling-from-pinned-packages`

## hooks-installed-with-dependencies · SHOULD
Installing the repository's dependencies installs the hooks, so no clone commits without them.
**Why:** hooks a person must remember to install are missing on exactly the machine that needs them.
**Check:** review
**Tags:** workflow

## hooks-never-bypassed · MUST
No commit skips the hooks — no `--no-verify`, no `LEFTHOOK=0` — except the release automation's version commit.
**Why:** a skipped hook lets through exactly the commit the hook exists to stop.
**Check:** review
**Tags:** workflow
**Implements:** `every-commit-passes-the-check`

## hook-rewrites-only-staged-files · SHOULD
A hook that formats rewrites only the staged files and stages them again; the check itself never writes.
**Why:** a hook that touches unstaged files mixes work in progress into the commit.
**Check:** review
**Tags:** workflow
**Implements:** `check-only-checks`
