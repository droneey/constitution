# Hooks

> Governs the commit hooks: what they check, how they are installed, what they rewrite and that no commit skips them.

## General

### commit-checked-by-the-hooks · MUST

A commit is checked by the commit hooks as it is made. A **commit hook** checks what can be checked of a commit before it is made: its branch's name, its message and its staged files.

| Why |
|---|
| a check left to a later step lets a wrong branch name, message or file into the history, where only another commit or a rewrite removes it, and its author learns of it once the change has left their mind. |

### hooks-installed-on-setup · SHOULD

Setting up a clone installs the commit hooks. They are installed so that none commits without them, and never through a package manager's install script.

| Why |
|---|
| hooks a person must remember to install are missing on exactly the machine that needs them, and an install script runs on every install of a dependency, wherever it comes from. |

### hooks-never-bypassed · MUST

No commit skips the commit hooks. The one exception is the release automation's version commit.

| Why |
|---|
| a skipped hook lets through exactly the commit the hook exists to stop. |

### hook-rewrites-only-staged-files · MUST

A commit hook that formats rewrites only the staged files and stages them again.

| Why |
|---|
| a hook that touches unstaged files mixes work in progress into the commit. |
