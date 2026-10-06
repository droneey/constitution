# Git

## Worktrees

## worktree-one-branch-no-linked-folder · MUST
A worktree holds one branch, and no folder of it is a link into another checkout.

| Why | Check | Tags |
|---|---|---|
| a linked folder escapes the ignore pattern and gets committed, and two worktrees on one branch overwrite each other. | review | [] |

## Ignores, tags and large files

## gitignore-covers-key-files → no-secret-in-repository
`.gitignore` covers key and credential files — `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `credentials.json`, `id_rsa`, `*.secrets`, `.htpasswd` — in nested ignore files too.

| Why | Check | Tags |
|---|---|---|
| one careless add of a key file publishes it; the ignore rule stops it before the scanner has to. | review | [] |

## gitignore-covers-environment-files → machine-local-files-ignored · MUST
`.gitignore` covers every local environment file except its example — `.env*` but `.env.example` — in nested ignore files too.

| Why | Check | Tags |
|---|---|---|
| a local environment file holds one machine's settings and often its secrets, and one careless add commits them. | review | [] |

## gitignore-covers-dependencies-output-and-caches · SHOULD
`.gitignore` covers dependencies, build output, coverage, logs, caches, temporary and backup files, and the files of the operating system and of personal editors. A file it covers is not tracked.

| Why | Check | Tags |
|---|---|---|
| what the build or the machine produces never belongs in history, and an ignore rule alone leaves tracked what is already there. | review | [] |

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
