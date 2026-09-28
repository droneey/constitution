---
id: git
kind: implementation
summary: Git's commits, branches, tags, ignores and worktrees.
chapters: []
requires: [version-control]
extends: null
abstract: false
checks: []
owns: [Git, git, .gitignore, .gitattributes, .gitkeep, Git LFS, commit-msg, pre-commit]
governs: [".gitignore", ".gitattributes"]
status: stable
---

# Git

> Version control with git: how changes are staged, what is ignored, annotated tags, large files and worktrees. A git-flow framework extends this block and may tighten it. The commit hooks check version-control's formats of commits and branches, under the `commits` role.

## Working with changes

## move-with-git-mv · SHOULD
With staged changes, a file is moved with `git mv`, so the index records a rename.
**Why:** a recorded rename keeps the file's history and shows the reviewer a move, not a deletion and a new file.
**Check:** review
**Tags:** workflow
**Implements:** `move-files-never-recreate`

## stage-by-name-and-read-staged-diff · MUST
Files are staged by name or by hunk, never with `git add .` or `-A`, and the staged diff and status are read before the commit.
**Why:** staging everything commits whatever lies around — a scratch file, a key, a build output.
**Check:** review
**Tags:** workflow, security

## worktree-one-branch-own-dependencies · MUST
A worktree holds one branch, and its dependencies are installed in it, never linked from another checkout.
**Why:** a linked dependency folder escapes the ignore pattern and gets committed, and two worktrees on one branch overwrite each other.
**Check:** review
**Tags:** workflow

## force-push-with-lease-to-own-branch-only · SHOULD
A force push goes only to one's own branch that nobody else has, and always with `--force-with-lease`.
**Why:** a force push to a shared branch erases others' work; the lease refuses when the branch moved.
**Check:** review
**Tags:** workflow
**Implements:** `shared-history-never-rewritten`

## clean-tree-with-safe-cleanup · SHOULD
A stash carries a message, and `git clean -n` precedes `git clean -fd`.
**Why:** an unnamed stash is forgotten, and a blind clean deletes work that was never committed.
**Check:** review
**Tags:** workflow
**Implements:** `working-copy-clean-at-hand-back`

## Ignores, tags and large files

## gitignore-covers-dependencies-output-and-caches · SHOULD
`.gitignore` covers dependencies, build output, coverage, logs, caches, temporary and backup files, the files of the operating system and of personal editors, and `/local/`. A tracked file that becomes ignored is untracked with `git rm --cached`.
**Why:** what the build or the machine produces never belongs in history, and an ignore rule alone does not untrack what is already there.
**Check:** review
**Tags:** workflow
**Implements:** `working-notes-stay-out-of-history`

## gitignore-covers-keys-and-environment-files · MUST
`.gitignore` covers key and credential files and every local environment file except its example — `.env*` but `.env.example`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `credentials.json`, `id_rsa`, `*.secrets`, `.htpasswd` — in nested ignore files too.
**Why:** one careless add of a key file publishes it; the ignore rule stops it before the scanner has to.
**Check:** review
**Tags:** security
**Implements:** `environment-names-declared-in-one-place`

## release-tags-annotated · MUST
A release tag is annotated.
**Why:** an annotated tag records who tagged the release and when.
**Check:** review
**Tags:** workflow
**Implements:** `release-marked-by-immutable-tag`

## lfs-for-files-over-a-megabyte · SHOULD
A file over 1 MB goes to Git LFS, or out of the repository.
**Why:** a large file in git's history is downloaded by every clone forever.
**Check:** review
**Tags:** performance
**Implements:** `large-files-outside-history`
