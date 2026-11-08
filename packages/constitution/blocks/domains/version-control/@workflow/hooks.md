# Hooks

> Governs the commit hooks: what they check, how they are installed, what they rewrite and that no version-control commit bypasses them.

## Vocabulary

The **commit hooks** are the hooks version control runs as a version-control commit is made, a hook being what core's tools chapter defines.

The **staged files** are the files chosen for the next version-control commit; a file is staged when it is chosen so.

## General

### commit-checked-by-the-hooks · MUST

The commit hooks check every version-control commit made in a clone, as it is made: its version-control branch's name, its commit message and its staged files.

| Why |
|---|
| a check left to a later step lets a wrong version-control branch name, commit message or file into the repository history, where only another version-control commit or a rewrite removes it, and its author learns of it once the change has left their mind. |

### hooks-never-bypassed · MUST

No version-control commit made in a clone bypasses the commit hooks. Exempt: the release automation's release commit, and a version-control commit of an update bot.

| Why |
|---|
| a bypassed hook lets through exactly the version-control commit the hook exists to stop, while a version-control commit made outside every clone runs no hook, and reaches the main line only inside a joined commit whose message is checked before the merge. |

### hook-rewrites-only-staged-files · MUST

Every commit hook that formats rewrites only the staged files.

| Why |
|---|
| a hook that touches unstaged files mixes work in progress into the version-control commit. |

### hook-restages-what-it-rewrote · MUST

Every file a commit hook rewrites is staged again before the version-control commit is made.

| Why |
|---|
| a rewrite left unstaged never reaches the version-control commit, which records the files as they were before the hook, unformatted, and leaves the rewrite behind as a stray change. |

## Installation

### hooks-installed-on-setup · SHOULD

Every clone's setup installs the commit hooks.

| Why |
|---|
| hooks a person must remember to install are missing on exactly the machine that needs them. |

### hooks-never-installed-by-an-install-script · SHOULD

No commit hook is installed by a package manager's install script.

| Why |
|---|
| an install script is skipped wherever install scripts are turned off, as they should be for dependencies, so hooks installed by one are missing on that machine, and a repository that relies on one cannot turn install scripts off. |
