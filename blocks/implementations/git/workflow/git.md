# Git

## Ignores, tags and large files

## gitignore-covers-dependencies-output-and-caches · SHOULD
`.gitignore` covers dependencies, build output, coverage, logs, caches, temporary and backup files, the files of the operating system and of personal editors, and `/local/`. A tracked file that becomes ignored is untracked with `git rm --cached`.
**Why:** what the build or the machine produces never belongs in history, and an ignore rule alone does not untrack what is already there.
**Check:** review
**Tags:** workflow
**Implements:** `working-notes-stay-out-of-history`
