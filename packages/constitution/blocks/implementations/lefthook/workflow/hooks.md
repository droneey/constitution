# Hooks

> Governs the git hooks: where they come from, how they are installed and run, and what they refuse.

## General

### hooks-from-the-shared-preset → configuration-holds-what-its-blocks-compute · MUST

The hooks are the jobs the presets give, written into the configuration, never scripts copied into the repository.

| Why |
|---|
| a fix to a hook reaches every repository with one update, and no copy drifts. |

### hooks-installed-on-setup · SHOULD

Setting up a clone installs the hooks, so none commits without them; never through a package manager's install script.

| Why |
|---|
| hooks a person must remember to install are missing on exactly the machine that needs them, and an install script runs on every install of a dependency, wherever it comes from. |

### hooks-never-bypassed → commit-checked-by-the-hooks · MUST

No commit skips the hooks — no `--no-verify`, no `LEFTHOOK=0` — except the release automation's version commit.

| Why |
|---|
| a skipped hook lets through exactly the commit the hook exists to stop. |

### hook-rewrites-only-staged-files → commit-holds-only-its-task-files · MUST

A hook that formats rewrites only the staged files and stages them again.

| Why |
|---|
| a hook that touches unstaged files mixes work in progress into the commit. |

### commit-subject-never-a-placeholder → commit-subject-says-what-changed · MUST

The `commit-msg` hook rejects a placeholder subject: "update", "fix stuff", "wip", "changes", "misc".

| Why |
|---|
| a placeholder subject makes the history useless at exactly the commit someone needs to understand. |
