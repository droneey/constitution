# Lefthook

## hooks-from-the-shared-preset · SHOULD
The hooks come from the shared preset, pinned, never from scripts copied into the repository.
**Why:** a fix to a hook reaches every repository with one update, and no copy drifts.
**Check:** review
**Tags:** process, security
**Implements:** `shared-tooling-from-pinned-packages`

## hooks-installed-with-dependencies · SHOULD
Installing the repository's dependencies installs the hooks, so no clone commits without them.
**Why:** hooks a person must remember to install are missing on exactly the machine that needs them.
**Check:** review
**Tags:** process

## hooks-never-bypassed · MUST
No commit skips the hooks — no `--no-verify`, no `LEFTHOOK=0` — except the release automation's version commit.
**Why:** a skipped hook lets through exactly the commit the hook exists to stop.
**Check:** review
**Tags:** process
**Implements:** `every-commit-passes-the-check`
