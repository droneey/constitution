# Effects

> Governs standard output, interrupts, closed output, settings, user files and destructive commands.

## General

### closed-output-ends-the-run-quietly · SHOULD

When the reader of standard output closes it, as `head` does, the command stops without a stack trace and exits as a program ended by `SIGPIPE`.

| Why |
|---|
| a pipeline that reads only the first lines is a normal use, and a trace printed for it reads as a failure of the command. |

## Calls and resources

### interrupt-ends-the-run-promptly → program-stops-cleanly · MUST

On an interrupt a command says it is stopping, cleans up within a bound and exits as interrupted; a second interrupt ends it without the cleanup.

| Why |
|---|
| a person presses Ctrl-C to get the terminal back, and a command that ignores it, or hangs in its cleanup, holds the terminal and whatever it locked. |

## Operations

### destructive-command-confirmed-or-forced → irreversible-operation-runs-dry-by-default · MUST

A command that destroys more than its arguments name, or what it cannot restore, asks for confirmation on a terminal; without one it refuses with a usage error unless `--force` is given, and it offers `--dry-run`.

| Why |
|---|
| a typo, or an agent running the command unattended, otherwise destroys what nobody meant to, and no prompt can be answered where no terminal is. |

## Records and configuration

### standard-output-holds-only-data → diagnostics-written-through-a-logger · MUST

Standard output carries only the command's result; diagnostics, progress, prompts and failures go to standard error.

| Why |
|---|
| a pipe or a file then receives only the data the next program reads, while the person at the terminal still sees what happened. |

### setting-taken-from-flag-then-environment-then-files · SHOULD

A setting given in several places is taken from the flag first, then the environment, then the project's configuration file, then the user's, then the system's.

| Why |
|---|
| the most specific and most recent choice wins, so a user overrides a file for one run, and a project overrides a user's defaults, without editing either. |

### user-file-kept-in-the-systems-base-directories · SHOULD

Configuration, cache and data a program keeps for its user live in the base directory of each kind — `XDG_CONFIG_HOME`, `XDG_CACHE_HOME` and `XDG_DATA_HOME` with their defaults on Linux and macOS, the known folders on Windows, and a set `XDG_*` variable on every system — never in a dotfile at the root of the home directory.

| Why |
|---|
| people back up, clear and sync these directories by kind, so a cache kept beside configuration is backed up for nothing, and configuration kept in a cache is lost when it is cleared. |
