# Lefthook

## hooks-from-the-shared-preset → hooks-and-release-automation-from-the-shared-source
The hooks come from the shared preset, pinned, never from scripts copied into the repository.

| Why | Check | Tags |
|---|---|---|
| a fix to a hook reaches every repository with one update, and no copy drifts. | review | [] |

## hooks-installed-with-dependencies · SHOULD
Installing the repository's dependencies installs the hooks, so no clone commits without them.

| Why | Check | Tags |
|---|---|---|
| hooks a person must remember to install are missing on exactly the machine that needs them. | review | [] |

## hooks-never-bypassed → check-run-by-hooks-and-ci
No commit skips the hooks — no `--no-verify`, no `LEFTHOOK=0` — except the release automation's version commit.

| Why | Check | Tags |
|---|---|---|
| a skipped hook lets through exactly the commit the hook exists to stop. | review | [] |

## hook-rewrites-only-staged-files → check-only-checks
A hook that formats rewrites only the staged files and stages them again; the check itself never writes.

| Why | Check | Tags |
|---|---|---|
| a hook that touches unstaged files mixes work in progress into the commit. | review | [] |
