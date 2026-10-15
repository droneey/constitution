# Lefthook

### hooks-from-the-shared-preset · SHOULD
The hooks come from the shared preset, pinned, never from scripts copied into the repository.

| Why | Tags |
|---|---|
| a fix to a hook reaches every repository with one update, and no copy drifts. | [security] |

### hooks-installed-with-dependencies · SHOULD
Installing the repository's dependencies installs the hooks, so no clone commits without them.

| Why | Tags |
|---|---|
| hooks a person must remember to install are missing on exactly the machine that needs them. | [] |

### hooks-never-bypassed → commit-checked-by-the-hooks · MUST
No commit skips the hooks — no `--no-verify`, no `LEFTHOOK=0` — except the release automation's version commit.

| Why | Tags |
|---|---|
| a skipped hook lets through exactly the commit the hook exists to stop. | [] |

### hook-rewrites-only-staged-files → commit-holds-only-its-task-files · MUST
A hook that formats rewrites only the staged files and stages them again.

| Why | Tags |
|---|---|
| a hook that touches unstaged files mixes work in progress into the commit. | [] |

### commit-subject-never-a-placeholder → commit-subject-says-what-changed · MUST
The `commit-msg` hook rejects a placeholder subject: "update", "fix stuff", "wip", "changes", "misc".

| Why | Tags |
|---|---|
| a placeholder subject makes the history useless at exactly the commit someone needs to understand. | [] |
