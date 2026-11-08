# Hooks

> Governs the commit hooks: what they check, how they are installed, what they rewrite and that no version-control commit bypasses them.

## Vocabulary

The **commit hooks** are the hooks version control runs as a version-control commit is made, a hook being what core's tools chapter defines.

The **staged files** are the files chosen for the next version-control commit; a file is staged when it is chosen so.

## General

### commit-checked-by-the-hooks · MUST

The commit hooks check every version-control commit made in a clone, as it is made: its version-control branch's name, its commit message and its staged files.

#### Why

A check left to a later step lets a wrong version-control branch name, commit message or file into the repository history, where only another version-control commit or a rewrite removes it, and its author learns of it once the change has left their mind.

#### Examples

```text title="Avoid"
commit hooks
  format the staged files
```

```text title="Prefer"
commit hooks
  check the branch name
  check the commit message
  format and lint the staged files
  scan the staged files for secrets
```

### hooks-never-bypassed · MUST

No version-control commit made in a clone bypasses the commit hooks. Exempt: the release automation's release commit, and a version-control commit of an update bot.

#### Why

A bypassed hook lets through exactly the version-control commit the hook exists to stop, while a version-control commit made outside every clone runs no hook, and reaches the main line only inside a joined commit whose message is checked before the merge.

#### Examples

```text title="Avoid"
$ commit, skipping the hooks
  fix: Round invoice totals to the cent
recorded c4
```

```text title="Prefer"
$ commit
  fix: Round invoice totals to the cent
hook: lint failed at invoices/totals:12
fix the finding, stage it, commit again
```

### hook-rewrites-only-staged-files · MUST

Every commit hook that formats rewrites only the staged files.

#### Why

A hook that touches unstaged files mixes work in progress into the version-control commit.

#### Examples

```text title="Avoid"
staged:    invoices/totals
unstaged:  refunds/refund

hook: format every file of the project
  rewrote invoices/totals, refunds/refund
```

```text title="Prefer"
staged:    invoices/totals
unstaged:  refunds/refund

hook: format the staged files
  rewrote invoices/totals
```

### hook-restages-what-it-rewrote · MUST

Every file a commit hook rewrites is staged again before the version-control commit is made.

#### Why

A rewrite left unstaged never reaches the version-control commit, which records the files as they were before the hook, unformatted, and leaves the rewrite behind as a stray change.

#### Examples

```text title="Avoid"
hook: format the staged files
  rewrote invoices/totals
commit recorded invoices/totals unformatted
working copy:  M invoices/totals
```

```text title="Prefer"
hook: format the staged files
  rewrote invoices/totals
  staged invoices/totals again
commit recorded invoices/totals formatted
working copy:  clean
```

## Installation

### hooks-installed-on-setup · SHOULD

Every clone's setup installs the commit hooks.

#### Why

Hooks a person must remember to install are missing on exactly the machine that needs them.

#### Examples

```text title="Avoid"
README
  1. Install the toolchain.
  2. Install the dependencies.
  3. Remember to install the commit hooks.
```

```text title="Prefer"
$ setup
installed the toolchain
installed the dependencies
installed the commit hooks
```

### hooks-never-installed-by-an-install-script · SHOULD

No commit hook is installed by a package manager's install script.

#### Why

An install script is skipped wherever install scripts are turned off, as they should be for dependencies, so hooks installed by one are missing on that machine, and a repository that relies on one cannot turn install scripts off.

#### Examples

```text title="Avoid"
package manifest
  install script: install the commit hooks
```

```text title="Prefer"
package manifest
  install scripts: off

setup task
  install the toolchain
  install the dependencies
  install the commit hooks
```
