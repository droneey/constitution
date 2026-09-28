# Lefthook

## hooks-from-the-shared-preset → shared-tooling-from-pinned-packages
The hooks come from the shared preset, pinned, never from scripts copied into the repository.

| Why | Check | Tags |
|---|---|---|
| a fix to a hook reaches every repository with one update, and no copy drifts. | review | [] |

## hooks-installed-with-dependencies · SHOULD
Installing the repository's dependencies installs the hooks, so no clone commits without them.

| Why | Check | Tags |
|---|---|---|
| hooks a person must remember to install are missing on exactly the machine that needs them. | review | [] |

## hooks-never-bypassed → every-commit-passes-the-check
No commit skips the hooks — no `--no-verify`, no `LEFTHOOK=0` — except the release automation's version commit.

| Why | Check | Tags |
|---|---|---|
| a skipped hook lets through exactly the commit the hook exists to stop. | review | [] |
