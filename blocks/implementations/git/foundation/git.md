# Git

## Working with changes

## move-with-git-mv → move-files-never-recreate
With staged changes, a file is moved with `git mv`, so the index records a rename.

| Why | Check | Tags |
|---|---|---|
| a recorded rename keeps the file's history and shows the reviewer a move, not a deletion and a new file. | review | [] |

## stage-by-name-and-read-staged-diff · MUST
Files are staged by name or by hunk, never with `git add .` or `-A`, and the staged diff and status are read before the commit.

| Why | Check | Tags |
|---|---|---|
| staging everything commits whatever lies around — a scratch file, a key, a build output. | review | [security] |

## worktree-one-branch-own-dependencies · MUST
A worktree holds one branch, and its dependencies are installed in it, never linked from another checkout.

| Why | Check | Tags |
|---|---|---|
| a linked dependency folder escapes the ignore pattern and gets committed, and two worktrees on one branch overwrite each other. | review | [] |

## force-push-with-lease-to-own-branch-only → shared-history-never-rewritten
A force push goes only to one's own branch that nobody else has, and always with `--force-with-lease`.

| Why | Check | Tags |
|---|---|---|
| a force push to a shared branch erases others' work; the lease refuses when the branch moved. | review | [] |

## clean-tree-with-safe-cleanup → working-copy-clean-at-hand-back
A stash carries a message, and `git clean -n` precedes `git clean -fd`.

| Why | Check | Tags |
|---|---|---|
| an unnamed stash is forgotten, and a blind clean deletes work that was never committed. | review | [] |

## Ignores, tags and large files

## gitignore-covers-keys-and-environment-files → machine-local-files-ignored · MUST
`.gitignore` covers key and credential files and every local environment file except its example — `.env*` but `.env.example`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `credentials.json`, `id_rsa`, `*.secrets`, `.htpasswd` — in nested ignore files too.

| Why | Check | Tags |
|---|---|---|
| one careless add of a key file publishes it; the ignore rule stops it before the scanner has to. | review | [] |

## gitignore-covers-dependencies-output-and-caches · SHOULD
`.gitignore` covers dependencies, build output, coverage, logs, caches, temporary and backup files, and the files of the operating system and of personal editors. A tracked file that becomes ignored is untracked with `git rm --cached`.

| Why | Check | Tags |
|---|---|---|
| what the build or the machine produces never belongs in history, and an ignore rule alone does not untrack what is already there. | review | [] |

## release-tags-annotated → release-marked-by-immutable-tag
A release tag is annotated.

| Why | Check | Tags |
|---|---|---|
| an annotated tag records who tagged the release and when. | review | [] |

## lfs-for-files-over-a-megabyte → large-files-outside-history
A file over 1 MB goes to Git LFS, or out of the repository.

| Why | Check | Tags |
|---|---|---|
| a large file in git's history is downloaded by every clone forever. | review | [] |
