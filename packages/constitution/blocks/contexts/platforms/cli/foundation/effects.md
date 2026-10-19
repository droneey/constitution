# Effects

> Governs standard output, interrupts, closed output, settings, user files and destructive commands.

## General

### closed-output-ends-the-run-quietly · SHOULD

When the reader of standard output closes it, as `head` does, the command stops without a stack trace and exits as a program ended by `SIGPIPE`.

| Why | Tags |
|---|---|
| a pipeline that reads only the first lines is a normal use, and a trace printed for it reads as a failure of the command. | [ux] |

## Calls and resources

### interrupt-ends-the-run-promptly → program-stops-cleanly · MUST

On an interrupt a command says it is stopping, cleans up within a bound and exits as interrupted; a second interrupt ends it without the cleanup.

| Why | Tags |
|---|---|
| a person presses Ctrl-C to get the terminal back, and a command that ignores it, or hangs in its cleanup, holds the terminal and whatever it locked. | [ux, errors] |

## Operations

### destructive-command-confirmed-or-forced → irreversible-operation-runs-dry-by-default · MUST

A command that destroys more than its arguments name, or what it cannot restore, asks for confirmation on a terminal; without one it refuses with a usage error unless `--force` is given, and it offers `--dry-run`.

| Why | Tags |
|---|---|
| a typo, or an agent running the command unattended, otherwise destroys what nobody meant to, and no prompt can be answered where no terminal is. | [security, ux] |

## Records and configuration

### standard-output-holds-only-data → diagnostics-written-through-a-logger · MUST

Standard output carries only the command's result; diagnostics, progress, prompts and failures go to standard error.

| Why | Tags |
|---|---|
| a pipe or a file then receives only the data the next program reads, while the person at the terminal still sees what happened. | [ux] |

### setting-taken-from-flag-then-environment-then-files · SHOULD

A setting given in several places is taken from the flag first, then the environment, then the project's configuration file, then the user's, then the system's.

| Why | Tags |
|---|---|
| the most specific and most recent choice wins, so a user overrides a file for one run, and a project overrides a user's defaults, without editing either. | [ux] |

### user-file-kept-in-the-systems-base-directories · SHOULD

Configuration, cache and data a program keeps for its user live in the system's base directory for each kind — the XDG directories on Linux, and on macOS too, and the platform's own on Windows, an `XDG_*` variable that is set honoured on every system — never in a dotfile at the root of the home directory.

| Why | Tags |
|---|---|
| people back up, clear and sync these directories by kind, so a cache kept beside configuration is backed up for nothing, and configuration kept in a cache is lost when it is cleared. | [ux, data] |
